import {implicitCoordinateKeyToBarcode} from "../utils/util";
import _ from "lodash";

export default (state = {}, action) => {
  switch (action.type) {
    case "EDIT-BARCODE": {
      const { coordinate, new_barcode } = action.value;
      let newState = _.cloneDeep(state);
      for (var charger_id in newState) {
        if (newState[charger_id].entry_point_location == implicitCoordinateKeyToBarcode(coordinate)) {
          newState[charger_id].entry_point_location = new_barcode;
          newState[charger_id].reinit_point_location = new_barcode;
        }
      }
      return {...state, ...newState};
    }
    case "EDIT-CHARGER-BARCODE": {
      var chargers = action.value
      var newState = _.cloneDeep(state);

      for(var i = 0 ;i<chargers.length;i++){
        var new_barcode = chargers[i].new_barcode
        var charger_id = chargers[i].charger_id
        var charger_location = chargers[i].charger_location
        newState[charger_id].entry_point_location = new_barcode;
        newState[charger_id].reinit_point_location = new_barcode;
        newState[charger_id].charger_location = charger_location;
      }
      return {...state, ...newState};
    }
  }
  return state;
};
