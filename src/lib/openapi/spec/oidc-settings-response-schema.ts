import { FromSchema } from 'json-schema-to-ts';
import { enableOidcSchema } from './oidc-settings-schema.js';
export const oidcSettingsResponseSchema = {
    $id: '#/components/schemas/oidcSettingsResponseSchema',
    type: 'object',
    description: 'Response for OpenID Connect settings',
    components: {},
    properties: {
        ...enableOidcSchema.properties,
    },
} as const;

export type OidcSettingsResponseSchema = FromSchema<typeof oidcSettingsResponseSchema>;