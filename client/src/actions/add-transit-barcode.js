import {
  getNeighbouringBarcodesWithNbFilter,
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey,
  getNeighbourBarcodeIncludingDisconnectedInDirection
} from "utils/util";
import {calculate_corner_world_cordinate} from "./actions";
import {
  getBarcodes,
  getTileIdHavingWorldCoordinate,
  getExistingBarcodesAndCoordinates,
  tileToWorldCoordinate,
  getNewCoordinate
} from "utils/selectors";
import _ from "lodash";

// TODO: correct place for this function
export const isValidNewBarcode = (barcode, state) => {
  const existingBarcodesAndCoordinates = getExistingBarcodesAndCoordinates(
    state
  );
  const existingBarcodes = existingBarcodesAndCoordinates.barcodes;
  if (existingBarcodes.hasOwnProperty(barcode)) {
    return false;
  } else {
    return true;
  }
};

export const validateTransitBarcodeForm = (formData, state) => {
  const { tileId, newBarcode, direction, distance } = formData;
  const barcodes = getBarcodes(state);
  if (isValidNewBarcode(newBarcode, state)) {
    const refBarcodeInfo = barcodes[tileId];
    if (refBarcodeInfo.size_info[direction] * 2 > distance) {
      const nTileId = getNeighbourBarcodeIncludingDisconnectedInDirection(
        tileId,
        barcodes,
        direction
      );
      if (nTileId != null) {
        return true;
      }
      return {
        error: `Cannot Add transit barcode in direction: ${direction} of coordinate: ${tileId}`
      };
    }
    return {
      error: `Transit barcode will overlap with existing barcode in direction: ${direction}`
    };
  }
  return { error: `Barcode:  ${newBarcode} already exists in map` };
};

const getTransitCoordinate = state => {
  const coordinate = getNewCoordinate(state);
  return tupleOfIntegersToCoordinateKey(coordinate);
};

// TODO: Can merge both getWorldCoordUsingNeighbour from world-coordinate-utils-selectors
export const getNeighbourBarcodeWorldCoord = (
  refBarcodeWorldCoord,
  distance,
  direction
) => {
  const barcodeWorldCoord = { x: 0, y: 0 };
  switch (true) {
    case direction == 0:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y - distance;
      return barcodeWorldCoord;
    case direction == 1:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x + distance;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y;
      return barcodeWorldCoord;
    case direction == 2:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y + distance;
      return barcodeWorldCoord;
    case direction == 3:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x - distance;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y;
      return barcodeWorldCoord;
    default:
      throw new Error("Wrong direction in input");
  }
};

const getUpdatedBarcodeInfo = (
  barcodeInfo,
  direction,
  size,
  transitCoordinate,
  neighbours,
  refDirection
) => {
  const oppositeDirection = getOppositDirection(direction);
  var currentNeighbourStructure = barcodeInfo.neighbours;
  barcodeInfo.size_info[oppositeDirection] = size;
  // Adjacency update,
  const adjacency = [null, null, null, null];
  for (var neighbourDir in neighbours) {
    if (neighbourDir == oppositeDirection) {
      adjacency[neighbourDir] = coordinateKeyToTupleOfIntegers(
        transitCoordinate
      );
      // Update neighbour structure of perpendicular neighbours only
      if (refDirection != direction && refDirection != oppositeDirection) {
        currentNeighbourStructure[neighbourDir] = [1, 1, 1];
      }
    } else {
      const nBarcodeInfo = neighbours[neighbourDir];
      if (nBarcodeInfo != null) {
        adjacency[neighbourDir] = coordinateKeyToTupleOfIntegers(
          nBarcodeInfo.coordinate
        );
      }
    }
  }
  barcodeInfo.adjacency = adjacency;
  return barcodeInfo;
};

const getOppositDirection = dir => {
  return (dir + 2) % 4;
};

export const getUpdatedBarcodes = (
  transitBarcodeInfo,
  newState,
  refDirection
) => {
  const updatedBarcodes = [];
  for (var dir = 0; dir < 4; dir++) {
    const neighbourIndir = transitBarcodeInfo.adjacency[dir];
    if (neighbourIndir != null) {
      const neighbourIndirTileId = tupleOfIntegersToCoordinateKey(
        neighbourIndir
      );
      const barcodeInfo = newState[neighbourIndirTileId];
      const neighbours = getNeighbouringBarcodesWithNbFilter(
        neighbourIndirTileId,
        newState,
        [[0,0,0]]
      );
      const size = transitBarcodeInfo.size_info[dir];
      const updatedBarcodeInfo = getUpdatedBarcodeInfo(
        barcodeInfo,
        dir,
        size,
        transitBarcodeInfo.coordinate,
        neighbours,
        refDirection
      );
      updatedBarcodes.push(updatedBarcodeInfo);
    }
  }
  return updatedBarcodes;
};

const getTransitBarcodeInfo = (state, formData) => {
  const { tileId, newBarcode, direction, distance } = formData;
  const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId });
  const barcodes = getBarcodes(state);
  const refBarcodeInfo = barcodes[tileId];
  const oldNeighbour = getNeighbourBarcodeIncludingDisconnectedInDirection(
    tileId,
    barcodes,
    direction
  ); // Of ref barcode
  const transitBarcodeWorldCoord = getNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    distance,
    direction
  );
  const transitBarcodeCoordinate = getTransitCoordinate(state);
  // SizeInfo
  const sizeInfo = _.cloneDeep(refBarcodeInfo.size_info);
  sizeInfo[direction] =
    (2 * refBarcodeInfo.size_info[direction] - distance) / 2;
  sizeInfo[(direction + 2) % 4] = distance / 2;
  // Adjacency and Neighbour structure

  const adjacency = [null, null, null, null];
  const nStructure = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (var dir = 0; dir < 4; dir++) {
    const nWorldCoord = getNeighbourBarcodeWorldCoord(
      transitBarcodeWorldCoord,
      2 * sizeInfo[dir],
      dir
    );
    const nTileId = getTileIdHavingWorldCoordinate(state, nWorldCoord);
    var transitBarcodeWorldCoordinate = `[${transitBarcodeWorldCoord["x"]},${transitBarcodeWorldCoord["y"]}]`
    var cornerWorldCooordinate = calculate_corner_world_cordinate(sizeInfo,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
    if (nTileId != undefined) {
      adjacency[dir] = coordinateKeyToTupleOfIntegers(nTileId);
      if (dir != getOppositDirection(direction)) {
        nStructure[dir] = refBarcodeInfo.neighbours[dir];
      } else {
        nStructure[dir] = oldNeighbour.neighbours[dir];
      }
    }
  }
  var unit = {
    store_status: 0,
    zone: refBarcodeInfo.zone,
    barcode: newBarcode,
    botid: "null",
    neighbours: nStructure,
    coordinate: transitBarcodeCoordinate,
    blocked: false,
    size_info: sizeInfo,
    adjacency: adjacency,
    world_coordinate:transitBarcodeWorldCoordinate,
    world_coordinate_reference_neighbour:tileId,
    corner_world_cooordinate: cornerWorldCooordinate
  };
  return unit;
};

// Barcode Exists: B_1-9, Barcode Doesn't Exists: N0, Transit Barcode: TB
// case 1:
//    B3   N0   B4
//    B1   TB   B2
//    B5   N0   B6
// case 2:
//    B3   B7   B4
//    B1   TB   B2
//    B5   N0   B6
// case 2:
//    B3   N0   B4
//    B1   TB   B2
//    B5   B8   B6
// case 3:
//    B3   B7   B4
//    B1   TB   B2
//    B5   B8   B6

// B1,B7,B2,B8 will be modified and TB will be added
export const getUpdatedAndTransitBarcodes = (state, formData) => {
  const barcodes = getBarcodes(state);
  const newState = _.cloneDeep(barcodes);
  var { direction } = formData;
  validateTransitBarcodeForm(formData, state);
  const transitBarcodeInfo = getTransitBarcodeInfo(state, formData);
  const updatedBarcodes = getUpdatedBarcodes(
    transitBarcodeInfo,
    newState,
    direction
  );
  return [updatedBarcodes, transitBarcodeInfo];
};
