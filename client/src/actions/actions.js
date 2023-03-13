// action creator to make clicked-on-tile action from clicked-on-viewport action
import { handleErrors,
         ConvertTTPFormatBarcodeIntoDefaultFormat, 
         ConvertDefaultFormatBarcodeIntoTTPFormat,
         getOffsetValue,
         calculateGMBarcode
       } from "utils/util";
import { createSelector } from "reselect";
import {
  worldToTileCoordinate,
  tileIdsMapSelector,
  getDragSelectedTiles,
  distanceTileSpritesSelector,
  coordinateKeyToBarcodeSelector,
  getMapId,
  getTileIdToWorldCoordMapFunc,
  getNormalizedMap,
  getBarcodes,
  getParticularEntity,
  getStorableCoordinatesCount,
  getZoneToColorMap,
  getSectorToColorMap
} from "utils/selectors";
import { denormalizeMap, formatMapWithDataSuffix } from "utils/normalizr";
import { runCompleteDataSanity } from "../utils/data-sanity";
import { loader as PIXILoader } from "pixi.js";
import JSZip from "jszip";
import { saveAs } from "file-saver/FileSaver";
import copy from "copy-to-clipboard";
import exportMap from "common/utils/export-map";
import { SPRITESHEET_PATH } from "../constants";
import { fitToViewport, setViewportClamp } from "./viewport";
import { getLinearWorldCordXY ,mappedNeighbour} from "./AddAdjacency";
import { setErrorMessage, setSuccessMessage } from "./message";
import {
  getMap,
  updateMap,
  createMap,
  deleteMap as deleteMapApi,
  getSampleRacksJson,
  requestValidation as requestValidationApi,
  requestMapUploadToGsb as requestMapUploadToGsbApi,
} from "utils/api";
import { implicitBarcodeToCoordinate } from "../utils/util";
import { locateBarcode } from "../actions/barcode";
import _ from "lodash";


// always good idea to return promises from async action creators

export const mapTileClick = (tileId) => ({
  type: "CLICK-ON-MAP-TILE",
  value: tileId,
});
export const outsideTilesClick = {
  type: "CLICK-OUTSIDE-TILES",
};

const isPointInRect = ({ x, y, width, height }, { x: px, y: py }) =>
  px >= x && px <= x + width && py >= y && py <= y + height;

export const clickOnViewport = (worldCoordinate, onShiftClickOnMapTile) => (
  dispatch,
  getState
) => {
  const state = getState();
  const { normalizedMap } = getState();
  const tileIdsMap = tileIdsMapSelector(state);
  const distanceTileRects = distanceTileSpritesSelector(state);
  const isPointOnADistanceTile = distanceTileRects.some((rect) =>
    isPointInRect(rect, worldCoordinate)
  );
  var tileId = worldToTileCoordinate(state, worldCoordinate);
  // make sure the tileId is actually part of current floor's tiles
  if (tileId && tileIdsMap[tileId]) {
    if (state.selection.shiftKey) return onShiftClickOnMapTile(tileId);
    return dispatch(mapTileClick(tileId));
  } else if (!isPointOnADistanceTile) {
      Object.keys(normalizedMap.entities.barcode).forEach((key) => {
          if (normalizedMap.entities.barcode[key].highlight_status == 1){
              normalizedMap.entities.barcode[key].highlight_status = 0
          }
          });
    return dispatch(outsideTilesClick);
  } else {
    return Promise.resolve();
  }
};

export const clickOnDistanceTile = (distanceTileKey) => ({
  type: "CLICK-ON-DISTANCE-TILE",
  value: distanceTileKey,
});

export const dragStart = (worldCoordinate) => (dispatch, getState) => {
  const { selectedArea } = getState();
  if (!selectedArea) {
    // drag not already started
    dispatch({
      type: "DRAG-START",
      value: worldCoordinate,
    });
  }
  return Promise.resolve();
};

export const updateAutocadMap = (mapId,map1,onError,onSuccess) => (dispatch, getState) => {
  updateMap(mapId, map1).then(handleErrors)
    .then((res) => res.json())
    .then((map) => dispatch(newMap(map)))
    .then(onSuccess)
    .then(() => setSectorsMxUPreferences(getState))
    .then((map) => barcodeCordMapping(getState))
    .catch(onError);
    
}

export const dragEnd = () => (dispatch, getState) => {
  const state = getState();
  if (state.selectedArea) {
    dispatch({
      type: "DRAG-END",
      value: getDragSelectedTiles(state),
    });
  }
  return Promise.resolve();
};

export const dragMove = (worldCoordinate) => ({
  type: "DRAG-MOVE",
  value: worldCoordinate,
});

const newSpritesheet = {
  type: "LOADED-SPRITESHEET",
};

export const loadSpritesheet = () => (dispatch) => {
  PIXILoader.add("mySpritesheet", SPRITESHEET_PATH).load(() => {
    dispatch(newSpritesheet);
  });
  return Promise.resolve();
};

export const newMap = (map) => ({
  type: "NEW-MAP",
  value: map,
});

export const clearMap = {
  type: "CLEAR-MAP",
};

export const setSectorsBarcodeMapping = (dispatch, getState) => {
  const state = getState();
  const normalizedMap = state.normalizedMap;
  normalizedMap.entities.sectorBarcodeMapping = {};
  Object.keys(normalizedMap.entities.barcode).forEach((key) => {
    if (normalizedMap.entities.barcode[key].sector == undefined)
      normalizedMap.entities.barcode[key].sector = "undefined";
    if (
      normalizedMap.entities.sectorBarcodeMapping[
        normalizedMap.entities.barcode[key].sector
      ] == undefined
    )
      normalizedMap.entities.sectorBarcodeMapping[
        normalizedMap.entities.barcode[key].sector
      ] = [];
    normalizedMap.entities.sectorBarcodeMapping[
      normalizedMap.entities.barcode[key].sector
    ].push("[" + key + "]");
  });
  // delete normalizedMap.entities.sectorBarcodeMapping[undefined];
  return normalizedMap.entities.sectorBarcodeMapping;
};

export const setSectorsMxUPreferences = (getState) => {
  const state = getState();
  const normalizedMap = state.normalizedMap;
  var mapId = getMapId(state);
  var sectorMxUPreferences = {};
  return getMap(mapId)
    .then(handleErrors)
    .then((res) => res.json())
    .then((map) => {
      sectorMxUPreferences = map.map.sectorMxUPreferences;
      if (sectorMxUPreferences[undefined] != undefined) {
        setSectorsMxUPreferences(getState);
      }
      normalizedMap.entities.sectorMxUPreferences = sectorMxUPreferences;
      normalizedMap.entities.map.dummy.sectorMxUPreferences = sectorMxUPreferences;
    });
};

export const barcodeCordMapping = (getState) => {  
  const state = getState();
  const normalizedMap = state.normalizedMap;
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  var mappingBarcodeCoord = {}
  Object.keys(normalizedMap.entities.barcode).forEach(function(key) {
    mappingBarcodeCoord[normalizedMap.entities.barcode[key]["barcode"]]=key
  });
  normalizedMap["entities"]["mappingBarcodeCoord"]=mappingBarcodeCoord
  return normalizedMap
};

export const getBarcodeDistance = (dispatch,getState,mapId) => {  
  const state = getState();
  var mapId = state.normalizedMap.entities.mapObj[parseInt(mapId)]
  var barcodeDistance = mapId.BaseMap.barcodeDistance
  dispatch(setbarcodeDistance(barcodeDistance))

};


export const setbarcodeDistance = (barcodeDistance) => ({
  type: "CHANGE-BARCODE-DISTANCE",
  value: barcodeDistance
});


export const fetchMap = (mapId) => (dispatch, getState) => {
  dispatch(clearMap);
  return getMap(parseInt(mapId))
    .then(handleErrors)
    .then((res) => res.json())
    .then((map) => dispatch(newMap(map)))
    .then((map) => barcodeCordMapping(getState))
    .then(() => dispatch(setViewportClamp))
    .then(() => dispatch(fitToViewport))
    .then(() => setSectorsMxUPreferences(getState))
    .then(() => getBarcodeDistance(dispatch,getState,mapId))
    .catch((error) => console.warn(error)); // eslint-disable-line no-console
};

export const clearTiles = {
  type: "CLEAR-SELECTED-TILES",
};

// TODO: figure out if this can be done
// export const addToEntitiesAndFloor = ({
//   currentFloor, floorKey, entitiesKey, reducerKey, idField, entities
// }) => (dispatch, getState) => {
//   // dispatch both ADD-MULTIPLE-{reducerKey} and ADD-ENTITIES-TO-FLOOR
// }

export const addEntitiesToFloor = ({
  currentFloor,
  floorKey,
  entities,
  idField,
}) => ({
  type: "ADD-ENTITIES-TO-FLOOR",
  value: {
    currentFloor,
    floorKey,
    ids: entities.map((e) => e[idField]),
  },
});

export const removeEntitiesToFloor = ({ currentFloor, floorKey, ids }) => ({
  type: "REMOVE-ENTITIES-FROM-FLOOR",
  value: {
    currentFloor,
    floorKey,
    ids: ids,
  },
});

export const getUpdatedMap = (getState) => {
  const state = getState();
  var mapId = getMapId(state);
  return getMap(mapId)
    .then(handleErrors)
    .then((res) => res.json()).then(data => {return data;})

};
export const RemoveExtraMapValueKey = (update_map,base_map) => {
    var rem_list = ['world_coordinate', 'world_coordinate_reference_neighbour', 'path_status','node_status','excluded','highlight_status']
    var map_list = [update_map,base_map]
    for (var k = 0; k < map_list.length; k++) {
        var map = map_list[k]
        for (var i = 0, len = map.floors.length; i < len; i++) {
            var map_values = map.floors[i]["map_values"]
            for (var j = 0, len1 = map_values.length; j < len1; j++)
                rem_list.forEach(e => delete map_values[j][e])
            map.floors[i]["map_values"] = map_values
        }
    }
    return update_map,map
}


export const GetMapObjectDelta = (obj1, obj2) => {
  return _.differenceWith(obj1, obj2, _.isEqual);
}

export const GetMapObjectDictIntoList = (get_elevator_delta,barcode_diff,key) => {
    const byPosition = array => array.reduce((obj, data) => {barcode_diff.push(data[key].split("--")[0])
            return barcode_diff}, {});
    var result = byPosition(get_elevator_delta)
    return result
}

export const GetElevatorMapObjectDiff = (updated_map, base_map) => {
    var barcode_diff = []
    for (const [key, value] of Object.entries(updated_map)) {
        if (key=="elevators"){
            let get_elevator_delta = GetMapObjectDelta(updated_map["elevators"],base_map["elevators"])
            if(get_elevator_delta.length>0){
                barcode_diff = GetMapObjectDictIntoList(get_elevator_delta,barcode_diff,"position")
            }
        }
    }
    return barcode_diff
}

export const GetFloorMapObjectDiff = (updated_map,base_map,barcode_diff) => {
    for (var i = 0, len = updated_map.floors.length; i < len; i++) {
        var map_key = {"odsExcludeds":"ods_tuple", "ppses":"location", "map_values":"barcode", "chargers":"charger_location","fireEmergencies":"barcode"}
        for (const [key, value] of Object.entries(map_key)){
            if (updated_map.floors[i][key]){
                let get_entity_delta = GetMapObjectDelta(updated_map.floors[i][key],base_map.floors[i][key])
                if(key=="odsExcludeds"){
                  var get_ods_delta = GetMapObjectDelta(base_map.floors[i][key],updated_map.floors[i][key])
                  if(get_ods_delta.length>0){
                    var barcode_diff = GetMapObjectDictIntoList(get_ods_delta,barcode_diff,value)
                  }
                }
                if(get_entity_delta.length>0){
                    var barcode_diff = GetMapObjectDictIntoList(get_entity_delta,barcode_diff,value)
                }
                

            }
        }
    }
    return barcode_diff
}

export const EncodeBarcodeToCordinate = (barcode_list) => {
    var coord_list = []
    for (var i = 0; i < barcode_list.length; i++) {
        var coord = barcode_list[i].split(".").map(s => s.replace(/^0+/, ""))
        if (coord[1]==""){
            coord[1]=0
        }
        if (coord[0]==""){
            coord[0]=0
        }
        coord_list.push(coord[1]+","+coord[0])
    }
    return coord_list
}

export const RemoveNewFloor = (updated_map, base_map, barcode_diff) => {
    let old_floor = updated_map.floors.filter(ar => base_map.floors.find(rm => (rm.floor_id === ar.floor_id)))
    let new_floor = updated_map.floors.filter(ar => !base_map.floors.find(rm => (rm.floor_id === ar.floor_id)))
    for (var i = 0; i < new_floor.length; i++) {
        barcode_diff = GetMapObjectDictIntoList(new_floor[i].map_values,barcode_diff,"barcode")
    }
    updated_map.floors = old_floor
    return updated_map, barcode_diff
}


export const showHighlight = () => (dispatch, getState) => {
  const { normalizedMap } = getState();
  const base_map = getUpdatedMap(getState).then(response=>{
    var base_map = response.BaseMap
    var updated_map = response.map
    updated_map,base_map = RemoveExtraMapValueKey(updated_map,base_map)
    var barcode_diff = GetElevatorMapObjectDiff(updated_map,base_map)
    updated_map,barcode_diff = RemoveNewFloor(updated_map,base_map,barcode_diff)
    var barcode_diff = GetFloorMapObjectDiff(updated_map,base_map,barcode_diff)
    var encode_barcode = EncodeBarcodeToCordinate(barcode_diff)
    Object.keys(normalizedMap.entities.barcode).forEach((key) => {
        if (encode_barcode.includes(key)){
            normalizedMap.entities.barcode[key].highlight_status = 1
        }
        else{
            normalizedMap.entities.barcode[key].highlight_status = 0
        }
        });
    console.log("normalizedMap",normalizedMap.entities.barcode)
    console.log("encode_barcode",encode_barcode)
    var highlight = []
    for (var i = 0; i < encode_barcode.length; i++) {
        var convert = encode_barcode[i].split(",").map((val) => parseInt(val))
        highlight.push(convert)
    }
    if (encode_barcode.length==0){
        return dispatch(clearTiles)
    }
    dispatch({
        type: "HIGHLIGHT",
        value: { highlight, highlight_status: 1 },
    });

    return dispatch(clearTiles);
    })
}

export const showPath = () => (dispatch, getState) => {
  const state = getState();

  const {
    selection: { mapTiles },
  } = state;

  var selectedTiles = Object.keys(mapTiles);

  var coor = selectedTiles[0];
  var show = 1;

  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;

  const base = Object.keys(barcode)[0];

  if (barcode[coor].path_status > 0) {
    show = -1;
  }

  const path = [base];
  const showPath = [];

  if (isNaN(barcode[base].path_status)) {
    showPath.push(1);
  } else {
    showPath.push(barcode[base].path_status + show);
  }

  while (barcode[coor]["world_coordinate_reference_neighbour"] != "0,0") {
    path.push(coor);

    const bcp = barcode[coor].path_status;

    if (isNaN(bcp)) {
      showPath.push(1);
    } else {
      showPath.push(bcp + show);
    }

    const neighbour = barcode[coor]["world_coordinate_reference_neighbour"];

    coor = neighbour;
  }

  dispatch({
    type: "SHOW-PATH",
    value: { path, showPath: showPath },
  });

  return dispatch(clearTiles);
};

// If all selections are storable -> converted to non-storable
// If all/some selections are non-storable -> converted to storable

export const toggleStorable = () => (dispatch, getState) => {
  const state = getState();

  const {
    selection: { mapTiles },
  } = state;

  const selectedTiles = Object.keys(mapTiles);

  var allStorable = _.every(selectedTiles, function(coordinate) {
    return state.normalizedMap.entities.barcode[coordinate].store_status == 1;
  });
  if (allStorable == true) {
    dispatch({
      type: "TOGGLE-STORABLE",
      value: { selectedTiles, makeStorable: 0 },
    });
  } else {
    dispatch({
      type: "TOGGLE-STORABLE",
      value: { selectedTiles, makeStorable: 1 },
    });
  }
  return dispatch(clearTiles);
};

const getOrderedQueueCoordinates = (mapTiles) =>
  Object.keys(mapTiles).sort(function(a, b) {
    return mapTiles[a] - mapTiles[b];
  });

export const addPPSQueue = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
    normalizedMap: {
      entities: { pps },
    },
  } = state;

  var ppscoordiantes = _.map(pps, "coordinate");
  var queuebarcodes = _.keys(mapTiles);
  var intersectionresult = ppscoordiantes.filter(
    (value) => -1 !== queuebarcodes.indexOf(value)
  );

  if (intersectionresult.length == 1) {
    var pps_id = _.findKey(pps, { coordinate: intersectionresult[0] });
    var current_queue_coordinates = _.map(
      pps[pps_id].queue_barcodes,
      (barcode) => implicitBarcodeToCoordinate(barcode)
    );
    var queue_barcodes_array = getOrderedQueueCoordinates(mapTiles);
    var asBarcodes = queue_barcodes_array.map((asCoordinate) =>
      coordinateKeyToBarcodeSelector(state, { tileId: asCoordinate })
    );
    var asCurrentQueueBarcodes = current_queue_coordinates.map((asCoordinate) =>
      coordinateKeyToBarcodeSelector(state, { tileId: asCoordinate })
    );

    dispatch({
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        tiles: asBarcodes,
        pps_id: pps_id,
        coordinates: queue_barcodes_array,
        pps_coordinate: pps[pps_id].coordinate,
        multi_queue_mode:
          state.selection.multiQueueMode != undefined
            ? state.selection.multiQueueMode
            : false,
        current_queue_barcodes: asCurrentQueueBarcodes,
        current_queue_coordinates: current_queue_coordinates,
      },
    });
  }
};

export const addHighwayQueue = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
  } = state;
  return dispatch({
    type: "ADD-QUEUE-BARCODES-TO-HIGHWAY",
    value: {
      coordinates: getOrderedQueueCoordinates(mapTiles),
    },
  });
};

export const saveMap = (onError, onSuccess) => (dispatch, getState) => {
  var { normalizedMap, barcodeFormat } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  var withAdjacencyWorldCoordinate = addWorldCoordinateAndAdjacency(normalizedMap,barcodeFormat)
  var convertBarcodeEntities = ConvertEntitiesInBarcodeFormat(dispatch,getState)
  var { normalizedMap, barcodeFormat } = getState();
  setSectorsBarcodeMapping(dispatch, getState);
  // denormalize it
  const mapObj = denormalizeMap(normalizedMap);
  let updatedMapObj = updateMapObj(mapObj, normalizedMap);

  return updateMap(updatedMapObj.id, updatedMapObj.map)
    .then(handleErrors)
    .then((res) => res.json())
    .then((map) => dispatch(newMap(map)))
    .then(onSuccess)
    .then(() => setSectorsMxUPreferences(getState))
    .then((map) => barcodeCordMapping(getState))
    .catch(onError);
};

export const downloadMap = (singleFloor = false) => (dispatch, getState) => {
  var { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  setSectorsBarcodeMapping(dispatch, getState);
  const exportedJson = exportMap(withWorldCoordinate, singleFloor);
  var zip = new JSZip();
  Object.keys(exportedJson).forEach((fileName) => {
    if (fileName != "sector") {
      if (fileName == "sectorBarcodeMapping") {
        zip.file("sectors.json", JSON.stringify(exportedJson[fileName]));
      } else {
        zip.file(`${fileName}.json`, JSON.stringify(exportedJson[fileName]));
      }
    }
  });
  return zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, Object.keys(normalizedMap.entities.mapObj)[0] + ".zip");
  });
};

export const copyJSONToClipboard = (fieldName, singleFloor = false) => (
  dispatch,
  getState
) => {
  setSectorsBarcodeMapping(dispatch, getState);
  var { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  const exportedJson = exportMap(withWorldCoordinate, singleFloor);
  if (exportedJson[fieldName]) {
    copy(JSON.stringify(exportedJson[fieldName]));
  } else dispatch(setErrorMessage("Invalid JSON file name"));
};

export const copySampleRacksJsonToClipboard = (dispatch, getState) => {
  const state = getState();
  const mapId = getMapId(state);
  getSampleRacksJson(mapId)
    .then((res) => res.json())
    .then((racksJson) => copy(JSON.stringify(racksJson)))
    .catch(() =>
      dispatch(setErrorMessage("Could not copy racks JSON (bad response)"))
    );
};

export const editSpecialBarcode = ({ coordinate, new_barcode }) => ({
  type: "EDIT-BARCODE",
  value: { coordinate, new_barcode },
});

export const editChargerBarcode = (charger_location, new_barcode ) => ({
  type: "EDIT-CHARGER-BARCODE",
  value: { charger_location, new_barcode },
});

export const createMapCopy = ({ name }) => (dispatch, getState) => {
  const { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  return createMap(denormalizeMap(withWorldCoordinate).map, name)
    .then(handleErrors)
    .then((res) => res.json())
    .then((id) =>
      dispatch(setSuccessMessage(`Created new map '${name}' with ID #${id}`))
    )
    .catch((error) => dispatch(setErrorMessage(error)));
};

export const deleteMap = (id, history) => (dispatch) => {
  return deleteMapApi(id)
    .then(handleErrors)
    .then(() => history.push("/"))
    .catch((error) => dispatch(setErrorMessage(error)));
};

export const requestValidation = (id, email, map_updated_time) => (
  dispatch,
  getState
) => {
  var { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  setSectorsBarcodeMapping(dispatch, getState);
  const exportedJson = exportMap(withWorldCoordinate, false);
  var payload = formatMapWithDataSuffix(id, exportedJson, map_updated_time);
  payload["email"] = email;
  // map validation request on Map Validator
  return requestValidationApi(payload)
    .then(handleErrors)
    .then((res) => res.text())
    .then((res) => dispatch(setSuccessMessage(res)))
    .then(() => dispatch(fetchMap(id)))
    .catch((error) => dispatch(setErrorMessage(error)));
};

export const requestMapUploadToGsb = (solutionId, agentId, functionalAreaId, uid) => (
  dispatch,
  getState
) => {
  const state = getState();
  let id = getMapId(state);
  let { normalizedMap } = state;
  let withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  setSectorsBarcodeMapping(dispatch, getState);
  const mapObj = denormalizeMap(withWorldCoordinate);
  let updatedMapObj = updateMapObj(mapObj, withWorldCoordinate);
  const exportedJson = exportMap(withWorldCoordinate, false);
  let chargerDict = getParticularEntity(state, { entityName: "charger" });
  let chargers = Object.entries(chargerDict).map(([, val]) => val);
  let ppsDict = getParticularEntity(state, { entityName: "pps" });
  let ppses = Object.entries(ppsDict).map(([, val]) => val);
  let elevatorDict = getParticularEntity(state, { entityName: "elevator" });
  let elevators = Object.entries(elevatorDict).map(([, val]) => val);
  let storables = getStorableCoordinatesCount(state);
  let barcodes = getBarcodes(state);
  let zoneToColorMap = getZoneToColorMap(state);
  let sectorToColorMap = getSectorToColorMap(state);
  let gsbSolutionId = solutionId;
  let gsbAgentId = agentId;
  let gsbFunctionalAreaId = functionalAreaId;
  let gsbUid = uid;

  var data = new FormData();
  let mapData;
  Object.keys(exportedJson).forEach((keyName) => {
      if (keyName !== "sector") {
        if (keyName === "sectorBarcodeMapping"){
          data.append('files', new File([new Blob([JSON.stringify(exportedJson[keyName])], { type: 'application/json' })], 'sector.json', {type: "application/json"}));
        } else if (keyName === "map") {
          mapData = exportedJson[keyName].length == 1 ? exportedJson[keyName][0]['map_values'] : exportedJson[keyName];
          data.append('files', new File([new Blob([JSON.stringify(mapData)], { type: 'application/json' })], 'map.json', {type: "application/json"}));
        } else {
          data.append('files', new File([new Blob([JSON.stringify(exportedJson[keyName])], { type: 'application/json' })], `${keyName}.json`, {type: "application/json"}));
        }
      }
  });
  data.append('map_tool_id', id);
  data.append('gsb_solution_id', gsbSolutionId);
  data.append('gsb_agent_id', gsbAgentId);
  data.append('functional_area_id', gsbFunctionalAreaId);
  data.append('uid', gsbUid);
  data.append('total_chargers', chargers.length);
  data.append('total_ppses', ppses.length);
  data.append('total_elevators', elevators.length);
  data.append('total_zones', Object.keys(zoneToColorMap).length);
  data.append('total_sectors', Object.keys(sectorToColorMap).length);
  data.append('total_storables', storables);
  data.append('total_barcodes', Object.keys(barcodes).length);

  updateMap(id, updatedMapObj.map)
    .then(handleErrors)
    .then((res) => res.json())
    .then(() => setSectorsMxUPreferences(getState))
    .then((map) => barcodeCordMapping(getState))
    .catch((error) => console.warn(error));

  // Map JSONs and Summary details upload request on Map Validator
  return requestMapUploadToGsbApi(data)
    .then(handleErrors)
    .then((res) => res.text())
    .then(
      (res) => {
        localStorage.setItem(`map_${id}_sol_${gsbSolutionId}`, true)
        return dispatch(setSuccessMessage(res))
      }
    )
    .catch((error) => dispatch(setErrorMessage(error)));
};

// eslint-disable-next-line
export const runSanity = () => (dispatch, getState) => {
  //return runSanityReducer("NONE");
  const { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  var CompleteDataSanity = runCompleteDataSanity(withWorldCoordinate);

  // console.log("CompleteDataSanity  data", CompleteDataSanity);
  return dispatch(
    setSuccessMessage(JSON.stringify(CompleteDataSanity, undefined, 4))
  );
};

export const excludeNode = () => (dispatch, getState) => {
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
  const misaligned_node = [];
  for (var x in selectedTiles) {
    var coor = selectedTiles[x];
    barcode[coor]["excluded"] = 1;
    barcode[coor].node_status = 0;
    misaligned_node.push(barcode[coor]);
    // console.log("excluded ", barcode[coor], coor);
  }

  dispatch({
    type: "MISALINED",
    value: { misaligned_node, node_status: 0 },
  });

  return dispatch(clearTiles);
};

export const sortedData = (state) => state.sortedData;

export const getSortedData = createSelector(
  sortedData,
  getBarcodes,
  (data, barcode) => {
    const base = Object.keys(barcode)[0]
      .split(",")
      .map(Number);
    data.sort(function(a, b) {
      return Math.sqrt(
        Math.pow(base[0] - a[0][0], 2) + Math.pow(base[1] - a[0][1], 2)
      ) <
        Math.sqrt(
          Math.pow(base[0] - b[0][0], 2) + Math.pow(base[1] - b[0][1], 2)
        )
        ? -1
        : 1;
    });
    return data;
  }
);

export const getData = createSelector(
  getSortedData,
  (data) => {
    return data;
  }
);


export const misaligned = () => (dispatch, getState) => {
  // console.log("debugger statement 1",Date(Date.now()).toString() )
  const state = getState();
  // var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  // var CompleteDataSanity = runCompleteDataSanity(withWorldCoordinate);
  var CompleteDataSanity = getCompleteDataSanity(state);
  const barcodes = state.normalizedMap.entities.barcode;

  var j = 0;
  var count = Object.keys(CompleteDataSanity.mapSanity);
  while (
    CompleteDataSanity.mapSanity[j].wrongly_aligned_barcodes == undefined
  ) {
    if (j == count) return;
    j++;
  }

  const items = CompleteDataSanity.mapSanity[j].wrongly_aligned_barcodes;
  const path = [];
  var coordinate = [];

  for (var x in items) {
    var coor1 = items[x].coordinate_wrongly_aligned;
    var coor2 = Object.values(items[x].wrongly_aligned_with[0])[0];
    coordinate.push([coor1, coor2]);
    path.push(items[x].coordinate_wrongly_aligned);
  }
  if (coordinate.length == 0) return;
  var misaligned_node = [];

  state["sortedData"] = coordinate;

  coordinate = getData(state);

  for (var i in coordinate) {
    if (barcodes[coordinate[i][0]].excluded == 1) continue;

    misaligned_node = misaligned_cal(coordinate[i], barcodes, path);
    var isExculed = false;
    for (var xx in misaligned_node) {
      barcodes[misaligned_node[xx]]["node_status"] = 1;
      // console.log("excluded coordinates", barcodes[misaligned_node[x]]);
      if (barcodes[misaligned_node[xx]].excluded == 1) {
        isExculed = true;
      }
    }
    // console.log("is excluded", coordinate[i][0], base);
    if (isExculed == false) break;

    barcodes[coordinate[i][0]]["excluded"] = 1;
  }

  dispatch({
    type: "MISALINED",
    value: { misaligned_node, node_status: 1 },
  });

  var s = misaligned_node[0].toString();
  const barcodeString = barcodes[s].barcode;

  // console.log("barcode string ", barcodeString, misaligned_node);
  dispatch(locateBarcode(barcodeString));
  // console.log("debugger statement 3",Date(Date.now()).toString() )
  return dispatch(clearTiles);
};

const backTrack = (coor, barcode) => {
  const base = "0,0";
  const path = [];

  while (barcode[coor]["world_coordinate_reference_neighbour"] != base) {
    const neighbour = barcode[coor]["world_coordinate_reference_neighbour"];
    coor = neighbour;
    path.push(coor);
  }
  return path;
};

const misaligned_cal = (coors, barcode, coordinates) => {
  if (coors.length == 0) {
    return [];
  }
  // console.log(coors);

  const node1 = backTrack(coors[0].toString(), barcode);

  const node2 = backTrack(coors[1].toString(), barcode);

  // console.log(node1, node2);

  var prev_state = [coors[0], coors[1]];

  for (var node in node1) {
    if (coordinates.includes(node1[node])) {
      prev_state[0] = node1[node];
    }
  }
  for (var nodee in node2) {
    if (coordinates.includes(node2[nodee])) {
      prev_state[1] = node2[nodee];
    }
  }
  // console.log("debugger statement 2",Date(Date.now()).toString() )
  alert(prev_state);

  return prev_state;
};

export const getWithWorldCoordinate = createSelector(
  getNormalizedMap,
  (normalizedMap) => {
    return addWorldCoordinateToMap(normalizedMap);
  }
);

export const getCompleteDataSanity = createSelector(
  getWithWorldCoordinate,
  (withWorldCoordinate) => {
    // console.log("getCompleteDataSanity " , withWorldCoordinate)
    return runCompleteDataSanity(withWorldCoordinate);
  }
);

export const addWorldCoordinateAndDenormalize = (normalizedMap) => {
  var withWorldCoordinate = addWorldCoordinateToMap(normalizedMap);
  return withWorldCoordinate;
};

const addWorldCoordinateAndAdjacency = (normalizedMap,barcodeFormat) => {
  var withWorldCoordinate = addWorldCoordinateAdjacencyToMap(normalizedMap,barcodeFormat);
  return withWorldCoordinate;
};

const updateMapObj = (mapObj, withWorldCoordinate) => {
  mapObj.sectorMxUPreferences =
    withWorldCoordinate.entities.map.dummy.sectorMxUPreferences != undefined
      ? withWorldCoordinate.entities.map.dummy.sectorMxUPreferences
      : {};

  const mapValues = mapObj.map.floors[0].map_values;
  for (var coor in mapValues) {
    mapObj.map.floors[0].map_values[coor].path_status = 0;
    mapObj.map.floors[0].map_values[coor].node_status = 0;
    mapObj.map.floors[0].map_values[coor].excluded = 0;
    if(mapObj.map.floors[0].map_values[coor].highlight_status==1){
      mapObj.map.floors[0].map_values[coor].highlight_status = 0
    }
  }
  return mapObj;
}

// adds the key "world_coordinate" to the normalized map.
// This is a derived value, so by default is not stored. However
// while exporting, it is required to be present explicitly
export const addWorldCoordinateToMap = (normalizedMap) => {
  var entities = normalizedMap.entities;
  const oldBarcodeDict = entities.barcode;
  const floorInfo = entities.floor;
  var newbarcodeDict = {};
  for (var floorId in floorInfo) {
    var currentFloorBarcodeDict = {};
    const barcodeKeys = floorInfo[floorId].map_values;
    barcodeKeys.forEach((barcodeKey) => {
      currentFloorBarcodeDict[barcodeKey] = oldBarcodeDict[barcodeKey];
    });
    const {
      tileIdToWorldCoordinateMap: tileIdToWorldCoordinateMap,
      neighbourWithValidWorldCoordinate: neighbourWithValidWorldCoordinate,
    } = getTileIdToWorldCoordMapFunc(currentFloorBarcodeDict);
    for (var barcode in currentFloorBarcodeDict) {
      var barcodeInfo = currentFloorBarcodeDict[barcode];
      const worldCoordinate = tileIdToWorldCoordinateMap[barcode];
      const wcReferenceNeighbour = neighbourWithValidWorldCoordinate[barcode];
      barcodeInfo["world_coordinate"] = `[${worldCoordinate.x},${
        worldCoordinate.y
      }]`;
      barcodeInfo[
        "world_coordinate_reference_neighbour"
      ] = wcReferenceNeighbour;
      currentFloorBarcodeDict[barcode] = barcodeInfo;
    }
    newbarcodeDict = { ...newbarcodeDict, ...currentFloorBarcodeDict };
  }
  entities.barcode = newbarcodeDict;
  normalizedMap.entities = entities;
  return normalizedMap;
};

export const addWorldCoordinateAdjacencyToMap = (normalizedMap,barcodeFormat) => {
  var entities = normalizedMap.entities;
  const oldBarcodeDict = entities.barcode;
  const floorInfo = entities.floor;
  var newbarcodeDict = {};
  for (var floorId in floorInfo) {
    var currentFloorBarcodeDict = {};
    const barcodeKeys = floorInfo[floorId].map_values;
    barcodeKeys.forEach((barcodeKey) => {
      currentFloorBarcodeDict[barcodeKey] = oldBarcodeDict[barcodeKey];
    });
    const {
      tileIdToWorldCoordinateMap: tileIdToWorldCoordinateMap,
      neighbourWithValidWorldCoordinate: neighbourWithValidWorldCoordinate,
    } = getTileIdToWorldCoordMapFunc(currentFloorBarcodeDict);
    var worldcord_mapping = [];
    for (var key in tileIdToWorldCoordinateMap) {
        worldcord_mapping.push([key, tileIdToWorldCoordinateMap[key]]);
    }
    // sort world cordinate for adjacency
    worldcord_mapping.sort(
       function(a, b) {          
          if (a[1].y === b[1].y) {
             return b[1].x - a[1].x;
          }
          return a[1].y > b[1].y ? 1 : -1;
       });

    let objSorted = []
    worldcord_mapping.forEach(function(item){
        item[1].coord = item[0]
        objSorted.push(item[1])
    })
    var worldcorld_tile_mapping = {}
    for (var key in tileIdToWorldCoordinateMap) {
        var value = tileIdToWorldCoordinateMap[key]["x"]+','+tileIdToWorldCoordinateMap[key]["y"]
        worldcorld_tile_mapping[value] = key
    }
    var mappping_coord_with_adjacent_neighbour_dict = {}
    for(var data in objSorted){
      var adjacent_neighbour_dict = getLinearWorldCordXY(objSorted[data]["x"],objSorted[data]["y"],objSorted[data]["coord"],objSorted,worldcorld_tile_mapping)
      mappping_coord_with_adjacent_neighbour_dict[objSorted[data]["coord"]]=adjacent_neighbour_dict
    }
    var offset_value = getOffsetValue(currentFloorBarcodeDict)
    for (var barcode in currentFloorBarcodeDict) {
      var barcodeInfo = currentFloorBarcodeDict[barcode];
      const worldCoordinate = tileIdToWorldCoordinateMap[barcode];
      const wcReferenceNeighbour = neighbourWithValidWorldCoordinate[barcode];
      barcodeInfo["adjacency"] = mappping_coord_with_adjacent_neighbour_dict[barcode]["adjacency"];
      barcodeInfo["neighbours"] = mappedNeighbour(mappping_coord_with_adjacent_neighbour_dict[barcode]["neighbours"],currentFloorBarcodeDict[barcode]["neighbours"]);
      if(barcodeFormat=="default_format"){
        barcodeInfo["barcode"] = ConvertTTPFormatBarcodeIntoDefaultFormat(barcode,barcodeInfo)
        
      }else{
        var GM_barcode = calculateGMBarcode(JSON.parse(barcodeInfo["world_coordinate"]),offset_value)
        barcodeInfo["barcode"] = GM_barcode
      }
      currentFloorBarcodeDict[barcode] = barcodeInfo;
    }
    newbarcodeDict = { ...newbarcodeDict, ...currentFloorBarcodeDict };
  }
  entities.barcode = newbarcodeDict;
  normalizedMap.entities = entities;
  return normalizedMap;
};

export const editEntryPoints = (entry_barcodes, elevator_id ) => ({
  type: "EDIT-ELEVATOR-ENTRY-POINTS",
  value: {
    elevator_id,
    entry_barcodes
  }
});

export const editExitPoints = ( exit_barcodes, elevator_id ) => ({
  type: "EDIT-ELEVATOR-EXIT-POINTS",
  value: {
    elevator_id,
    exit_barcodes
  }
});

export const positionPoint = ( position, elevator_id ) => ({
  type: "EDIT-POSITION-POINTS",
  value: {
    elevator_id,
    position
  }
});

export const ConvertEntitiesInBarcodeFormat = (dispatch,getState) => {
  var { normalizedMap } = getState();
  var entities = normalizedMap.entities;
  var barcodeMapping = entities.mappingBarcodeCoord
  var ppsDict = entities.pps
  var chargerDict = entities.charger
  var elevatorDict = entities.elevator
  var odsDict = entities.odsExcluded
  var BarcodeDict = entities.barcode;
  if(Object.keys(ppsDict).length !== 0){
    Object.keys(ppsDict).forEach(function(pps_id) {
    ppsDict[pps_id]["location"] = BarcodeDict[ppsDict[pps_id]["coordinate"]]["barcode"]
    ppsDict[pps_id]["pick_position"] = BarcodeDict[ppsDict[pps_id]["coordinate"]]["barcode"]
    })
  }
  if(Object.keys(chargerDict).length !== 0){
    Object.keys(chargerDict).forEach(function(charger_id) {
      var reinitPoint = chargerDict[charger_id]["reinit_point_location"]
      var chargerLocation = chargerDict[charger_id]["charger_location"]
      if(barcodeMapping.hasOwnProperty(reinitPoint)){
        var charger_location = BarcodeDict[barcodeMapping[chargerLocation]]["barcode"]
        var reinit_barcode = BarcodeDict[barcodeMapping[reinitPoint]]["barcode"]
        dispatch(editChargerBarcode(charger_location,reinit_barcode))
      }
    })
  }
  if(Object.keys(elevatorDict).length !== 0){
    Object.keys(elevatorDict).forEach(function(elevator_id) {
      var position_barcode = BarcodeDict[barcodeMapping[elevatorDict[elevator_id]["position"]]]["barcode"]
      var entry_barcode = elevatorDict[elevator_id]["entry_barcodes"]
      var exit_barcode = elevatorDict[elevator_id]["exit_barcodes"]
      for (var entry in entry_barcode){
        var entry_barcode_val = BarcodeDict[barcodeMapping[entry_barcode[entry]["barcode"]]]["barcode"]
        entry_barcode[entry]["barcode"] = entry_barcode_val
      }
      for (var exit in exit_barcode){
          var exit_barcode_val = BarcodeDict[barcodeMapping[exit_barcode[exit]["barcode"]]]["barcode"]
          exit_barcode[exit]["barcode"] = exit_barcode_val
      }
      if(entry_barcode.length!==0){
        dispatch(editEntryPoints(entry_barcode,elevator_id))
      }
      if(exit_barcode.length!==0){
        dispatch(editExitPoints(exit_barcode,elevator_id))
    }
    dispatch(positionPoint(position_barcode,elevator_id))
    })
  }
  if(Object.keys(odsDict).length !== 0){
    Object.keys(odsDict).forEach(function(ods_id) {
      var new_barcode = BarcodeDict[odsDict[ods_id]["coordinate"]]["barcode"]
      var tuple_list = odsDict[ods_id]["ods_tuple"].split("--")
      var new_tuple = new_barcode+'--'+tuple_list[1]
      odsDict[ods_id]["ods_tuple"] = new_tuple
    })
  }

  return
}
