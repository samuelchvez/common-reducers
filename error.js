// @flow
import {
  ERROR_TYPE,
  MAYBE_ERROR_TYPE,
} from './types';


type ErrorConfigurationType = {
  clear: Array<string>,
  populate: Array<string>,
};

type ErrorActionType = {
  type: string,
  payload: ERROR_TYPE,
};

const error = (configuration: ErrorConfigurationType) => (
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


export default error;
