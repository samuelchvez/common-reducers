// @flow
export type ID_TYPE = number | string;

export type ERROR_TYPE = {
  objectId: ?number,
  status: number,
  message: string,
  extra?: Object,
  retryAction?: Object,
};

export type MAYBE_ERROR_TYPE = {} | ERROR_TYPE;

export type GENERIC_ACTION_TYPE = {
  type: string,
  payload?: Object,
};
