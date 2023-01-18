import { clearTiles } from "./actions";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";
import { setErrorMessage } from "./message";
import conveyor_json from "common/utils/conveyor_json";


export const addConveyorId = ({
  conveyor_id,
  conveyor_height,
}) => (dispatch, getState) => {
  var ConveyorData={
    "conveyor_id":conveyor_id,
    "conveyor_height":conveyor_height,
    "selected_tile":[]

  }
  return dispatch({
    type: "ADD-CONVEYOR",
    value: ConveyorData
  });
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

export const validateActiveSelectedBarcodes = (tileIds, ConveyorTile, conveyor_id) => {
  var final_list = convertNestedListToList(ConveyorTile[conveyor_id]["selected_tile"])
  if(!final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "Active Point should lie on intermidiate point of conveyor belt"
      };
  }
  final_list = convertNestedListToList(ConveyorTile[conveyor_id]["conveyor_entry"])
  if(final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "Entry Point cannot be Active Point"
      };
  }
  final_list = convertNestedListToList(ConveyorTile[conveyor_id]["conveyor_exit"])
  if(final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "Entry Point cannot be Exit Point"
      };
  }
  return { error: false };
};

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


export const getIoPoint = (tileId, conveyorTile, conveyor_id, name, barcode) => {
  if(barcode[tileId[0]].hasOwnProperty('adjacency')){
    var nbTileId = convertNestedListToList(barcode[tileId[0]]["adjacency"])
  }else{
    var nbTileId = getNeighbourTiles(tileId[0])
  }
  var selectedConveyorTiles = convertNestedListToList(conveyorTile[conveyor_id]["selected_tile"])
  var result = selectedConveyorTiles.filter(o => nbTileId.some(e => JSON.stringify(e) == JSON.stringify(o)));
  if(result.length===1){
    var direction = nbTileId.indexOf(result[0])
    var io_point = nbTileId[(direction + 2) % 4]
    if(!Object.keys(barcode).includes(io_point)){
      return {
        io_error: true,
        io_reason: "No "+name+" IO point available for conveyor",
        io_point:[]
      };
    }
    if(!barcode[io_point]["ttp_location"]===true){
      return {
        io_error: true,
        io_reason: name+" Point adjacent point should lie on ttp map location",
        io_point:[]
      };
    }
    io_point = JSON.stringify(io_point.split(",").map((val) => parseInt(val)))
    return { io_error: false, io_reason:"",io_point: io_point};
  }
  else{
    return {
          io_error: true,
          io_reason: name+" point can be defined on the start point of conveyor",
          io_point:[]
        };
  }
}


export const validateEntrySelectedBarcodes = (tileIds, ConveyorTile, conveyor_id, barcode) => {
  if (tileIds.length > 1)
    return {
      error: true,
      reason: "Only 1 barcode can be Entry point"
    };
  var final_list = convertNestedListToList(ConveyorTile[conveyor_id]["selected_tile"])
  if(!final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "Entry Point should lie on intermidiate point of conveyor belt"
      };
  }
  return { error: false };
};

export const validateExitSelectedBarcodes = (tileIds, ConveyorTile, conveyor_id, barcode) => {
  if (tileIds.length > 1)
    return {
      error: true,
      reason: "Only 1 barcode can be Exit point"
    };
  var entry_point = ConveyorTile[conveyor_id]["conveyor_entry"][0].toString()
  if(entry_point === tileIds[0]){
    return {
        error: true,
        reason: "Entry point and exit point can not be same"
      };
  }
  var final_list = convertNestedListToList(ConveyorTile[conveyor_id]["selected_tile"])
  if(!final_list.includes(tileIds[0])){
    return {
        error: true,
        reason: "Exit Point should lie on intermidiate point of conveyor belt"
      };
  }
  return { error: false };
};

export const validateSelectedConveyorPoint = (tileIds, barcodesDict) => {
  if (tileIds.length < 4)
    return {
      error: true,
      reason: "Atleast 4 barcodes required"
    };
  for (var i = 1; i < tileIds.length; i++) {
    var curTileId = tileIds[i];
    var prevTileId = tileIds[i - 1];
    // make sure prev barcode has current barcode as neighbour
    if (
      getNeighbouringCoordinateKeys(prevTileId, barcodesDict).find(
        coordinateKey => coordinateKey == curTileId
      ) === undefined
    )
      return {
        error: true,
        reason: "Some barcodes are not consecutive or disconnected"
      };
  }
  return { error: false };
};


export const selectConveyor = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;
  const { error, reason } = validateSelectedConveyorPoint(selectedTiles, barcode);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  var conveyor_tile = []
  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id
  for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
  }
  var ConveyorData = {"conveyor_id":conveyor_id[0],"selected_tile":conveyor_tile}
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, conveyor_selected_status: 1 } ,
    });
  dispatch({
        type: "SELECT-CONVEYOR-SYSTEM",
        value: ConveyorData ,
    });
  dispatch(clearTiles);
  return true

}

export const selectEntryConveyor = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id
  const { error, reason } = validateEntrySelectedBarcodes(selectedTiles, conveyorTile, conveyor_id[0], barcode);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  var conveyor_tile = StringtoListFormat(selectedTiles)
  var {io_error,io_reason,io_point } = getIoPoint(selectedTiles,conveyorTile, conveyor_id[0], "Entry", barcode)
  if (io_error) {
    return dispatch(setErrorMessage(io_reason));
  }
  var ConveyorData = {"conveyor_id":conveyor_id[0],"conveyor_entry":conveyor_tile, "conveyor_io_entry":io_point}
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, conveyor_selected_status: 2 } ,
    });
  dispatch({
        type: "SELECTED-CONVEYOR-ENTRY-POINT",
        value: ConveyorData ,
    });
  dispatch(clearTiles);
  return true
}

export const selectExitConveyor = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;
  const {
    normalizedMap: {
      entities: { conveyorTile },
    },
  } = state;
  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id

  const { error, reason } = validateExitSelectedBarcodes(selectedTiles, conveyorTile,conveyor_id[0],barcode);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  var conveyor_tile = StringtoListFormat(selectedTiles)
  var {io_error,io_reason,io_point } = getIoPoint(selectedTiles,conveyorTile, conveyor_id[0], "Exit",barcode)
  if (io_error) {
    return dispatch(setErrorMessage(io_reason));
  }
  var ConveyorData = {"conveyor_id":conveyor_id[0],"conveyor_exit":conveyor_tile, "conveyor_io_exit":io_point}
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, conveyor_selected_status: 3 } ,
    });
  dispatch({
        type: "SELECTED-CONVEYOR-EXIT-POINT",
        value: ConveyorData ,
    });
  dispatch(clearTiles);
  return true
}

export const selectEndConveyor = () => (dispatch, getState) => {
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
  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id
  const { error, reason } = validateEndSelectedBarcodes(selectedTiles, conveyorTile,conveyor_id[0]);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  var conveyor_tile = StringtoListFormat(selectedTiles)
  var ConveyorData = {"conveyor_id":conveyor_id[0],"conveyor_end":conveyor_tile}
  if(conveyorTile[conveyor_id[0]].hasOwnProperty("conveyor_end")){
    var pre_end_point = conveyorTile[conveyor_id[0]]["conveyor_end"]
    dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { pre_end_point, conveyor_selected_status: 1} ,
    });
  }
  if(conveyorTile[conveyor_id[0]].hasOwnProperty("conveyor_active")){
    var check_conveyor_active = checkIfEndPointLieOnActive(conveyorTile[conveyor_id[0]],selectedTiles)
    if (check_conveyor_active){
      dispatch({
        type: "SELECTED-CONVEYOR-ACTIVE-POINT",
        value: {"conveyor_id":conveyor_id[0],"conveyor_active":check_conveyor_active} ,
      });
      dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { check_conveyor_active, conveyor_selected_status: 5 } ,
      });
    }
  }
  dispatch({
        type: "SELECTED-CONVEYOR-END-POINT",
        value: ConveyorData ,
    });
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, conveyor_selected_status: 4 } ,
    });
  dispatch(clearTiles);
  return true
}

export const selectActiveConveyor = () => (dispatch, getState) => {
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
  var conveyor_id = state.normalizedMap.entities.map.dummy.current_conveyor_id
  const { error, reason } = validateActiveSelectedBarcodes(selectedTiles, conveyorTile,conveyor_id[0]);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  var conveyor_tile = []
  for (var i = 0; i < selectedTiles.length; i++) {
      var convert = selectedTiles[i].split(",").map((val) => parseInt(val))
      conveyor_tile.push(convert)
  }
  var ConveyorData = {"conveyor_id":conveyor_id[0],"conveyor_active":conveyor_tile}
  if(conveyorTile[conveyor_id[0]].hasOwnProperty("conveyor_active")){
    var pre_active_point = conveyorTile[conveyor_id[0]]["conveyor_active"]
    dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { pre_active_point, conveyor_selected_status: 1} ,
    });
  }
  dispatch({
        type: "SELECTED-CONVEYOR-ACTIVE-POINT",
        value: ConveyorData ,
    });
  dispatch({
        type: "CONVEYOR-TILES-STRIPES",
        value: { conveyor_tile, conveyor_selected_status: 5 } ,
    });
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
        if (window.confirm("Are you Sure You want to delete conveyor id "+conveyor_id+"?") ) {
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
  var conveyor_tile = conveyorTile[conveyor_id]["selected_tile"]
  var conveyor_height = conveyorTile[conveyor_id]["conveyor_height"]
  dispatch({
      type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
      value: {conveyor_tile,"remove_conveyor_tile":1}
    });
  var state = getState();
  var removed_conveyor_array = convertNestedListToList(conveyor_tile)
  var barcodes = state.normalizedMap.entities.barcode[removed_conveyor_array[0]]
  if(barcodes.hasOwnProperty('remove_conveyor_tile')){
    setTimeout(() => {
      alert("Height of conveyor id "+conveyor_id+" is "+conveyor_height)
      dispatch({
              type: "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR",
              value: {conveyor_tile,"remove_conveyor_tile":0}
          });
      }, 1000);
  }
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