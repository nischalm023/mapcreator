import { createSelector } from "reselect";
import { getTileIdToWorldCoordMap } from "./world-coordinate-utils-selectors";
import {getBarcodesDistance} from "./barcode-selectors"
import * as constants from "../../constants";

export const getDistinctXAndYDistances = createSelector(
  getTileIdToWorldCoordMap,
  tileIdToWorldCoordinateMap => {
    const xAndYDistancePairList = Object.values(tileIdToWorldCoordinateMap);
    const xDistanceSet = new Set();
    const yDistanceSet = new Set();
    xAndYDistancePairList.forEach(xAndYDistancePair => {
      xDistanceSet.add(xAndYDistancePair.x);
      yDistanceSet.add(xAndYDistancePair.y);
    });
    const xDistances = [...xDistanceSet].sort(function(a, b) {
      return b - a;
    });
    const yDistances = [...yDistanceSet].sort(function(a, b) {
      return a - b;
    });
    const xAndYDistances = { x: xDistances, y: yDistances };
    return xAndYDistances;
  }
);

export const distanceTileSpritesSelector = createSelector(
  getDistinctXAndYDistances,
  getBarcodesDistance,
  (xAndYDistances,barcode_distance) => {
    const xDistances = xAndYDistances.x;
    const yDistances = xAndYDistances.y;
    var ret = [];
    // ************** For X Distance tile **************  //
    for (var i = 0; i < xDistances.length; i++) {
      const currentXCoordinateInPixel = xDistances[i];
      var sizeInLeft = barcode_distance;
      var sizeInRight = barcode_distance;
      if (i != 0) {
        sizeInRight = xDistances[i - 1] - xDistances[i];
      }
      if (i != xDistances.length - 1) {
        sizeInLeft = xDistances[i] - xDistances[i + 1];
      }
      // const size = (sizeInLeft + sizeInRight) / 2;
      const minSize = Math.min(sizeInLeft, sizeInRight);
      const width = (minSize / 750) * constants.DISTANCE_TILE_HEIGHT;
      ret.push({
        x: currentXCoordinateInPixel - width / 2,
        y: yDistances[0] - 1500,
        width: width,
        height: constants.DISTANCE_TILE_HEIGHT,
        key: `c-${i}`
      });
    }
    // ************** For Y Distance tile **************  //
    for (var j = 0; j < yDistances.length; j++) {
      const currentYCoordinateInPixel = yDistances[j];
      var sizeInDown = barcode_distance;
      var sizeInTop = barcode_distance;
      if (j != 0) {
        sizeInTop = yDistances[j] - yDistances[j - 1];
      }
      if (j != yDistances.length - 1) {
        sizeInDown = yDistances[j + 1] - yDistances[j];
      }
      const minSize = Math.min(sizeInTop, sizeInDown);
      const height = (minSize / 750) * constants.DISTANCE_TILE_HEIGHT;
      ret.push({
        x: xDistances[xDistances.length - 1] - 1500,
        y: currentYCoordinateInPixel - height / 2,
        width: constants.DISTANCE_TILE_HEIGHT,
        height: height,
        key: `r-${j}`
      });
    }
    return ret;
  }
);

export const getRowColumnInBetweenDistancesAndCoordinates = createSelector(
  getDistinctXAndYDistances,
  xAndYDistances => {
    const xDistances = xAndYDistances.x;
    const yDistances = xAndYDistances.y;
    var distance = 0;
    var x;
    var y;
    var ret = [];
    // columns
    for (var i = 0; i < xDistances.length - 1; i++) {
      distance = xDistances[i] - xDistances[i + 1];
      x = xDistances[i + 1] + distance / 2;
      y = yDistances[0] - 2000;
      ret.push({
        x: x,
        y: y,
        distance: distance
      });
    }
    // rows
    for (var j = 0; j < yDistances.length - 1; j++) {
      distance = yDistances[j + 1] - yDistances[j];
      x = xDistances[xDistances.length - 1] - 2000;
      y = yDistances[j] + distance / 2;
      ret.push({
        x: x,
        y: y,
        distance: distance
      });
    }
    return ret;
  }
);

// exported for testing
export const getAllColumnTileIdTuples = createSelector(
  getTileIdToWorldCoordMap,
  getDistinctXAndYDistances,
  (_state, distanceTileKey) => distanceTileKey,
  (tileIdToWorldCoordinateMap, xAndYDistances, distanceTileKey) => {
    const selectedColumnIndex = parseInt(distanceTileKey.match(/c-(.*)/)[1]);
    const columnDistances = xAndYDistances.x;
    const xCoordinate = columnDistances[selectedColumnIndex];
    const AllColumnTileIdTuples = [];
    for (const tileId in tileIdToWorldCoordinateMap) {
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        if (tileIdToWorldCoordinateMap[tileId].x == xCoordinate) {
          AllColumnTileIdTuples.push(tileId);
        }
      }
    }
    return AllColumnTileIdTuples;
  }
);

// exported for testing
export const getAllRowTileIdTuples = createSelector(
  getTileIdToWorldCoordMap,
  getDistinctXAndYDistances,
  (_state, distanceTileKey) => distanceTileKey,
  (tileIdToWorldCoordinateMap, xAndYDistances, distanceTileKey) => {
    const selectedRowIndex = parseInt(distanceTileKey.match(/r-(.*)/)[1]);
    const rowDistances = xAndYDistances.y;
    const yCoordinate = rowDistances[selectedRowIndex];
    const AllRowTileIdTuples = [];
    for (const tileId in tileIdToWorldCoordinateMap) {
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        if (tileIdToWorldCoordinateMap[tileId].y == yCoordinate) {
          AllRowTileIdTuples.push(tileId);
        }
      }
    }
    return AllRowTileIdTuples;
  }
);

export const getTileIdsForDistanceTiles = (distanceTiles, state, direction) => {
  var tileIds = [];
  for (let distanceTileKey in distanceTiles) {
    if (/c-.*/.test(distanceTileKey) && (direction == 1 || direction == 3)) {
      // column
      tileIds = tileIds.concat(
        getAllColumnTileIdTuples(state, distanceTileKey)
      );
    } else {
      // row
      tileIds = tileIds.concat(getAllRowTileIdTuples(state, distanceTileKey));
    }
  }
  return tileIds;
};
