// map entity has 'dummy' as key since there is only one map
import _ from "lodash";

const addKey = (state, entity, key) => ({
  ...state,
  dummy: {
    ...state["dummy"],
    [entity]: [...state["dummy"][entity], key]
  }
});

export default (state = {}, action) => {
  var newState = _.clone(state);
  switch (action.type) {
    case "ADD-FLOOR": {
      return addKey(state, "floors", action.value.floor_id);
    }
    case "ADD-ELEVATOR": {
      return addKey(state, "elevators", action.value.elevator_id);
    }
    case "ADD-ZONE": {
      return addKey(state, "zones", action.value.zone_id);
    }
    case "ADD-SECTOR": {
      return addKey(state, "sectors", action.value.sector_id.toString());
    }
    case "ADD-CONVEYOR": {
      const { conveyor_id, conveyor_height } = action.value;
      if (!newState.dummy.hasOwnProperty('conveyors')){
        newState.dummy.conveyors = [];
      }
      newState.dummy.conveyors.push(conveyor_id);
      newState.dummy.current_conveyor_id = [];
      newState.dummy.current_conveyor_id.push(conveyor_id);
      return newState;
    }
    case "REMOVE-CONVEYOR-ID": {
      var conveyor_id = parseInt(action.value.conveyor_id)
      if (newState.dummy.hasOwnProperty('conveyors')){
        var newList = newState.dummy.conveyors.filter(function(item) {
              return item !== conveyor_id
          })
        newState.dummy.conveyors = newList
      }
      return newState;
    }
    case "SECTOR-BARCODE-MAPPING": {
      const { entities } = action.value;
      newState.dummy.sectorBarcodeMapping = [];
      Object.keys(entities.barcode).forEach(function(key) {
        if(newState.dummy.sectorBarcodeMapping[entities.barcode[key].sector] == undefined) newState.dummy.sectorBarcodeMapping[entities.barcode[key].sector] = []; 
        newState.dummy.sectorBarcodeMapping[entities.barcode[key].sector].push("[" + key + "]");
      });
      return newState;
    }
    case "SECTOR-MXU-PREFERENCES": {
      const { formData } = action.value;
      newState.dummy.sectorMxUPreferences = formData;
      return newState;
    }
    case "DELETE-ELEVATOR": {
      const elevator_id = action.value.elevator_id;
      newState.dummy.elevators = newState.dummy.elevators.filter(id => id != elevator_id);
      return newState;
    }
  }
  return state;
};
