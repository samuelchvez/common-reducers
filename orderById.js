// @flow
import { ID_TYPE } from './types';


type OrderByIdConfigurationType = {
  fetched?: Array<string>,
  replaced?: Array<string>,
  idKey?: string,
  orderKey?: string,
};

type OrderByIdActionType = {
  type: string,
  payload: {
    order?: Array<ID_TYPE>
  },
};

const orderById = (configuration: OrderByIdConfigurationType) => (
  state: {[ID_TYPE]: Array<ID_TYPE>} = {},
  action: OrderByIdActionType,
): {[ID_TYPE]: Array<ID_TYPE>} => {
  const {
    fetched,
    replaced,
    idKey = 'id',
    orderKey = 'order',
  } = configuration;

  const { payload } = action;

  if(fetched != null && fetched.includes(action.type)) {
    let order = payload[orderKey];
    if (order && order.constructor === Array) {
      const objectId = payload[idKey];
      const originalOrder = state[objectId] || [];
      const stateSet = new Set(originalOrder);
      const difference = order.filter(
        id => !stateSet.has(id)
      );

      return {
        ...state,
        [objectId]: [ ...originalOrder, ...difference ],
      };
    }
  }

  if(replaced != null && replaced.includes(action.type)) {
    const order = payload[orderKey];

    if (order && order.constructor === Array) {
      const objectId = payload[idKey];
      return {
        ...state,
        [objectId]: order,
      };
    }
  }

  return state;
};


export default orderById;
