import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import _ from "lodash";
import {
  getBarcode,
  getBarcodes,
  currentFloorBarcodeToCoordinateKeySelector,
} from "./barcode-selectors";
import * as constants from "../../constants";
import {
  tupleOfIntegersToCoordinateKey,
  getNeighbouringBarcodes,
  zoneToColorMapper,
  sectorToColorMapper,
} from "../util";

export const tileNameWithoutEntityDataSelector = createSelector(
  getBarcode,
  (state) => state.selection.zoneViewMode,
  (state) => state.selection.sectorViewMode,
  (state) => state.normalizedMap.entities.odsExcluded || {},
  (barcode, zoneViewMode, sectorViewMode, odsExcluded) => {
    var tileSprite = constants.NORMAL;
    // don't show storables in zone view mode; otherwise their darker color messes with the tint
    if (barcode.store_status && !zoneViewMode && !sectorViewMode)
      tileSprite = constants.STORABLE;
    if (barcode.special && !zoneViewMode) tileSprite = constants.SPECIAL;
    if (barcode.blocked && !zoneViewMode) tileSprite = constants.BLOCKED;
    if (barcode.path_status > 0 && !zoneViewMode && !sectorViewMode)
      tileSprite = constants.PATH;
    if (barcode.node_status > 0 && !zoneViewMode && !sectorViewMode)
      tileSprite = constants.QUEUE;
    
    Object.keys(odsExcluded).forEach((ods) => {
      if (
        barcode.coordinate === odsExcluded[ods].coordinate &&
        !zoneViewMode &&
        odsExcluded[ods].excluded
      ) {
        var odsDirection = odsExcluded[ods].ods_tuple.split("--")[1];
        switch (odsDirection) {
          case "0":
            tileSprite = constants.ODS_EXCLUDED_TOP;
            break;
          case "1":
            tileSprite = constants.ODS_EXCLUDED_RIGHT;
            break;
          case "2":
            tileSprite = constants.ODS_EXCLUDED_BOTTOM;
            break;
          case "3":
            tileSprite = constants.ODS_EXCLUDED_LEFT;
            break;
          default:
            tileSprite = constants.ODS_EXCLUDED;
        }
      }
    });
    if (barcode.highlight_status > 0 && !zoneViewMode && !sectorViewMode)
      tileSprite = constants.HIGHLIGHT;
    return tileSprite;
  }
);

export const tileSpriteNamesWithoutEntityData = createSelector(
  getBarcode,
  tileNameWithoutEntityDataSelector,
  (barcode, tileName) => {
    // last sprite (dot) is for showing center point of barcode.
    // TODO: should replace it with a 'x' sprite
    var spriteNames = barcode.barcode
      .split("")
      .map((char) =>
        char !== "." ? `${char}.png` : constants.BARCODE_DOT_SPRITE
      );
    return [tileName, ...spriteNames, constants.BARCODE_CENTRE_SPRITE];
  }
);

export const getParticularEntity = (state, { entityName }) =>
  state.normalizedMap.entities[entityName] || {};

const getQueueData = (state) => state.normalizedMap.entities.queueData || {};

export const getQueueMap = createSelector(
  getQueueData,
  (queueData) => {
    var ret = {};
    var queueCoordinates = [].concat(
      ...Object.entries(queueData).map(([, { coordinates }]) => coordinates)
    );
    // make unique
    var queueCoordinatesWithoutDuplicates = new Set(queueCoordinates);
    queueCoordinatesWithoutDuplicates.forEach(
      (v1) => (ret[v1] = constants.QUEUE)
    );
    return ret;
  }
);


const entitySelectorHelperData = {
  pps: ["pps", constants.PPS],
  pps_top: ["pps_top", constants.PPS_TOP],
  pps_right: ["pps_right", constants.PPS_RIGHT],
  pps_bottom: ["pps_bottom", constants.PPS_BOTTOM],
  pps_left: ["pps_left", constants.PPS_LEFT],
  charger: ["charger", constants.CHARGER],
  dockPoint: ["dockPoint", constants.DOCK_POINT],
  ods: ["ods", constants.ODS_EXCLUDED],
  fireEmergency: ["fireEmergency", constants.EMERGENCY_EXIT],
  // 3rd argument is how to get coordinate(s) from an entity.
  // in case of elevator, there are multiple coordinates per elevator
  elevator: [
    "elevator",
    constants.ELEVATOR,
    (e) =>
      e.coordinate_list.map(({ coordinate }) =>
        tupleOfIntegersToCoordinateKey(coordinate)
      ),
  ],
};

// all entities except elevator have one coordinate per entity
const defaultGetCoordinatesFromEntity = (e) => [e];

export const getParticularEntityMap = createCachedSelector(
  getParticularEntity,
  (state_, { entityName }) => entityName,
  (particularEntities, entityName) => {
    var ret = {};
    const [
      ,
      entitySprite,
      getCoordinatesFromEntity = defaultGetCoordinatesFromEntity,
    ] = entitySelectorHelperData[entityName];
    var list = Object.entries(particularEntities).map(([, val]) => val);
    var coordinateKeys = _.flatten(
      list.map((e) => getCoordinatesFromEntity(e))
    );
    coordinateKeys.forEach((key) => {
      if (key.pick_direction != undefined) {
        switch (key.pick_direction) {
          case 0:
            ret[key.coordinate] = constants.PPS_TOP;
            break;
          case 1:
            ret[key.coordinate] = constants.PPS_RIGHT;
            break;
          case 2:
            ret[key.coordinate] = constants.PPS_BOTTOM;
            break;
          case 3:
            ret[key.coordinate] = constants.PPS_LEFT;
            break;
        }
      } else if (key.coordinate != undefined) {
        ret[key.coordinate] = entitySprite;
      } else {
        ret[key] = entitySprite;
      }
    });

    return ret;
  }
)((state, { entityName }) => entityName);

export const getChargerEntryMap = (state) => {
  var chargerEntities = getParticularEntity(state, { entityName: "charger" });
  var barcodesDict = getBarcodes(state);
  var ret = {};
  Object.entries(chargerEntities).forEach(
    ([, { charger_direction, coordinate }]) => {
      var nb = getNeighbouringBarcodes(coordinate, barcodesDict)[
        charger_direction
      ];
      if (nb) {
        // charger -> special barcode -> charger entry barcode
        var eb = getNeighbouringBarcodes(nb.coordinate, barcodesDict)[
          charger_direction
        ];
        if (eb) ret[eb.coordinate] = constants.CHARGER_ENTRY;
      }
    }
  );
  return ret;
};

export const getEditHighlight = (state) => {
  var chargerEntities = getParticularEntity(state, { entityName: "charger" });
  var barcodesDict = getBarcodes(state);
  var ret = {};
  Object.entries(barcodesDict).forEach(
    (key) => {
      if (key[1].highlight_status>0){
        ret[key[0]] = constants.HIGHLIGHT
      }
    }
  );
  return ret;
};

export const getPpsQueueMap = (state) => {
  var PpsEntities = getParticularEntity(state, { entityName: "pps" });
  var ret = {};
  Object.entries(PpsEntities).forEach(([, { coordinate, queue_barcodes }]) => {
    _.forEach(queue_barcodes, function(queue_barcode) {
      var qb_coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
        barcode: queue_barcode,
      });

      if (qb_coordinate != coordinate) {
        ret[qb_coordinate] = constants.QUEUE;
      }
    });
  });
  return ret;
};

// creates map of tileId -> spriteName for all special tiles i.e. tile which
// have some entity (charger, pps, queue etc.)
export const tileEntitySpritesMapSelector = (state) => {
  var ret = {};
  Object.keys(entitySelectorHelperData).forEach((key) => {
    ret = { ...ret, ...getParticularEntityMap(state, { entityName: key }) };
  });
  // queue also
  // charger entry points also
  ret = { ...ret, ...getChargerEntryMap(state) };
  // selected also
  ret = { ...ret, ...getQueueMap(state) };
  ret = { ...ret, ...getPpsQueueMap(state) };
  ret = { ...ret, ...getEditHighlight(state) };
  return ret;
};

export const specialTileSpritesMapSelector = createSelector(
  tileEntitySpritesMapSelector,
  (state) => state.selection.mapTiles,
  (state) => state.selection.zoneViewMode,
  (state) => state.selection.sectorViewMode,
  (entitySpritesMap, selectedMapTiles, zoneViewMode, sectorViewMode) => {
    var ret = {};
    Object.keys(selectedMapTiles).forEach(
      (key) => (ret[key] = constants.SELECTED)
    );
    // if in zone view, don't render any entities, just selections; otherwise they mess with the tint
    if (zoneViewMode || sectorViewMode) return ret;
    return { ...entitySpritesMap, ...ret };
  }
);

export const getZones = (state) => state.normalizedMap.entities.zone || {};
export const getSectors = (state) => {
  const FLoor = state.currentFloor;
  const sectors =
    state.normalizedMap.entities.sector === undefined ||
    _.isEmpty(state.normalizedMap.entities.sector)
      ? state.normalizedMap.entities.floor[FLoor].sectors || {}
      : state.normalizedMap.entities.sector || {};
  return sectors;
};

export const getZoneToColorMap = createSelector(
  getZones,
  (zones) => {
    const newZoneMap = zoneToColorMapper(zones);
    return newZoneMap;
  }
);
export const getSectorToColorMap = createSelector(
  getSectors,
  (sectors) => {
    const newSectorMap = sectorToColorMapper(sectors);

    return newSectorMap;
  }
);

export function strToHex(s) {
  return parseInt(s.substr(1), 16);
}

export const tileTintSelector = createSelector(
  getZoneToColorMap,
  getSectorToColorMap,
  getBarcode,
  (state) => state.selection.zoneViewMode,
  (state) => state.selection.sectorViewMode,
  (zoneToColorMap, sectorToColorMap, barcode, zoneViewMode, sectorViewMode) =>
    zoneViewMode
      ? strToHex(zoneToColorMap[barcode.zone] || "#ffffff"): sectorViewMode? strToHex(sectorToColorMap[barcode.sector] || "#ffffff"): 0xffffff
);
