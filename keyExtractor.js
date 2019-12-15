// @flow

type KeyExtractorConfigurationType = {
  clear: Array<string>,
  set: Array<string>,
  extractionKey: string,
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
    extractionKey,
  } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return configuration.default;
  }

  if (set != null && set.includes(action.type)) {
    return action.payload[extractionKey];
  }

  return state;
};


export default keyExtractor;
