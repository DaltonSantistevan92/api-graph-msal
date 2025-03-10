import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    PORT : number;
    AZURE_SCOPES : string[];
    GRAPH_API_ROOT_URL : string;

    // Azure Authentication
    AZURE_TENANT_ID: string;
    AZURE_CLIENT_ID: string;
    AZURE_CLIENT_SECRET: string;
    AZURE_REDIRECT_URI: string;
}

const envsSchema = joi.object({
    PORT : joi.number().required(),
    AZURE_SCOPES : joi.array().items( joi.string() ).required(),
    GRAPH_API_ROOT_URL : joi.string().required(),
    AZURE_TENANT_ID: joi.string().required(),
    AZURE_CLIENT_ID: joi.string().required(),
    AZURE_CLIENT_SECRET: joi.string().required(),
    AZURE_REDIRECT_URI: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( {
    ...process.env,
    AZURE_SCOPES : process.env.AZURE_SCOPES?.split(',')
});

if ( error ) {
    throw new Error(`Config validation error: ${ error.message }`);
}

const envVars : EnvVars = value;

export const envs = {
    port : envVars.PORT,
    azureScope : envVars.AZURE_SCOPES,
    graphApiRootUrl : envVars.GRAPH_API_ROOT_URL,
    azureTenantId : envVars.AZURE_TENANT_ID,
    azureClientId : envVars.AZURE_CLIENT_ID,
    azureClientSecret : envVars.AZURE_CLIENT_SECRET,
    azureRedirectUri : envVars.AZURE_REDIRECT_URI,
}
