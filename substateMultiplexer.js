// @flow
import { combineReducers } from 'redux';

import type { ID_TYPE } from './types';
import type { OrderConfigurationType } from './order';
import type { SelectedConfigurationType } from './selected';
import order as commonOrder from './order';
import selected as commonSelected from './selected';


type SubstateMultiplexerConfigurationType =
  | OrderConfigurationType
  | SelectedConfigurationType
  | { reducer: (mixed, object) => mixed };

type SubstateMultiplexerActionType = OrderActionType;

export type SubstateMultiplexerStateType = {
  order: Array<ID_TYPE>,
  selected: ?ID_TYPE,
  substates: Object,
};

const initialState = {
  order: [],
  selected: null,
  substates: {},
};


const substateMultiplexer = (configuration: SubstateMultiplexerConfigurationType) => {
  const orderAndSelectedReducer = combineReducers({
    order: commonOrder({
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
    selected: commonSelected({
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
    const { order, selected } = orderAndSelectedReducer(state, action);

    // Select the first one if just added one and there was anything selected
    if (
        (
          configuration.added.includes(action.type) ||
          configuration.fetched.includes(action.type)
        ) &&
        order.length > 0 &&
        selected === null
      ) {
      selected = order[0];
    }

    // Re-select if removed the one that is currently selected
    if (
      configuration.removed.includes(action.type) &&
      selected !== null &&
      !order.includes(selected)
    ) {
      // If there are another options, select the first one
      if (order.length > 0) {
        selected = order[0];

      // Mark that nothing is selected
      } else {
        selected = null;
      }
    }

    return {
      order,
      selected,
      substates: selected != null ? {
        ...substates,
        [selected]: reducer(substate[selected], action),
      } : substates,
    };
  };
};


export default substateMultiplexer;
