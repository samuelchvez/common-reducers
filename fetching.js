// @flow
import { ID_TYPE } from './types';


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

const fetching = (configuration: FetchingConfigurationType) => (
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


export default fetching;
