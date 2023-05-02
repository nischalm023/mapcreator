import _ from "lodash";
import { implicitBarcodeToCoordinate } from "utils/util";
import { DEFAULT_BARCODE_FORMAT,DEFAULT_MAP_OFFSET } from "../constants";
export default (state = {}, action) => {
  // only handle multiple add action for now..
  switch (action.type) {
    case "ADD-ENTITIES-TO-FLOOR": {
      const { floorKey, currentFloor, ids } = action.value;
      if (state[currentFloor]) {
        return {
          ...state,
          [currentFloor]: {
            ...state[currentFloor],
            [floorKey]: _.union(state[currentFloor][floorKey] || [], ids)
          }
        };
      }
      break;
    }
    case "REMOVE-ENTITIES-FROM-FLOOR": {
      const { floorKey, currentFloor, ids } = action.value;
      if (state[currentFloor]) {
        return {
          ...state,
          [currentFloor]: {
            ...state[currentFloor],
            [floorKey]: _.difference(state[currentFloor][floorKey] || [], ids)
          }
        };
      }
      break;
    }
    case "ADD-FLOOR": {
      const floorData = action.value;
      return {
        ...state,
        [floorData.floor_id]: {
          ...floorData,
          map_values: floorData.map_values.map(barcode => barcode.coordinate),
          barcodeFormat:DEFAULT_BARCODE_FORMAT,
          barcodeOffset:DEFAULT_MAP_OFFSET
        }
      };
    }
    
    case "EDIT-BARCODE": {
      const { coordinate, new_barcode } = action.value;
      var newCoordinate = implicitBarcodeToCoordinate(new_barcode);
      // search in ALL floors to find this barcode
      let newState = _.cloneDeep(state);
      Object.keys(state).forEach(floorId => {
        var index = _.findIndex(state[floorId].map_values, function(elem) {
          return elem == coordinate;
        });
        if (index == -1) {
          return;
        }
        var newMapValues = _.clone(state[floorId].map_values);
        newMapValues[index] = newCoordinate;
        newState = {
          ...newState,
          [floorId]: {
            ...state[floorId],
            map_values: newMapValues
          }
        };
      });
      return newState;
    }
    case "DELETE-CHARGER-DATA": {
      // const {entry_point_coordinate, charger_id} = action.value;
      const chargerInfo = action.value.chargerDetails;
      const entry_point_coordinate = implicitBarcodeToCoordinate(chargerInfo.entry_point_location);
      const charger_id = chargerInfo.charger_id;
      var newState = _.cloneDeep(state);
      Object.keys(newState).forEach(floorId => {
        _.remove(newState[floorId].chargers, function (charger) {
          return charger === charger_id;
        });
        _.remove(newState[floorId].map_values, function (elem) {
          return elem === entry_point_coordinate;
        });
      });
      return newState;
    }
    case "DELETE-PPS-BY-ID": {
      var newState = _.clone(state);
      Object.keys(newState).forEach(floorId => {
        _.remove(newState[floorId].ppses, function (pps) {
          return pps === action.value;
        });
      });
      return newState;
    }
    case "CHANGE-FLOOR-BARCODE-FORMAT-MODE":{
      var {barcode_value,currentFloor} = action.value
      var newState = _.cloneDeep(state);
      newState[currentFloor].barcodeFormat=barcode_value
      return newState
    }
    case "BARCODE-FLOOR-OFFSET-VALUE":{
      var {barcodeOffset,currentFloor} = action.value
      var newState = _.cloneDeep(state);
      newState[currentFloor].barcodeOffset=barcodeOffset
      return newState
    }
  }
  return state;
};
