// action creator to make clicked-on-tile action from clicked-on-viewport action
import { handleErrors } from "utils/util";
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
import _ from "lodash";
import { setErrorMessage, setSuccessMessage } from "./message";
import {
  getMap,
  updateMap,
  createMap,
  deleteMap as deleteMapApi,
  getSampleRacksJson,
  requestValidation as requestValidationApi
} from "utils/api";
import { implicitBarcodeToCoordinate } from "../utils/util";
import { locateBarcode } from "../actions/barcode";


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
      normalizedMap.entities.barcode[key].sector = 0;
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
  delete normalizedMap.entities.sectorBarcodeMapping[undefined];
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

export const fetchMap = (mapId) => (dispatch, getState) => {
  dispatch(clearMap);
  return getMap(parseInt(mapId))
    .then(handleErrors)
    .then((res) => res.json())
    .then((map) => dispatch(newMap(map)))
    .then(() => dispatch(setViewportClamp))
    .then(() => dispatch(fitToViewport))
    .then(() => setSectorsMxUPreferences(getState))
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
  const { normalizedMap } = getState();
  var withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
  setSectorsBarcodeMapping(dispatch, getState);
  // denormalize it
  const mapObj = denormalizeMap(withWorldCoordinate);

  mapObj.sectorMxUPreferences =
    withWorldCoordinate.entities.map.dummy.sectorMxUPreferences != undefined
      ? withWorldCoordinate.entities.map.dummy.sectorMxUPreferences
      : {};

  const mapValues = mapObj.map.floors[0].map_values;

  for (var coor in mapValues) {
    mapObj.map.floors[0].map_values[coor].path_status = 0;
    mapObj.map.floors[0].map_values[coor].node_status = 0;
    mapObj.map.floors[0].map_values[coor].excluded = 0;
  }

  return updateMap(mapObj.id, mapObj.map)
    .then(handleErrors)
    .then((res) => res.json())
    .then((map) => dispatch(newMap(map)))
    .then(onSuccess)
    .then(() => setSectorsMxUPreferences(getState))
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
  return requestValidationApi(payload)
    .then(handleErrors)
    .then((res) => res.text())
    .then((res) => dispatch(setSuccessMessage(res)))
    .then(() => dispatch(fetchMap(id)))
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
    // console.log("getWithWorldCoordinate",normalizedMap)
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

const addWorldCoordinateAndDenormalize = (normalizedMap) => {
  var withWorldCoordinate = addWorldCoordinateToMap(normalizedMap);
  return withWorldCoordinate;
};

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
