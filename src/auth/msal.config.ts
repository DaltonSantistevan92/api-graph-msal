import { Configuration } from '@azure/msal-node';
import { envs } from 'src/config';

export const msalConfig: Configuration = {
    auth: {
        clientId: envs.azureClientId,
        authority: `https://login.microsoftonline.com/${envs.azureTenantId}`,
        clientSecret: envs.azureClientSecret
    },
    system: {
        loggerOptions: {
            loggerCallback: (loglevel, message) =>{
                // console.log({loglevel})

                // console.log({message})
            } 
        }
    }
};