import { FromSchema } from "json-schema-to-ts";

export const projectCreatedSchema = {
    $id: '#/components/schemas/projectCreatedSchema',
    type: 'object',
    required: ['id', 'name'],
    description: 'Details about the newly created project.',
    additionalProperties: false,
    properties: {
        id: {
            description: "The project's identifier.",
            type: 'string',
            pattern: '[A-Za-z0-9_~.-]+',
            example: 'pet-shop',
        },
        name: {
            description: "The project's name.",
            type: 'string',
            minLength: 1,
            example: 'Pet shop',
        },
        description: {
            description: "The project's description.",
            type: 'string',
            nullable: true,
            example: 'This project contains features related to the new pet shop.',
        },
        featureLimit: {
            type: 'integer',
            nullable: true,
            example: 100,
            description: 'A limit on the number of features allowed in the project. `null` if no limit.',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected', 'private'],
            example: 'open',
            description: 'A mode of the project affecting what actions are possible in this project',
        },
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            description: 'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
        environments: {
            type: 'array',
            items: {
                type: 'string',
            },
            description: 'The environments enabled for the project.',
            example: ['production', 'staging'],
        },
        changeRequestEnvironments: {
            type: 'array',
            description: 'The list of environments that have change requests enabled.',
            items: {
                type: 'object',
                required: ['name', 'requiredApprovals'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'production',
                        description: 'The name of the environment this change request configuration applies to.',
                    },
                    requiredApprovals: {
                        type: 'integer',
                        example: 3,
                        minimum: 1,
                        default: 1,
                        description: 'The number of approvals required for a change request to be fully approved and ready to applied in this environment. If no value is provided, it will be set to the default number, which is 1. The value must be greater than or equal to 1.',
                    },
                },
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ProjectCreatedSchema = FromSchema<typeof projectCreatedSchema>;