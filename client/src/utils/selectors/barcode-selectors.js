import { createSelector } from "reselect";
import { encode_barcode, coordinateKeyToTupleOfIntegers } from "../util";
export const getCurrentFloorBarcodeIds = state =>
  state.normalizedMap.entities.floor[state.currentFloor].map_values;
export const getBarcodes = state => state.normalizedMap.entities.barcode || {};
export const getBarcodesDistance = state => state.barcodeDistance
export const getBarcode = (state, { tileId }) =>
  state.normalizedMap.entities.barcode[tileId];
export const getCurrentFloorBarcodes = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (barcodeKeys, barcodes) => {
    var currentFloorBarcodes = {};
    barcodeKeys.forEach(barcodeKey => {
      currentFloorBarcodes[barcodeKey] = barcodes[barcodeKey];
    });
    return currentFloorBarcodes;
  }
);
export const getFloors = state => state.normalizedMap.entities.floor || {};

export const getBarcodeSize = createSelector(
  getBarcode,
  barcodeInfo => {
    var barcodeSizeInfo = barcodeInfo.size_info;
    return [
      barcodeSizeInfo[0],
      barcodeSizeInfo[1],
      barcodeSizeInfo[2],
      barcodeSizeInfo[3]
    ];
  }
);

// since barcodes =/= coordinate sometimes
export const coordinateKeyToBarcodeSelector = createSelector(
  getBarcode,
  barcode => barcode.barcode
);

// assumed that there is one-to-one relationship b/w barcode string and coordinate on a floor
export const currentFloorBarcodeToCoordinateMap = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (tileIds, barcodes) => {
    var ret = {};
    for (var tileId of tileIds) {
      const barcodeString = barcodes[tileId].barcode;
      if (ret[barcodeString]) {
        throw Error(
          `duplicate barcodes on current floor: ${barcodeString}, tile ids ${
            ret[barcodeString]
          }, ${tileId}`
        );
      }
      ret[barcodeString] = tileId;
    }
    return ret;
  }
);

export const currentFloorBarcodeToCoordinateKeySelector = createSelector(
  currentFloorBarcodeToCoordinateMap,
  (_state, { barcode }) => barcode,
  (barcodeCoordinateMap, barcode) => barcodeCoordinateMap[barcode]
);

export const getCurrentFloorBarcodesList = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (currentFloorBarcodeIds, barcodesDict) =>
    currentFloorBarcodeIds.map(coordinate => barcodesDict[coordinate])
);
export const getExistingBarcodesAndCoordinates = createSelector(
  getBarcodes,
  barcodeInfoList => {
    var barcodes = {};
    var coordinates = {};

    for (var key in barcodeInfoList) {
      if (barcodeInfoList.hasOwnProperty(key)) {
        barcodes[barcodeInfoList[key].barcode] = true;

        coordinates[
          coordinateKeyToTupleOfIntegers(barcodeInfoList[key].coordinate)
        ] = true;
      }
    }
    return { barcodes: barcodes, coordinates: coordinates };
  }
);

// start from top right corner
export const getNewBarcode = createSelector(
  getExistingBarcodesAndCoordinates,

  existingBarcodesAndCoordinates => {
    const existingBarcodes = existingBarcodesAndCoordinates.barcodes;
    for (var i = 999; i > 0; i--) {
      for (var j = 1; j < 1000; j++) {
        const barcode = encode_barcode(j, i);
        if (existingBarcodes.hasOwnProperty(barcode)) {
          continue;
        }
        return barcode;
      }
    }
    throw new Error("No barcode available in between 001.001 to 999.999");
  }
);

export const getNewCoordinate = createSelector(
  getExistingBarcodesAndCoordinates,
  existingBarcodesAndCoordinates => {
    const existingCoordinates = existingBarcodesAndCoordinates.coordinates;
    for (var i = 999; i > 0; i--) {
      for (var j = 1; j < 1000; j++) {
        const coordinate = [i, j];
        if (existingCoordinates.hasOwnProperty(coordinate)) {
          continue;
        }
        return coordinate;
      }
    }
    throw new Error("No coordinate available in between {1,1} to {999, 999}");
  }
);

export const barcodeStringToFloorsSelector = createSelector(
  getBarcodes,
  getFloors,
  (_state, { barcodeString }) => barcodeString,
  (barcodesDict, floorsDict, barcodeString) => {
    var floors = [];
    Object.entries(floorsDict).forEach(([floorId, floorDict]) => {
      const { map_values: floorCoordinates } = floorDict;
      for (var coordinate of floorCoordinates) {
        if (
          barcodesDict[coordinate] &&
          barcodesDict[coordinate].barcode == barcodeString
        ) {
          floors.push(parseInt(floorId));
          break;
        }
      }
    });
    return floors;
  }
);
