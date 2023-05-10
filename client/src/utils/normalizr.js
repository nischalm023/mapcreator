// normalization and denormalization fns, also schema
import { normalize, schema, denormalize } from "normalizr";
import moment from "moment";

const barcode = new schema.Entity("barcode", {}, { idAttribute: "coordinate" });
const elevator = new schema.Entity(
  "elevator",
  {},
  { idAttribute: "elevator_id" }
);
const zone = new schema.Entity("zone", {}, { idAttribute: "zone_id" });
const sector = new schema.Entity("sector", {}, { idAttribute: "sector_id" });
const sectorMxUPreferences = new schema.Entity(
  "sectorMxUPreferences",
  {},
  { idAttribute: "sector_mxu_preferences" }
);
const queueData = new schema.Entity(
  "queueData",
  {},
  { idAttribute: "queue_data_id" }
);
const conveyorTile = new schema.Entity("conveyorTile", {}, { idAttribute: "conveyor_id" });
const ioPoints = new schema.Entity("ioPoints", {}, { idAttribute: "io_point_id" });
const toteStorables = new schema.Entity("toteStorables", {}, { idAttribute: "next_tote_storable_id" });
const charger = new schema.Entity("charger", {}, { idAttribute: "charger_id" });
const pps = new schema.Entity("pps", {}, { idAttribute: "pps_id" });
const odsExcluded = new schema.Entity(
  "odsExcluded",
  {},
  { idAttribute: "ods_excluded_id" }
);
const dockPoint = new schema.Entity(
  "dockPoint",
  {},
  { idAttribute: "dock_point_id" }
);
const fireEmergency = new schema.Entity(
  "fireEmergency",
  {},
  { idAttribute: "fire_emergency_id" }
);

const floor = new schema.Entity(
  "floor",
  {
    map_values: [barcode],
    chargers: [charger],
    ppses: [pps],
    odsExcludeds: [odsExcluded],
    dockPoints: [dockPoint],
    fireEmergencies: [fireEmergency],
    ioPointsIds: [ioPoints],
    toteStorablesIds: [toteStorables],
  },
  { idAttribute: "floor_id" }
);

const mapSchema = new schema.Entity("map", {
  elevators: [elevator],
  zones: [zone],
  sectors: [sector],
  sectorMxUPreferences: [sectorMxUPreferences],
  queueDatas: [queueData],
  floors: [floor],
  conveyors:[conveyorTile],
  ioPointsIds: [ioPoints],
  toteStorablesIds: [toteStorables],
});

// this is the schema on which normalization will be run.
// very important that floors don't have duplicate coordinate barcodes
const mapObjSchema = new schema.Entity("mapObj", {
  map: mapSchema
});

// expects mapObj (with updatedAt etc.)
export var normalizeMap = mapObj => {
  // hack: add dummy id to map field
  // using parseJson(JSON.stringify()) to create deep copy so argument is not mutated
  var newMap = JSON.parse(JSON.stringify(mapObj));
  newMap.map.id = "dummy";
  return normalize(newMap, mapObjSchema);
};

export var denormalizeMap = normalizedMap => {
  var denormalizedMapObj = denormalize(
    normalizedMap.result,
    mapObjSchema,
    normalizedMap.entities
  );
  // remove id from map
  delete denormalizedMapObj.map.id;
  return denormalizedMapObj;
};

export var formatMapWithDataSuffix = (mapId, exportedJson, map_updated_time = null) => {
  var format = "YYYY-MM-DD HH:mm:ssZ";
  map_updated_time = moment(map_updated_time).utc().format(format);
  var payload = {'map_creator_id': mapId, 'map_updated_time': map_updated_time};
  Object.keys(exportedJson).forEach((keyName) => {
    if(['elevator', 'zone', 'sector', 'map', 'charger', 'pps'].indexOf(keyName) > -1){
      if(keyName !== 'map'){
        payload[keyName+"_data"] = typeof exportedJson[keyName]['data'] !== "undefined" ? exportedJson[keyName]['data'] : [];
      } else {
        payload[keyName+"_data"] = exportedJson[keyName].length == 1 ? exportedJson[keyName][0]['map_values'] : exportedJson[keyName];
      }
    }
  });

  return payload;
};