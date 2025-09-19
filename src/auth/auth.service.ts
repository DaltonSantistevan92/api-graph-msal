import {
    AuthenticationResult,
    ConfidentialClientApplication,
} from '@azure/msal-node';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { msalConfig } from './msal.config';
import { envs } from 'src/config';
import { Request } from 'express';
import axios, { AxiosResponse } from 'axios';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    loggerAuthService = new Logger('AuthService');

    private msalClient: ConfidentialClientApplication;

    constructor() {
        this.msalClient = new ConfidentialClientApplication(msalConfig);
    }

    async signIn(): Promise<string> {
        const authCodeUrlParameters = {
            scopes: envs.azureScope,
            redirectUri: envs.azureRedirectUri,
        };
        return await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
    }

    async handleRedirect(
        req: Request,
        code: string,
    ): Promise<AuthenticationResult> {
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
            this.loggerAuthService.log(
                `${name} - ${username} has iniciado sesión exitosamente`,
            );
        } else {
            this.loggerAuthService.log(
                'El usuario desconocido inició sesión correctamente.',
            );
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

    async getFilesInFolder(
        folderId: string,
        accessToken: string,
    ): Promise<AxiosResponse> {
        const url = `${envs.graphApiRootUrl}/me/drive/items/${folderId}/children`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        return axios.get(url, { headers });
    }

    async getCalendarEvents(accessToken: string) {
        const url = `${envs.graphApiRootUrl}/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            this.loggerAuthService.error(
                'Error obteniendo eventos del calendario',
                error,
            );
            throw new InternalServerErrorException(
                'No se pudo obtener eventos del calendario',
            );
        }
    }

    async getUserCalendars(accessToken: string) {
        const url = `${envs.graphApiRootUrl}/me/calendars`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            this.loggerAuthService.error('Error obteniendo calendarios', error);
            throw new InternalServerErrorException(
                'No se pudieron obtener los calendarios',
            );
        }
    }

    async createCalendarEvent(accessToken: string, eventData: any) {
        const url = `${envs.graphApiRootUrl}/me/events`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const response = await axios.post(url, eventData, { headers });
            return response.data; // datos del evento creado
        } catch (error) {
            this.loggerAuthService.error('Error creando evento en calendario', error);
            throw new InternalServerErrorException('No se pudo crear el evento');
        }
    }

    async deleteCalendarEvent(accessToken: string, eventId: string) {
        const url = `${envs.graphApiRootUrl}/me/events/${eventId}`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            await axios.delete(url, { headers });
        } catch (error) {
            this.loggerAuthService.error(
                'Error eliminando evento del calendario',
                error,
            );
            throw new InternalServerErrorException('No se pudo eliminar el evento');
        }
    }

    async updateCalendarEvent(
        accessToken: string,
        eventId: string,
        updateData: any,
    ) {
        const url = `${envs.graphApiRootUrl}/me/events/${eventId}`;
        const headers = { Authorization: `Bearer ${accessToken}` };

        try {
            const response = await axios.patch(url, updateData, { headers });
            return response.data; // devuelve el evento actualizado
        } catch (error) {
            this.loggerAuthService.error(
                'Error actualizando evento del calendario',
                error,
            );
            throw new InternalServerErrorException('No se pudo actualizar el evento');
        }
    }

    // async isEventDuplicate(
    //     accessToken: string,
    //     subject: string,
    //     startDateTime: string,
    // ): Promise<boolean> {
    //     const filter = `subject eq '${subject}' and start/dateTime eq '${startDateTime}'`;
    //     const url = `${envs.graphApiRootUrl}/me/events?$filter=${encodeURIComponent(filter)}`;
    //     const headers = { Authorization: `Bearer ${accessToken}` };

    //     const response = await axios.get(url, { headers });
    //     return response.data.value.length > 0;
    // }

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


    // async createCalendarEvent(accessToken: string, eventData: any) {
    //     try {
    //         // Generar o usar un iCalUId único para el evento
    //         if (!eventData.iCalUId) {
    //             eventData.iCalUId = uuidv4();
    //         }

    //         // Buscar si hay eventos con el mismo iCalUId (identificador único)
    //         const filter = `iCalUId eq '${eventData.iCalUId}'`;
    //         const urlCheck = `${envs.graphApiRootUrl}/me/events?$filter=${encodeURIComponent(filter)}`;
    //         const headers = { Authorization: `Bearer ${accessToken}` };

    //         const existing = await axios.get(urlCheck, { headers });
    //         if (existing.data.value.length > 0) {
    //             throw new Error('Evento duplicado detectado con el mismo identificador único');
    //         }

    //         // Crear evento
    //         const url = `${envs.graphApiRootUrl}/me/events`;
    //         const response = await axios.post(url, eventData, { headers });
    //         return response.data; // datos del evento creado

    //     } catch (error) {
    //         this.loggerAuthService.error('Error creando evento en calendario', error);
    //         throw new InternalServerErrorException('No se pudo crear el evento');
    //     }
    // }
}
