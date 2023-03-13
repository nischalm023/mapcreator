// mainly selectors for map rendering
import { getBarcodeSize, getBarcode } from "./barcode-selectors";
import { createSelector } from "reselect";
import * as constants from "../../constants";
import {
  tileToWorldCoordinate,
  getTileBoundingBox
} from "./world-coordinate-utils-selectors";
import createCachedSelector from "re-reselect";
import _ from "lodash";

// Scale is for stretching out the barcode.png sprite to exactly fit the tile
// bounding box. Hence it is not {1,1} for the default sprite but some other value.
export const getTileSpriteScale = createCachedSelector(
  getBarcodeSize,
  barcodeSizeInfo => {
    const barcodeSizeXInCADCoordinates =
      barcodeSizeInfo[1] + barcodeSizeInfo[3];
    const barcodeSizeYInCADCoordinates =
      barcodeSizeInfo[0] + barcodeSizeInfo[2];
    const defDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
    // Read tests to understand this calculation
    const xScale =
      (barcodeSizeXInCADCoordinates / defDistance) * constants.DEFAULT_X_SCALE;
    const yScale =
      (barcodeSizeYInCADCoordinates / defDistance) * constants.DEFAULT_Y_SCALE;
    return { xScale, yScale };
  }
)((state, { tileId }) => tileId);

export const getMainTileSpriteData = createSelector(
  getBarcode,
  getTileBoundingBox,
  getTileSpriteScale,
  state => state.selection.zoneViewMode,
  state => state.selection.sectorViewMode,
  state => state.normalizedMap.entities.odsExcluded || {},
  (barcode, boundingBox, { xScale, yScale }, zoneViewMode, sectorViewMode, odsExcluded) => {
    var tileSprite = constants.NORMAL;
    // don't show storables in zone view mode; otherwise their darker color messes with the tint
    if (barcode.store_status && !zoneViewMode && !sectorViewMode) tileSprite = constants.STORABLE;
    if (barcode.special && !zoneViewMode) tileSprite = constants.SPECIAL;
    if (barcode.blocked && !zoneViewMode) tileSprite = constants.BLOCKED;
    if ( barcode.path_status > 0 && !zoneViewMode && !sectorViewMode) tileSprite = constants.PATH;
    if ( barcode.node_status > 0 && !zoneViewMode && !sectorViewMode) tileSprite = constants.QUEUE;
    Object.keys(odsExcluded).forEach((ods) => {
      if(barcode.coordinate === odsExcluded[ods].coordinate && !zoneViewMode && odsExcluded[ods].excluded) {
        var odsDirection = odsExcluded[ods].ods_tuple.split("--")[1];
        switch(odsDirection) {
          case "0": tileSprite = constants.ODS_EXCLUDED_TOP; break; 
          case "1": tileSprite = constants.ODS_EXCLUDED_RIGHT; break; 
          case "2": tileSprite = constants.ODS_EXCLUDED_BOTTOM; break; 
          case "3": tileSprite = constants.ODS_EXCLUDED_LEFT; break;
          default: tileSprite = constants.ODS_EXCLUDED;
        }
      }
    });
    // {
      // conveyor_selected_status = 1 (selected conveyor tile)
      // conveyor_selected_status = 2 (entry points on conveyor tile)
      // conveyor_selected_status = 3 (exit points on conveyor tile)
      // conveyor_selected_status = 4 (end points on conveyor tile)
      // conveyor_selected_status = 5 (active point on conveyor tile)
      // remove_conveyor_tile = 1 (remove selected conveyor tile)
      // conveyor_selected_status = 0 (selected conveyor tile for normal color)
    // }
    if ( barcode.highlight_status > 0 && !zoneViewMode && !sectorViewMode) tileSprite = constants.HIGHLIGHT;
    if ( barcode.conveyor_selected_status === 1 && !zoneViewMode && !sectorViewMode) tileSprite = constants.SELECT_CONVEYOR;
    if ( barcode.conveyor_selected_status === 2 && !zoneViewMode && !sectorViewMode) tileSprite = constants.ENTRY_CONVEYOR;
    if ( barcode.conveyor_selected_status === 3 && !zoneViewMode && !sectorViewMode) tileSprite = constants.EXIT_CONVEYOR;
    if ( barcode.conveyor_selected_status === 4 && !zoneViewMode && !sectorViewMode) tileSprite = constants.END_CONVEYOR;
    if ( barcode.conveyor_selected_status === 5 && !zoneViewMode && !sectorViewMode) tileSprite = constants.ACTIVE_CONVEYOR;
    if ( barcode.remove_conveyor_tile === 1 && !zoneViewMode && !sectorViewMode) tileSprite = constants.ODS_EXCLUDED;
    if ( barcode.conveyor_selected_status === 0 && !zoneViewMode && !sectorViewMode) tileSprite = constants.NORMAL;
    
    return {
      name: tileSprite,
      x: boundingBox.left,
      y: boundingBox.top,
      xScale,
      yScale
    };
  }
);

export const getBarcodeDigitSpritesNames = createSelector(
  getBarcode,
  barcode => {
    var spriteNames = barcode.barcode
      .split("")
      // dot in the middle of xxx and yyy also needs to be present. hence length is 7
      .map(char =>
        char !== "." ? `${char}.png` : constants.BARCODE_DOT_SPRITE
      );
    return spriteNames;
  }
);

export const getBarcodeDigitSpritesData = createSelector(
  getBarcode,
  getBarcodeDigitSpritesNames,
  tileToWorldCoordinate,
  getTileSpriteScale,
  getTileBoundingBox,
  (barcode,digitSpriteNames, { y: centreY }, { xScale, yScale }, boundingBox) => {
    // Width of barcode sprite
    var barcodeWidth = boundingBox.right - boundingBox.left;
    // vertical distance within which barcode numbers appear
    var topDistance = centreY - boundingBox.top;
    // check if enough space for rendering. if not, return an empty array
    var ret = {};
    if (!(topDistance > yScale * constants.BARCODE_DIGIT_HEIGHT)) return ret;
    // first 3 sprites
    const scaleData = {
      xScale,
      yScale
    };
    // this support default barcode label calculation
    if(/^(\d+\.\d+)$/.test(barcode.barcode)){    
      for (let i = 0; i < 3; i++) {
        ret[i] = {
          name: digitSpriteNames[i],
          x: boundingBox.left +(i * barcodeWidth) / 7,
          y: boundingBox.top - constants.BARCODE_DIGIT_HEIGHT * yScale,
          ...scaleData
        };
      }
      // dot sprite
      ret["3"] = {
        name: digitSpriteNames[3],
        x: boundingBox.left + (barcodeWidth) / 2.2,
        y:
          boundingBox.top -
          (constants.BARCODE_DIGIT_OFFSET + constants.BARCODE_DIGIT_HEIGHT / 3) *
            yScale,
        ...scaleData
      };
      // last 3 sprites
      for (let i = 4; i < 7; i++) {
        ret[i] = {
          name: digitSpriteNames[i],
          x: boundingBox.right - ((7 - i) * barcodeWidth) / 7,
          y: boundingBox.top - constants.BARCODE_DIGIT_HEIGHT * yScale,
          ...scaleData
        };
      }
// this supprt ttp barcode label calculation
    }else{
      for (let i = 0; i < 12; i++) {
        ret[i] = {
          name: digitSpriteNames[i],
          x: boundingBox.left + (i * barcodeWidth) / 12,
          y: boundingBox.top - constants.BARCODE_DIGIT_HEIGHT * yScale,
          ...scaleData
        };
      }
    }

    return ret;
  }
);

export const getDirectionalitySpritesNames = createSelector(
  getBarcode,
  barcode => {
    const { neighbours } = barcode;
    // if all neighbours are either [1,1,1] or [0,0,0], no need to draw direciotnality sprites for this barcode
    // they won't really add any new formation, just clutter
    const shouldNotDrawSprites = neighbours.every(nb =>
      _.isEqual(nb, [1, 1, 1])
    );
    if (shouldNotDrawSprites) return [null, null, null, null];
    return neighbours.map(nb => constants.DIRECTIONALITY_SPRITES_MAP[nb]);
  }
);

export const getDirectionalitySpriteCoordinateData = createSelector(
  getTileBoundingBox,
  getTileSpriteScale,
  ({ top, right, bottom, left }, { xScale, yScale }) => {
    // scale needs to be set separately for these sprites since
    // when they are rotated by 90 degrees or 270 degrees, x and y scale are swapped!
    return [
      {
        x: right,
        y: top,
        rotation: Math.PI / 2,
        xScale: yScale,
        yScale: xScale
      }, // top
      { x: right, y: bottom, rotation: Math.PI, xScale, yScale }, // right
      {
        x: left,
        y: bottom,
        rotation: Math.PI * (3 / 2),
        xScale: yScale,
        yScale: xScale
      }, // bottom
      { x: left, y: top, xScale, yScale } // left
    ];
  }
);

export const getDirectionalitySpritesData = createSelector(
  getDirectionalitySpritesNames,
  getDirectionalitySpriteCoordinateData,
  (directionalitySpriteNames, directionalitySpriteCoordinates) => {
    var ret = {};
    ["top", "right", "bottom", "left"].forEach((str, idx) => {
      if (directionalitySpriteNames[idx]) {
        ret[str] = {
          name: directionalitySpriteNames[idx],
          ...directionalitySpriteCoordinates[idx]
        };
      }
    });
    return ret;
  }
);

export const getAllSpritesData = createSelector(
  getMainTileSpriteData,
  getBarcodeDigitSpritesData,
  getDirectionalitySpritesData,
  tileToWorldCoordinate,
  getTileSpriteScale,
  state => state.selection.directionViewMode,
  (
    mainSpriteData,
    barcodeDigitSpritesData,
    directionalitySpritesData,
    { x: centreX, y: centreY },
    { xScale, yScale },
    directionViewMode
  ) => {
    const baseData = {
      main: mainSpriteData,
      ...barcodeDigitSpritesData,
      // the centre x sprite
      centre: {
        name: constants.BARCODE_CENTRE_SPRITE,
        x: centreX,
        y: centreY,
        xScale,
        yScale
      },
    };

    if (directionViewMode) return { ...baseData, ...directionalitySpritesData };
    return baseData;
  }
);
