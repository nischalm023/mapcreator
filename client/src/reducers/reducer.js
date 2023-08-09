import { normalizeMap } from "utils/normalizr";
import { combineReducers } from "redux";
import { createEntityReducer, dummyState } from "./util";
import reduceReducers from "reduce-reducers";
import floorReducer from "./floor";
import select from "./selection";
import barcodeReducer from "./barcode/index";
import ppsReducer from "./pps";
import conveyorReducer from "./conveyor";
import iopointReducer from "./iopoint";
import connectedConveyorReducer from "./connectedconveyor";
import totestorableReducer from "./totestorable";
import DownloadConveyorReducer from "./download_conveyor";
import currentFloorReducer from "./currentFloor";
import barcodeDistanceReducer from "./barcodeDistance";
import mapReducer from "./map";
import conveyorVersionReducer from "./conveyorVersion";
import elevatorReducer from "./elevator";
import zoneReducer from "./zone";
import sectorReducer from "./sector";
import { DEFAULT_BARCODE_FORMAT,DEFAULT_MAP_OFFSET } from "../constants";
import sectorBarcodeMappingReducer from "./sectorBarcodeMapping";
import mappingBarcodeCoordReducer from "./mappingBarcodeCoordReducer";
import sectorMxUPreferencesReducer from "./sectorMxUPreferences";
import charger from "./charger";
import ods from "./ods";
import { successMessageReducer, errorMessageReducer } from "./message";
import _ from "lodash";
export var baseBarcodeReducer = createEntityReducer("BARCODE", "coordinate");
export var basePPSReducer = createEntityReducer("PPS", "pps_id");
export var baseElevatorReducer = createEntityReducer("ELEVATOR", "elevator_id");
export var baseChargerReducer = createEntityReducer("CHARGER", "charger_id");
export var baseConveyorReducer = createEntityReducer("CONVEYOR", "conveyor_id");
export var baseConnectedConveyorReducer = createEntityReducer("CONNECTED_CONVEYOR", "connected_conveyor_id");
export var baseIopointReducer = createEntityReducer("IO-POINT", "io_point_id");
export var baseTotestorableReducer = createEntityReducer("TOTE-STORABLE", "next_tote_storable_id");
export var baseOdsReducer = createEntityReducer("ODS-EXCLUDED", "ods_excluded_id")

export const entitiesReducer = combineReducers({
  elevator: reduceReducers(elevatorReducer, baseElevatorReducer),
  queueData: createEntityReducer("QUEUE-DATA", "queue_data_id"),
  charger: reduceReducers(charger, baseChargerReducer),
  pps: reduceReducers(basePPSReducer, ppsReducer),
  conveyorTile: reduceReducers(baseConveyorReducer, conveyorReducer),
  odsExcluded: reduceReducers(ods, baseOdsReducer),
  dockPoint: createEntityReducer("DOCK-POINT", "dock_point_id"),
  fireEmergency: createEntityReducer("FIRE-EMERGENCY", "fire_emergency_id"),
  ConnectedconveyorTile: reduceReducers(baseConnectedConveyorReducer, connectedConveyorReducer),
  ioPoints: reduceReducers(baseIopointReducer, iopointReducer),
  toteStorables: reduceReducers(baseTotestorableReducer, totestorableReducer),
  barcode: reduceReducers(barcodeReducer, baseBarcodeReducer),
  DownloadconveyorTile: reduceReducers(baseConveyorReducer, conveyorReducer),
  DownloadToteStorage: reduceReducers(baseTotestorableReducer, totestorableReducer),
  floor: floorReducer,
  map: mapReducer,
  zone: zoneReducer,
  sector: sectorReducer,
  sectorBarcodeMapping: sectorBarcodeMappingReducer,
  sectorMxUPreferences: sectorMxUPreferencesReducer,
  mappingBarcodeCoord:mappingBarcodeCoordReducer,
  // dynamicMappingBarcodeCoord:mappingBarcodeCoordReducer,
  // TODO: make reducers for these
  mapObj: m => m || null
});

export const mapUpdateReducer = combineReducers({
  entities: entitiesReducer,
  result: r => r || null
});

// reducer for data sanity
// eslint-disable-next-line
export const runSanityReducer = (state = {}, action) => {
  switch (action.type) {
    //case "CHARGER-SANITY":
    //  return validateChargersLayout;
    case "RUN-DATA-SANITY":
      //var finalDataSanityResult = runCompleteDataSanity(state);
      return state;
      

  }
  return state;
};

// for full map updates eg. clear, new
export const mapChangeReducer = (state = dummyState.normalizedMap, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
      return dummyState.normalizedMap;
    case "NEW-MAP":
      var map = action.value.map;
      if(map.sectorBarcodeMapping == undefined) map.sectorBarcodeMapping = [];
      if(map.sectorMxUPreferences == undefined) map.sectorMxUPreferences = {};
      if(map.mappingBarcodeCoord == undefined) map.mappingBarcodeCoord = {};
      if(map.ioPoints == undefined) map.ioPoints = {};
      if(map.toteStorables == undefined) map.toteStorables = {};
      if(map.sectors == undefined) map.sectors = [];
      if(map.floors.map((obj,i)=>{
        if(!obj.hasOwnProperty("barcodeFormat")){
          obj["barcodeFormat"] = DEFAULT_BARCODE_FORMAT
        }
        if(!obj.hasOwnProperty("barcodeOffset")){
          obj["barcodeOffset"] = DEFAULT_MAP_OFFSET
        }
      }))
      return normalizeMap(action.value);
  }
  return state;
};

export const normalizedMapReducer = reduceReducers(
  mapUpdateReducer,
  mapChangeReducer,
  runSanityReducer
);

// helper exported for testing
export const toggleKeyInMap = (theMap, key) => {
  if (theMap[key]) {
    return _.omit(theMap, key);
  }

  return { ...theMap, [key]: true };
};

export const toggleKeyInMapWhenQueueMode = (state, tileId) => {
  var a = _.reduce(
    state,
    function (acc, value) {
      return Math.max(acc, value);
    },
    0
  );

  return { ...state, [tileId]: a + 1 };
};

export const selectedDistanceTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "UPDATE-SECTORS-MAPPING":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
    // should deselect if a map tile is clicked
    case "CLICK-ON-MAP-TILE":
    case "ADD-CONVEYOR":
    case "ADD-CONNECTED-CONVEYOR":
    case "CHANGE-FLOOR":
    case "ADD-ELEVATOR":
    case "SHIFT-BARCODE":
    case "ALIGN-BARCODE":
      return {};
  }
  return state;
};

export const selectedMapTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "UPDATE-SECTORS-MAPPING":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
    // should deselect if a distance tile is selected
    case "CLICK-ON-DISTANCE-TILE":
    case "CHANGE-FLOOR":
    case "ADD-ELEVATOR":
    case "SHIFT-BARCODE":
    case "ALIGN-BARCODE":
    case "ADD-QUEUE-BARCODES-TO-HIGHWAY":
    case "ADD-QUEUE-BARCODES-TO-PPS":
      return {};
  }
  return state;
};

const queueModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-QUEUE-MODE":
      return !state;
  }
  return state;
};

const TTPModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-TTP-VIEW-MODE":
      return !state;
  }
  return state;
};

const IOPointReducer = (state = true, action) => {
  switch (action.type) {
    case "TOGGLE-IO-POINT-MODE":
      return !state;
  }
  return state;
};

const ToteStorageReducer = (state = true, action) => {
  switch (action.type) {
    case "TOGGLE-TOTE-STORAGE-MODE":
      return !state;
  }
  return state;
};

const multiQueueModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-MULTI-QUEUE-MODE":
      return !state;
  }
  return state;
};

const zoneViewModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-ZONE-VIEW-MODE":
      return !state;
  }
  return state;
};

const sectorViewModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-SECTOR-VIEW-MODE":
      return !state;
  }
  return state;
};

const directionViewModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-DIRECTION-VIEW-MODE":
      return !state;
  }
  return state;
};

export const baseSelectionReducer = combineReducers({
  mapTiles: reduceReducers(select, selectedMapTilesReducer),
  distanceTiles: selectedDistanceTilesReducer,
  queueMode: queueModeReducer,
  TTPMode: TTPModeReducer,
  multiQueueMode: multiQueueModeReducer,
  zoneViewMode: zoneViewModeReducer,
  sectorViewMode: sectorViewModeReducer,
  directionViewMode: directionViewModeReducer,
  iopointMode: IOPointReducer,
  totestorageMode: ToteStorageReducer,
  
  metaKey: (e = false) => e,
  shiftKey: (e = false) => e
});

// exported for testing
export const xoredMap = (theMap, keysArr) => {
  // keysArr should be array of strings!
  const xored = _.xor(Object.keys(theMap), keysArr.map(x => `${x}`));
  return _.fromPairs(xored.map(x => [x, true]));
};

export const selectionReducer = (
  state = {
    mapTiles: {},
    distanceTiles: {},
    metaKey: false,
    shiftKey: false,
    queueMode: false,
    TTPMode:false,
    multiQueueMode: false,
    zoneViewMode: false,
    sectorViewMode: false,
    directionViewMode: false,
    iopointMode: true,
    totestorageMode:true
  },
  action
) => {
  switch (action.type) {
    case "META-KEY-UP":
      return { ...state, metaKey: false };
    case "META-KEY-DOWN":
      return { ...state, metaKey: true };
    case "SHIFT-KEY-UP":
      return { ...state, shiftKey: false };
    case "SHIFT-KEY-DOWN":
      return { ...state, shiftKey: true };
    case "TOGGLE-QUEUE-MODE":
      return {
        ...state,
        mapTiles: {},
        distanceTiles: {}
      };
    case "TOGGLE-MULTI-QUEUE-MODE":
      return {
        ...state,
        mapTiles: {},
        distanceTiles: {}
      };
    case "TOGGLE-CONVEYOR-VIEW-MODE":

      return {
        ...state,
        mapTiles: {},
        distanceTiles: {}
      };
    
    case "CLICK-ON-MAP-TILE":
      var tileId = action.value;
      if (!state.queueMode) {
        if (state.mapTiles[tileId]) {
          // delete tile from selected
          return { ...state, mapTiles: _.omit(state.mapTiles, tileId) };
        } else {
          // using true to signify tile is selected. doesn't really matter what
          // the value is, just interested in the key
          return { ...state, mapTiles: { ...state.mapTiles, [tileId]: true } };
        }
      } else {
        // don't do anything if it's already selected
        if (state.mapTiles[action.value]) {
          return state;
        }
        var a = _.reduce(
          state.mapTiles,
          function (acc, value) {
            return Math.max(acc, value);
          },
          0
        );
        return { ...state, mapTiles: { ...state.mapTiles, [tileId]: a + 1 } };
      }

    case "CLICK-ON-DISTANCE-TILE":
      if (state.queueMode) {
        return { ...state, queueMode: state.queueMode };
      } else {
        return {
          ...state,
          distanceTiles: toggleKeyInMap(state.distanceTiles, action.value)
        };
      }

    case "DRAG-END": {
      const { mapTilesArr = [], distanceTilesArr = [] } = action.value;
      // if both map tiles and distance tiles are selected, consider only map tiles as selected
      if (!state.queueMode) {
        if (mapTilesArr.length > 0) {
          return {
            ...state,
            distanceTiles: {},
            mapTiles: xoredMap(state.mapTiles, mapTilesArr)
          };
        }
        return {
          ...state,
          mapTiles: {},
          distanceTiles: xoredMap(state.distanceTiles, distanceTilesArr)
        };
      } else {
        return { ...state };
      }
    }
  }
  return state;
};

export const spritesheetLoadedReducer = (state = false, action) => {
  switch (action.type) {
    case "LOADED-SPRITESHEET":
      return true;
  }
  return state;
};
export const selectedAreaReducer = (state = null, action) => {
  switch (action.type) {
    case "DRAG-START": {
      if (state) {
        // duplicate event, already processing a drag
        return state;
      }
      let { x, y } = action.value;
      return { startPoint: { x, y }, endPoint: { x, y } };
    }
    case "DRAG-MOVE": {
      if (!state) {
        // drag not started yet?
        return state;
      }
      let { x, y } = action.value;
      return { ...state, endPoint: { x, y } };
    }
    case "DRAG-END":
      return null;
  }
  return state;
};

const viewportReducer = (
  state = { viewportInstance: null, minimapInstance: null, currentView: null },
  action
) => {
  switch (action.type) {
    case "REGISTER-PIXI-VIEWPORT":
      return { ...state, viewportInstance: action.value };
    case "REGISTER-PIXI-MINIMAP":
      return { ...state, minimapInstance: action.value };
  }
  return state;
};
const barcodeSpacingReducer = (state = 1500, action) => {
  switch (action.type) {
    case "CHANGE-BARCODE-SPACING":
      return action.value;
  }
  return state;
};

const viewConveyorReducer = (state = false, action) => {
  switch (action.type) {
    case "VIEW-CONVEYOR-STATUS":
      return !state;
  }
  return state;
};

export default combineReducers({
  normalizedMap: normalizedMapReducer,
  currentFloor: currentFloorReducer,
  barcodeDistance:barcodeDistanceReducer,
  conveyorVersion:conveyorVersionReducer,
  selection: reduceReducers(selectionReducer, baseSelectionReducer),
  spritesheetLoaded: spritesheetLoadedReducer,
  selectedArea: selectedAreaReducer,
  viewport: viewportReducer,
  successMessage: successMessageReducer,
  errorMessage: errorMessageReducer,
  barcodeSpacing: barcodeSpacingReducer,
  viewConveyor:viewConveyorReducer
});
