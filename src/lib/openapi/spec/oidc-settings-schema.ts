import { FromSchema } from "json-schema-to-ts";

const enabledProperty = {
    description: 'Whether to enable or disable OpenID Connect for this instance',
    type: 'boolean',
} as const;
const sharedProperties = {
    discoverUrl: {
        description: 'The [.well-known OpenID discover URL](https://swagger.io/docs/specification/authentication/openid-connect-discovery/)',
        example: 'https://myoidchost.azure.com/.well-known/openid-configuration',
        type: 'string',
        format: 'uri',
    },
    clientId: {
        description: 'The OIDC client ID of this application.',
        example: 'FB87266D-CDDB-4BCF-BB1F-8392FD0EDC1B',
        type: 'string',
    },
    secret: {
        description: 'Shared secret from OpenID server. Used to authenticate login requests',
        type: 'string',
        example: 'qjcVfeFjEfoYAF3AEsX2IMUWYuUzAbXO',
    },
    autoCreate: {
        description: 'Auto create users based on email addresses from login tokens',
        type: 'boolean',
    },
    enableSingleSignOut: {
        description: 'Support Single sign out when user clicks logout in Unleash. If `true` user is signed out of all OpenID Connect sessions against the clientId they may have active',
        type: 'boolean',
    },
    defaultRootRole: {
        description: '[Default role](https://docs.getunleash.io/reference/rbac#standard-roles) granted to users auto-created from email. Only relevant if autoCreate is `true`',
        type: 'string',
        enum: ['Viewer', 'Editor', 'Admin'],
    },
    defaultRootRoleId: {
        description: 'Assign this root role to auto created users. Should be a role ID and takes precedence over `defaultRootRole`.',
        type: 'number',
        example: 2,
    },
    emailDomains: {
        description: 'Comma separated list of email domains that are automatically approved for an account in the server. Only relevant if autoCreate is `true`',
        type: 'string',
        example: 'getunleash.io,getunleash.ai',
    },
    acrValues: {
        description: 'Authentication Context Class Reference, used to request extra values in the acr claim returned from the server. If multiple values are required, they should be space separated. \n ' +
            'Consult [the OIDC reference](https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint) for more information \n',
        type: 'string',
        example: 'urn:okta:loa:2fa:any phr',
    },
    idTokenSigningAlgorithm: {
        description: 'The signing algorithm used to sign our token. Refer to the [JWT signatures](https://jwt.io/introduction) documentation for more information.',
        type: 'string',
        example: 'RS256',
        enum: ['RS256', 'RS384', 'RS512'],
    },
    enableGroupSyncing: {
        description: 'Should we enable group syncing. Refer to the documentation [Group syncing](https://docs.getunleash.io/how-to/how-to-set-up-group-sso-sync)',
        type: 'boolean',
        example: false,
    },
    groupJsonPath: {
        description: 'Specifies the path in the OIDC token response to read which groups the user belongs to from.',
        type: 'string',
        example: 'groups',
    },
    addGroupsScope: {
        description: "When enabled Unleash will also request the 'groups' scope as part of the login request.",
        type: 'boolean',
        example: false,
    },
} as const;
export const enableOidcSchema = {
    $id: '#/components/schemas/enableOidcSchema',
    components: {},
    required: ['enabled', 'clientId', 'secret'],
    type: 'object',
    properties: {
        enabled: {
            ...enabledProperty,
            example: true,
            enum: [true],
        },
        ...sharedProperties,
    },
} as const;
const disableOidcSchema = {
    type: 'object',
    properties: {
        enabled: {
            ...enabledProperty,
            example: false,
            enum: [false],
        },
        ...sharedProperties,
    },
} as const;
export const oidcSettingsSchema = {
    $id: '#/components/schemas/oidcSettingsSchema',
    type: 'object',
    description: 'Settings for configuring OpenID Connect as a login provider for Unleash',
    components: {},
    oneOf: [enableOidcSchema, disableOidcSchema],
} as const;
//# sourceMappingURL=oidc-settings-schema.js.map

export type OidcSettingsSchema = FromSchema<typeof oidcSettingsSchema>;