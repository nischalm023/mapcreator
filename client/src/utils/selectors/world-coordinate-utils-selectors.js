import { getCurrentFloorBarcodes, getBarcodeSize } from "./barcode-selectors";
import * as constants from "../../constants";
import { createSelector } from "reselect";
import { getNeighbouringBarcodesIncludingDisconnected } from "../util";
import createCachedSelector from "re-reselect";

var getNeighbourWithValidWorldCoord = (
  barcode,
  barcodes,
  coordinateToWorldCoorinateMapInitial
) => {
  var neighbours = getNeighbouringBarcodesIncludingDisconnected(
    barcode,
    barcodes
  );
  for (var neighbourDir in neighbours) {
    var nBarcodeInfo = neighbours[neighbourDir];
    if (nBarcodeInfo != null) {
      var nBarcodeKey = nBarcodeInfo.coordinate;
      var distanceInfo = nBarcodeInfo.size_info;
      if (coordinateToWorldCoorinateMapInitial.hasOwnProperty(nBarcodeKey)) {
        var nWorldCoordinate =
          coordinateToWorldCoorinateMapInitial[nBarcodeKey];
        return {
          nbarcode:nBarcodeKey,
          direction: neighbourDir,
          worldcoordinate: nWorldCoordinate,
          distanceInfo: distanceInfo
        };
      }
    }
  }
};

export const getWorldCoordUsingNeighbour = (
  distanceInfo,
  neighbourWithWorldCoordinate
) => {
  switch (neighbourWithWorldCoordinate.direction) {
    case "0":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x,
        y:
          neighbourWithWorldCoordinate.worldcoordinate.y +
          distanceInfo[0] +
          neighbourWithWorldCoordinate.distanceInfo[2]
      };
    case "1":
      return {
        x:
          neighbourWithWorldCoordinate.worldcoordinate.x -
          (distanceInfo[1] + neighbourWithWorldCoordinate.distanceInfo[3]),
        y: neighbourWithWorldCoordinate.worldcoordinate.y
      };
    case "2":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x,
        y:
          neighbourWithWorldCoordinate.worldcoordinate.y -
          (distanceInfo[2] + neighbourWithWorldCoordinate.distanceInfo[0])
      };
    case "3":
      return {
        x:
          neighbourWithWorldCoordinate.worldcoordinate.x +
          (neighbourWithWorldCoordinate.distanceInfo[1] + distanceInfo[3]),
        y: neighbourWithWorldCoordinate.worldcoordinate.y
      };
    default: {
      return { x: undefined, y: undefined };
    }
  }
};

export const getTileIdToWorldCoordMapFunc = barcodes => {
  var tileIdToWorldCoordinateMapInitial = {};
  var neighbourWithValidWorldCoordinate = {};
  const startBarcode = Object.keys(barcodes)[0];
  var worldCoordinate = { x: 0, y: 0 };
  tileIdToWorldCoordinateMapInitial[startBarcode] = worldCoordinate;
  neighbourWithValidWorldCoordinate[startBarcode] = "0,0";
  const totalBarcodes = Object.keys(barcodes).length;
  var totalBarcodesWithDefinedWorldCoord = 1;
  while (totalBarcodesWithDefinedWorldCoord < totalBarcodes) {
    for (var barcode in barcodes) {
      if (barcodes.hasOwnProperty(barcode)) {
        if (tileIdToWorldCoordinateMapInitial.hasOwnProperty(barcode)) {
          continue;
        }
        var barcodeInfoDict = barcodes[barcode];
        var distanceInfo = barcodeInfoDict.size_info;
        var neighbourWithWorldCoordinate = getNeighbourWithValidWorldCoord(
          barcode,
          barcodes,
          tileIdToWorldCoordinateMapInitial
        );
        if (neighbourWithWorldCoordinate != undefined) {
         
          
          worldCoordinate = getWorldCoordUsingNeighbour(
            distanceInfo,
            neighbourWithWorldCoordinate
          );
          totalBarcodesWithDefinedWorldCoord =
            totalBarcodesWithDefinedWorldCoord + 1;
          tileIdToWorldCoordinateMapInitial[barcode] = worldCoordinate;
          neighbourWithValidWorldCoordinate[barcode] = neighbourWithWorldCoordinate.nbarcode;
        }
      }
    }
  }
  return {tileIdToWorldCoordinateMap : tileIdToWorldCoordinateMapInitial,
    neighbourWithValidWorldCoordinate : neighbourWithValidWorldCoordinate};
};

export const getTileIdToWorldCoordMap = createSelector(
  getCurrentFloorBarcodes,
  barcodes => {
    return getTileIdToWorldCoordMapFunc(barcodes).tileIdToWorldCoordinateMap;
  }
);

export const tileToWorldCoordinate = createCachedSelector(
  getTileIdToWorldCoordMap,
  (_state, props) => props.tileId,
  (tileIdToWorldCoordinateMap, tileId) => {
    var xCoord = tileIdToWorldCoordinateMap[tileId].x;
    var yCoord = tileIdToWorldCoordinateMap[tileId].y;
    return { x: xCoord, y: yCoord };
  }
)((state, { tileId }) => tileId);

export var worldToTileCoordinate = createSelector(
  getTileIdToWorldCoordMap,
  (state, { x, y }) => [state, { x, y }],
  (tileIdToWorldCoordinateMap, [state, { x, y }]) => {
    for (var tileId in tileIdToWorldCoordinateMap) {
      // check if the property/key is defined in the object itself, not in parent
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        const barcodeSizeInfo = getBarcodeSize(state, { tileId });
        const { left, right, top, bottom } = getTileBoundingBoxInternal(
          tileIdToWorldCoordinateMap[tileId],
          barcodeSizeInfo
        );
        if (x <= right && x >= left && y <= bottom && y >= top) {
          return tileId;
        }
      }
    }
    return undefined;
  }
);

// search and return exact tile id at given world coordinate if any
export const getTileIdHavingWorldCoordinate = createSelector(
  getTileIdToWorldCoordMap,
  (_state, worldCoordinate) => worldCoordinate,
  (tileIdToWorldCoordinateMap, worldCoordinate) => {
    for (var key in tileIdToWorldCoordinateMap) {
      // check if the property/key is defined in the object itself, not in parent
      if (tileIdToWorldCoordinateMap.hasOwnProperty(key)) {
        var worldX = tileIdToWorldCoordinateMap[key].x;
        var worldY = tileIdToWorldCoordinateMap[key].y;
        if (worldCoordinate.x == worldX && worldCoordinate.y == worldY) {
          return key;
        }
      }
    }
    return undefined;
  }
);

// bounding box for main tile sprite (i.e. the barcode square) in world coordinates
export const getTileBoundingBox = createCachedSelector(
  tileToWorldCoordinate,
  getBarcodeSize,
  (worldCoordinate, barcodeSizeInfo) => {
    return getTileBoundingBoxInternal(worldCoordinate, barcodeSizeInfo);
  }
)((state, { tileId }) => tileId);

// exported for testing
export const getTileBoundingBoxInternal = ({ x, y }, barcodeSizeInfo) => {
  const worldXInPixel = x;
  const worldYInPixel = y;
  const left =
    worldXInPixel - barcodeSizeInfo[3] * constants.BARCODE_CLICKABLE_AREA_RATIO;
  const right =
    worldXInPixel + barcodeSizeInfo[1] * constants.BARCODE_CLICKABLE_AREA_RATIO;
  const top =
    worldYInPixel - barcodeSizeInfo[0] * constants.BARCODE_CLICKABLE_AREA_RATIO;
  const bottom =
    worldYInPixel + barcodeSizeInfo[2] * constants.BARCODE_CLICKABLE_AREA_RATIO;
  return {
    left,
    right,
    top,
    bottom
  };
};
