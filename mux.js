// @flow
import { ID_TYPE, GENERIC_ACTION_TYPE } from './types';


type MuxConfigurationType = {
  selected?: Array<string>,
  allDeselected?: Array<string>,
  default: ID_TYPE,
};

const mux = (configuration: MuxConfigurationType) => (
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


export default mux;
