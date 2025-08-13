import Joi from 'joi';

export const oidcSettings : Joi.ObjectSchema<any> = Joi.object({
    enabled: Joi.boolean().default(false),
    discoverUrl: Joi.string()
        .allow('')
        .optional()
        .default((context) => context.discoverUrl?.trim() ?? '')
        .uri({ allowRelative: false }),
    clientId: Joi.string().default(''),
    secret: Joi.string().default(''),
    autoCreate: Joi.boolean().default(false),
    defaultRootRole: Joi.string()
        .valid('Viewer', 'Editor', 'Admin')
        .default('Editor'),
    defaultRootRoleId: Joi.number(),
    emailDomains: Joi.string(),
    enableSingleSignOut: Joi.bool().default(false),
    addGroupsScope: Joi.bool().default(false),
    acrValues: Joi.string().allow('').optional().trim(),
    enableGroupSyncing: Joi.boolean().default(false),
    groupJsonPath: Joi.string()
        .trim()
        .regex(/^[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$/)
        .messages({
        'string.pattern.base': 'Group Json Path must be a valid JSON lookup',
    }),
}).options({ stripUnknown: true });
