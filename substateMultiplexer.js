// @flow
import { combineReducers } from 'redux';

import type { ID_TYPE } from './types';
import type { OrderActionType } from './order';
import * as common from '.';


type SubstateMultiplexerConfigurationType = {
  added?: Array<string>,
  fetched?: Array<string>,
  removed?: Array<string>,
  cleared?: Array<string>,
  replaced?: Array<string>,
  confirmed?: Array<string>,
  sorted?: Array<string>,
  preferPrepend?: boolean,
  allDeselected?: Array<string>,
  selected?: Array<string>,
  idKey?: string,
  reducer: (mixed, Object) => mixed,
}

type SubstateMultiplexerActionType = OrderActionType;

export type SubstateMultiplexerStateType = {
  byId: {[ID_TYPE]: Object},
  order: Array<ID_TYPE>,
  selected: ?ID_TYPE,
  substates: Object,
};

const initialState = {
  byId: {},
  order: [],
  selected: null,
  substates: {},
};


const substateMultiplexer = (configuration: SubstateMultiplexerConfigurationType) => {
  const byIdOrderAndSelectedReducer = combineReducers({
    byId: common.byId({
      added: configuration.added,
      fetched: configuration.fetched,
      removed: configuration.removed,
      cleared: configuration.cleared,
      idKey: configuration.idKey,
    }),
    order: common.order({
      added: configuration.added,
      fetched: configuration.fetched,
      replaced: configuration.replaced,
      removed: configuration.removed,
      confirmed: configuration.confirmed,
      cleared: configuration.cleared,
      sorted: configuration.sorted,
      idKey: configuration.idKey,
      preferPrepend: configuration.preferPrepend,
    }),
    selected: common.selected({
      selected: configuration.selected,
      allDeselected: configuration.allDeselected,
      default: null,
    }),
  });

  return (
    state: SubstateMultiplexerStateType = initialState,
    action: SubstateMultiplexerActionType,
  ): SubstateMultiplexerStateType => {
    const { substates } = state;
    // $FlowFixMe
    const byIdOrderAndSelected = byIdOrderAndSelectedReducer(state, action);
    const { byId, order } = byIdOrderAndSelected;
    let { selected } = byIdOrderAndSelected;

    // Select the first one if just added one and there was anything selected
    if (
      (
        (configuration.added && configuration.added.includes(action.type))
        || (configuration.fetched && configuration.fetched.includes(action.type))
      )
      && order.length > 0
      && selected === null
    ) {
      selected = order[0]; // eslint-disable-line prefer-destructuring
    }

    // Re-select if removed the one that is currently selected
    if (
      configuration.removed
      && configuration.removed.includes(action.type)
      && selected !== null
      && !order.includes(selected)
    ) {
      // If there are another options, select the first one
      if (order.length > 0) {
        selected = order[0]; // eslint-disable-line prefer-destructuring

      // Mark that nothing is selected
      } else {
        selected = null;
      }
    }

    return {
      byId,
      order,
      selected,
      substates: selected != null ? {
        ...substates,
        [selected]: configuration.reducer(substates[selected], action),
      } : substates,
    };
  };
};


export default substateMultiplexer;


export const reselectWithMultiplexer = (selector: Function): Function => (multiplexerState: SubstateMultiplexerStateType, ...args: Array<mixed>) => {
  const { selected, substates } = multiplexerState;
  if (selected != null) {
    if (substates[selected] != null) {
      return selector(substates[selected], ...args);
    } else {
      throw new Error('Invalid selected substate');
    }
  } else {
    throw new Error('No substate is selected');
  }
};

export const multipleReselectsWithMultiplexer = ({
  selectors = {},
  excluded = [],
}: {
  selectors: {[string]: Function},
  excluded?: Array<string>,
}): {[string]: Function} => {
  const wSelectors = {};
  Object.keys(selectors).filter(
    selectorName => selectorName !== 'default'
    && !excluded.includes(selectorName),
  ).forEach((selectorName) => {
    wSelectors[selectorName] = reselectWithMultiplexer(selectors[selectorName]);
  });

  return wSelectors;
};

