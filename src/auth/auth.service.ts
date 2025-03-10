import { AuthenticationResult, ConfidentialClientApplication } from '@azure/msal-node';
import { Injectable, Logger } from '@nestjs/common';
import { msalConfig } from './msal.config';
import { envs } from 'src/config';
import { Request } from 'express';
import axios, { AxiosResponse } from 'axios';


@Injectable()
export class AuthService {

    loggerAuthService = new Logger('AuthService');
    
    private msalClient: ConfidentialClientApplication;

    constructor() {
        this.msalClient = new ConfidentialClientApplication(msalConfig);
    }

    async signIn(): Promise < string > {
        const authCodeUrlParameters = {
            scopes: envs.azureScope,
            redirectUri: envs.azureRedirectUri,
        };
        return await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
    }

    async handleRedirect(req: Request, code: string) : Promise < AuthenticationResult > {
        const tokenRequest = {
            code: code,
            scopes: envs.azureScope,
            redirectUri: envs.azureRedirectUri,
        };

        // El código se recibe en la URL desde la URI de redirección. Luego, MSAL se encarga del intercambio de código por token..
        const response = await this.msalClient.acquireTokenByCode(tokenRequest);
        // console.log({response});
        
        // req.session.token = response.accessToken;
        // console.log('token real', response.accessToken);
        
        // Iniciar sesión de usuario.
        if (response.account) {
            const { username, name } = response.account;
            this.loggerAuthService.log(`${name} - ${username} has iniciado sesión exitosamente`);
        } else {
            this.loggerAuthService.log('El usuario desconocido inició sesión correctamente.');
        } 

        return response;
    }

    async getAfterLoginRedirect(req: Request): Promise<string> {
        return 'http://localhost:4200/#/home';
    }

    async getLogoutUrl(req: any): Promise<string> {
        return `https://login.microsoftonline.com/${envs.azureTenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${'http://localhost:4200/#/auth/login'}`;
    }


    async getUserProfile(accessToken: string): Promise<AxiosResponse> {
        const url = envs.graphApiRootUrl + '/me';
        const headers = { Authorization: `Bearer ${accessToken}` };
    
        return axios.get(url, { headers });
    }


    async getAllFiles(accessToken: string) {
        const url = `${envs.graphApiRootUrl}/me/drive/root/children`;
        const headers = { Authorization: `Bearer ${accessToken}` };
    
        return axios.get(url, { headers }); 
    }

    async getFilesInFolder(folderId: string, accessToken: string): Promise<AxiosResponse> {
        const url = `${envs.graphApiRootUrl}/me/drive/items/${folderId}/children`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        return axios.get(url, { headers });
    }


    // async validateToken(token: string): Promise<any> {
    //     try {
    //         const result = await this.msalClient.acquireTokenOnBehalfOf({
    //             oboAssertion: token,
    //             scopes: envs.azureScope
    //         });
            
    //         return {
    //             id: result.account.homeAccountId,
    //             roles: result.account.idTokenClaims?.roles || []
    //         };
    //     } catch (error) {
    //         throw new Error(`MSAL validation failed: ${error.message}`);
    //     }
    // }
}
