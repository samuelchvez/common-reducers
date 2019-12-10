// @flow
import { GENERIC_ACTION_TYPE } from './types';


const withReplaceSubState = (reducer: Function) =>
  (replaceActionTypes: Array<string>)  =>
    (state: mixed = reducer(undefined, {}), action: GENERIC_ACTION_TYPE) =>
      replaceActionTypes.includes(action.type) ? action.payload : reducer(state, action);


export default withReplaceSubState;
