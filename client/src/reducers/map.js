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
      const { conveyor_id } = action.value;
      if (!newState.dummy.hasOwnProperty('conveyors')){
        newState.dummy.conveyors = [];
      }
      if(!newState.dummy.conveyors.includes(conveyor_id)){
        newState.dummy.conveyors.push(conveyor_id);
        newState.dummy.current_conveyor_id = [];
        newState.dummy.current_conveyor_id.push(conveyor_id);
      }
      return newState;
    }
  case "ADD-TEMPLATE": {
      const { template_id } = action.value;
      if(!newState.dummy.haiPortsTemplateIds.includes(template_id)){
        newState.dummy.haiPortsTemplateIds.push(template_id);
      }
      return newState;
    }

  case "ADD-CONNECTED-CONVEYOR": {
      const { connected_conveyor_id } = action.value;
      if (!newState.dummy.hasOwnProperty('connectedConveyor')){
        newState.dummy.connectedConveyor = [];
      }
      if(!newState.dummy.connectedConveyor.includes(connected_conveyor_id)){
        newState.dummy.connectedConveyor.push(connected_conveyor_id);
        newState.dummy.current_connected_conveyor_id = [];
        newState.dummy.current_connected_conveyor_id.push(connected_conveyor_id);
      }
      return newState;
    }
  case "ADD-HAI-PORTS": {
      if (!newState.dummy.hasOwnProperty('haiPort')){
        newState.dummy.haiPort = [];
      }
      if(!newState.dummy.haiPort.includes(action.value)){
        newState.dummy.haiPort.push(action.value);
      }
      return newState;
    }
    case "ADD-IO-POINT":{
      const { io_point_id } = action.value;
      if (!newState.dummy.hasOwnProperty('ioPointsIds')){
        newState.dummy.ioPointsIds = [];
      }
      // newState.dummy.ioPointsIds.push(io_point_id);
      if (!newState.dummy.ioPointsIds.includes(io_point_id)) {
        newState.dummy.ioPointsIds.push(io_point_id);
      }
      return newState;
    }
    case "CREATE-MULTIPLE-IO-POINT":{
      const io_points = action.value;
      if (!newState.dummy.hasOwnProperty('ioPointsIds')){
        newState.dummy.ioPointsIds = [];
      }
      
      var io_point_ids = [];
      io_points.map(io_point=>{
        if (!newState.dummy.ioPointsIds.includes(io_point)) {
          io_point_ids.push(io_point.io_point_id);
        }
      })
      if (io_point_ids.length>=1) {
        newState.dummy.ioPointsIds.push(...io_point_ids);
      }
      return newState;
    }
    case "ADD-TOTE-STORABLE":{
      const { next_tote_storable_id } = action.value;
      if (!newState.dummy.hasOwnProperty('toteStorablesIds')){
        newState.dummy.toteStorablesIds = [];
      }
      // newState.dummy.toteStorablesIds.push(next_tote_storable_id);
      if (!newState.dummy.toteStorablesIds.includes(next_tote_storable_id)) {
        newState.dummy.toteStorablesIds.push(next_tote_storable_id);
      }
      return newState;
    }
    case "CREATE-MULTIPLE-TOTE-STORABLE":{
      const tote_storables = action.value;
      console.log("next_tote_storable_id===", next_tote_storable_id);
      if (!newState.dummy.hasOwnProperty('toteStorablesIds')){
        newState.dummy.toteStorablesIds = [];
      }
      var tote_storable_ids = [];
      tote_storables.map(tote_storable=>{
        if (!newState.dummy.toteStorablesIds.includes(tote_storable.next_tote_storable_id)) {
          tote_storable_ids.push(tote_storable.next_tote_storable_id);
        }
      })
      // newState.dummy.toteStorablesIds.push(next_tote_storable_id);
      if (tote_storable_ids.length>1) {
        newState.dummy.toteStorablesIds.push(...tote_storable_ids);
      }
      return newState;
    }
    case "REMOVE-IO-POINT": {
      var io_point_id = parseInt(action.value.io_point_id)
      if (newState.dummy.hasOwnProperty('ioPointsIds')){
        var newList = newState.dummy.ioPointsIds.filter(function(item) {
              return item !== io_point_id
          })
        newState.dummy.ioPointsIds = newList
      }
      return newState;
    }
    case "REMOVE-TOTE-STORABLE": {
      var next_tote_storable_id = parseInt(action.value.next_tote_storable_id)
      if (newState.dummy.hasOwnProperty('toteStorablesIds')){
        var newList = newState.dummy.toteStorablesIds.filter(function(item) {
              return item !== next_tote_storable_id
          })
        newState.dummy.toteStorablesIds = newList
      }
      return newState;
    }
    case "REMOVE-MULTIPLE-TOTE-STORABLE": {
      // var next_tote_storable_id = parseInt(action.value.next_tote_storable_id)
      if (newState.dummy.hasOwnProperty('toteStorablesIds')){
        var newList = newState.dummy.toteStorablesIds.filter(function(item) {
              return !action.value.includes(item)
          })
        newState.dummy.toteStorablesIds = newList
      }
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
    case "REMOVE-TEMPLATE": {
      var template_id = parseInt(action.value)
      if (newState.dummy.hasOwnProperty('haiPortsTemplateIds')){
        var newList = newState.dummy.haiPortsTemplateIds.filter(function(item) {
              return item !== template_id
          })
        newState.dummy.haiPortsTemplateIds = newList
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
