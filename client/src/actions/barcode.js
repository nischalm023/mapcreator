import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  addNeighbourToBarcode
} from "../utils/util";
import {
  getBarcode,
  getTileIdsForDistanceTiles,
  currentFloorBarcodeToCoordinateKeySelector,
  tileToWorldCoordinate,
  getTileSpriteScale,
  barcodeStringToFloorsSelector,
  getExistingBarcodesAndCoordinates
} from "utils/selectors";
import { changeFloor } from "./currentFloor";
import {
  getUpdatedAndTransitBarcodes,
  validateTransitBarcodeForm,
  getNeighbourBarcodeWorldCoord
} from "./add-transit-barcode";

import {
  getUpdatedAndTTPTransitBarcodes,
  getTTPNeighbourBarcodeWorldCoord,
} from "./add-ttp-transit-barcode";

import { addEntitiesToFloor, clearTiles, calculate_corner_world_cordinate} from "./actions";
import { snapToCoordinate } from "./viewport";
import { setErrorMessage } from "./message";
import {
  DEFAULT_BOT_WITH_RACK_THRESHOLD,
  TILE_SPRITE_WIDTH,
  TILE_SPRITE_HEIGHT
} from "../constants.js";

// TODO: should create a folder "actions/barcode" and move this file
// and "add-transit-barcode.js" in it since this is getting big

const createNewBarcode = ({ coordinate, neighbours, barcode, size_info, world_coordinate, world_coordinate_reference_neighbour,corner_world_cooordinate}) => ({
  barcode,
  coordinate,
  neighbours,
  blocked: false,
  zone: "defzone",
  sector: "undefined",
  store_status: 0,
  size_info,
  botid: "null",
  world_coordinate,
  world_coordinate_reference_neighbour,
  corner_world_cooordinate
});

const getValidEmptyDirTileIdList = (barcodeDict, ncoord) => {
  if(barcodeDict.hasOwnProperty(implicitCoordinateKeyToBarcode(ncoord))){
      for (var i = 999; i > 0; i--) {
        for (var j = 1; j < 1000; j++) {
          const coordinate = `${i},${j}`;
          if (barcodeDict.hasOwnProperty(implicitCoordinateKeyToBarcode(coordinate))) {
            continue;
          }else{
            barcodeDict[implicitCoordinateKeyToBarcode(coordinate)] = true
            ncoord = coordinate
            i = -1
            break
          }
        }
      }
    }
  return ncoord;
};

const addTransitBarcode = formData => (dispatch, getState) => {
  const state = getState();
  const isValidFormData = validateTransitBarcodeForm(formData, state);
  if (isValidFormData != true) {
    const { error } = isValidFormData;
    return dispatch(setErrorMessage(error));
  }
  var [updatedBarcodes, transitBarcode] = getUpdatedAndTransitBarcodes(
    state,
    formData
  );
  // TODO: should do add barcode and add barcode to floor in a single action.
  // i.e. handle "ADD-MULTIPLE-BARCODE" in floor reducer itself.
  // add to barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: [...updatedBarcodes, transitBarcode]
  });
  // add to floor
  dispatch(
    addEntitiesToFloor({
      currentFloor: state.currentFloor,
      floorKey: "map_values",
      entities: [transitBarcode],
      idField: "coordinate"
    })
  );
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

const addTTPTransitBarcode = formData => (dispatch, getState) => {
  const state = getState();
  // const isValidFormData = validateTransitBarcodeForm(formData, state);
  // if (isValidFormData != true) {
  //   const { error } = isValidFormData;
  //   return dispatch(setErrorMessage(error));
  // }
  var [updatedBarcodes, transitBarcode] = getUpdatedAndTTPTransitBarcodes(
    state,
    formData
  );
  // TODO: should do add barcode and add barcode to floor in a single action.
  // i.e. handle "ADD-MULTIPLE-BARCODE" in floor reducer itself.
  // add to barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: [...updatedBarcodes, transitBarcode]
  });
  // add to floor
  dispatch(
    addEntitiesToFloor({
      currentFloor: state.currentFloor,
      floorKey: "map_values",
      entities: [transitBarcode],
      idField: "coordinate"
    })
  );
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

// TODO: (MUST) choose barcode and coordinate which doesn't exit in current map

const addNewBarcode = formData => (dispatch, getState) => {
  const state = getState();

  const { tileId, direction, barcode_value} = formData;
  const nbTileId = getNeighbourTiles(tileId)[direction];
  const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId });
  const newBarcodeWorldCoord = getNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    DEFAULT_BOT_WITH_RACK_THRESHOLD*2,
    direction
  );
  const NewBarcodeWorldCoordinate = `[${newBarcodeWorldCoord["x"]},${newBarcodeWorldCoord["y"]}]`
  // new barcode will be connected to all neighbour barcodes that it has
  const nbNeighboursTileIds = getNeighbourTiles(nbTileId);
  const oldBarcodes = [];
  const nbNeighbourStructure = [];
  const nbSizeInfo = Array(4).fill(state.barcodeDistance);
  nbNeighboursTileIds.forEach((nbNbTileId, idx) => {
    const nbNbBarcode = getBarcode(state, { tileId: nbNbTileId });
    if (nbNbBarcode) {
      oldBarcodes.push(
        addNeighbourToBarcode(nbNbBarcode, (idx + 2) % 4, nbTileId)
      );
      nbNeighbourStructure.push([1, 1, 1]);
      nbSizeInfo[idx] = nbNbBarcode.size_info[(idx + 2) % 4];
    } else {
      nbNeighbourStructure.push([0, 0, 0]);
    }
  });
  var barcodeCornerCoordinate = calculate_corner_world_cordinate(nbSizeInfo,[newBarcodeWorldCoord["x"],newBarcodeWorldCoord["y"]])
  const newBarcode = createNewBarcode({
    coordinate: nbTileId,
    neighbours: nbNeighbourStructure,
    barcode: barcode_value,
    size_info: nbSizeInfo,
    world_coordinate:NewBarcodeWorldCoordinate,
    world_coordinate_reference_neighbour:tileId,
    corner_world_cooordinate:barcodeCornerCoordinate
  });
  // add to barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: [...oldBarcodes, newBarcode]
  });
  // add to floor
  dispatch(
    addEntitiesToFloor({
      currentFloor: state.currentFloor,
      floorKey: "map_values",
      entities: [newBarcode],
      idField: "coordinate"
    })
  );
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

const addNewMultipleBarcode = formData => (dispatch, getState) => {
  const state = getState();
  const { tileId, direction } = formData;
  var tileIdArr = JSON.parse(tileId);
  tileIdArr.map((val) => {
    const nbTileId = getNeighbourTiles(val)[direction];
    const nbBarcode = getBarcode(state, { tileId: val });
    // new barcode will be connected to all neighbour barcodes that it has
    const nbNeighboursTileIds = getNeighbourTiles(nbTileId);
    const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId: val });
    const newBarcodeWorldCoord = getNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    DEFAULT_BOT_WITH_RACK_THRESHOLD*2,
    direction
    );
    const NewBarcodeWorldCoordinate = `[${newBarcodeWorldCoord["x"]},${newBarcodeWorldCoord["y"]}]`
    const oldBarcodes = [];
    const nbNeighbourStructure = [];
    const nbSizeInfo = nbBarcode.size_info;
    nbNeighboursTileIds.forEach((nbNbTileId, idx) => {
      const nbNbBarcode = getBarcode(state, { tileId: nbNbTileId });
      if (nbNbBarcode) {
        oldBarcodes.push(
          addNeighbourToBarcode(nbNbBarcode, (idx + 2) % 4, nbTileId)
        );
        nbNeighbourStructure.push([1, 1, 1]);
      } else {
        nbNeighbourStructure.push([0, 0, 0]);
      }
    });
    var barcode_cordinate = getExistingBarcodesAndCoordinates(state)
    var barocde_value = getValidEmptyDirTileIdList(barcode_cordinate.barcodes,nbTileId)
    var barcodeCornerCoordinate = calculate_corner_world_cordinate(nbSizeInfo,[newBarcodeWorldCoord["x"],newBarcodeWorldCoord["y"]])
    const newBarcode = createNewBarcode({
      coordinate: nbTileId,
      neighbours: nbNeighbourStructure,
      barcode: implicitCoordinateKeyToBarcode(barocde_value),
      size_info: nbSizeInfo,
      world_coordinate:NewBarcodeWorldCoordinate,
      world_coordinate_reference_neighbour:val,
      corner_world_cooordinate:barcodeCornerCoordinate
    });

    // add to barcodes
    dispatch({
      type: "ADD-MULTIPLE-BARCODE",
      value: [...oldBarcodes, newBarcode]
    });
    // add to floor
    dispatch(
      addEntitiesToFloor({
        currentFloor: state.currentFloor,
        floorKey: "map_values",
        entities: [newBarcode],
        idField: "coordinate"
      })
    );
  });
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

const removeBarcodes = (dispatch, getState) => {
  const {
    selection: { mapTiles },
    currentFloor
  } = getState();
  // remove from floor
  dispatch({
    type: "REMOVE-ENTITIES-FROM-FLOOR",
    value: {
      currentFloor,
      floorKey: "map_values",
      ids: Object.keys(mapTiles) || []
    }
  });
  // remove barcodes
  dispatch({
    type: "DELETE-BARCODES",
    value: mapTiles || {}
  });
  // clear tiles
  dispatch(clearTiles);
};

const modifyDistanceBetweenBarcodes = ({ distance, direction }) => (
  dispatch,
  getState
) => {
  const globalState = getState();
  const {
    selection: { distanceTiles }
  } = globalState;
  const tileIds = getTileIdsForDistanceTiles(
    distanceTiles,
    globalState,
    direction
  );
  dispatch({
    type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
    value: {
      distance,
      tileIds,
      direction
    }
  });
  dispatch(clearTiles);
};

const modifyNeighbours = (tileId, values) => dispatch => {
  dispatch({
    type: "MODIFY-BARCODE-NEIGHBOURS",
    value: {
      tileId,
      values
    }
  });
  dispatch(clearTiles);
};

const modifyMultipleNeighbours = (values) => (dispatch, getState) => {
  const {
    selection: { mapTiles },
  } = getState();

  dispatch({
    type: "MODIFY-MULTI-BARCODE-NEIGHBOURS",
    value: {
      mapTiles,
      values
    }
  });
  dispatch(clearTiles);
};

const shiftBarcode = ({ tileId, direction, distance }) => dispatch => {
  try {
    return dispatch({
      type: "SHIFT-BARCODE",
      value: {
        tileId,
        direction,
        distance
      }
    });
  } catch (e) {
    return dispatch(setErrorMessage(e.message));
  }
};

export const alignBarcode = ({ alignedBarcode, tileId, axis }) => (dispatch, getState) => {
  // vertically:
  //   left: (aligned node_x < misaligned node_x)
  //   right:(aligned node_x > misaligned node_x)

  // horizontally:
  //   top:(aligned node_y < misaligned node_y)
  //   bottom:(aligned node_y > misaligned node_y)
  const state = getState();
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;
  var direction = 0
  var distance = 0
  const alignBarcodeWorldCoordinate = JSON.parse(barcode[alignedBarcode]["world_coordinate"]);
  const misalignBarcodeWorldCoordinate = JSON.parse(barcode[tileId]["world_coordinate"]);
  if(axis=="vertical"){
    // const { error, reason } = validateVerticalAlignment(alignBarcodeWorldCoordinate,misalignBarcodeWorldCoordinate);
    // if (error) {
    // return dispatch(setErrorMessage(reason));
    // }
    if(alignBarcodeWorldCoordinate[0] < misalignBarcodeWorldCoordinate[0]){
       direction = 3
       distance = misalignBarcodeWorldCoordinate[0] - alignBarcodeWorldCoordinate[0]

    }
    else if(alignBarcodeWorldCoordinate[0] > misalignBarcodeWorldCoordinate[0]){
      direction = 1
      distance = alignBarcodeWorldCoordinate[0] - misalignBarcodeWorldCoordinate[0]
    }
  }
  if(axis=="horizontal"){
    if(alignBarcodeWorldCoordinate[1] < misalignBarcodeWorldCoordinate[1]){
       direction = 0
       distance = misalignBarcodeWorldCoordinate[1] - alignBarcodeWorldCoordinate[1]
    }
    else if(alignBarcodeWorldCoordinate[1] > misalignBarcodeWorldCoordinate[1]){
      direction = 2
      distance = alignBarcodeWorldCoordinate[1] - misalignBarcodeWorldCoordinate[1]
    }
    
  }
  try {
    return dispatch({
      type: "ALIGN-BARCODE",
      value: {
        tileId,
        direction,
        distance
      }
    });
  } catch (e) {
    return dispatch(setErrorMessage(e.message));
  }
};


const locateBarcode = barcodeString => async (dispatch, getState) => {
  var state = getState();
  const floors = barcodeStringToFloorsSelector(state, { barcodeString });
  if (!floors.length) {
    return dispatch(setErrorMessage(`Barcode ${barcodeString} not found.`));
  }
  if (!floors.find(floorId => floorId == state.currentFloor)) {
    // barcode is not present on current floor, switch first
    await dispatch(changeFloor(floors[0]));
    // need to get state again! since we will be using it for selectors later
    state = getState();
  }
  const coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
    barcode: barcodeString
  });
  const renderCoordinate = tileToWorldCoordinate(state, {
    tileId: coordinate
  });
  const { xScale, yScale } = getTileSpriteScale(state, {
    tileId: coordinate,
    spriteIdx: 0
  });
  // 5 times the max of (width, height) of the tile
  // TODO: should fix selectors and make a `getTileDimensions` selector. right now lots of copy paste @amar.c
  return dispatch(
    snapToCoordinate(
      renderCoordinate,
      Math.max(TILE_SPRITE_WIDTH * xScale, TILE_SPRITE_HEIGHT * yScale) * 5
    )
  );
};

export {
  createNewBarcode,
  addNewBarcode,
  addNewMultipleBarcode,
  removeBarcodes,
  modifyDistanceBetweenBarcodes,
  modifyNeighbours,
  modifyMultipleNeighbours,
  shiftBarcode,
  addTransitBarcode,
  locateBarcode,
  addTTPTransitBarcode
};
