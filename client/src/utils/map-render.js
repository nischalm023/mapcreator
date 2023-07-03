// helper methods for rendering. impure methods (kind of) since reselect was not
// efficient enough. need information of previous state to work correctly
import {
  tileNameWithoutEntityDataSelector,
  tileTintSelector,
  getCurrentFloorBarcodes,
  specialTileSpritesMapSelector,
  getZoneToColorMap,
  getSectorToColorMap,
  getAllSpritesData
} from "../utils/selectors";
import { dummyState } from "reducers/util";
import * as PIXI from "pixi.js";

// some exports are for testing


export var createOrUpdateAllSprites = (container, state, tileId) => {
  var spriteData = getAllSpritesData(state, { tileId });
  var tint = tileTintSelector(state, { tileId });
  container.spriteMap[tileId] = {};
  Object.entries(spriteData).forEach(([key, value]) => {
    if(key=="storable" && value.length>0){
      for (var i = 0; i < value.length; i++) {
        const { name, x, y, rotation, xScale, yScale } = value[i];
        var sprite = new PIXI.Sprite(
          PIXI.loader.resources["mySpritesheet"].textures[name]
        );
        if (xScale) sprite.scale.x = xScale;
        if (yScale) sprite.scale.y = yScale;
        container.addChild(sprite);
        container.spriteMap[tileId][key] = sprite;
        sprite.x = x;
        sprite.y = y;
        sprite.tint = tint;
        if (rotation) sprite.rotation = rotation;
      }
    }
    else{
      const { name, x, y, rotation, xScale, yScale } = value;
      var sprite = new PIXI.Sprite(
        PIXI.loader.resources["mySpritesheet"].textures[name]
      );
      if (xScale) sprite.scale.x = xScale;
      if (yScale) sprite.scale.y = yScale;
      container.addChild(sprite);
      container.spriteMap[tileId][key] = sprite;
      sprite.x = x;
      sprite.y = y;
      sprite.tint = tint;
      if (rotation) sprite.rotation = rotation;
      }
  });
};

// will define selectors 2 cases:
// 1. barcode update -> re render everything O(n)
// 2. Other entity updates (charger, pps, selection.mapTiles etc. etc.) -> diff render entity, maybe just re-render all every time.

// called whenever tileIds change.
export var tileIdsUpdate = (container, state, prevState) => {
  var prevBarcodes = getCurrentFloorBarcodes(prevState);
  var barcodes = getCurrentFloorBarcodes(state);
  // add explicit check for zone view since we'll need to render when it changes...
  if (
    prevBarcodes === barcodes &&
    prevState.selection.zoneViewMode === state.selection.zoneViewMode &&
    prevState.selection.directionViewMode ===
      state.selection.directionViewMode &&
    getZoneToColorMap(prevState) === getZoneToColorMap(state) &&
    Object.keys(state.normalizedMap.entities.toteStorables).length===0
  )
    return; // nothing to do.
  // remove childrend and set spritemap to empty... actually pretty efficient.
  container.removeChildren();
  container.spriteMap = {};
  for (var barcodeId in barcodes) {
    const barcodeInfo = barcodes[barcodeId];
    createOrUpdateAllSprites(container, state, barcodeInfo.coordinate);
  }
  return container;
};

// called whenever tileIds change.
export var tileIdsSectorUpdate = (container, state, prevState) => {
  var prevBarcodes = getCurrentFloorBarcodes(prevState);
  var barcodes = getCurrentFloorBarcodes(state);
  // add explicit check for zone view since we'll need to render when it changes...
  if (
    prevBarcodes === barcodes &&
    prevState.selection.sectorViewMode === state.selection.sectorViewMode &&
    prevState.selection.directionViewMode ===
      state.selection.directionViewMode &&
    getSectorToColorMap(prevState) === getSectorToColorMap(state)
  )
    return; // nothing to do.
  // remove childrend and set spritemap to empty... actually pretty efficient.
  container.removeChildren();
  container.spriteMap = {};
  for (var barcodeId in barcodes) {
    const barcodeInfo = barcodes[barcodeId];
    createOrUpdateAllSprites(container, state, barcodeInfo.coordinate);
  }
  return container;
};

// updater that does all the entity (pps, charger, queue etc.) and selected tile rendering.
// almost always run...
export var tileSpriteUpdate = (container, state, prevState) => {
  if (
    state.normalizedMap.entities === prevState.normalizedMap.entities &&
    state.selection.mapTiles === prevState.selection.mapTiles
  )
    return;
  var prevSpecial = specialTileSpritesMapSelector(prevState);
  var special = specialTileSpritesMapSelector(state);
  // these maps have not been filtered for current floor, so need to do that.
  // need to correct both previous and current special
  Object.entries(prevSpecial).forEach(([tileId]) => {
    if (!container.spriteMap[tileId]) return;
    var spriteName = tileNameWithoutEntityDataSelector(state, { tileId });
    container.spriteMap[tileId]["main"].texture =
      PIXI.loader.resources["mySpritesheet"].textures[
        special[tileId] || spriteName
      ];
  });
  Object.entries(special).forEach(([tileId, spriteName]) => {
    if (!container.spriteMap[tileId]) return;
    // prevSpecial's are already corrected.
    if (!prevSpecial[tileId])
      container.spriteMap[tileId]["main"].texture =
        PIXI.loader.resources["mySpritesheet"].textures[spriteName];
  });
};

// only this one needs to be exposed.
var allUpdates = (container, state) => {
  var prevState = container.prevState || dummyState;
  tileIdsUpdate(container, state, prevState);
  tileIdsSectorUpdate(container, state, prevState);
  tileSpriteUpdate(container, state, prevState);
  container.prevState = state;
};

export default allUpdates;
