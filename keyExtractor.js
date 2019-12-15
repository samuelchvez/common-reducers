// @flow

type KeyExtractorConfigurationType = {
  clear: Array<string>,
  set: Array<string>,
  keyExtractorKey: string,
  default: number,
};

type KeyExtractorActionType = {
  type: string,
  payload: Object,
};

const keyExtractor = (configuration: KeyExtractorConfigurationType) => (
  state: number = configuration.default,
  action: KeyExtractorActionType,
): number => {
  const {
    clear,
    set,
    keyExtractorKey,
  } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return configuration.default;
  }

  if (set != null && set.includes(action.type)) {
    return action.payload[keyExtractorKey];
  }

  return state;
};


export default keyExtractor;
