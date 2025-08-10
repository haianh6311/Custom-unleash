import { FromSchema } from "json-schema-to-ts";

export const createProjectSchema = {
    $id: '#/components/schemas/createProjectSchema',
    type: 'object',
    required: ['name'],
    description: 'Data used to create a new [project](https://docs.getunleash.io/reference/projects).',
    properties: {
        id: {
            deprecated: true,
            description: "The project's identifier. If this property is not present or is an empty string, Unleash will generate the project id automatically. This property is deprecated.",
            type: 'string',
            pattern: '[A-Za-z0-9_~.-]*',
            example: 'pet-shop',
        },
        name: {
            description: "The project's name. The name must contain at least one non-whitespace character.",
            type: 'string',
            pattern: '^(?!\\s*$).+',
            example: 'Pet shop',
        },
        description: {
            description: "The project's description.",
            type: 'string',
            nullable: true,
            example: 'This project contains features related to the new pet shop.',
        },
        mode: {
            type: 'string',
            enum: ['open', 'protected', 'private'],
            example: 'open',
            default: 'open',
            description: 'A mode of the project affecting what actions are possible in this project',
        },
        defaultStickiness: {
            type: 'string',
            example: 'userId',
            default: 'default',
            description: 'A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy',
        },
        environments: {
            type: 'array',
            items: {
                type: 'string',
                example: 'production',
            },
            description: 'A list of environments that should be enabled for this project. If this property is missing, Unleash will default to enabling all non-deprecated environments for the project. An empty list will result in no environment enabled for the project.',
            example: ['production', 'development'],
        },
        changeRequestEnvironments: {
            type: 'array',
            description: 'A list of environments that should have change requests enabled. If the list includes environments not in the `environments` list, they will still have change requests enabled.',
            items: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'production',
                        description: 'The name of the environment to configure change requests for.',
                    },
                    requiredApprovals: {
                        type: 'integer',
                        example: 3,
                        default: 1,
                        description: 'The number of approvals required for a change request to be fully approved and ready to applied in this environment. If no value is provided, it will be set to the default number, which is 1. Values will be clamped to between 1 and 10 inclusive.',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type CreateProjectSchema = FromSchema<typeof createProjectSchema>;