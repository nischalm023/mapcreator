import {implicitCoordinateKeyToBarcode,implicitBarcodeToCoordinate} from "../utils/util";
import _ from "lodash";

export default (state = {}, action) => {
  switch (action.type) {
    case "EDIT-BARCODE":{
      const { coordinate, new_barcode } = action.value;
      let newState = _.cloneDeep(state);
      for (var ods_coord in newState) {
        if (newState[ods_coord]["coordinate"] == coordinate) {
          var new_coordinate = implicitBarcodeToCoordinate(new_barcode)
          var ods_tuple = newState[ods_coord]["ods_tuple"].split("--")
          newState[ods_coord]["coordinate"] = new_coordinate;
          newState[ods_coord]["ods_tuple"] = new_coordinate+'--'+ods_tuple[1];
        }
      }
      return {...state, ...newState};
    }
  }
  return state;
};
