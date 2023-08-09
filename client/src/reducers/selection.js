import {implicitCoordinateKeyToBarcode,implicitBarcodeToCoordinate} from "../utils/util";
import _ from "lodash";

export default (state = {}, action) => {
  switch (action.type) {
    case "EDIT-BARCODE":{
      const { coordinate, new_barcode } = action.value;
      let newState = _.cloneDeep(state);
      var tile_list = Object.keys(newState)
      for (var old_coord in tile_list) {
        if (tile_list[old_coord] == coordinate) {
          var new_coordinate = implicitBarcodeToCoordinate(new_barcode)
          delete newState[tile_list[old_coord]]
          newState[new_coordinate] = true;
        }
      }
      return {...newState};
    }
  }
  return state;
};
