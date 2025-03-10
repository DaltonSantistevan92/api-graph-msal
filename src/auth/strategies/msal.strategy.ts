// src/auth/strategies/msal.strategy.ts
/* import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-strategy';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { msalConfig } from '../msal.config';
import { envs } from 'src/config';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class MsalStrategy extends PassportStrategy( Strategy, 'azure-msal')  {
    private msalClient: ConfidentialClientApplication;

    constructor() {
        super();
        this.msalClient = new ConfidentialClientApplication(msalConfig);
    }

    async validate(token: string): Promise<any> {
        // console.log({token});

        try {
            const result = await this.msalClient.acquireTokenOnBehalfOf({
                oboAssertion: token,
                scopes: envs.azureScope
            });

            console.log('MsalStrategy validate', result);
            
            
            return {
                id: result.account.homeAccountId,
                roles: result.account.idTokenClaims?.roles || []
            };
        } catch (error) {
            throw new Error(`MSAL validation failed: ${error.message}`);
        }
    }

    authenticate(req: any) {
        const token = this.extractToken(req);  
        // console.log('MsalStrategy authenticate token',token);
        
        if (!token) throw new UnauthorizedException('authenticate Token no válido'); 

        this.validate(token)
            .then(user => {
                console.log({user});
                
            })
            .catch(err =>  {
                // console.error('MSAL validation failed:', err);
                throw new UnauthorizedException({
                    statusCode: 401,
                    message: 'Autenticación fallida. Por favor, inténtelo de nuevo.',
                    error: 'MSAL validation failed'
                });
                // throw new UnauthorizedException(err);
            });
    }

    private extractToken(req: Request): string | null {
        return req.headers.authorization?.split(' ')[1] || null;
    }

    // private extractTokenFromHeader(request: Request): string | undefined {
    //     const [type, token] = request.headers.authorization?.split(' ') ?? [];
    //     return type === 'Bearer' ? token : undefined;
    // }


    



} */



import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { envs } from 'src/config';
import { Request } from 'express';
import { jwtDecode } from "jwt-decode";


@Injectable()
export class MsalStrategy extends PassportStrategy(Strategy, 'azure-msal') {


    private msalClient: ConfidentialClientApplication;

    constructor() {
        super();
        this.msalClient = new ConfidentialClientApplication({
            auth: {
                clientId: envs.azureClientId,
                authority: `https://login.microsoftonline.com/${envs.azureTenantId}`,
                clientSecret: envs.azureClientSecret
            }
        });
    }

    async authenticate(req: Request): Promise<any> {
        try {
          // Obtener token de headers o cookies
          const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
          if (!token) {
            throw new Error('No token found');
          }
    
          // Llamar al método validate para verificar el token
          return this.validate(token);
        } catch (error) {
          throw new Error(`Error al validar el token: ${error.message}`);
        }
      }
    
      async validate(token: string): Promise<any> {
        try {
          // Validar el token con MSAL o cualquier otro método
          const decodedToken: any = jwtDecode(token);
    
          // Verificar claims específicos de MSAL
          if (
            decodedToken.iss === `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}` &&
            decodedToken.aud === process.env.AZURE_CLIENT_ID
          ) {
            // Token válido emitido por MSAL
            return decodedToken;
          } else {
            throw new Error('Token no válido');
          }
        } catch (error) {
          throw new Error(`Error al validar el token: ${error.message}`);
        }
      }


    // async validate(token: string): Promise<any> {
    //     try {
    //       // Decodificar el token JWT
    //       const decodedToken: any = jwtDecode(token);
    
    //       // Verificar claims específicos de MSAL
    //       if (
    //         decodedToken.iss === `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}` &&
    //         decodedToken.aud === process.env.AZURE_CLIENT_ID
    //       ) {
    //         // Token válido emitido por MSAL
    //         return decodedToken;
    //       } else {
    //         throw new Error('Token no válido');
    //       }
    //     } catch (error) {
    //       throw new Error(`Error al validar el token: ${error.message}`);
    //     }
    //   }







//   private msalClient: ConfidentialClientApplication;
//   private cryptoProvider: CryptoProvider;

//   constructor() {
//     super();
    
//     this.msalClient = new ConfidentialClientApplication({
//       auth: {
//         clientId: envs.azureClientId,
//         authority: `https://login.microsoftonline.com/${envs.azureTenantId}`,
//         clientSecret: envs.azureClientSecret
//       }
//     });

//     this.cryptoProvider = new CryptoProvider();
//   }


//   async validate(req: Request): Promise<any> {
//     try {
//       // Verificar token
//       const token = req.headers.authorization?.split(' ')[1];
      
//       if (!token) {
//         throw new Error('No token found');
//       }

//       // Validar token con MSAL
//       const result = await this.msalClient.acquireTokenSilent({
//         scopes: [envs.azureClientId + '/.default'],
//         account: await this.getAccountFromToken(token)
//       });

//       // Devolver usuario autenticado
//       return {
//         oid: result.account?.idTokenClaims?.oid,
//         email: result.account?.username,
//         name: result.account?.name,
//         roles: result.account?.idTokenClaims?.roles || []
//       };
//     } catch (error) {
//       throw new Error(`Authentication failed: ${error.message}`);
//     }
//   }

//   private async getAccountFromToken(token: string): Promise<any> {
//     // 1. Obtener cache del token correctamente
//     const tokenCache = this.msalClient.getTokenCache();
    
//     // 2. Hashear el token con el método correcto de CryptoProvider
//     const tokenHash = this.cryptoProvider.hashString()
//         .substring(0, 16); // Primeros 16 caracteres del hash SHA-256

//     // 3. Usar el método correcto para buscar la cuenta
//     return tokenCache.getAccountByLocalId(tokenHash);
// }


 /*  private async getAccountFromToken(token: string): Promise<any> {
    const tokenClaims = await this.msalClient.getTokenCache().deserialize(token);
    return tokenClaims.getAccountByLocalAccountId(
      this.cryptoProvider.hashToken(token).substring(0, 16)
    );
  } */
}

