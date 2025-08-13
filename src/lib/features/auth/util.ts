export function buildName(firstName?: string, lastName?: string): string | undefined {
    if (firstName && lastName) {
        return `${firstName.trim()} ${lastName.trim()}`;
    }
    if (lastName) {
        return lastName.trim();
    }
    if (firstName) {
        return firstName.trim();
    }
    return undefined;
}
const formatUnknownError = (error: any) => {
    if (error instanceof Error) {
        return error.message || error.toString();
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error';
};
export const parseError = (error: unknown, known_username?: string) : {
    username: string;
    failure_reason: string;
} => {
    const failure_reason = formatUnknownError(error);
    const username = known_username ||
        failure_reason.split('email=')[1] ||
        'Incorrectly configured provider';
    return {
        username,
        failure_reason,
    };
};
export const samlConfigId = 'unleash.enterprise.auth.saml';
export const oidcConfigId = 'unleash.enterprise.auth.oidc';
export const simpleConfigId = 'unleash.auth.simple';

type TokenSigningAlgorithm = 'RS256' | 'RS384' | 'RS512';

export function findTokenSigningAlgorithm(envValue: string | undefined): TokenSigningAlgorithm | undefined {
    const allowedAlgorithms = ['RS256', 'RS384', 'RS512'];
    if (envValue && allowedAlgorithms.includes(envValue)) {
        return envValue as TokenSigningAlgorithm;
    }
    return undefined;
}

type RootRole = 'Viewer' | 'Editor' | 'Admin';
export function findDefaultRootRole(envValue: string | undefined): RootRole | undefined {
    const allowedRoles = ['Viewer', 'Editor', 'Admin'];
    if (envValue && allowedRoles.includes(envValue)) {
        return envValue as RootRole;
    }
    return undefined;
}
//# sourceMappingURL=util.js.map