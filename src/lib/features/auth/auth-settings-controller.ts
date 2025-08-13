import joi from 'joi';
import crypto from 'crypto';
import type { Response } from 'express';
import { AccessService, Controller, Db, IAuthRequest, IUnleashConfig, IUnleashServices, Logger, OidcSettingsResponseSchema, OidcSettingsSchema, OpenApiService, SettingService, } from 'unleash-server';
import { ADMIN, BadDataError, createRequestSchema, createResponseSchema, getStandardResponses, NONE, UPDATE_AUTH_CONFIGURATION, } from 'unleash-server';
import { oidcSettings } from './oidc-settings-schema.js'; 
import { oidcConfigId } from './util.js';
import { Issuer } from 'openid-client';
class AuthSettingsController extends Controller {
    private logger: Logger ;
    private settingService: SettingService;
    private accessService: AccessService;
    private openApiService: OpenApiService;
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
        super(config);
        this.logger = config.getLogger('/routes/auth-settings-controller');
        this.settingService = services.settingService;
        this.accessService = services.accessService;
        this.openApiService = services.openApiService;
        this.route({
            method: 'get',
            path: '/oidc/settings',
            handler: this.getOidcSettings,
            permission: [ADMIN, UPDATE_AUTH_CONFIGURATION],
            middleware: [
                this.openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Get OIDC auth settings',
                    description: 'Returns the current settings for OIDC Authentication',
                    operationId: 'getOidcSettings',
                    responses: {
                        200: createResponseSchema('oidcSettingsResponseSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/oidc/settings',
            handler: this.setOidcSettings,
            permission: [ADMIN, UPDATE_AUTH_CONFIGURATION],
            middleware: [
                this.openApiService.validPath({
                    tags: ['Auth'],
                    operationId: 'setOidcSettings',
                    summary: 'Set OIDC settings',
                    description: 'Configure OpenID Connect as a login provider for Unleash.',
                    requestBody: createRequestSchema('oidcSettingsSchema'),
                    responses: {
                        200: createResponseSchema('oidcSettingsResponseSchema'),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }
    
    async getOidcSettings(req: IAuthRequest, res: Response<OidcSettingsSchema | Object>): Promise<void> {
        const settings = await this.settingService.get(oidcConfigId);
        if (settings) {
            res.send(settings);
        }
        else {
            res.send({});
        }
    }
    async setOidcSettings(req: IAuthRequest<unknown, unknown, OidcSettingsSchema>, res: Response<OidcSettingsResponseSchema | joi.ValidationError>): Promise<void> {
        const validateSettings = async (settings: any): Promise<void> => {
            await Issuer.discover(settings.discoverUrl);
        }

        const trimSettings = (settings: any): any => {
            return {
                ...settings,
                discoverUrl: settings.discoverUrl?.trim(),
                clientId: settings.clientId?.trim(),
                secret: settings.secret?.trim(),
            };
        }
        const data = req.body;
        const { error, value } = oidcSettings.validate(data);
        if (error) {
            this.logger.warn('Could not store Open ID Connect settings', error);
            res.status(400).send(error);
        }
        else {
            const trimmedSettings = trimSettings(value);
            try {
                if (value.enabled || value.discoverUrl) {
                    await validateSettings(trimmedSettings);
                }
            }
            catch (e) {
                this.logger.error(e);
                throw new joi.ValidationError('Could not load discoverUrl', [
                    {
                        message: 'Could not load discoverUrl',
                        path: ['discoverUrl'],
                        type: 'url',
                    },
                ], { discoverUrl: trimmedSettings.discoverUrl });
            }
            const defaultRootRoleId = await this.resolveDefaultRootRoleId(trimmedSettings);
            const version = crypto.randomBytes(8).toString('hex');
            const newSettings = {
                ...trimmedSettings,
                defaultRootRoleId,
                version,
            };
            await this.settingService.insert(oidcConfigId, newSettings, req.audit);
            res.send(trimmedSettings);
        }
    }
    async resolveDefaultRootRoleId(value: any): Promise<number>{
        if (value.defaultRootRoleId) {
            return Promise.resolve(value.defaultRootRoleId);
        }
        if (value.defaultRootRole) {
            const role = await this.accessService.getRoleByName(value.defaultRootRole);
            if (role) {
                return role.id;
            }
            throw new BadDataError(`Could not find role with name ${value.defaultRootRole}.`);
        }
        throw new BadDataError(`Could not find root role.`);
    }

}
export default AuthSettingsController;
//# sourceMappingURL=auth-settings-controller.js.map