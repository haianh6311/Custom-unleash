import { OidcSettingsSchema, parseEnvVarBoolean } from 'unleash-server';
import { findDefaultRootRole, findTokenSigningAlgorithm } from './util.js';
import { IdTokenClaims } from 'openid-client';
export interface IOIDCSettings {
    enabled: boolean;
    version: string;
    acrValues?: string;
    enableGroupSyncing: boolean;
    groupJsonPath?: string;
    addGroupsScope?: boolean;
}
export function validateAcrValues(settings: IOIDCSettings, claims: IdTokenClaims): boolean {
    if (settings.acrValues) {
        if (!settings.acrValues.split(' ').includes(claims.acr || "")) {
            throw new TypeError(`acr_values and "acr claim" does not match. Claims=${JSON.stringify(claims)}`);
        }
    }
    return true;
}
export function readOidcConfigurationFromEnvironmentVariables(): OidcSettingsSchema | undefined {
    const oidcEnabledIsDefined = process.env.OIDC_ENABLED !== undefined;
    if (!oidcEnabledIsDefined) {
        return undefined;
    }
    const oidcEnabled = parseEnvVarBoolean(process.env.OIDC_ENABLED, false);
    if (!oidcEnabled) {
        return {
            enabled: false,
        };
    }
    const unsetRequiredVariables = [
        'OIDC_DISCOVER_URL',
        'OIDC_CLIENT_ID',
        'OIDC_CLIENT_SECRET',
    ].filter((required) => !process.env[required]);
    if (unsetRequiredVariables.length > 0) {
        throw new Error(`You've enabled OIDC, but are missing required configuration. Please make sure that ${unsetRequiredVariables.join(', ')} variables are set`);
    }
    const oidcDiscoverUrl = process.env.OIDC_DISCOVER_URL;
    const oidcClientId = process.env.OIDC_CLIENT_ID;
    const oidcSecret = process.env.OIDC_CLIENT_SECRET;
    const oidcAutoCreate = parseEnvVarBoolean(process.env.OIDC_AUTO_CREATE, false);
    const oidcEnableSingleSignOut = parseEnvVarBoolean(process.env.OIDC_ENABLE_SINGLE_SIGN_OUT, false);
    const oidcDefaultRootRoleId = process.env.OIDC_DEFAULT_ROOT_ROLE_ID !== undefined
        ? Number.parseInt(process.env.OIDC_DEFAULT_ROOT_ROLE_ID, 10)
        : undefined;
    const oidcEmailDomains = process.env.OIDC_AUTO_CREATE_EMAIL_DOMAINS;
    const oidcAcrValues = process.env.OIDC_ACR_VALUES;
    const idTokenSigningAlgorithm = findTokenSigningAlgorithm(process.env.OIDC_ID_TOKEN_SIGNING_ALGORITHM) || 'RS256';
    const oidcDefaultRootRole = findDefaultRootRole(process.env.OIDC_DEFAULT_ROOT_ROLE);
    const enableGroupSyncing = parseEnvVarBoolean(process.env.OIDC_ENABLE_GROUP_SYNCING, false);
    const groupJsonPath = process.env.OIDC_GROUP_JSON_PATH;
    const addGroupsScope = parseEnvVarBoolean(process.env.OIDC_ADD_GROUPS_SCOPE, false);
    return {
        enabled: oidcEnabled,
        discoverUrl: oidcDiscoverUrl,
        clientId: oidcClientId || "",
        secret: oidcSecret || "",
        autoCreate: oidcAutoCreate,
        enableSingleSignOut: oidcEnableSingleSignOut,
        defaultRootRole: oidcDefaultRootRole,
        defaultRootRoleId: oidcDefaultRootRoleId,
        emailDomains: oidcEmailDomains,
        acrValues: oidcAcrValues,
        idTokenSigningAlgorithm,
        enableGroupSyncing,
        groupJsonPath,
        addGroupsScope,
    };
}
//# sourceMappingURL=oidc-util.js.map