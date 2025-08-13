// import { generators, Issuer } from 'openid-client';
// import { IAuthRequest, IUnleashConfig, IUnleashServices, Logger, OidcSettingsSchema, SettingService, SYSTEM_USER_AUDIT } from 'unleash-server';
// const configId = 'unleash.enterprise.auth.oidc';
// const safeRedirect = (redirect) => {
//     const decodedRedirect = redirect ? decodeURIComponent(redirect) : '/';
//     const isValidRedirect = decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//');
//     return isValidRedirect ? decodedRedirect : '/';
// };
// import type { Response } from 'express';
// import { validateAcrValues } from './oidc-util.js';

// export default class OidcAuthProvider extends Provider {
//     private clearSiteDataOnLogout: boolean;
//     private cookieName: string;
//     private logger: Logger;
//     private settingService: SettingService;
//     private baseUriPath: string;
//     private unleashUrl: string;
//     private discoverUrl?;
//     private client?;
//     private version?;
//     private type?;
//     constructor(config: IUnleashConfig, services: IUnleashServices) {
//         super(config, services, 'open-id-connect');
//         this.clearSiteDataOnLogout = config.session.clearSiteDataOnLogout;
//         this.cookieName = config.session.cookieName;
//         this.logger = config.getLogger('/auth/oidc-provider.js');
//         this.settingService = services.settingService;
//         this.baseUriPath = config.server.baseUriPath;
//         this.unleashUrl = config.server.unleashUrl;
//         this.client = undefined;
//         this.version = undefined;
//         process.nextTick(() => this.load());
//         this.get('/login', this.login);
//         this.get('/callback', this.callback);
//         this.post('/callback', this.callback, undefined, 'application/x-www-form-urlencoded');
//         this.get('/callback', this.callback);
//         this.get('/logout', this.logoutStart);
//     }
//     async load(): Promise<void> {
//         try {
//             const settings = await this.syncOidcConfigurationWithEnvironment();
//             if (settings?.enabled && settings?.discoverUrl) {
//                 const discoverUrl = settings.discoverUrl.trim();
//                 const issuer = await Issuer.discover(discoverUrl);
//                 this.logger.info('loaded issuer: ', discoverUrl);
            
//                 this.version = settings.version;
//                 this.discoverUrl = discoverUrl;
//                 this.client = new issuer.Client({
//                     client_id: settings.clientId.trim(),
//                     client_secret: settings.secret.trim(),
//                     redirect_uris: [`${this.unleashUrl}/auth/oidc/callback`],
//                     response_types: ['code'],
//                     id_token_signed_response_alg: settings.idTokenSigningAlgorithm || 'RS256',
//                 });
//             }
//         }
//         catch (e) {
//             this.logger.warn('Failed to load OpenID Connect provider', e);
//         }
//     }
//     static async validateSettings(settings: any): Promise<void>{
//         await Issuer.discover(settings.discoverUrl);
//     }
//     static trimSettings(settings: any): any {
//         return {
//             ...settings,
//             discoverUrl: settings.discoverUrl?.trim(),
//             clientId: settings.clientId?.trim(),
//             secret: settings.secret?.trim(),
//         };
//     }
//     async getSettings() {
//         // TODO: use generic after Unleash 4.2 release
//         const settings = (await this.settingService.get(configId));
//         return settings;
//     }

//     async login(req: IAuthRequest<unknown, unknown, unknown, {
//         redirect?: string;
//     }>, res: Response): Promise<void> {
//         const redirect = req.query.redirect || '';
//         const settings = await this.getSettings();
//         if (!settings) {
//             res.redirect(`${this.baseUriPath}/login?errorMsg=${encodeURIComponent('OpenID Connect is not enabled')}`);
//         }
//         if (this.version !== settings.version) {
//             await this.load();
//         }
//         const nonce = generators.nonce();
//         const state = generators.state();
//         req.session.auth = {
//             type: this.type,
//             nonce,
//             state,
//         };
//         req.session.auth.redirect = redirect;
//         const config = {
//             scope: 'openid email profile',
//             response_mode: 'query',
//             nonce,
//             state,
//             acr_values: settings.acrValues || undefined,
//         };
//         if (settings.enableGroupSyncing && settings.addGroupsScope) {
//             config.scope += ' groups';
//         }
//         const url = this.client.authorizationUrl(config);
//         req.session.save(() => {
//             res.redirect(url);
//         });
//     }

//     getLogoutUrl(req, settings) {
//         let url = `${this.baseUriPath}/`;
//         if (!settings.enableSingleSignOut) {
//             return url;
//         }
//         try {
//             const { state, idToken } = req.session.auth;
//             if (!state || !idToken) {
//                 this.logger.error('No IdToken or state available on session.');
//                 return url;
//             }
//             url = this.client.endSessionUrl({
//                 state,
//                 id_token_hint: idToken,
//                 post_logout_redirect_uri: this.unleashUrl,
//             });
//         }
//         catch (error) {
//             this.logger.warn('Unable to perform logout with IDP.', error);
//         }
//         return url;
//     }

//     async logoutStart(req: IAuthRequest, res: Response): Promise<void> {
//         const settings = await this.getSettings();
//         const url = this.getLogoutUrl(req, settings);
//         req.session.destroy();
//         res.clearCookie(this.cookieName);
//         if (this.clearSiteDataOnLogout) {
//             res.set('Clear-Site-Data', '"cookies", "storage"');
//         }
//         res.redirect(url);
//     }
//     async callback(req: IAuthRequest, res: Response): Promise<void> {
//         try {
//             const settings = await this.getSettings();
//             if (this.version !== settings.version) {
//                 await this.load();
//             }
//             const { state, nonce, redirect } = req.session.auth;
//             const sanitizedRedirect = safeRedirect(redirect);
//             const params = this.client.callbackParams(req);
//             const tokenSet = await this.client.callback(`${this.unleashUrl}/auth/oidc/callback`, params, { nonce, state });
//             validateAcrValues(settings, tokenSet.claims());
//             this.logger.info('Successfully validated ACR values in OIDC provider');
//             req.session.auth = {
//                 type: this.type,
//                 state,
//                 idToken: tokenSet.id_token,
//             };
//             const userInfo = await this.client.userinfo(tokenSet.access_token);
//             this.logger.info(`Retrieved user info from OIDC provider`);
//             const { email, name } = userInfo;
//             const user = await this.getOrCreateUser(email, settings, name);
//             await this.syncExternalGroups(user.id, userInfo, settings);
//             this.logger.info(`${email} just logged in with OpenID Connect`);
//             await this.successfulLoginEvent(email, req.ip);
//             req.session.user = user;
//             req.session.logoutUrl = `${this.baseUriPath}/auth/oidc/logout`;
//             res.redirect(`${this.baseUriPath}${sanitizedRedirect}`);
//         }
//         catch (error) {
//             const msg = `Unable to sign in with OpenID Connect`;
//             this.logger.warn(msg, error);
//             await this.failedLoginEvent(error, req.ip);
//             res.status(400);
//             res.send(`
//             <h1>Login failed</h1>
//             <p>${msg}</p>
//             <a href='/'>go back</a>
//         `);
//         }
//     }
//     async syncOidcConfigurationWithEnvironment(): Promise<OidcSettingsSchema | undefined> {
//         const environmentSettings = readOidcConfigurationFromEnvironmentVariables();
//         if (environmentSettings !== undefined) {
//             // Only change from environment if environment says it is enabled
//             if (environmentSettings.enabled) {
//                 const storedSettings = await this.settingService.get(configId);
//                 const activeEnvironmentSettings = Object.fromEntries(Object.entries(environmentSettings).filter(([_, value]) => value !== undefined));
//                 let updatedSettings = {
//                     ...storedSettings,
//                     ...activeEnvironmentSettings,
//                 }; // Override settings in database with settings from environment. Then update database with new settings.
//                 updatedSettings =
//                     OidcAuthProvider.trimSettings(updatedSettings);
//                 await OidcAuthProvider.validateSettings(updatedSettings);
//                 await this.settingService.insert(configId, updatedSettings, SYSTEM_USER_AUDIT);
//                 return updatedSettings;
//             }
//             else {
//                 this.logger.info('OIDC explicitly disabled through environment variable.');
//                 await this.settingService.insert(configId, { enabled: false }, SYSTEM_USER_AUDIT);
//                 return undefined;
//             }
//         }
//         else {
//             return this.settingService.get(configId);
//         }
//     }
// }
// //# sourceMappingURL=oidc-provider.js.map