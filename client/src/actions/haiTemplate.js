import { clearTiles ,calculate_corner_world_cordinate,addEntitiesToFloor} from "./actions";
import { DEFAULT_CONVEYOR_VERSION,
         NORTH,
         EAST,
         SOUTH,
         WEST,
         DEFAULT_DISTANCE_HAI_PORT_IO_POINT,
         DEFAULT_VICINITY_HAI_IO_POINT,
         TTP_BARCODE_FORMAT,
         ADJACENCYDISTANCE } from "../constants";
import {StringtoListFormat,convertNestedListToList} from "./conveyor"
import { setSuccessMessage, setErrorMessage } from "./../actions/message";
import {getNeighbouringCoordinateKeys, 
        getBarcodeOffsetAndFormat,
        getNeighbourTiles ,
        implicitCoordinateKeyToBarcode,
        calculateVdaBarcode,
        getNeighbouringBarcodes,
        coordinateKeyToTupleOfIntegers,
        getNeighbouringBarcodesIncludingDisconnected,
        deleteNeighbourFromBarcode
        } from "utils/util";
import _ from "lodash";
import {
  getNewSpecialCoordinates,
  tileToWorldCoordinate,
} from "utils/selectors";
import {
  getNeighbourBarcodeWorldCoord
} from "./add-transit-barcode";

import {
  view_overlap_barcode
} from "./view_overlap_barcodes";
import {
  manage_ttp_overlap
} from "./manage_ttp_overlap";

import {shiftBarcode} from "reducers/barcode/shift-barcode";

export const createSpecialBarcode = (state,hai_port) =>{
  var specialTileIds = getNewSpecialCoordinates(state, {
    n: Object.keys(hai_port).length
  });
  return specialTileIds
}

export const createIOBarcode = (state,specialTileId,tileId,barcodes,direction,barcodeFormat,
  vda_offset,barcode,arbitrary_origin_value,currentFloor) =>{
  var newBarcodes = [];
  var specialBarcode = {
    store_status: 0,
    zone: "defzone",
    sector: "undefined",
    barcode: implicitCoordinateKeyToBarcode(specialTileId),
    botid: "null",
    neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    coordinate: specialTileId,
    blocked: false,
    size_info: barcodes[tileId]["size_info"],
    adjacency: [null, null, null, null],
    hai_port_special:true,
    special:true
  };
  var io_distance = barcodes[tileId]["size_info"][direction]
  const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId });
  const transitBarcodeWorldCoord = getNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    io_distance*2,
    direction
  );
  var haiBarcode = _.cloneDeep(barcodes[tileId]);
  haiBarcode.neighbours[direction] = [1, 1, 1];
  specialBarcode.neighbours[direction] = [1, 1, 1];
  specialBarcode.neighbours[(direction + 2) % 4] = [1, 1, 1];
  if(!haiBarcode.hasOwnProperty("adjacency")){
    haiBarcode["adjacency"] = getNeighbourTiles(tileId)
    haiBarcode["adjacency"][direction] = coordinateKeyToTupleOfIntegers(specialTileId);
    specialBarcode["adjacency"][
    (direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(tileId);
  }else{
    haiBarcode.adjacency[direction] = coordinateKeyToTupleOfIntegers(specialTileId);
    specialBarcode.adjacency[
    (direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(tileId);
  }
  
  specialBarcode["world_coordinate"] = `[${transitBarcodeWorldCoord["x"]},${transitBarcodeWorldCoord["y"]}]`
  specialBarcode["world_coordinate_reference_neighbour"]= tileId
  specialBarcode["corner_world_cooordinate"] = calculate_corner_world_cordinate(specialBarcode["size_info"],[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
  if(barcodeFormat==TTP_BARCODE_FORMAT){
    specialBarcode["barcode"] = calculateVdaBarcode([transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]],arbitrary_origin_value,vda_offset)
  }
  return [specialBarcode,haiBarcode]
}



export const createHaiTemplate = (formData) => (dispatch, getState) => {
  const state = getState();
  var template_data = 
         {
           "template_id":formData.template_id,
           "template_display_name":formData.schema.template_display_name.display_name,
           "port_type":formData.schema.port_type.port_type,
           "tray_count":parseInt(formData.schema.tray_count.tray_count),
           "support_agent":formData.schema.agent.agent_name,
           "length":parseInt(formData.schema.dimension.length),
           "breadth":parseInt(formData.schema.dimension.breadth),
           "height":parseInt(formData.schema.dimension.height),
           "clone":0
       }
  
  dispatch({
    type: "CREATE-HAI-TEMPLATE",
    value: template_data
  });
  dispatch({
    type:"ADD-TEMPLATE",
    value:template_data
  })
  dispatch(setSuccessMessage(`New Ranger Port Template: "${formData.schema.template_display_name.display_name}" has been created.`));
  return true
}
export const manageHaiTemplate = (formData) => (dispatch, getState) => {
  const state = getState();
  var haiTemplates = state.normalizedMap.entities.haiPortsTemplate
  var clone = haiTemplates[formData.template_id]["clone"]
  var template_data = 
         {
           "template_id":formData.template_id,
           "template_display_name":formData.schema.template_display_name.display_name,
           "port_type":formData.schema.port_type.port_type,
           "tray_count":parseInt(formData.schema.tray_count.tray_count),
           "support_agent":formData.schema.agent.agent_name,
           "length":parseInt(formData.schema.dimension.length),
           "breadth":parseInt(formData.schema.dimension.breadth),
           "height":parseInt(formData.schema.dimension.height),
           "clone":clone
       }
  
  dispatch({
    type: "MANAGE-HAI-TEMPLATE",
    value: template_data
  });
  if(formData.is_updated){
  dispatch(setSuccessMessage(`All Port linked to this template have updated properties.`));
  }
  return true
}

export const cloneHaiTemplate = (template_name,port_type,tray_count,length,breadth,height,template_id,agent_name) => (dispatch, getState) => {
  const state = getState();
  var haiTemplates = state.normalizedMap.entities.haiPortsTemplate
  if(haiTemplates[template_id]["clone"] === 0){
    var clone_template_name = `clone_${template_name}`
  }else{
    var clone_template_name = `clone${haiTemplates[template_id]["clone"]}_${template_name}`
  }
  var clone_template_id = Math.max(...(state.normalizedMap.entities.map.dummy.haiPortsTemplateIds || []), 0) + 1
  var clone = haiTemplates[template_id]["clone"] + 1
  var clone_template_data = {
    "template_display_name":clone_template_name,
    "port_type":port_type,
    "tray_count":tray_count,
    "length":length,
    "breadth":breadth,
    "height":height,
    "template_id":clone_template_id,
    "support_agent":agent_name,
    "clone":0
  }
  var manage_template_data = {
    "template_display_name":template_name,
    "port_type":port_type,
    "tray_count":tray_count,
    "length":length,
    "breadth":breadth,
    "height":height,
    "support_agent":agent_name,
    "template_id":template_id,
    "clone":clone
  }
  dispatch({
    type: "MANAGE-HAI-TEMPLATE",
    value: manage_template_data
  });
  dispatch({
    type: "CLONE-HAI-TEMPLATE",
    value: clone_template_data
  });
  dispatch({
    type:"ADD-TEMPLATE",
    value:clone_template_data
  })
  return true
}

export const removeHaiTemplate = (template_id,template_name) => (dispatch, getState) => {
  const state = getState();
  dispatch({
    type: "REMOVE-TEMPLATE",
    value: template_id
  });
  dispatch({
    type: "REMOVE-HAI-TEMPLATE",
    value: template_id
  });
  dispatch(setSuccessMessage(`Template: "${template_name}" Deleted.`));
  return true
}

export const manageHaiPortNeighbour = (barcodes,entity,direction,hai_port,entity_val,io_point,collect_eile_coordinate) =>{

  if (barcodes[hai_port].hasOwnProperty('adjacency')) {
    var nbTileId = convertNestedListToList(barcodes[hai_port]["adjacency"])
  }
  else{
    var nbTileId = getNeighbourTiles(hai_port)
    } 
  if(io_point !== "" && entity_val == "exit"){
    nbTileId[direction] = io_point
  }
  if(io_point !== "" && entity_val == "entry"){
    nbTileId[(direction + 2) % 4] = io_point
  }
  if(entity_val === "exit"){
    barcodes[hai_port]["size_info"][direction] = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - DEFAULT_VICINITY_HAI_IO_POINT
    if(collect_eile_coordinate.length ===0){
      barcodes[nbTileId[direction]]["size_info"][direction] = DEFAULT_VICINITY_HAI_IO_POINT
    }
    barcodes[nbTileId[direction]]["size_info"][(direction + 2) % 4] = DEFAULT_VICINITY_HAI_IO_POINT
    barcodes[nbTileId[direction]]["corner_world_cooordinate"] = calculate_corner_world_cordinate(barcodes[nbTileId[direction]]["size_info"],JSON.parse(barcodes[nbTileId[direction]]["world_coordinate"]))
  }else{
    barcodes[hai_port]["size_info"][(direction + 2) % 4] = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - DEFAULT_VICINITY_HAI_IO_POINT
    barcodes[nbTileId[(direction + 2) % 4]]["size_info"][direction] = DEFAULT_VICINITY_HAI_IO_POINT
    if(collect_eile_coordinate.length ===0){
    barcodes[nbTileId[(direction + 2) % 4]]["size_info"][(direction + 2) % 4] = DEFAULT_VICINITY_HAI_IO_POINT
    }
    barcodes[nbTileId[(direction + 2) % 4]]["corner_world_cooordinate"] = calculate_corner_world_cordinate(barcodes[nbTileId[(direction + 2) % 4]]["size_info"],JSON.parse(barcodes[nbTileId[(direction + 2) % 4]]["world_coordinate"]))
  } 
  barcodes[hai_port]["corner_world_cooordinate"] = calculate_corner_world_cordinate(barcodes[hai_port]["size_info"],JSON.parse(barcodes[hai_port]["world_coordinate"]))
  for (var j = 0; j < nbTileId.length; j++) {
    if(Object.keys(barcodes).includes(nbTileId[j]) && nbTileId[j]!==null && nbTileId[j]!==""){
      if(entity_val === "exit"){
        if(j !== (direction + 2) % 4){
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0]
          barcodes[hai_port]["neighbours"][j] = [1,0,0]
        }else{
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1]
          barcodes[hai_port]["neighbours"][j] = [1,1,1]
        }
      }else{
        if(j !== direction){
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0]
          barcodes[hai_port]["neighbours"][j] = [1,0,0]
        }else{
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1]
          barcodes[hai_port]["neighbours"][j] = [1,1,1]
        }
      }
      
    }
  }
  return barcodes
}

export const manageHaiPortNeighbourAfterOverlapping = (barcodes,direction,hai_port,entity_val,io_point) =>{
  if (barcodes[hai_port].hasOwnProperty('adjacency')) {
    var nbTileId = convertNestedListToList(barcodes[hai_port]["adjacency"])
  }
  else{
    var nbTileId = getNeighbourTiles(hai_port)
    } 
  if(io_point !== "" && entity_val == "exit"){
    nbTileId[direction] = io_point
  }
  if(io_point !== "" && entity_val == "entry"){
    nbTileId[(direction + 2) % 4] = io_point
  }
  if(entity_val === "exit"){
    barcodes[hai_port]["size_info"][direction] = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - DEFAULT_VICINITY_HAI_IO_POINT
    barcodes[nbTileId[direction]]["size_info"][(direction + 2) % 4] = DEFAULT_VICINITY_HAI_IO_POINT
  }else{
    barcodes[hai_port]["size_info"][(direction + 2) % 4] = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - DEFAULT_VICINITY_HAI_IO_POINT
    barcodes[nbTileId[(direction + 2) % 4]]["size_info"][direction] = DEFAULT_VICINITY_HAI_IO_POINT
  } 
  
  return barcodes
}

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
        }else{
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0]
          barcodes[hai_port]["neighbours"][j] = [1,0,0]
        }
      }else{
        if(j !== direction){
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,1,1]
          barcodes[hai_port]["neighbours"][j] = [1,1,1]
        }else{
          barcodes[nbTileId[j]]["neighbours"][(j + 2) % 4] = [1,0,0]
          barcodes[hai_port]["neighbours"][j] = [1,0,0]
        }
      }
      
    }
  }
  return barcodes
}

export const removeExtraVicinity = (state,tileIdMap) =>{
  let newState = {};
      for (let key of tileIdMap) {
        if (state[key]) {
          var neighbours = getNeighbouringBarcodesIncludingDisconnected(
            key,
            state
          );
          for (const [idx, nb] of neighbours.entries()) {
            if (nb && !tileIdMap[nb.coordinate]) {
              // its a valid neighbour of the deleted barcode that itself won't be deleted
              if (!newState[nb.coordinate])
                newState[nb.coordinate] = state[nb.coordinate];
              newState[nb.coordinate] = deleteNeighbourFromBarcode(
                newState[nb.coordinate],
                (idx + 2) % 4,
                false
              );
            }
          }
        }
      }
  return { ..._.omit(state, tileIdMap), ...newState };
}



export const createHaiPort = (formData) => (dispatch, getState) => {
  const state = getState();
  let barcodes
  var converyor_version = state.conveyorVersion
  barcodes = state.normalizedMap.entities.barcode
  var currentFloor = state.currentFloor
  var map_values = state.normalizedMap.entities.floor[currentFloor].map_values
  var collect_eile_coordinate = formData.collect_eile_coordinate
  let io_point = ""
  io_point = formData.io_point_coordinate
  var new_io_point = ""
  if(formData.remove_io_point.length !== 0){
      barcodes = removeExtraVicinity(barcodes,formData.remove_io_point)
  }
  var newBarcodes = [];
  var specialTileIds = []
  // If IO point barcode not present then create IO point barcode
  if(formData.hai_point_coordinate !== "" && io_point === ""){
    var hai_port_value = {}
    hai_port_value[formData.hai_point_coordinate] = true
    var specialTileIds = createSpecialBarcode(state,hai_port_value)
    Object.keys(hai_port_value).forEach((tileId, idx) => {
      var specialTileId = specialTileIds[idx];
      if(formData.entity_val == "entry"){
        var direction = (formData.direction + 2) % 4
      }else{
        var direction = formData.direction
      }
      var [barcodeFormat,vda_offset,barcode,arbitrary_origin_value,currentFloor] = getBarcodeOffsetAndFormat(state)
      var update_charger_barcode = createIOBarcode(state,specialTileId,formData.hai_point_coordinate,barcodes,
        direction,barcodeFormat,vda_offset,barcode,arbitrary_origin_value,currentFloor)
        newBarcodes = newBarcodes.concat(update_charger_barcode);
        let newEntitiesObj = {};
        for (let idx = 0; idx < newBarcodes.length; idx++) {
          let id = newBarcodes[idx]["coordinate"];
          newEntitiesObj[id] = {
            ...newBarcodes[idx]
          };
        }
        barcodes = { ...barcodes, ...newEntitiesObj }
        io_point = update_charger_barcode[0]["coordinate"]
    });
  }
  // shift barcode distance to vicinty and maintain size info of haiport and IO Point
  if(formData.hai_point_coordinate !== "" && io_point !==""){
    var tileId = io_point
    var hai_port_world_coord  = JSON.parse(barcodes[formData.hai_point_coordinate]["world_coordinate"])
    var io_point_worldcoordinate =  JSON.parse(barcodes[io_point]["world_coordinate"])
    var direction = formData.direction
    if(direction == NORTH || direction == SOUTH){
      var distance = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - Math.abs(hai_port_world_coord[1] - io_point_worldcoordinate[1]) 
    }
    if(direction == EAST || direction == WEST){
      var distance = DEFAULT_DISTANCE_HAI_PORT_IO_POINT - Math.abs(hai_port_world_coord[0] - io_point_worldcoordinate[0])
    }
    if(formData.entity_val =="entry"){
      direction = (direction + 2) % 4
    }
    barcodes = shiftBarcode(barcodes,[tileId,direction,distance],true)
    if(Object.keys(barcodes).length === 0 ){
      return dispatch(setErrorMessage("Cannot shift that much; getting negative distances."))
    }
    collect_eile_coordinate = collect_eile_coordinate.filter( ( el ) => !formData.remove_io_point.includes( el ) );
    barcodes = manageHaiPortNeighbour(barcodes,formData.entity_point,formData.direction,formData.hai_point_coordinate,formData.entity_val,io_point,collect_eile_coordinate)
  }
  // fix overlapping
  if(io_point !== ""){
    var check_overlapping = {}
    // var collect_eile_coordinate = collectEileCoordinate(barcodes,formData.hai_point_coordinate,direction)
    collect_eile_coordinate = collect_eile_coordinate.filter( ( el ) => !formData.remove_io_point.includes( el ) );
    for (var _data = 0; _data < collect_eile_coordinate.length; _data++) {
      check_overlapping[collect_eile_coordinate[_data]] = barcodes[io_point]
    }
    barcodes = dispatch(manage_ttp_overlap(check_overlapping,barcodes,true))
  }
  // check if IO point size info not change by overlapping.
    if(io_point !== ""){
    barcodes = manageHaiPortNeighbourAfterOverlapping(barcodes,formData.direction,formData.hai_point_coordinate,formData.entity_val,io_point)
  }
  // check if overlapping removed
  //  if(io_point !== ""){
  //   var check_overlapping = {}
  //   check_overlapping[io_point] = barcodes[io_point]
  //   check_overlapping[formData.hai_point_coordinate] = barcodes[formData.hai_point_coordinate]
  //   var unsuccessful_overlap = dispatch(view_overlap_barcode(check_overlapping,barcodes,true))
  //   if(unsuccessful_overlap.length !== 0){
  //     // var unsuccessful_overlap_barcode_format = []
  //     // for (var overlap = 0; overlap < unsuccessful_overlap.length; overlap++) {
  //     //   unsuccessful_overlap_barcode_format.push(barcodes[unsuccessful_overlap[overlap]]["barcode"])
  //     // }
  //     // const increase_distance_unsuccessful_barcode = unsuccessful_overlap_barcode_format.filter(dat => dat !== formData.hai_point_barcode);
  //     return dispatch(setErrorMessage(`Barcode: (${unsuccessful_overlap.join(",")}) was found to be overlapping with an existing barcode. Please increase the distance ...`));
  //   }
  // }
  if(io_point !=="" ){
    var conveyor_tile_io_point = StringtoListFormat([io_point])
    var conveyor_tile_hai_port = StringtoListFormat([formData.hai_point_coordinate])
     dispatch({
          type: "VIEW-OVERLAP-BAROCDES",
          value: barcodes
        });
     if(formData.remove_io_point.length !== 0){
      dispatch({
          type: "REMOVE-ENTITIES-FROM-FLOOR",
          value: {
            currentFloor,
            floorKey: "map_values",
            ids: formData.remove_io_point || []
          }
        });
        // remove barcodes
        dispatch({
          type: "DELETE-HAI-BARCODES",
          value: formData.remove_io_point || {}
        });
     }
     if(newBarcodes.length !==0){
      dispatch(
        addEntitiesToFloor({
          currentFloor,
          floorKey: "map_values",
          entities: newBarcodes,
          idField: "coordinate"
        })
      );
      dispatch({
          type:"ADD-COORDINATE-BARCODE-MAPPING",
          value:{"coordinate":specialTileIds[0],"barcode":implicitCoordinateKeyToBarcode(specialTileIds[0])}
        });
     }
     var data = {
        entity_point:formData.entity_point,
        template_id:formData.template_id,
        port_barcode:formData.hai_point_barcode,
        conveyor_id:formData.conveyor_id,
        port_id:formData.port_id,
        io_barcode:barcodes[io_point]["barcode"],
        port_id_value:"RPort_"+formData.port_id,
        io_coodinate:io_point,
        port_coordinate:formData.hai_point_coordinate,
        entity_height:formData.entity_height,
        direction:formData.direction,
      }
      dispatch({
        type:"CREATE-HAI-PORT",
        value:data
      })
      dispatch({
        type:"ADD-HAI-PORTS",
        value:formData.port_id
      })
      if(converyor_version !== DEFAULT_CONVEYOR_VERSION){
        dispatch({
        type: "CHANGE-CONVEYOR-VERSION",
        value: DEFAULT_CONVEYOR_VERSION,
        });  
      }
      if(formData.entity_val =="entry"){
        dispatch({
              type: "CONVEYOR-TILES-ENTRY-HAI-PORT-STRIPES",
              value: { conveyor_tile_hai_port, conveyorPortEntry: true, conveyor_tile_io_point, conveyorEntryIO: true } ,
          });
      }else{
        dispatch({
              type: "CONVEYOR-TILES-EXIT-HAI-PORT-STRIPES",
              value: { conveyor_tile_hai_port, conveyorPortExit: true,conveyor_tile_io_point, conveyorExitIO: true } ,
          });
      }
      dispatch(setSuccessMessage(`Ranger Port (${"RPort_"+formData.port_id}) has been added with a Ranger I/O Point (${barcodes[io_point]["barcode"]})`));
      dispatch(clearTiles);
  }


  return true
}

export const updateHaiPort = (formData) => (dispatch, getState) => {
  const state = getState();
  var data = {
    port_id:formData.port_id,
    port_id_value:formData.port_val,
    old_port_id_val:formData.old_port_val
  }
  dispatch({
          type: "UPDATE-HAI-PORT-ID",
          value: { data} ,
      });
  if(formData.old_port_val !== formData.port_val){
    dispatch(setSuccessMessage(`Ranger Port ID (${formData.old_port_val}) has been updated (${formData.port_val})`));
  }
  dispatch(clearTiles);
  return true
}

export const removeHaiPort = (formData) => (dispatch, getState) => {
  const state = getState();
  var hai_port_info = state.normalizedMap.entities.haiPortTile
  var barcodes = state.normalizedMap.entities.barcode
  var data = formData.port_info
  var port_id_list = [data.port_id]
  barcodes = removeHaiPortNeighbour(barcodes,hai_port_info[data.port_id]["entity_point"],hai_port_info[data.port_id]["direction"],hai_port_info[data.port_id]["port_coordinate"],data.port_type)
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcodes
  });
  dispatch({
          type: "DELETE-HAI-PORT-DATA",
          value: {port_id_list} ,
  });
  if(data.port_type === "unloader"){
    var conveyor_tile_io_point = [data.io_point]
    var conveyor_tile_hai_port = [data.port_coordinate]
    dispatch({
          type: "REMOVE-ENTRY-HAI-PORT",
          value: {conveyor_tile_hai_port,conveyor_tile_io_point} ,
      });
  }else{
    var conveyor_tile_io_point = [data.io_point]
    var conveyor_tile_hai_port = [data.port_coordinate]
    dispatch({
          type: "REMOVE-EXIT-HAI-PORT",
          value: {conveyor_tile_hai_port,conveyor_tile_io_point} ,
      });
  }
  dispatch(setSuccessMessage(`Ranger Port (${data.port_id_value}) has been Deleted.`)); 
  dispatch(clearTiles);
  return true
}