// @flow
import { GENERIC_ACTION_TYPE } from './types';


const withResetState = (reducer: Function) =>
  (resetActionTypes: Array<string>)  =>
    (state: mixed = reducer(undefined, {}), action: GENERIC_ACTION_TYPE) =>
      resetActionTypes.includes(action.type) ? reducer(undefined, {}) : reducer(state, action);


export default withResetState;
