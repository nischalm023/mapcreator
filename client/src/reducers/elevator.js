import _ from "lodash";
import {implicitCoordinateKeyToBarcode} from "../utils/util";

export default (state = {}, action) => {
  switch (action.type) {
    case "EDIT-ELEVATOR-ENTRY-POINTS": {
      const { elevator_id, entry_barcodes } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], entry_barcodes }
      };
    }
    case "EDIT-ELEVATOR-EXIT-POINTS": {
      const { elevator_id, exit_barcodes } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], exit_barcodes }
      };
    }
    case "EDIT-ELEVATOR-COORDINATES": {
      const { elevator_id, coordinate_list } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], coordinate_list }
      };
    }
    case "EDIT-POSITION-POINTS": {
      const { elevator_id, position } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id],position}
      };
    }
    case "EDIT-BARCODE": {
      const {coordinate, new_barcode} = action.value;
      let newState = _.cloneDeep(state);
      var old_barcode = implicitCoordinateKeyToBarcode(coordinate);
      for (var elevator_id in newState) {
        var indx1 = newState[elevator_id].entry_barcodes.indexOf(old_barcode);
        var indx2 = newState[elevator_id].exit_barcodes.indexOf(old_barcode);
        if(indx1 > -1) {
          newState[elevator_id].entry_barcodes[indx1] = new_barcode;
        }
        if(indx2 > -1) {
          newState[elevator_id].exit_barcodes[indx2] = new_barcode;
        }
      }
      return newState;
    }
    case "DELETE-ELEVATOR": {
      return _.omit(state, action.value.elevator_id);
    }
  }
  return state;
};
