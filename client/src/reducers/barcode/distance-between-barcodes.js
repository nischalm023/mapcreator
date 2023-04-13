import _ from "lodash";
import {calculate_corner_world_cordinate} from "actions/actions";

export const modifyDistanceBetweenBarcodes = (state, action) => {
  // iterate over all rows/cols and modify
  let newState = _.cloneDeep(state);
  var {distance, direction, tileIds} = action.value;
  tileIds.forEach((tileId) => {
    if(state[tileId].size_info[direction] + distance < 1){
      // Negative or 0 size
      throw new Error(`Cannot modify the distance of barcode ${state[tileId].barcode} in direction because that would cause overlap`);
    };
    newState[tileId].size_info[direction] = state[tileId].size_info[direction] + distance;
    var barcodeInfoWorldCoord = JSON.parse(newState[tileId].world_coordinate)
    newState[tileId].corner_world_cooordinate = calculate_corner_world_cordinate(newState[tileId].size_info,barcodeInfoWorldCoord)
  });
  return { ...state, ...newState };
};
