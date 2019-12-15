// @flow

type KeyExtractorByIdConfigurationType = {
  clear: Array<string>,
  set: Array<string>,
  keyExtractorKey: string,
  idKey?: string,
  default: mixed,
};

type KeyExtractorByIdActionType = {
  type: string,
  payload: Object,
};

const keyExtractorById = (configuration: KeyExtractorByIdConfigurationType) => (
  state: {[ID_TYPE]: mixed} = {},
  action: KeyExtractorByIdActionType,
): mixed => {
  const {
    clear,
    set,
    keyExtractorKey,
    idKey = 'id',
  } = configuration;
  if (clear != null && clear.includes(action.type)) {
    return {
      ...state,
      [action.payload[idKey]]: undefined,
    };
  }

  if (set != null && set.includes(action.type)) {
    const { payload } = action;
    return {
      ...state,
      [payload[idKey]]: payload[keyExtractorKey],
    };
  }

  return state;
};


export default keyExtractorById;
