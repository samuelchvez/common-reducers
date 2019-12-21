// @flow
import type { ID_TYPE, ERROR_TYPE } from './types';


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

const errors = (configuration: ErrorsConfigurationType) => (
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


export default errors;
