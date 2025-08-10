// import { eventtypes, BaseEvent } from 'unleash-server';
// import { BadDataError, NameExistsError, } from 'unleash-server';
// import { throwExceedsLimitError } from 'unleash-server';
// import { ACTIONS } from './constants/actions.js';
// import { ActionDeletedEvent } from './action-events.js';
// class ActionsCreatedEvent extends BaseEvent {
//     constructor(eventData) {
//         super(eventtypes.ACTIONS_CREATED, eventData.auditUser);
//         this.data = eventData.data;
//     }
// }
// export class ActionsService {
//     constructor({ actionSetStore, actionsStore, actionSetEventsStore, eventService, }, { getLogger, resourceLimits, eventBus, }) {
//         this.actionSetStore = actionSetStore;
//         this.actionsStore = actionsStore;
//         this.actionSetEventsStore = actionSetEventsStore;
//         this.eventService = eventService;
//         this.resourceLimits = resourceLimits;
//         this.logger = getLogger('actions-service');
//         this.eventBus = eventBus;
//     }
//     async getActionSetsWithActions(sets) {
//         const setIds = sets.map(({ id }) => id);
//         const actions = await this.actionsStore.getAllByActionSetIds(setIds);
//         return sets.map((set) => ({
//             ...set,
//             actions: actions
//                 .filter((action) => action.actionSetId === set.id)
//                 .map(({ actionSetId, ...actionWithoutSetReference }) => actionWithoutSetReference),
//         }));
//     }
//     async getActionSets() {
//         const sets = await this.actionSetStore.getAll();
//         return this.getActionSetsWithActions(sets);
//     }
//     async getActionSetsByProject(project) {
//         const sets = await this.actionSetStore.getAllByProject(project);
//         return this.getActionSetsWithActions(sets);
//     }
//     async getActionSet(id, project) {
//         const set = await this.actionSetStore.getByIdAndProject(id, project);
//         const actions = await this.actionsStore.getByActionSetId(id);
//         return {
//             ...set,
//             actions,
//         };
//     }
//     async createActionSet({ actions, ...set }, project, createdBy) {
//         await this.validateUniqueName(set.name, project);
//         await this.validateMaxActionSets(project);
//         this.validateMaxActions(actions);
//         this.validateFilters(set.match);
//         this.validateActions(actions);
//         const createdByUserId = createdBy.id;
//         const actionSet = await this.actionSetStore.insert({
//             ...set,
//             project,
//             createdByUserId,
//         });
//         const actionList = await this.actionsStore.bulkInsert(actions.map(({ executionParams, ...action }) => ({
//             actionSetId: actionSet.id,
//             ...action,
//             executionParams: executionParams || {},
//             createdByUserId,
//         })));
//         const created = {
//             ...actionSet,
//             actions: actionList,
//         };
//         await this.eventService.storeEvent(new ActionsCreatedEvent({
//             data: created,
//             auditUser: createdBy,
//         }));
//         return created;
//     }
//     async updateActionSet(id, project, { actions, ...set }, createdBy) {
//         await this.validateUniqueName(set.name, project, id);
//         this.validateMaxActions(actions);
//         this.validateFilters(set.match);
//         this.validateActions(actions);
//         const createdByUserId = createdBy.id;
//         const preActionSet = await this.getActionSet(id, project);
//         const actionSet = await this.actionSetStore.update(id, set);
//         await this.actionsStore.deleteByActionSetId(id);
//         const actionList = await this.actionsStore.bulkInsert(actions.map(({ executionParams, ...action }) => ({
//             actionSetId: actionSet.id,
//             ...action,
//             executionParams: executionParams || {},
//             createdByUserId,
//         })));
//         const updated = {
//             ...actionSet,
//             actions: actionList,
//         };
//         await this.eventService.storeEvent({
//             type: eventtypes.ACTIONS_UPDATED,
//             createdBy: createdBy.username,
//             createdByUserId: createdByUserId,
//             ip: createdBy.ip,
//             preData: preActionSet,
//             data: updated,
//         });
//         return updated;
//     }
//     async deleteActionSet(id, project, auditUser) {
//         const actionSet = await this.getActionSet(id, project);
//         await this.actionSetStore.delete(id);
//         await this.eventService.storeEvent(new ActionDeletedEvent({
//             preData: actionSet,
//             auditUser,
//         }));
//     }
//     async toggleProjectActionSets(project, enabled, createdBy) {
//         const actionsSets = await this.actionSetStore.getAllByProject(project);
//         const enabledActionsSets = actionsSets.filter((actionSet) => actionSet.enabled);
//         const results = [];
//         for (const actionSet of enabledActionsSets) {
//             const result = await this.toggleActionSet(actionSet.id, actionSet.project, enabled, createdBy);
//             results.push(result);
//         }
//         return results;
//     }
//     async toggleActionSet(id, project, enabled, createdBy) {
//         const preActionSet = await this.getActionSet(id, project);
//         await this.actionSetStore.toggle(id, enabled);
//         const updatedActionSet = {
//             ...preActionSet,
//             enabled,
//         };
//         await this.eventService.storeEvent({
//             type: eventtypes.ACTIONS_UPDATED,
//             createdBy: createdBy.username,
//             createdByUserId: createdBy.id,
//             ip: createdBy.ip,
//             preData: preActionSet,
//             data: updatedActionSet,
//         });
//         return updatedActionSet;
//     }
//     async validateUniqueName(name, project, id) {
//         const exists = id
//             ? await this.actionSetStore.existsByNameWithDifferentId(name, project, id)
//             : await this.actionSetStore.existsByName(name, project);
//         if (exists) {
//             throw new NameExistsError(`Action set with name ${name} already exists`);
//         }
//     }
//     async getPaginatedEvents(id, limit, offset) {
//         return this.actionSetEventsStore.getPaginatedEvents(id, limit, offset);
//     }
//     async validateMaxActionSets(project) {
//         const count = await this.actionSetStore.count({ project });
//         if (count >= this.resourceLimits.actionSetsPerProject) {
//             throwExceedsLimitError(this.eventBus, {
//                 resource: 'action sets per project',
//                 limit: this.resourceLimits.actionSetsPerProject,
//             });
//         }
//     }
//     validateMaxActions(actions) {
//         if (actions.length >= this.resourceLimits.actionSetActions) {
//             throwExceedsLimitError(this.eventBus, {
//                 resource: 'actions in same action set',
//                 limit: this.resourceLimits.actionSetActions,
//             });
//         }
//     }
//     validateFilters(match) {
//         if (Object.keys(match.payload).length >
//             this.resourceLimits.actionSetFilters) {
//             throwExceedsLimitError(this.eventBus, {
//                 resource: 'filters',
//                 limit: this.resourceLimits.actionSetFilters,
//             });
//         }
//         for (const filter of Object.keys(match.payload)) {
//             const filterConfiguration = match.payload[filter];
//             const configuredValues = filterConfiguration.values || [];
//             if (configuredValues.length >
//                 this.resourceLimits.actionSetFilterValues) {
//                 throwExceedsLimitError(this.eventBus, {
//                     resource: `filter values for ${filter}`,
//                     limit: this.resourceLimits.actionSetFilterValues,
//                     resourceNameOverride: 'filter values',
//                 });
//             }
//         }
//     }
//     validateActions(actions) {
//         if (actions.length === 0) {
//             throw new BadDataError('Action set must have at least one action');
//         }
//         for (const { action, executionParams } of actions) {
//             const actionDefinition = ACTIONS[action];
//             if (!actionDefinition) {
//                 throw new BadDataError(`Action set has invalid action${action ? `: ${action}` : ''}`);
//             }
//             const requiredParameters = actionDefinition.parameters
//                 .filter(({ optional }) => !optional)
//                 .map(({ name }) => name);
//             if (requiredParameters.some((required) => !executionParams?.[required])) {
//                 throw new BadDataError(`Action set has action without all required parameters. ${action} should include ${requiredParameters.join(', ')}`);
//             }
//         }
//     }
// }
