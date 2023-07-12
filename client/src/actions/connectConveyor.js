import { clearTiles } from "./actions";
import { DEFAULT_CONVEYOR_VERSION } from "../constants";

export const manageConnectedConveyorNeighbour = (barcodes,source_conveyor_tile,destination_conveyor_tile,direction) =>{
      if(Object.keys(barcodes).length!=0){
          barcodes[source_conveyor_tile]["neighbours"][direction] = [1,1,1] 
          barcodes[destination_conveyor_tile]["neighbours"][[(direction + 2) % 4]] = [1,0,0] 
      }
    return barcodes
}

export const deleteAllConnectedConveyorLink = (barcodes,source_conveyor_tile,destination_conveyor_tile,direction) =>{
      if(Object.keys(barcodes).length!=0){
          barcodes[source_conveyor_tile]["neighbours"][direction] = [1,0,0] 
          barcodes[destination_conveyor_tile]["neighbours"][[(direction + 2) % 4]] = [1,0,0] 
      }
    return barcodes
}

export const manageDeletedConnectedConveyorNeighbour = (barcodes,connected_conveyor_info) =>{
      var source_conveyor_tile = connected_conveyor_info["source_conveyor_tile"]
      var destination_conveyor_tile = connected_conveyor_info["destination_conveyor_tile"]
      var direction = connected_conveyor_info["direction"]
      if(Object.keys(barcodes).length!=0){
          barcodes[source_conveyor_tile]["neighbours"][direction] = [1,0,0] 
          barcodes[destination_conveyor_tile]["neighbours"][[(direction + 2) % 4]] = [1,0,0] 
      }
    return barcodes
}

export const linkConveyorSystem = (formData) => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });
  barcode = manageConnectedConveyorNeighbour(barcode,formData.source_conveyor_tile,formData.destination_conveyor_tile,formData.direction)
  var detination_tile = formData.destination_conveyor_tile.split(",").map((val) => parseInt(val))
  var source_tile = formData.source_conveyor_tile.split(",").map((val) => parseInt(val))
  var connected_tile = [source_tile,detination_tile]
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcode
  });
  dispatch({
    type: "ADD-CONNECTED-CONVEYOR",
    value: formData
  });
  dispatch({
        type: "LINK-CONNECT-CONVEYOR-SYSTEM",
        value: formData,
    });
  dispatch({
        type: "CHANGE-CONVEYOR-VERSION",
        value: DEFAULT_CONVEYOR_VERSION,
    });  
  dispatch(clearTiles);
  return true
}


export const updateConnectedConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  const connectedconveyorTileDict = {}
  const connectedconveyorTileState = normalizedMap.entities.ConnectedconveyorTile
  var key_list = Object.keys(connectedconveyorTileState)
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });
  var formdata_list = formData.schema.connected_point_info
  var formdata_connected_id = []
  for (var i = 0; i < formdata_list.length; i++) {
    var connectedconveyorTile = {}
    formdata_connected_id.push((formdata_list[i]["nextConnectedConveyorId"]).toString())
    barcode = manageConnectedConveyorNeighbour(barcode,formdata_list[i]["source_tile_id"],formdata_list[i]["destination_tile_id"],formdata_list[i]["tote_direction"])
    connectedconveyorTile["conveyor_id_destination"] = formdata_list[i]["destination_id"]
    connectedconveyorTile["conveyor_id_source"] = formdata_list[i]["source_id"]
    connectedconveyorTile["destination_conveyor_tile"] = formdata_list[i]["destination_tile_id"]
    connectedconveyorTile["source_conveyor_tile"] = formdata_list[i]["source_tile_id"]
    connectedconveyorTile["direction"] = formdata_list[i]["tote_direction"]
    connectedconveyorTile["connected_conveyor_id"] = formdata_list[i]["nextConnectedConveyorId"]
    connectedconveyorTileDict[formdata_list[i]["nextConnectedConveyorId"]] = connectedconveyorTile
  }
  var removed_connected_ids = key_list.filter(x => !formdata_connected_id.includes(x))
  for (var i = 0; i < removed_connected_ids.length; i++) {
    barcode = manageDeletedConnectedConveyorNeighbour(barcode,connectedconveyorTileState[removed_connected_ids[i]])
  }
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcode
  });
  dispatch({
        type: "EDIT-CONNECT-CONVEYOR-SYSTEM",
        value: connectedconveyorTileDict,
    }); 
  dispatch(clearTiles);
  return true
}

export const removeConnectedConveyor = (formData) => (dispatch, getState) => {
  const state = getState();
  const {normalizedMap,currentFloor} = state;
  const floorInfo = normalizedMap.entities.floor;
  const connectedconveyorTileDict = {}
  const connectedconveyorTileState = normalizedMap.entities.ConnectedconveyorTile
  var key_list = Object.keys(connectedconveyorTileState)
  var barcode = {};
  const barcodeKeys = floorInfo[currentFloor].map_values;
  barcodeKeys.forEach((barcodeKey) => {
      barcode[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });
  
  setTimeout(() => {
    if (window.confirm("Are you sure you want to remove all connected conveyors ?") === true){
      var formdata_list = formData.schema.connected_point_info
      for (var i = 0; i < formdata_list.length; i++) {
        barcode = deleteAllConnectedConveyorLink(barcode,formdata_list[i]["source_tile_id"],formdata_list[i]["destination_tile_id"],formdata_list[i]["tote_direction"])
      }
      dispatch({
          type: "VIEW-OVERLAP-BAROCDES",
          value: barcode
      });
      dispatch({
          type: "EDIT-CONNECT-CONVEYOR-SYSTEM",
          value: connectedconveyorTileDict,
      });
    }else{
      dispatch({
          type: "EDIT-CONNECT-CONVEYOR-SYSTEM",
          value: connectedconveyorTileState,
      });
    } 
  }, 1000);
  
   
  dispatch(clearTiles);
  return true
}