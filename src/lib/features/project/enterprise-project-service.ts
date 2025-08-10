// import { IUnleashConfig } from "../../types/index.js";
// import ProjectService from "./project-service.js";

// export class EnterpriseProjectService {
//     private logger: any;
//     private projectService: ProjectService;
//     private changeRequestConfigService: ChangeRequestService;
//     private actionsService: ActionsService;
//     private flagResolver: any;
//     constructor({ getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>, { projectService, changeRequestConfigService, actionsService, }: {
//         projectService: ProjectService;
//         actionsService: ActionsService;
//         changeRequestConfigService: ChangeRequestConfigService;
//     }) {
//         this.projectService = projectService;
//         this.changeRequestConfigService = changeRequestConfigService;
//         this.actionsService = actionsService;
//         this.logger = getLogger('services/enterprise-project-service.js');
//         this.flagResolver = flagResolver;
//     }

//     async archiveProject(id: string, auditUser: IAuditUser): Promise<Void> {
//         await this.projectService.archiveProject(id, auditUser);
//         if (this.flagResolver.isEnabled('automatedActions')) {
//             await this.actionsService.toggleProjectActionSets(id, false, auditUser);
//         }
//     }

//     async createProject(newProject: CreateProject, user: IUser, auditUser: IAuditUser): Promise<ProjectCreated> {
//         const configureChangeRequests = async (changeRequestEnvironments) => {
//             const withApprovals = changeRequestEnvironments.map(({ name, requiredApprovals }) => ({
//                 projectId: newProject.id,
//                 environment: name,
//                 changeRequestEnabled: true,
//                 requiredApprovals: requiredApprovals || 1,
//             }));
//             await Promise.all(withApprovals.map((config) => {
//                 this.changeRequestConfigService.updateProjectChangeRequestConfig(config, auditUser);
//             }));
//             return withApprovals.map(({ environment, requiredApprovals }) => ({
//                 name: environment,
//                 requiredApprovals,
//             }));
//         };
//         const { id, name, description, defaultStickiness, mode, environments, changeRequestEnvironments, } = await this.projectService.createProject(newProject, user, auditUser, configureChangeRequests);
//         return {
//             id,
//             name,
//             description,
//             defaultStickiness,
//             mode,
//             environments,
//             changeRequestEnvironments,
//         };
//     }
// }