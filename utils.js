// @flow
import { ID_TYPE } from './types';


export const arrayMove = (
  arr: Array<ID_TYPE>,
  previousIndex: number,
  newIndex: number,
): Array<ID_TYPE> => {
  const array = [...arr];
  if (newIndex >= array.length) {
    let k = newIndex - array.length;
    while (k + 1) {
      k -= 1;
      array.push(undefined);
    }
  }

  array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
  return array;
};