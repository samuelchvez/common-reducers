// @flow
// 20/01/2018
import type {
  ERROR_TYPE,
  GENERIC_ACTION_TYPE,
  MAYBE_ERROR_TYPE
} from '../types/common';

type ByIdConfigurationType = {
  added?: Array<string>,
  fetched?: Array<string>,
  updated?: Array<string>,
  removed?: Array<string>,
  cleared?: Array<string>,
  defaultAttributes?: Object,
  singleton?: boolean
};

type ByIdActionType = {
  type: string,
  payload: number | {
    id?: number,
    entities?: {[number]: Object},
    order?: Array<number>
  }
};

type OrderConfigurationType = {
  added?: Array<string>,
  fetched?: Array<string>,
  removed?: Array<string>,
  singleton?: boolean,
  cleared?: Array<string>
};

type OrderActionType = {
  type: string,
  payload: number | {
    id?: number,
    entities?: {[number]: Object},
    order?: Array<number>
  }
}

type FetchingConfigurationType = {
  started?: Array<string>,
  succeed?: Array<string>,
  failed?: Array<string>
};

type FetchingActionType = {
  type: string,
  payload: number | {
    id?: number,
    object_id?: number
  }
};

type IsFetchingConfigurationType = {
  started?: Array<string>,
  succeed?: Array<string>,
  failed?: Array<string>
};

type IsFetchingActionType = {
  type: string
};

type ErrorConfigurationType = {
  clear: Array<string>,
  populate: Array<string>
};

type ErrorsConfigurationType = {
  succeed?: Array<string>,
  failed?: Array<string>,
  cleared?: Array<string>
};

type ErrorActionType = {
  type: string,
  payload: ERROR_TYPE
};

type ErrorsActionType = {
  type: string,
  payload: {
    id: number
  } | {
    object_id: number
  }
};

type ToggleConfigurationType = {
  turnedOn?: Array<string>,
  turnedOff?: Array<string>,
  default: boolean
};

type MuxConfigurationType = {
  selected?: Array<string>,
  allDeselected?: Array<string>,
  default: number
};

type ByObjectIdConfigurationType = {
  fetched?: Array<string>,
  replaced?: Array<string>
};

type ByObjectIdActionType = {
  type: string,
  payload: {
    object_id: number,
    order: Array<number>
  }
};


/*
This should be used when each instance is fetched one by one.
*/
export const byId = (configuration: ByIdConfigurationType) => (
  state: {[number]: Object} = {},
  action: ByIdActionType
): {[number]: Object} => {
  const {
    added,
    updated,
    fetched,
    removed,
    cleared,
    defaultAttributes,
    singleton = false
  } = configuration;

  const buildWithDefaults = entity => ({
    ...(defaultAttributes || {}),
    ...entity
  });

  const { payload } = action;

  if(payload != null) {
    if(
      added != null &&
      added.includes(action.type) &&
      typeof payload === 'object' &&
      typeof payload.id === 'number'
    ) {
      if(!singleton) {
        return {
          ...state,
          [payload.id]: buildWithDefaults(payload)
        };
      }



      return {
        [payload.id]: buildWithDefaults(payload)
      }
    }

    if(updated != null && updated.includes(action.type)) {
      if(
        typeof payload === 'object' &&
        typeof payload.id === 'number'
      ) {
        return {
          ...state,
          [payload.id]: {
            ...state[payload.id],
            ...payload
          }
        };
      }
    }

    if(!singleton && fetched != null && fetched.includes(action.type)) {
      if(
        typeof payload === 'object' &&
        typeof payload.entities === 'object') {

        let newEntities = {};
        Object.keys(payload.entities).forEach(id => {
          newEntities[id] = buildWithDefaults((payload.entities || {})[id])
        });

        return {
          ...state,
          ...newEntities
        };
      }
    }

    if(removed != null && removed.includes(action.type)) {
      if(typeof payload === 'number') {
        const newState = {
          ...state
        };

        delete newState[payload];
        return newState;
      }

      return state;
    }
  }

  if(cleared != null && cleared.includes(action.type)) {
    return {};
  }

  return state;
}

export const order = (configuration: OrderConfigurationType) => (
  state: Array<number> = [],
  action: OrderActionType
): Array<number> => {
  const {
    added,
    fetched,
    removed,
    cleared,
    singleton = false
  } = configuration;

  const { payload } = action;

  if(added != null && added.includes(action.type)) {
    if(
      typeof payload === 'object' &&
      typeof payload.id !== 'undefined') {

      return [
        ...(singleton ? []: state),
        payload.id
      ];
    }
  }

  if(!singleton && fetched != null && fetched.includes(action.type)) {
    if(
      typeof payload === 'object' &&
      payload.order != null &&
      payload.order.constructor === Array) {

      if(singleton) {
        return payload.order.length > 0 ?
          [payload.order[0]]:
          [];
      }

      const stateSet = new Set(state);
      const difference = payload.order.filter(
         id => !stateSet.has(id)
      );

      return [
        ...state,
        ...difference
      ];
    }
  }

  if(removed != null && removed.includes(action.type)) {
    if(
      typeof payload === 'object' &&
      payload.order != null &&
      payload.order.constructor === Array) {
      const stateSet = new Set(state);
      const difference = payload.order.filter(
         id => !stateSet.has(id)
      );

      return [...state, ...difference];
    }

    return state;
  }

  if(cleared != null && cleared.includes(action.type)) {
    return [];
  }

  return state;
}

export const errors = (configuration: ErrorsConfigurationType) => (
  state: {[number]: ERROR_TYPE} = {},
  action: ErrorsActionType
): {[number]: ERROR_TYPE} => {
  const { succeed, failed, cleared } = configuration;
  const { payload } = action;
  if(failed != null && failed.includes(action.type)) {
    if (typeof payload.object_id === 'number') {
      return {
        ...state,
        [payload.object_id]: action.payload
      };
    }

    return state;
  }

  if(succeed != null && succeed.includes(action.type)) {
    if(typeof payload.id === 'number') {
      let newState = { ...state };
      delete newState[payload.id];
      return newState;
    }

    return state;
  }

  if(cleared != null && cleared.includes(action.type)) {
    let newState = { ...state };

    if(typeof payload === 'number') {
      delete newState[payload];
    } else if(typeof payload.id === 'number') {
      delete newState[payload.id];
    }

    return newState;
  }

  return state;
}

export const fetching = (configuration: FetchingConfigurationType) =>(
  state: Array<number> = [],
  action: FetchingActionType
): Array<number> => {
  const { started, succeed, failed } = configuration;
  if(started != null && started.includes(action.type)) {
    if(typeof action.payload === 'number') {
      return [
        ...state,
        action.payload
      ];
    }

    return state;
  }

  if(failed != null && failed.includes(action.type)) {
    const { payload } = action;
    if(
      payload !== null &&
      typeof payload === 'object' &&
      typeof payload.object_id === 'number') {
      return state.filter(id => id !== payload.object_id);
    }

    return state;
  }

  if(succeed != null && succeed.includes(action.type)) {
    const { payload } = action;
    if(
      payload !== null &&
      typeof payload === 'object' &&
      typeof payload.id === 'number') {
      return state.filter(id => id !== payload.id);
    }

    return state;
  }

  return state;
}

export const isFetching = (configuration: IsFetchingConfigurationType) =>(
  state: boolean = false,
  action: IsFetchingActionType
): boolean => {
  const { started, succeed, failed } = configuration;
  if(started != null && started.includes(action.type)) {
    return true;
  }

  if(
    (failed != null && failed.includes(action.type)) ||
    (succeed != null && succeed.includes(action.type))) {
    return false;
  }

  return state;
}

export const error = (configuration: ErrorConfigurationType) =>(
  state: MAYBE_ERROR_TYPE = {},
  action: ErrorActionType
): MAYBE_ERROR_TYPE => {
  const { clear, populate } = configuration;
  if(clear != null && clear.includes(action.type)) {
    return {};
  }

  if(populate != null && populate.includes(action.type)) {
    return action.payload;
  }

  return state;
}

export const toggle = (configuration: ToggleConfigurationType) => (
  state: boolean = configuration.default,
  action: GENERIC_ACTION_TYPE
): boolean => {
  const { turnedOn, turnedOff } = configuration;
  if(turnedOn != null && turnedOn.includes(action.type)) {
    return true;
  }

  if(turnedOff != null && turnedOff.includes(action.type)) {
    return false;
  }

  return state;
}

export const mux = (configuration: MuxConfigurationType) => (
  state: number = configuration.default,
  action: GENERIC_ACTION_TYPE
): number => {
  const { selected, allDeselected } = configuration;
  if(selected != null && selected.includes(action.type)) {
    if(typeof action.payload === 'number') {
      return action.payload;
    }

    return state;
  }

  if(allDeselected != null && allDeselected.includes(action.type)) {
    return configuration.default;
  }

  return state;
}

export const byObjectId = (configuration: ByObjectIdConfigurationType) => (
  state: {[number]: Array<number>} = {},
  action: ByObjectIdActionType
): {[number]: Array<number>} => {
  const {
    fetched,
    replaced
  } = configuration;

  const { payload } = action;

  if(fetched != null && fetched.includes(action.type)) {
    const { order } = payload;
    const { object_id } = payload;
    const originalOrder = state[object_id] || [];
    const stateSet = new Set(originalOrder);
    const difference = order.filter(
       id => !stateSet.has(id)
    );

    return {
      ...state,
      [object_id]: [ ...originalOrder, ...difference ]
    };
  }

  if(replaced != null && replaced.includes(action.type)) {
    const { order } = payload;
    const { object_id } = payload;
    return {
      ...state,
      [object_id]: order
    };
  }

  return state;
}
