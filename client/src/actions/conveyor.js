import { clearTiles } from "./actions";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";
import { setErrorMessage } from "./message";
import conveyor_json from "common/utils/conveyor_json";
import SweetAlertError from "components/SweetAlertError";


export const addConveyorId = ({
  conveyor_id,
  conveyor_entry_height,
  conveyor_exit_height
}) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  var conveyor_tile = []
  for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
  }
  var ConveyorSelectData = {"conveyor_id":conveyor_id,"selected_tile":conveyor_tile}

  var ConveyorData={
    "conveyor_id":conveyor_id,
    "conveyor_entry_height":conveyor_entry_height,
    "conveyor_exit_height":conveyor_exit_height,
    "selected_tile":[],
    "conveyor_active":[]

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
  return true
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
  // var {io_error,io_reason,io_point } = validateIoPoint(selectedTiles,conveyorTile, conveyor_id, "Entry", barcode,formData.bot_direction,formData.direction )
  // if (io_error) {
  //   return dispatch(setErrorMessage(io_reason));
  // }
  var io_point_coordinate = state.normalizedMap.entities.mappingBarcodeCoord[formData.entry_io_point];
  var io_point = JSON.stringify(io_point_coordinate.split(",").map((val) => parseInt(val)))
  var ConveyorData = {
    "conveyor_id": conveyor_id,
    "conveyor_entry": conveyor_tile,
    "conveyor_io_entry": io_point,
    "entry_point_direction": formData.direction,
    "bot_orientation_entry": formData.bot_direction
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
  console.log("exit formdata===========",[formData["exit_point"]])
  var conveyor_tile = StringtoListFormat([formData["exit_point"]])
  // var {io_error,io_reason,io_point } = validateIoPoint(selectedTiles,conveyorTile, conveyor_id, "Exit",barcode,formData.bot_direction,formData.direction )
  // if (io_error) {
  //   return dispatch(setErrorMessage(io_reason));
  // }
  var io_point_coordinate = state.normalizedMap.entities.mappingBarcodeCoord[formData.exit_io_point];
  var io_point = JSON.stringify(io_point_coordinate.split(",").map((val) => parseInt(val)))
  var ConveyorData = {
    "conveyor_id": conveyor_id,
    "conveyor_exit": conveyor_tile,
    "conveyor_io_exit": io_point,
    "exit_point_direction": formData.direction,
    "bot_orientation_exit": formData.bot_direction
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
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = formData.conveyor_id
  var conveyor_tile = conveyorTile[conveyor_id]["selected_tile"]
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
    var barcodes = state.normalizedMap.entities.barcode[removed_conveyor_array[0]]
    if(barcodes.hasOwnProperty('remove_conveyor_tile')){
      setTimeout(() => {
        if (window.confirm("Are you sure you want to delete conveyor id "+conveyor_id+"?") ) {
          dispatch({
              type: "CONVEYOR-TILES-STRIPES",
              value: {conveyor_tile,"conveyor_selected_status":0}
                })
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

export const updateConveyor = (formData) => (dispatch, getState) => {
  var state = getState();
  const {
    normalizedMap: {
      entities: { conveyorTile,mappingBarcodeCoord },
    },
  } = state;
  let originalConveyorId = formData.originalConveyorId;
  let activePointDiff = []
  var ConveyorData = state.normalizedMap.entities.conveyorTile[originalConveyorId];
  // update conveyor details based on form
  ConveyorData.conveyor_entry_height = parseInt(formData.schema.conveyor_entry_height_info.conveyor_entry_height);
  ConveyorData.conveyor_exit_height = parseInt(formData.schema.conveyor_exit_height_info.conveyor_exit_height);
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
  
  // if form does not have conveyor_exit info but state has, 
  // then delete conveyor_exit info from state and remove exit point highlight.
  // if form has conveyor_exit info and state also has, 
  // then update conveyor_exit info from state.
  if(ConveyorData.hasOwnProperty("conveyor_exit")){
    conveyor_tile = ConveyorData.conveyor_exit
    if(!formData.schema.hasOwnProperty("exit_point_info")){
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
    }
  }
  if(!formData.schema.exit_point_info && ConveyorData.hasOwnProperty("conveyor_exit")){
       delete ConveyorData.bot_orientation_exit;
       delete ConveyorData.exit_point_direction;
       delete ConveyorData.conveyor_io_exit;
       delete ConveyorData.conveyor_exit;
     }
  else if(ConveyorData.hasOwnProperty("conveyor_exit")){
       ConveyorData.bot_orientation_exit = parseInt(formData.schema.exit_point_info.exit_bot_orientation_direction);
       ConveyorData.exit_point_direction = parseInt(formData.schema.exit_point_info.exit_direction);
       ConveyorData.conveyor_io_exit = `[${mappingBarcodeCoord[formData.schema.exit_point_info.exit_io_point_coordinate]}]`;
  }

  // if form does not have conveyor_entry info but state has, 
  // then delete conveyor_entry info from state and remove entry point highlight.
  // if form has conveyor_entry info and state also has, 
  // then update conveyor_entry info from state.
  if(ConveyorData.hasOwnProperty("conveyor_entry")){
    conveyor_tile = ConveyorData.conveyor_entry
    if(!formData.schema.hasOwnProperty("entry_point_info")){
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, grid_attribute: "conveyor_track" } ,
      });
    }
  }
  if(!formData.schema.entry_point_info && ConveyorData.hasOwnProperty("conveyor_entry")){
       delete ConveyorData.bot_orientation_entry;
       delete ConveyorData.entry_point_direction;
       delete ConveyorData.conveyor_io_entry;
       delete ConveyorData.conveyor_entry;
     }
  else if(ConveyorData.hasOwnProperty("conveyor_entry")){
       ConveyorData.bot_orientation_entry = parseInt(formData.schema.entry_point_info.entry_bot_orientation_direction);
       ConveyorData.entry_point_direction = parseInt(formData.schema.entry_point_info.entry_direction);
       ConveyorData.conveyor_io_entry = `[${mappingBarcodeCoord[formData.schema.entry_point_info.entry_io_point_coordinate]}]`
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
      entities: { conveyorTile },
    },
  } = state;
  var { normalizedMap } = getState();

  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id
  var conveyorJson = conveyor_json(normalizedMap);
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(conveyorJson)
    )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "conveyor.json";
  link.click();
};