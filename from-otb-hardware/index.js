// @flow
// 20/11/2019
import type {
  ERROR_TYPE,
  GENERIC_ACTION_TYPE,
  MAYBE_ERROR_TYPE,
  ID_TYPE,
} from '../types/common';
import { arrayMove } from './utils';

type ByIdConfigurationType = {
  added?: Array<string>,
  fetched?: Array<string>,
  updated?: Array<string>,
  updatedInBulk?: Array<string>,
  removed?: Array<string>,
  confirmed?: Array<string>,
  addedToArrayAttribute?: Array<string>,
  removedFromArrayAttribute?: Array<string>,
  replacedInArrayAttribute?: Array<string>,
  defaultAttributes?: Object,
  idKey?: string,
  cascade?: {[string]: string},
  cleared?: Array<string>,
  customBehavior?: (Object, Object) => Object, // state, action => newState
};

type ByIdActionType = {
  type: string,
  payload: ID_TYPE | {
    id?: ID_TYPE,
    entities?: { [ID_TYPE]: Object },
    order?: Array<ID_TYPE>,
    oldId?: ID_TYPE,
    newId?: ID_TYPE,
    key?: string,
    oldValues?: any,
    newValues?: any,
  }
};

type OrderConfigurationType = {
  added?: Array<string>,
  fetched?: Array<string>,
  replaced?: Array<string>,
  removed?: Array<string>,
  confirmed?: Array<string>,
  cleared?: Array<string>,
  sorted?: Array<string>,
  idKey?: string,
  preferPrepend?: boolean,
};

type OrderActionType = {
  type: string,
  payload: ID_TYPE | {
    id?: ID_TYPE,
    entities?: {[ID_TYPE]: Object},
    order?: Array<ID_TYPE>,
    oldId?: ID_TYPE,
    newId?: ID_TYPE,
    entityId?: ID_TYPE,
    oldIndex?: number,
    newIndex?: number,
  }
};

type FetchingConfigurationType = {
  started?: Array<string>,
  succeed?: Array<string>,
  idKey?: string,
  failed?: Array<string>,
};

type FetchingActionType = {
  type: string,
  payload: ID_TYPE | {
    id?: ID_TYPE,
    objectId?: ID_TYPE,
  },
};

type IsFetchingConfigurationType = {
  started?: Array<string>,
  succeed?: Array<string>,
  failed?: Array<string>,
};

type IsFetchingActionType = {
  type: string,
};

type ErrorConfigurationType = {
  clear: Array<string>,
  populate: Array<string>,
};

type ErrorActionType = {
  type: string,
  payload: ERROR_TYPE,
};

type ErrorsConfigurationType = {
  clear?: Array<string>,
  idKey?: string,
  populate?: Array<string>,
};

type ErrorsActionType = {
  type: string,
  payload: {
    id: ID_TYPE,
    objectId: ID_TYPE,
  }
};

type ToggleConfigurationType = {
  turnedOn?: Array<string>,
  turnedOff?: Array<string>,
  default: boolean,
};

type MuxConfigurationType = {
  selected?: Array<string>,
  allDeselected?: Array<string>,
  default: ID_TYPE,
};

type CounterConfigurationType = {
  incremented?: Array<string>,
  decremented?: Array<string>,
  reset?: Array<string>,
};

type CounterActionType = {
  type: string,
  payload: {
    step: number,
  },
};

type SingletonConfigurationType = {
  clear: Array<string>,
  populate: Array<string>,
  update: Array<string>,
};

type SingletonActionType = {
  type: string,
  payload: Object,
};

type TimestampConfigurationType = {
  clear: Array<string>,
  set: Array<string>,
  timestampKey?: string,
  default: number,
};

type TimestampActionType = {
  type: string,
  payload: Object | number,
};


export const byId = (configuration: ByIdConfigurationType) => (
  state: {[ID_TYPE]: Object} = {},
  action: ByIdActionType,
): {[ID_TYPE]: Object} => {
  const {
    added,
    updated,
    updatedInBulk,
    fetched,
    removed,
    confirmed,
    addedToArrayAttribute,
    removedFromArrayAttribute,
    replacedInArrayAttribute,
    defaultAttributes,
    cascade,
    cleared,
    idKey = 'id',
    // eslint-disable-next-line no-unused-vars
    customBehavior = (s, _a) => s, // Identity reducer FIXME: parametro no being use
  } = configuration;

  const { payload } = action;

  if (payload != null) {
    if (
      added != null && added.includes(action.type) && typeof payload === 'object' && (
        typeof payload[idKey] === 'number' || typeof payload[idKey] === 'string'
      )
    ) {
      return {
        ...state,
        [payload[idKey]]: {
          ...(defaultAttributes || {}),
          ...payload,
        },
      };
    }

    if (updated != null && updated.includes(action.type)) {
      if (
        typeof payload === 'object' && (
          typeof payload[idKey] === 'number' || typeof payload[idKey] === 'string'
        )
      ) {
        return {
          ...state,
          [payload[idKey]]: {
            ...state[payload[idKey]],
            ...payload,
          },
        };
      }
    }

    if (updatedInBulk != null && updatedInBulk.includes(action.type)) {
      if (
        typeof payload === 'object'
        && typeof payload.order !== 'undefined'
        && payload.order.constructor === Array
      ) {
        const { order, ...attributes } = payload;
        const newState = {
          ...state,
        };

        order.forEach((id) => {
          newState[id] = {
            ...state[id],
            ...attributes,
          };
        });

        return newState;
      } else if (
        typeof payload === 'object' &&
          typeof payload.entities === 'object'
      ) {
        const newState = {
          ...state,
        };

        Object.keys(payload.entities).forEach(id => {
          if (state[id] && payload.entities) {
            newState[id] = {
              ...state[id],
              ...payload.entities[id],
            };
          }
        });

        return newState;
      }
    }

    if (fetched != null && fetched.includes(action.type)) {
      if (
        typeof payload === 'object'
        && typeof payload.entities === 'object') {
        const newEntities = {};
        Object.keys(payload.entities).forEach((id) => {
          newEntities[id] = {
            ...(defaultAttributes || {}),
            ...(payload.entities || {})[id], // TODO: handle server string ids
            isConfirmed: true,
          };
        });

        return {
          ...state,
          ...newEntities,
        };
      }
    }

    if (removed != null && removed.includes(action.type)) {
      // TODO: handle payload object with id attribute
      if (
        typeof payload === 'number'
        || typeof payload === 'string'
      ) {
        const newState = {
          ...state,
        };

        delete newState[payload];
        return newState;
      }
    }

    if (confirmed != null && confirmed.includes(action.type)) {
      if (typeof payload === 'object') {
        const { oldId, newId, ...extra } = payload;

        if (
          typeof oldId !== 'undefined'
          && typeof newId !== 'undefined'
          && typeof state[oldId] !== 'undefined'
        ) {
          const newState = {
            ...state,
          };

          newState[newId] = {
            ...newState[oldId],
            ...extra,
            id: newId,
            isConfirmed: true,
          };

          delete newState[oldId];
          return newState;
        }
        const newState = {};
        Object.keys(state).forEach((key) => {
          newState[key] = {
            ...state[key],
            isConfirmed: true,
          };
        });

        return newState;
      }
    }

    if (addedToArrayAttribute != null && addedToArrayAttribute.includes(action.type)) {
      if (typeof payload === 'object') {
        const id = payload[idKey];
        const { key, order = [] } = payload;
        if (typeof id !== 'undefined' && typeof state[id] !== 'undefined') {
          const oldOrder = state[id][key] || [];
          return {
            ...state,
            [id]: {
              ...state[id],
              [key]: [
                ...oldOrder,
                ...order.filter(i => !oldOrder.includes(i)),
              ],
            },
          };
        }
      }

      return state;
    }

    if (removedFromArrayAttribute != null && removedFromArrayAttribute.includes(action.type)) {
      if (typeof payload === 'object') {
        const id = payload[idKey];
        const { key, order = [] } = payload;
        if (typeof id !== 'undefined' && typeof state[id] !== 'undefined') {
          const oldOrder = state[id][key] || [];
          return {
            ...state,
            [id]: {
              ...state[id],
              [key]: oldOrder.filter(i => !order.includes(i)),
            },
          };
        }
      }

      return state;
    }

    if (replacedInArrayAttribute != null && replacedInArrayAttribute.includes(action.type)) {
      if (typeof payload === 'object') {
        const id = payload[idKey];
        const { oldValues = [], newValues = [], key } = payload;
        if (typeof id !== 'undefined' && typeof state[id] !== 'undefined') {
          const oldOrder = state[id][key] || [];
          return {
            ...state,
            [id]: {
              ...state[id],
              [key]: oldOrder.map(oldValue => (oldValues.includes(oldValue)
                ? newValues[oldValues.indexOf(oldValue)]
                : oldValue)),
            },
          };
        }
      }

      return state;
    }

    // REMEMBER THAT THIS CASCADE GIMMICK ONLY WORKS ONE LEVEL DEEP
    // If you want more depth, tie delete actions with sagas, but for most cases
    // this will do the trick.
    if (cascade != null) {
      const fk = cascade[action.type];
      if (typeof fk !== 'undefined') {
        if (typeof payload === 'number' || typeof payload === 'string') {
          const removedId = payload;

          const newState = {};
          Object.keys(state).map(
            elementKey => state[parseInt(elementKey, 10)],
          ).forEach((element) => {
            if (typeof element[fk] !== 'undefined' && element[fk] !== removedId) {
              newState[element.id] = element;
            }
          });

          return newState;
        }
      }
    }

    if (cleared != null && cleared.includes(action.type)) {
      return {};
    }
  }

  return customBehavior(state, action);
};

export const order = (configuration: OrderConfigurationType) => (
  state: Array<ID_TYPE> = [],
  action: OrderActionType,
): Array<ID_TYPE> => {
  const {
    added,
    fetched,
    replaced,
    removed,
    confirmed,
    cleared,
    sorted,
    idKey = 'id',
    preferPrepend = false,
  } = configuration;

  const { payload } = action;

  if (added != null && added.includes(action.type)) {
    if (
      typeof payload === 'object'

      && (typeof payload[idKey] === 'number' || typeof payload[idKey] === 'string')) {
      return !preferPrepend ? (
        [
          ...state,
          payload[idKey],
        ]
      ) : (
        [
          payload[idKey],
          ...state,
        ]
      );
    }
  }

  if (fetched != null && fetched.includes(action.type)) {
    if (
      typeof payload === 'object'
      && payload.order != null
      && payload.order.constructor === Array
    ) {
      const stateSet = new Set(state);
      const difference = payload.order.filter(
        id => !stateSet.has(id),
      );

      return [
        ...state,
        ...difference,
      ];
    }
  }

  if (replaced != null && replaced.includes(action.type)) {
    if (
      typeof payload === 'object'
      && payload.order != null
      && payload.order.constructor === Array
    ) {
      return payload.order;
    }
  }

  if (removed != null && removed.includes(action.type)) {
    if (
      typeof payload === 'object'
      && payload.order != null
      && payload.order.constructor === Array) {
      const stateSet = new Set(state);
      const difference = payload.order.filter(
        id => !stateSet.has(id),
      );

      return [...state, ...difference];
    } if (typeof payload === 'number' || typeof payload === 'string') {
      return state.filter(id => id !== payload);
    } if (typeof payload === 'object' && typeof payload[idKey] !== 'undefined') {
      return state.filter(id => id !== payload[idKey]);
    }

    return state;
  }

  if (confirmed != null && confirmed.includes(action.type)) {
    if (typeof payload === 'object') {
      const { oldId = -1, newId = -1 } = payload;
      return state.map(i => (i === oldId ? newId : i));
    }
    return state;
  }

  if (cleared != null && cleared.includes(action.type)) {
    return [];
  }

  if (sorted != null && sorted.includes(action.type)) {
    if (typeof payload === 'object') {
      const { oldIndex, newIndex } = payload;
      if (
        (typeof oldIndex === 'number')
        && (typeof newIndex === 'number')
      ) {
        return arrayMove(state, oldIndex, newIndex);
      }
    }
  }

  return state;
};

export const counter = (configuration: CounterConfigurationType) => (
  state: number = 0,
  action: CounterActionType,
): number => {
  const {
    incremented,
    decremented,
    reset,
  } = configuration;

  const { payload } = action;

  if (incremented != null && incremented.includes(action.type)) {
    if (typeof payload !== 'undefined') {
      return state + (payload.step || 1);
    }
  }

  if (decremented != null && decremented.includes(action.type)) {
    if (typeof payload !== 'undefined') {
      return state - (payload.step || 1);
    }
  }

  if (reset != null && reset.includes(action.type)) {
    return 0;
  }

  return state;
};

export const errors = (configuration: ErrorsConfigurationType) => (
  state: {[ID_TYPE]: ERROR_TYPE} = {},
  action: ErrorsActionType,
): {[ID_TYPE]: ERROR_TYPE} => {
  const { clear, populate, idKey = 'id' } = configuration;
  const { payload } = action;
  if (populate != null && populate.includes(action.type)) {
    if (typeof payload.objectId === 'number') {
      return {
        ...state,
        [payload.objectId]: action.payload,
      };
    }


    if (typeof payload[idKey] === 'number' || typeof payload[idKey] === 'string') {
      return {
        ...state,
        [payload[idKey]]: action.payload,
      };
    }

    return state;
  }

  if (clear != null && clear.includes(action.type)) {
    if (typeof payload[idKey] === 'number' || typeof payload[idKey] === 'string') {
      const newState = { ...state };
      delete newState[payload[idKey]];
      return newState;
    }

    return state;
  }

  return state;
};

export const fetching = (configuration: FetchingConfigurationType) => (
  state: Array<ID_TYPE> = [],
  action: FetchingActionType,
): Array<ID_TYPE> => {
  const {
    started, succeed, failed, idKey = 'id',
  } = configuration;
  if (started != null && started.includes(action.type)) {
    if (typeof action.payload === 'number' || typeof action.payload === 'string') {
      return [
        ...state,
        action.payload,
      ];
    } if (typeof action.payload === 'object' && (
      typeof action.payload[idKey] === 'number' || typeof action.payload[idKey] === 'string'
    )) {
      return [
        ...state,
        action.payload[idKey],
      ];
    }

    return state;
  }

  if (failed != null && failed.includes(action.type)) {
    const { payload } = action;
    if (
      payload !== null
      && typeof payload === 'object'
      && typeof payload.objectId === 'number') {
      // $FlowFixMe
      return state.filter(id => id != payload.objectId);
    }

    return state;
  }

  if (succeed != null && succeed.includes(action.type)) {
    const { payload } = action;
    if (
      payload !== null
      && typeof payload === 'object'
      && (
        typeof payload[idKey] === 'number'
        || typeof payload[idKey] === 'string'
      )
    ) {
      // $FlowFixMe
      return state.filter(id => id != payload[idKey]);
    } if (typeof payload === 'number' || typeof payload === 'string') {
      // $FlowFixMe
      return state.filter(id => id != payload);
    }

    return state;
  }

  return state;
};

export const isFetching = (configuration: IsFetchingConfigurationType) => (
  state: boolean = false,
  action: IsFetchingActionType,
): boolean => {
  const { started, succeed, failed } = configuration;
  if (started != null && started.includes(action.type)) {
    return true;
  }

  if (
    (failed != null && failed.includes(action.type))
    || (succeed != null && succeed.includes(action.type))) {
    return false;
  }

  return state;
};

export const error = (configuration: ErrorConfigurationType) => (
  state: MAYBE_ERROR_TYPE = {},
  action: ErrorActionType,
): MAYBE_ERROR_TYPE => {
  const { clear, populate } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return {};
  }

  if (populate != null && populate.includes(action.type)) {
    return action.payload;
  }

  return state;
};

export const toggle = (configuration: ToggleConfigurationType) => (
  state: boolean = configuration.default,
  action: GENERIC_ACTION_TYPE,
): boolean => {
  const { turnedOn, turnedOff } = configuration;
  if (turnedOn != null && turnedOn.includes(action.type)) {
    return true;
  }

  if (turnedOff != null && turnedOff.includes(action.type)) {
    return false;
  }

  return state;
};

export const mux = (configuration: MuxConfigurationType) => (
  state: ID_TYPE = configuration.default,
  action: GENERIC_ACTION_TYPE,
): ID_TYPE => {
  const { selected, allDeselected } = configuration;
  if (selected != null && selected.includes(action.type)) {
    if (
      typeof action.payload === 'number'
      || typeof action.payload === 'string'
    ) {
      return action.payload;
    }

    return state;
  }

  if (allDeselected != null && allDeselected.includes(action.type)) {
    return configuration.default;
  }

  return state;
};

export const singleton = (configuration: SingletonConfigurationType) => (
  state: ?Object = null,
  action: SingletonActionType,
): ?Object => {
  const { clear, populate, update } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return null;
  }

  if (populate != null && populate.includes(action.type)) {
    return action.payload;
  }

  if (update != null && update.includes(action.type)) {
    return {
      ...state,
      ...action.payload,
    };
  }

  return state;
};


export const timestamp = (configuration: TimestampConfigurationType) => (
  state: number = configuration.default,
  action: TimestampActionType,
): number => {
  const {
    clear,
    set,
    timestampKey = 'timestamp',
  } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return configuration.default;
  }

  if (set != null && set.includes(action.type)) {
    if (typeof action.payload === 'object') {
      return action.payload[timestampKey];
    }
    return action.payload;
  }

  return state;
};


export const withReplaceSubState = (reducer: Function) =>
  (replaceActionTypes: Array<string>)  =>
    (state: mixed = reducer(undefined, {}), action: GENERIC_ACTION_TYPE) =>
      replaceActionTypes.includes(action.type) ? action.payload : reducer(state, action);


export const withResetState = (reducer: Function) =>
  (resetActionTypes: Array<string>)  =>
    (state: mixed = reducer(undefined, {}), action: GENERIC_ACTION_TYPE) =>
      resetActionTypes.includes(action.type) ? reducer(undefined, {}) : reducer(state, action);
