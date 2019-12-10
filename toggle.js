// @flow
import { ID_TYPE, GENERIC_ACTION_TYPE } from './types';


type ToggleConfigurationType = {
  turnedOn?: Array<string>,
  turnedOff?: Array<string>,
  default: boolean,
};

const toggle = (configuration: ToggleConfigurationType) => (
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


export default toggle;
