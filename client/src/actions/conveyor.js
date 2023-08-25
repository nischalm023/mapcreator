import { clearTiles } from "./actions";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";
import { setErrorMessage } from "./message";
import conveyor_json_v2 from "common/utils/conveyor_json_v2";
import conveyor_json_v1 from "common/utils/conveyor_json_v1";
import SweetAlertError from "components/SweetAlertError";
import {DEFAULT_CONVEYOR_VERSION} from "../constants";
import {validateConveyorEntity} from "./validateConveyor"

export const removeHaiPortNeighbour = (barcodes,entity,direction,hai_port,entity_val) =>{
  if (barcodes[hai_port].hasOwnProperty('adjacency')) {
    var nbTileId = convertNestedListToList(barcodes[hai_port]["adjacency"])
  }
  else{
    var nbTileId = getNeighbourTiles(hai_port)
    }
  for (var j = 0; j < nbTileId.length; j++) {
    if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!==""){
      if(entity_val === "loader"){
        if(j !== (direction + 2) % 4){
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1]
          barcodes[hai_port]["neighbours"][j] = [1,1,1]
        }
      }else{
        if(j !== direction){
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1]
          barcodes[hai_port]["neighbours"][j] = [1,1,1]
        }
      }
    }
  }
  return barcodes
}

export const manageRemoveConveyorNeighbour = (conveyor_id,barcodes,selectedTiles,conveyorTile,haiPortTile,haiPortsTemplate) => {
  for (var i = 0; i < selectedTiles.length; i++) {
      if(Object.keys(barcodes).length!=0 && selectedTiles.length!=0){
        if (barcodes[selectedTiles[i]].hasOwnProperty('adjacency')) {
          var nbTileId = convertNestedListToList(barcodes[selectedTiles[i]]["adjacency"])
        }
        else {
          var nbTileId = getNeighbourTiles(selectedTiles[i])
        }

        for (var j = 0; j < nbTileId.length; j++) {
          if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!==""){
              barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1] 
              barcodes[selectedTiles[i]]["neighbours"][j] = [1,1,1] 
          }
        }
      }
    }
    for (const [key, value] of Object.entries(conveyorTile)) {
      if(parseInt(value["conveyor_id"])!==parseInt(conveyor_id)){
        var selected_array = convertNestedListToList(value["selected_tile"])
        barcodes = manageConveyorNeighbour(barcodes,selected_array)
      }
      
    }
    for (const [key, value] of Object.entries(haiPortTile)) {
        barcodes  = removeHaiPortNeighbour(barcodes,value["entity_point"],value["direction"],value["port_coordinate"],haiPortsTemplate[value["template_id"]]["port_type"])
    }
    return barcodes
}


export const manageConveyorNeighbour = (barcodes,selectedTiles) =>{
    let pre_index = ""
    let conveyor_index = ""
    for (var i = 0; i < selectedTiles.length; i++) {
      if(Object.keys(barcodes).length!=0 && selectedTiles.length!=0){
        if (barcodes[selectedTiles[i]].hasOwnProperty('adjacency')) {
          var nbTileId = convertNestedListToList(barcodes[selectedTiles[i]]["adjacency"])
        }
        else {
          var nbTileId = getNeighbourTiles(selectedTiles[i])
        }
        for (var j = 0; j < nbTileId.length; j++) {
          if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!=="" && selectedTiles.includes(nbTileId[j])){
            barcodes[selectedTiles[i]]["neighbours"][j] = [1,1,1]
          }
          if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!=="" && !selectedTiles.includes(nbTileId[j])){
            barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0] 
            barcodes[selectedTiles[i]]["neighbours"][j] = [1,0,0]
          }
        }
      }
    }
    // for (var i = 0; i < selectedTiles.length; i++) {
    //   if(Object.keys(barcodes).length!=0 && selectedTiles.length!=0){
    //     if (barcodes[selectedTiles[i]].hasOwnProperty('adjacency')) {
    //       var nbTileId = convertNestedListToList(barcodes[selectedTiles[i]]["adjacency"])
    //     }
    //     else {
    //       var nbTileId = getNeighbourTiles(selectedTiles[i])
    //     }
    //     if(selectedTiles[i] === (selectedTiles.slice(-1))[0]){
    //       if(nbTileId.includes(selectedTiles[i-1])){
    //         if(conveyor_index!==""){
    //           pre_index = ""
    //         }
    //         conveyor_index = nbTileId.indexOf(selectedTiles[i-1])
    //       }
    //     }else{
    //       if(nbTileId.includes(selectedTiles[i+1])){
    //         if(conveyor_index!==""){
    //           pre_index = (conveyor_index + 2) % 4
    //         }
    //         conveyor_index = nbTileId.indexOf(selectedTiles[i+1])
    //       }
    //     }
        
    //     for (var j = 0; j < nbTileId.length; j++) {
    //       if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!==""){
    //         if(j === conveyor_index){
    //           barcodes[selectedTiles[i]]["neighbours"][j] = [1,1,1]
    //           barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1] 
    //         }
    //         else if(pre_index === ""){
    //           barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0] 
    //           barcodes[selectedTiles[i]]["neighbours"][j] = [1,0,0] 
    //         }else if(pre_index !== j){
    //           barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0] 
    //           barcodes[selectedTiles[i]]["neighbours"][j] = [1,0,0]
    //         }
    //       }
    //     }
    //   }
    // }
    return barcodes
}

export const addConveyorId = ({
  conveyor_id,
  conveyor_display_name,
  conveyor_step_id,
}) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  var barcodes
  barcodes = state.normalizedMap.entities.barcode
  const selectedTiles = Object.keys(mapTiles);
  var conveyor_tile = []
  for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
  }
  barcodes = manageConveyorNeighbour(barcodes,selectedTiles)
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcodes
  });
  var ConveyorSelectData = {"conveyor_id":conveyor_id,"selected_tile":conveyor_tile}

  var ConveyorData={
    "conveyor_id":conveyor_id,
    "conveyor_display_name":conveyor_display_name,
    "selected_tile":[],
    "conveyor_active":[],
    "conveyor_step_id":conveyor_step_id

  }
  dispatch({
    type: "ADD-CONVEYOR",
    value: ConveyorData
  });
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
    });
  dispatch({
        type: "SELECT-CONVEYOR-SYSTEM",
        value: ConveyorSelectData ,
    });
  dispatch(clearTiles);
  return Promise.resolve();
};

export const convertNestedListToList = (obj) =>{
  // [[1,2],[2,3]] = ["1,2","2,3"]
  var final_list = []
  for (var i = 0; i < obj.length; i++) {
    var element=""
    if(obj[i]!=null){
      element = obj[i].toString()
    }
    final_list.push(element)
  }
  return final_list
}

export const checkIfEndPointLieOnActive = (conveyor_tile,selectedTiles) => {
  var active_tile = convertNestedListToList(conveyor_tile["conveyor_active"])
  if(active_tile.includes(selectedTiles[0])){
    active_tile = active_tile.filter(function(item) {return item !== selectedTiles[0]})
  }
  var convert_active_tile = StringtoListFormat(active_tile)
  return convert_active_tile
}


export const validateEndSelectedBarcodes = (tileIds, ConveyorTile, conveyor_id) => {
  if (tileIds.length > 1)
    return {
      error: true,
      reason: "Only 1 barcode can be End point"
    };
  var final_list = convertNestedListToList(ConveyorTile[conveyor_id]["selected_tile"])
  if(!final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "End Point should lie on intermidiate point of conveyor belt"
      };
  }
  final_list = convertNestedListToList(ConveyorTile[conveyor_id]["conveyor_entry"])
  if(final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "End Point cannot be Entry Point"
      };
  }
  final_list = convertNestedListToList(ConveyorTile[conveyor_id]["conveyor_exit"])
  if(final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "End Point cannot be Exit Point"
      };
  }

  return { error: false };
};

export const StringtoListFormat = (selectedTiles) => {
  // ["1,2","3,4"] => [[1,2],[3,4]] 
  var conveyor_tile = []
  for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
  }
  return conveyor_tile

}

// entry and exit point bot direction
export const getConveyorPointBotDirection = (floor_barcodes, map_tile_value, direction, conveyorTile=null, conveyor_id=null) => {
  if(conveyorTile===undefined || conveyorTile===null){
    return {};
  }
  if(!conveyorTile.hasOwnProperty(conveyor_id)) {
    return {};
  }
  var bot_direction = {}
  if(Object.keys(floor_barcodes).length!=0 && map_tile_value.length!=0 && conveyor_id!=""){
    if (floor_barcodes[map_tile_value[0]].hasOwnProperty('adjacency')) {
      var nbTileId = convertNestedListToList(floor_barcodes[map_tile_value[0]]["adjacency"])
    }
    else {
      var nbTileId = getNeighbourTiles(map_tile_value[0])
    }
    // nbTileId = ["1,2", "", "1,4", "2,3"]

    var conveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
    for(var i = 0; i < nbTileId.length; i++) {
      if(nbTileId[i]!="" && Object.keys(floor_barcodes).includes(nbTileId[i])){
        if(conveyorTiles.includes(nbTileId[i])){
          continue;
        }
        if(i==0){
          var dir = "North"
        }
        if(i==1){
          var dir = "East"
        }
        if(i==2){
          var dir = "South"
        }
        if(i==3){
          var dir = "West"
        }
        bot_direction[dir] = i
      }
    }
  }
  return bot_direction
}
// entry point direction
export const getConveyorPointDirection = (state, floor_barcodes, map_tile_value, conveyorTile, conveyor_id) => {
  if(conveyorTile===undefined || conveyorTile===null){
    return {};
  }
  if(!conveyorTile.hasOwnProperty(conveyor_id)) {
    return {};
  }
  var conveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
  if(Object.keys(floor_barcodes).length!=0 && map_tile_value.length!=0 && conveyor_id!=""){
    var entry_direction_options = {
        "South" : 2,
        "West" : 3,
        "North" : 0,
        "East" : 1,
    };
    return entry_direction_options;
//    if(floor_barcodes[map_tile_value[0]].hasOwnProperty('adjacency')){
//      var nbTileId = convertNestedListToList(floor_barcodes[map_tile_value[0]]["adjacency"])
//    }else{
//      var nbTileId = getNeighbourTiles(map_tile_value[0])
//    }
    // nbTileId = ["1,2", "", "1,4", "2,3"]

    // cannot enter from an adjacent conveyor tile 
    // cannot enter from a null barcode
    // cannot enter from a barcode where there is an en entity
//    var entry_direction_options = {
//        "South" : 2,
//        "West" : 3
//        "North" : 0
//        "East" : 1
//    };
//    return entry_direction_options;
//    for (var i = 0; i < nbTileId.length; i++) {
//      if(nbTileId[i]!="" && Object.keys(floor_barcodes).includes(nbTileId[i])){
//        if(conveyorTiles.includes(nbTileId[i])){
//          continue;
//        }
//        // check if neighbour is a pps
//        let is_pps = false;
//        for(let key in state.normalizedMap.entities.pps){
//          let pps = state.normalizedMap.entities.pps[key];
//          if(pps.coordinate===nbTileId[i]){
//            is_pps = true;
//            break;
//          }
//        }
//        // check if neighbour is a charger
//        let is_charger = false;
//        for(let key in state.normalizedMap.entities.charger){
//          let charger = state.normalizedMap.entities.charger[key];
//          if(charger.coordinate===nbTileId[i]){
//            is_charger = true;
//            break;
//          }
//        }
//        // check if neighbour is a ods
//        let is_ods = false;
//        for(let key in state.normalizedMap.entities.odsExcluded){
//          let ods = state.normalizedMap.entities.odsExcluded[key];
//          if(ods.coordinate===nbTileId[i]){
//            is_ods = true;
//            break;
//          }
//        }
//        // check if neighbour is an elevator
//        let is_elevator = false;
//        for(let key in state.normalizedMap.entities.elevator){
//          let elevator = state.normalizedMap.entities.elevator[key];
//          if(state.normalizedMap.entities.mappingBarcodeCoord[elevator.position]===nbTileId[i]){
//            is_elevator = true;
//            break;
//          }
//        }
//        // if neighbour is an entity, then dont add in direction options
//        if(is_pps || is_charger || is_ods || is_elevator){
//          continue;
//        }
//
//        if(i==0){
//          entry_direction_options["South"] = 2
//        }
//        if(i==1){
//          entry_direction_options["West"] = 3
//        }
//        if(i==2){
//          entry_direction_options["North"] = 0
//        }
//        if(i==3){
//          entry_direction_options["East"] = 1
//        }
//      }
//    }
//  }
  //return entry_direction_options;
}
}
// exit point bot direction
export const getConveyorExitPointBotDirection = (floor_barcodes,map_tile_value,direction,conveyorTile,conveyor_id) => {
  var bot_direction = {}
  if(direction!==undefined && direction!=='' && Object.keys(floor_barcodes).length!==0 && map_tile_value.length!==0 && conveyor_id!=""){
  if(floor_barcodes[map_tile_value[0]].hasOwnProperty('adjacency')){
      var nbTileId = convertNestedListToList(floor_barcodes[map_tile_value[0]]["adjacency"])
    }else{
      var nbTileId = getNeighbourTiles(map_tile_value[0])
    }
    var selectedConveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
    var result = selectedConveyorTiles.filter(o => nbTileId.some(e => JSON.stringify(e) == JSON.stringify(o)));
    for (var i = 0, l = nbTileId.length; i < l; i++) {
      if(i!=nbTileId.indexOf(result[0]) && nbTileId[i]!="" && Object.keys(floor_barcodes).includes(nbTileId[i])){
        if(i==0){
          var dir = "North"
        }
        if(i==1){
          var dir = "East"
        }
        if(i==2){
          var dir = "South"
        }
        if(i==3){
          var dir = "West"
        }
        bot_direction[dir] = i
      }
    }
  }
  return bot_direction
}
// exit point direction
export const getConveyorExitPointDirection = (state, floor_barcodes, map_tile_value, conveyorTile, conveyor_id) => {
  var direction = ''
  if(conveyorTile===undefined || conveyorTile===null){
    return {};
  }
  if(!conveyorTile.hasOwnProperty(conveyor_id)) {
    return {};
  }
  var conveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
  if(Object.keys(floor_barcodes).length!=0 && map_tile_value.length!=0 && conveyor_id!=""){
        return {
                "South" : 2,
                "West" : 3,
                "North" : 0,
                "East" : 1,
        };

  }
//    if(floor_barcodes[map_tile_value[0]].hasOwnProperty('adjacency')){
//      var nbTileId = convertNestedListToList(floor_barcodes[map_tile_value[0]]["adjacency"])
//    }else{
//      var nbTileId = getNeighbourTiles(map_tile_value[0])
//    }
//    // nbTileId = ["1,2", "", "1,4", "2,3"]
//
//    // cannot exit to an adjacent conveyor tile
//    // cannot exit to a null barcode
//    // cannot exit to a barcode where there is an en entity
//    var exit_direction_options = {};
//    for (var i = 0; i < nbTileId.length; i++) {
//      if(nbTileId[i]!="" && Object.keys(floor_barcodes).includes(nbTileId[i])){
//        if(conveyorTiles.includes(nbTileId[i])){
//          continue;
//        }
//        // check if neighbour is a pps
//        let is_pps = false;
//        for(let key in state.normalizedMap.entities.pps){
//          let pps = state.normalizedMap.entities.pps[key];
//          if(pps.coordinate===nbTileId[i]){
//            is_pps = true;
//            break;
//          }
//        }
//        // check if neighbour is a charger
//        let is_charger = false;
//        for(let key in state.normalizedMap.entities.charger){
//          let charger = state.normalizedMap.entities.charger[key];
//          if(charger.coordinate===nbTileId[i]){
//            is_charger = true;
//            break;
//          }
//        }
//        // check if neighbour is a ods
//        let is_ods = false;
//        for(let key in state.normalizedMap.entities.odsExcluded){
//          let ods = state.normalizedMap.entities.odsExcluded[key];
//          if(ods.coordinate===nbTileId[i]){
//            is_ods = true;
//            break;
//          }
//        }
//        // check if neighbour is an elevator
//        let is_elevator = false;
//        for(let key in state.normalizedMap.entities.elevator){
//          let elevator = state.normalizedMap.entities.elevator[key];
//          if(state.normalizedMap.entities.mappingBarcodeCoord[elevator.position]===nbTileId[i]){
//            is_elevator = true;
//            break;
//          }
//        }
//        // if neighbour is an entity, then dont add in direction options
//        if(is_pps || is_charger || is_ods || is_elevator){
//          continue;
//        }
//
//        if(i==0){
//          exit_direction_options["North"] = 0
//        }
//        if(i==1){
//          exit_direction_options["East"] = 1
//        }
//        if(i==2){
//          exit_direction_options["South"] = 2
//        }
//        if(i==3){
//          exit_direction_options["West"] = 3
//        }
//      }
//    }
//  }
//  return exit_direction_options
}


export const getIoPoint = (tileId, conveyorTile, conveyor_id, 
                            barcode, direction, point_type=null) => {
  if(direction !== "" && conveyorTile!='' && barcode!="" && tileId!=""){
    if(barcode[tileId[0]].hasOwnProperty('adjacency')){
      var nbTileId = convertNestedListToList(barcode[tileId[0]]["adjacency"])
    }else{
      var nbTileId = getNeighbourTiles(tileId[0])
    }
    // nbTileId = ["1,2", "", "1,4", "2,3"]

    let iopoint_direction = null;
    if(point_type==="entry"){
      // opposite to entry direction
      iopoint_direction= (parseInt(direction) + 2) % 4;
    }
    else if(point_type==="exit"){
      // same as exit direction
      iopoint_direction= parseInt(direction) ;
    }
    var io_point_coordinate = nbTileId[iopoint_direction];
    var io_point_barcode = barcode[io_point_coordinate]["barcode"]

    return  io_point_barcode
  }
  return ''
}

export const validateIoPoint = (tileId, conveyorTile, conveyor_id, name, barcode,bot_direction,direction) => {
  if(bot_direction === "" || direction === ""){
    return {
        io_error: true,
        io_reason: "No "+name+" IO point available for conveyor",
        io_point:[]
      };
  }
  if(barcode[tileId[0]].hasOwnProperty('adjacency')){
    var nbTileId = convertNestedListToList(barcode[tileId[0]]["adjacency"])
  }else{
    var nbTileId = getNeighbourTiles(tileId[0])
  }
  var selectedConveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
  var io_point = nbTileId[bot_direction]
  if(!Object.keys(barcode).includes(io_point)){
      return {
        io_error: true,
        io_reason: "No "+name+" IO point available for conveyor",
        io_point:[]
      };
    }
    io_point = JSON.stringify(io_point.split(",").map((val) => parseInt(val)))
    return { io_error: false, io_reason:"",io_point: io_point};
}


export const selectEntryConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });

  var conveyor_id = formData.conveyor_id
  var conveyor_tile = StringtoListFormat([formData["conveyor_entry"]])
  var ConveyorData = {
    "conveyor_id": conveyor_id,
    "conveyor_entry": conveyor_tile,
    "entry_point_direction": formData.direction,
    "conveyor_entry_height": formData.entry_height,
  }
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_entry" } ,
    });
  dispatch({
        type: "SELECTED-CONVEYOR-ENTRY-POINT",
        value: ConveyorData ,
    });
  dispatch(clearTiles);
  return true
}

export const linkIOConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });
  var conveyor_tile_io_point = StringtoListFormat([formData.io_point])
  var conveyor_id = formData.conveyor_id
  var io_point = JSON.stringify(formData.io_point.split(",").map((val) => parseInt(val)))
  var ConveyorData = {
    "conveyor_id": conveyor_id,
    "conveyor_entry_point": formData.entry_point,
    "bot_orientation_entry": formData.bot_direction,
    "conveyor_io_entry":io_point
  }
  if(formData.link_entity_value === "entry"){
    var ConveyorData = {
      "conveyor_id": conveyor_id,
      "conveyor_entry_point": formData.entry_point,
      "bot_orientation_entry": formData.bot_direction,
      "conveyor_io_entry":io_point
     }
    dispatch({
          type: "CONVEYOR-TILES-ENTRY-IO-POINT-STRIPES",
          value: { conveyor_tile_io_point, conveyorEntryIO: true } ,
      });
    dispatch({
          type: "SELECTED-CONVEYOR-LINK-ENTRY-IO-POINT",
          value: ConveyorData ,
      });
  }else{
    var ConveyorData = {
      "conveyor_id": conveyor_id,
      "conveyor_exit_point": formData.entry_point,
      "bot_orientation_exit": formData.bot_direction,
      "conveyor_io_exit":io_point
     }
     dispatch({
          type: "CONVEYOR-TILES-EXIT-IO-POINT-STRIPES",
          value: { conveyor_tile_io_point, conveyorExitIO: true } ,
      });
    dispatch({
          type: "SELECTED-CONVEYOR-LINK-EXIT-IO-POINT",
          value: ConveyorData ,
      });
  }
  
  dispatch(clearTiles);
  return true
}

export const selectExitConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });

  var conveyor_id = formData.conveyor_id
  var conveyor_tile = StringtoListFormat([formData["exit_point"]])
  var ConveyorData = {
    "conveyor_id": conveyor_id,
    "conveyor_exit": conveyor_tile,
    "exit_point_direction": formData.direction,
    "conveyor_exit_height": formData.exit_height,
  }
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_exit" } ,
    });
  dispatch({
        type: "SELECTED-CONVEYOR-EXIT-POINT",
        value: ConveyorData ,
    });
  dispatch(clearTiles);
  return true
}

export const selectEndConveyor = (conveyor_id) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  
  var conveyor_tile = StringtoListFormat(selectedTiles)
  var ConveyorData = {"conveyor_id":conveyor_id,"conveyor_end":conveyor_tile}
  
  dispatch({
        type: "SELECTED-CONVEYOR-END-POINT",
        value: ConveyorData ,
    });
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_end" } ,
    });
  dispatch(clearTiles);
  return true
}

export const selectActiveConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = formData.conveyor_id
  var conveyor_tile = []
  var select_active_point = formData.active_point
  var conveyor_tile = StringtoListFormat(select_active_point)
  var conveyor_pps_point = {"pps_id":formData.pps_id,"pps_coordinate":formData.pps_coordinate,"conveyor_active_point":formData.active_point}
  var ConveyorData = {"conveyor_id":conveyor_id,"conveyor_pps_point":conveyor_pps_point,"active_point":conveyor_tile}
  dispatch({
        type: "SELECTED-CONVEYOR-ACTIVE-POINT",
        value: ConveyorData ,
    });
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_pps_point" } ,
    });
  dispatch({
        type: "ADD-TTP-PPS-POINT",
        value: { conveyor_pps_point } ,
  })
  dispatch(clearTiles);
  return true
}

export const removeConveyor = (
  formData) => (dispatch, getState) => {
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile,ConnectedconveyorTile,haiPortTile,haiPortsTemplate },
    },
  } = state;

  var conveyor_id = formData.conveyor_id
  var conveyor_tile = conveyorTile[conveyor_id]["selected_tile"]
  var diff_entry_io_point = []
  var diff_exit_io_point = []
  var hai_exit_port_list = []
  var hai_entry_port_list = []
  var port_id_list = []
  if(haiPortTile){
    for (const [key, value] of Object.entries(haiPortTile)) {
      if(haiPortsTemplate[value["template_id"]]["port_type"] === "loader" && value["conveyor_id"] == conveyor_id){
        diff_exit_io_point.push(value["io_coodinate"])
        hai_exit_port_list.push(value["port_coordinate"])
        port_id_list.push(value["port_id"])
      }else if(haiPortsTemplate[value["template_id"]]["port_type"] === "unloader" && value["conveyor_id"] == conveyor_id){
        diff_entry_io_point.push(value["io_coodinate"])
        hai_entry_port_list.push(value["port_coordinate"])
        port_id_list.push(value["port_id"])
      }
      
    }
  }
  if(ConnectedconveyorTile){
    var mapping_dict = {}
    for (const [key, value] of Object.entries(ConnectedconveyorTile)) {
        if(!Object.keys(mapping_dict).includes(value["conveyor_id_source"].toString())){
            var mapping_list = []
            mapping_list.push(value["conveyor_id_destination"].toString())
            mapping_dict[value["conveyor_id_source"]] = mapping_list
        }else{
            mapping_list.push(value["conveyor_id_destination"].toString())
            mapping_dict[value["conveyor_id_source"]] = mapping_list
        }
    }
    var error_text=''
    for (const [key, value] of Object.entries(mapping_dict)) {
        var values = value.map(Number)
        if(parseInt(conveyor_id) === parseInt(key)){
            var error_text = `Please disconnect conveyor system ${conveyor_id} and ${value.join()} before deletion`
            break
        }else if(values.includes(parseInt(conveyor_id))){
            var error_text = `Please disconnect conveyor system ${conveyor_id} and ${key} before deletion`
            break
        }
    }
    if(error_text!==""){
      return dispatch(setErrorMessage(error_text));
    }
  }
  var active_data = conveyorTile[conveyor_id]["conveyor_active"]
  if (conveyor_tile.length===0){
    dispatch({
      type: "REMOVE-SELECTED-CONVEYOR-ID",
      value: {conveyor_id}
    })
    dispatch({
      type:"REMOVE-CONVEYOR-ID",
      value: {conveyor_id}
    })
  }else{
    dispatch({
        type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
        value: {conveyor_tile,"remove_conveyor_tile":1}
      });
    var state = getState();
    var removed_conveyor_array = convertNestedListToList(conveyor_tile)
    var barcodes
    barcodes = state.normalizedMap.entities.barcode[removed_conveyor_array[0]]
    var barcodeDict = state.normalizedMap.entities.barcode
    if(barcodes.hasOwnProperty('remove_conveyor_tile')){
      setTimeout(() => {
        if (window.confirm("Are you sure you want to delete conveyor id "+conveyor_id+"?")){
          barcodes = manageRemoveConveyorNeighbour(conveyor_id,barcodeDict,removed_conveyor_array,conveyorTile,haiPortTile,haiPortsTemplate)
          dispatch({
            type: "VIEW-OVERLAP-BAROCDES",
            value: barcodes
          });
          dispatch({
              type: "CONVEYOR-TILES-STRIPES",
              value: {conveyor_tile,"conveyor_selected_status":0}
                })
          if(conveyorTile[conveyor_id].hasOwnProperty("conveyor_entry")){
            var conveyor_entry_data = conveyorTile[conveyor_id].conveyor_entry
            for (var i = 0; i < conveyor_entry_data.length; i++) {
              if(conveyor_entry_data[i].hasOwnProperty("conveyor_io_entry")){
                diff_entry_io_point.push(JSON.parse(conveyor_entry_data[i]["conveyor_io_entry"]).toString())
              }
            }
            dispatch({
              type: "REMOVE-CONVEYOR-ENTRY-IO-POINT-STRIPES",
              value: {diff_entry_io_point}
                })
          }
          if(conveyorTile[conveyor_id].hasOwnProperty("conveyor_exit")){
            var conveyor_exit_data = conveyorTile[conveyor_id].conveyor_exit
            for (var i = 0; i < conveyor_exit_data.length; i++) {
              if(conveyor_exit_data[i].hasOwnProperty("conveyor_io_exit")){
                diff_exit_io_point.push(JSON.parse(conveyor_exit_data[i]["conveyor_io_exit"]).toString())
              }
            }
            dispatch({
              type: "REMOVE-CONVEYOR-EXIT-IO-POINT-STRIPES",
              value: {diff_exit_io_point}
                })
          }
          if(hai_entry_port_list.length !==0){
            dispatch({
                type: "REMOVE-ENTRY-HAI-PORT-STRIPES",
                value: {hai_entry_port_list} ,
              });
          }
          if(hai_exit_port_list.length !==0){
            dispatch({
                type: "REMOVE-EXIT-HAI-PORT-STRIPES",
                value: {hai_exit_port_list} ,
              });
          }
          if(port_id_list!==0){
            dispatch({
               type: "DELETE-HAI-PORT-DATA",
                value: {port_id_list} ,
            });
          }
          dispatch({
              type: "REMOVE-SELECTED-CONVEYOR-ID",
              value: {conveyor_id}
            })
          dispatch({
              type:"REMOVE-CONVEYOR-ID",
              value: {conveyor_id}
            })
          dispatch({
              type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
              value: {conveyor_tile,"remove_conveyor_tile":0}
                });
          if(active_data.length!==0){
            dispatch({
                type: "DELETE-TTP-PPS-POINT",
                value: active_data
            });
          }
            }else {
                dispatch({
                    type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
                    value: {conveyor_tile,"remove_conveyor_tile":0}
                });
            }
        }, 1000);
    }
  }
  dispatch(clearTiles);
  return Promise.resolve();
  
};

const removeHaiPortDetails = (originalConveyorId,haiPortTile,stateDiff,haiPortsTemplate) => {
  var diff_entry_io_point = []
  var diff_exit_io_point = []
  var hai_exit_port_list = []
  var hai_entry_port_list = []
  var port_id_list = []
  if(haiPortTile){
    for (const [key, value] of Object.entries(haiPortTile)) {
      if(haiPortsTemplate[value["template_id"]]["port_type"] === "loader" && stateDiff.includes(value["entity_point"]) && value["conveyor_id"] == originalConveyorId){
        diff_exit_io_point.push(value["io_coodinate"])
        hai_exit_port_list.push(value["port_coordinate"])
        port_id_list.push(value["port_id"])
      }else if(haiPortsTemplate[value["template_id"]]["port_type"] === "unloader" && stateDiff.includes(value["entity_point"]) && value["conveyor_id"] == originalConveyorId){
        diff_entry_io_point.push(value["io_coodinate"])
        hai_entry_port_list.push(value["port_coordinate"])
        port_id_list.push(value["port_id"])
      }
    }
  }
  return [diff_entry_io_point,diff_exit_io_point,hai_exit_port_list,hai_entry_port_list,port_id_list]
}

export const updateConveyor = (formData) => (dispatch, getState) => {
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile,mappingBarcodeCoord ,haiPortTile,haiPortsTemplate},
    },
  } = state;
  let originalConveyorId = formData.originalConveyorId;
  let activePointDiff = []
  var ConveyorData = state.normalizedMap.entities.conveyorTile[originalConveyorId];

  if(formData.schema.conveyor_display_name_info){
    ConveyorData.conveyor_display_name = formData.schema.conveyor_display_name_info.conveyor_display_name;
  }
  if(ConveyorData.hasOwnProperty("conveyor_entry")){
    var getNewEntryList = []
    for (var i = 0; i < formData.schema.entry_point_info.length; i++) {
      getNewEntryList.push(mappingBarcodeCoord[formData.schema.entry_point_info[i]["entry_point_coordinate"]])
    }
    var getAllEntryCoordinateList = []
    for (var i = 0; i < ConveyorData.conveyor_entry.length; i++) {
      getAllEntryCoordinateList.push((ConveyorData.conveyor_entry[i]["conveyor_entry"][0]).toString())
    }
    let stateDiff = getAllEntryCoordinateList.filter(x => !getNewEntryList.includes(x));
    if(stateDiff){
      var conveyor_tile = StringtoListFormat(stateDiff)
      var diff_entry_io_point = []
      for (var i = 0; i < stateDiff.length; i++) {
        var entry_io = ConveyorData.conveyor_entry.find(item => (item.conveyor_entry[0]).toString() === stateDiff[i])
        if(entry_io.hasOwnProperty('conveyor_io_entry')){
          diff_entry_io_point.push(JSON.parse(entry_io["conveyor_io_entry"]).toString())
        }
      }
      if(diff_entry_io_point.length !== 0){
        dispatch({
          type: "REMOVE-CONVEYOR-ENTRY-IO-POINT-STRIPES",
          value: { diff_entry_io_point},
        });
      }
      var [diff_entry_io_point,diff_exit_io_point,hai_exit_port_list,hai_entry_port_list,port_id_list] = removeHaiPortDetails(originalConveyorId,haiPortTile,stateDiff,haiPortsTemplate)
      if(diff_entry_io_point.length !== 0){
        dispatch({
          type: "REMOVE-CONVEYOR-ENTRY-IO-POINT-STRIPES",
          value: { diff_entry_io_point},
        });
      }
      if(hai_entry_port_list !==0){
        dispatch({
                type: "REMOVE-ENTRY-HAI-PORT-STRIPES",
                value: {hai_entry_port_list} ,
              });
      }
      if(port_id_list !==0){
        dispatch({
               type: "DELETE-HAI-PORT-DATA",
                value: {port_id_list} ,
            });
      }
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
    }
  }
  if(formData.schema.entry_point_info.length === 0 && ConveyorData.hasOwnProperty("conveyor_entry")){
       delete ConveyorData.conveyor_entry
     }
  else if(formData.schema.entry_point_info.length !== 0  && ConveyorData.hasOwnProperty("conveyor_entry")){
    var new_entry = []
    delete ConveyorData.conveyor_entry
    for (var i = 0; i < formData.schema.entry_point_info.length; i++) {
      var entry_edit_dict = {}
      if(formData.schema.entry_point_info[i].entry_io_point_coordinate !== '' && formData.schema.entry_point_info[i].entry_io_point_coordinate !== 'NA'){
        entry_edit_dict["conveyor_io_entry"]=`[${mappingBarcodeCoord[formData.schema.entry_point_info[i].entry_io_point_coordinate]}]`
        entry_edit_dict["bot_orientation_entry"]=parseInt(formData.schema.entry_point_info[i].entry_bot_orientation_direction)
      }
      entry_edit_dict["conveyor_entry"]=[mappingBarcodeCoord[formData.schema.entry_point_info[i].entry_point_coordinate].split(",").map((val) => parseInt(val))]
      entry_edit_dict["conveyor_entry_height"]=parseInt(formData.schema.entry_point_info[i].conveyor_entry_height)
      entry_edit_dict["entry_point_direction"]=parseInt(formData.schema.entry_point_info[i].entry_direction)
      new_entry.push(entry_edit_dict)
    }
    ConveyorData.conveyor_entry = new_entry
  }
  if(ConveyorData.hasOwnProperty("conveyor_exit")){
    var getNewExitList = []
    for (var i = 0; i < formData.schema.exit_point_info.length; i++) {
      getNewExitList.push(mappingBarcodeCoord[formData.schema.exit_point_info[i]["exit_point_coordinate"]])
    }
    var getAllExitCoordinateList = []
    for (var i = 0; i < ConveyorData.conveyor_exit.length; i++) {
      getAllExitCoordinateList.push((ConveyorData.conveyor_exit[i]["conveyor_exit"][0]).toString())
    }
    let stateDiff = getAllExitCoordinateList.filter(x => !getNewExitList.includes(x));
    if(stateDiff){
      var conveyor_tile = StringtoListFormat(stateDiff)
      var diff_exit_io_point = []
      for (var i = 0; i < stateDiff.length; i++) {
        var exit_io = ConveyorData.conveyor_exit.find(item => (item.conveyor_exit[0]).toString() === stateDiff[i])
        if(exit_io.hasOwnProperty('conveyor_io_exit')){
          diff_exit_io_point.push(JSON.parse(exit_io["conveyor_io_exit"]).toString())
        }
      }
      if(diff_exit_io_point.length !== 0){
        dispatch({
          type: "REMOVE-CONVEYOR-EXIT-IO-POINT-STRIPES",
          value: { diff_exit_io_point},
        });
      }
      var [diff_entry_io_point,diff_exit_io_point,hai_exit_port_list,hai_entry_port_list,port_id_list] = removeHaiPortDetails(originalConveyorId,haiPortTile,stateDiff,haiPortsTemplate)
      if(diff_exit_io_point.length !== 0){
        dispatch({
          type: "REMOVE-CONVEYOR-EXIT-IO-POINT-STRIPES",
          value: { diff_exit_io_point},
        });
      }
      if(hai_exit_port_list !==0){
        dispatch({
                type: "REMOVE-EXIT-HAI-PORT-STRIPES",
                value: {hai_exit_port_list} ,
              });
      }
      if(port_id_list !==0){
        dispatch({
               type: "DELETE-HAI-PORT-DATA",
                value: {port_id_list} ,
            });
      }
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
    }
  }
  if(formData.schema.exit_point_info.length === 0 && ConveyorData.hasOwnProperty("conveyor_exit")){
       delete ConveyorData.conveyor_exit
     }
  else if(formData.schema.exit_point_info.length !== 0  && ConveyorData.hasOwnProperty("conveyor_exit")){
    var new_exit = []
    delete ConveyorData.conveyor_exit
    for (var i = 0; i < formData.schema.exit_point_info.length; i++) {
      var exit_edit_dict = {}
      if(formData.schema.exit_point_info[i].exit_io_point_coordinate !== '' && formData.schema.exit_point_info[i].exit_io_point_coordinate !== 'NA'){
        exit_edit_dict["bot_orientation_exit"]=parseInt(formData.schema.exit_point_info[i].exit_bot_orientation_direction)
        exit_edit_dict["conveyor_io_exit"]=`[${mappingBarcodeCoord[formData.schema.exit_point_info[i].exit_io_point_coordinate]}]`
      }
      exit_edit_dict["conveyor_exit"]=[mappingBarcodeCoord[formData.schema.exit_point_info[i].exit_point_coordinate].split(",").map((val) => parseInt(val))]
      exit_edit_dict["conveyor_exit_height"]=parseInt(formData.schema.exit_point_info[i].conveyor_exit_height)
      exit_edit_dict["exit_point_direction"]=parseInt(formData.schema.exit_point_info[i].exit_direction)
      new_exit.push(exit_edit_dict)
    }
    ConveyorData.conveyor_exit = new_exit
  }

  if(ConveyorData.conveyor_active.length !== 0){
    var getNewActiveList = []
    for (var i = 0; i < formData.schema.active_point_info.length; i++) {
      getNewActiveList.push(mappingBarcodeCoord[formData.schema.active_point_info[i]["active_point_coordinate"]])
    }
    var getAllActiveCoordinateList = []
    for (var i = 0; i < ConveyorData.conveyor_active.length; i++) {
      getAllActiveCoordinateList.push(ConveyorData.conveyor_active[i]["conveyor_active_point"][0])
    }
    let stateDiff = getAllActiveCoordinateList.filter(x => !getNewActiveList.includes(x));
    if(stateDiff){
      var conveyor_tile = StringtoListFormat(stateDiff)
      let ppsDiff = ConveyorData.conveyor_active.filter(object1 => {
                    return !formData.schema.active_point_info.some(object2 => {
                    return object1.conveyor_active_point[0] === mappingBarcodeCoord[object2.active_point_coordinate];
                    });
                  });
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
      dispatch({
        type: "DELETE-TTP-PPS-POINT",
        value: ppsDiff
      })
    }
  }
  if(formData.schema.active_point_info){
    let formDataActivePointCoordinates = [];
    let formDataActivePointPpsIds = {};
    var edit_pps_detail_list = []
    var activeNewPoint = formData.schema.active_point_info
    for (var i = 0; i < activeNewPoint.length; i++) {
      if(ConveyorData.conveyor_active.some(e => e.pps_id != activeNewPoint[i]["active_point_pps"] && 
      e.conveyor_active_point[0] == mappingBarcodeCoord[activeNewPoint[i]["active_point_coordinate"]])) {
          var edit_pps_detail = {}
          var old_detail = ConveyorData.conveyor_active.find(item => item.conveyor_active_point[0] ===  mappingBarcodeCoord[activeNewPoint[i]["active_point_coordinate"]])
          edit_pps_detail["old_pps_id"] = old_detail['pps_id']
          edit_pps_detail["new_pps_id"] = activeNewPoint[i]["active_point_pps"]
          edit_pps_detail["active_point"] = mappingBarcodeCoord[activeNewPoint[i]["active_point_coordinate"]]
          edit_pps_detail_list.push(edit_pps_detail)
      }
    }
    if(edit_pps_detail_list.length >0){
      dispatch({
        type: "EDIT-TTP-PPS-POINT",
        value: edit_pps_detail_list
      })
    }
    for(let i=0;i<Object.keys(formData.schema.active_point_info).length;i++){
      formDataActivePointCoordinates.push(mappingBarcodeCoord[formData.schema.active_point_info[i].active_point_coordinate]);
      formDataActivePointPpsIds[mappingBarcodeCoord[formData.schema.active_point_info[i].active_point_coordinate]]=formData.schema.active_point_info[i].active_point_pps;
    }
    let existingActivePointData = {};
    for(let i=0;i<ConveyorData.conveyor_active.length;i++){
      existingActivePointData[ConveyorData.conveyor_active[i].conveyor_active_point] = ConveyorData.conveyor_active[i];
    }
    let newActivePointData = [];
    let deletedActivePointData = []
    for(let i=0;i<formDataActivePointCoordinates.length;i++){
      let data = existingActivePointData[formDataActivePointCoordinates[i]];
      data.pps_id = formDataActivePointPpsIds[formDataActivePointCoordinates[i]];
      newActivePointData.push(data);
    }
    ConveyorData.conveyor_active = newActivePointData;
  }

  // if form does not have conveyor_end info but state has, 
  // then delete conveyor_end info from state and remove end point highlight
  if(ConveyorData.hasOwnProperty("conveyor_end")){
    conveyor_tile = ConveyorData.conveyor_end
    if(!formData.schema.hasOwnProperty("end_point_info")){
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
    }
  }
  if(!formData.schema.end_point_info && ConveyorData.hasOwnProperty("conveyor_end")){
    delete ConveyorData.conveyor_end;
  }
  
  // if(!formData.schema.exit_point_info && ConveyorData.hasOwnProperty("conveyor_exit")){
  //      delete ConveyorData.bot_orientation_exit;
  //      delete ConveyorData.exit_point_direction;
  //      delete ConveyorData.conveyor_io_exit;
  //      delete ConveyorData.conveyor_exit;
  //      delete ConveyorData.conveyor_exit_height
  //    }
  // else if(ConveyorData.hasOwnProperty("conveyor_exit")){
  //      ConveyorData.bot_orientation_exit = parseInt(formData.schema.exit_point_info.exit_bot_orientation_direction);
  //      ConveyorData.exit_point_direction = parseInt(formData.schema.exit_point_info.exit_direction);
  //      ConveyorData.conveyor_io_exit = `[${mappingBarcodeCoord[formData.schema.exit_point_info.exit_io_point_coordinate]}]`;
  // }

  // if form does not have conveyor_entry info but state has, 
  // then delete conveyor_entry info from state and remove entry point highlight.
  // if form has conveyor_entry info and state also has, 
  // then update conveyor_entry info from state.
  
  // if(!formData.schema.entry_point_info && ConveyorData.hasOwnProperty("conveyor_entry")){
  //      delete ConveyorData.bot_orientation_entry;
  //      delete ConveyorData.entry_point_direction;
  //      delete ConveyorData.conveyor_io_entry;
  //      delete ConveyorData.conveyor_entry;
  //      delete ConveyorData.conveyor_entry_height
  //    }
  // else if(ConveyorData.hasOwnProperty("conveyor_entry")){
  //      ConveyorData.bot_orientation_entry = parseInt(formData.schema.entry_point_info.entry_bot_orientation_direction);
  //      ConveyorData.entry_point_direction = parseInt(formData.schema.entry_point_info.entry_direction);
  //      ConveyorData.conveyor_io_entry = `[${mappingBarcodeCoord[formData.schema.entry_point_info.entry_io_point_coordinate]}]`
  //    }  
  if(ConveyorData.hasOwnProperty("conveyor_step_id")){
    var form_step_data = formData.schema.conveyor_step_id_info
    for(var i=0;i<form_step_data.length;i++){
      ConveyorData.conveyor_step_id[form_step_data[i]["step_barcode"]] = form_step_data[i]["step_id"]
    }
  }
  if(originalConveyorId===formData.schema.conveyor_id_info.conveyor_id){
    // update all other fields other than id
    dispatch({
      type: "ADD-CONVEYOR",
      value: ConveyorData
    });
    const selectedTiles = Object.keys(state.selection.mapTiles);
    var conveyor_tile = []
    for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
    }
    let ConveyorSelectData = {"conveyor_id":formData.schema.conveyor_id_info.conveyor_id,"selected_tile":conveyor_tile}
  //   dispatch({
  //     type: "SELECT-CONVEYOR-SYSTEM",
  //     value: ConveyorSelectData
  // });
  }
  else{
    // remove current conveyor system, then create new with new id

    dispatch({
      type: "REMOVE-SELECTED-CONVEYOR-ID",
      value: {"conveyor_id":originalConveyorId}
    })

    dispatch({
      type:"REMOVE-CONVEYOR-ID",
      value: {"conveyor_id":originalConveyorId}
    })
    // var state = getState();
    ConveyorData.conveyor_id=parseInt(formData.schema.conveyor_id_info.conveyor_id);

    dispatch({
      type: "ADD-CONVEYOR",
      value: ConveyorData
    });
  }
  dispatch(clearTiles);
  return Promise.resolve();
};

export const viewConveyor = (
  formData) => (dispatch, getState) => {
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = formData.conveyor_id
  if(conveyor_id=="All"){
    var conveyor_tile_list = []
    for (const [key, value] of Object.entries(conveyorTile)) {
      var selected_tile = convertNestedListToList(value["selected_tile"])
      conveyor_tile_list.push(selected_tile)
    }
    var conveyor_tile = StringtoListFormat([].concat.apply([], conveyor_tile_list))
  }else{
    var conveyor_tile = conveyorTile[conveyor_id]["selected_tile"]
  }
  dispatch({
      type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
      value: {conveyor_tile,"remove_conveyor_tile":1}
    });
  dispatch({ type: "VIEW-CONVEYOR-STATUS" })
  dispatch(clearTiles);
  return Promise.resolve();
};

export const viewModalConveyor = (
  formData) => (dispatch, getState) => {
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = formData.conveyor_id
  if(conveyor_id=="All"){
    var conveyor_tile_list = []
    for (const [key, value] of Object.entries(conveyorTile)) {
      var selected_tile = convertNestedListToList(value["selected_tile"])
      conveyor_tile_list.push(selected_tile)
    }
    var conveyor_tile = StringtoListFormat([].concat.apply([], conveyor_tile_list))
  }else{
    var conveyor_tile = conveyorTile[conveyor_id]["selected_tile"]
  }
  dispatch({
      type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
      value: {conveyor_tile,"remove_conveyor_tile":0}
    });
  dispatch({ type: "VIEW-CONVEYOR-STATUS" })
  return Promise.resolve();
};

export const downloadConveyor = () => (dispatch, getState) =>{
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile,ConnectedconveyorTile,haiPortTile },
    },
  } = state;
  var { normalizedMap } = getState();
  var [io_error_text,error_text] = validateConveyorEntity(ConnectedconveyorTile,conveyorTile,haiPortTile)
    if(error_text!==""){
      return dispatch(setErrorMessage(error_text));
    }
    if(io_error_text!==""){
      return dispatch(setErrorMessage(io_error_text));
    }
  var converyor_version = state.conveyorVersion
  if(converyor_version === DEFAULT_CONVEYOR_VERSION){
      var conveyorJson = conveyor_json_v2(normalizedMap);
    }else{
      var conveyorJson = conveyor_json_v1(normalizedMap);
    }
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(conveyorJson)
    )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "conveyor.json";
  link.click();
};