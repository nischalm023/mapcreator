// takes uploaded json files and returns a single #map json object which is internal
// represention of the map in mapcreator. schema for this is defined in json-schemas/map.json

import getLoadedAjv from "common/utils/get-loaded-ajv";
import {
  parseCoordinateString,
  findFloorIndex,
  findCoordinateForBarcode,
} from "common/utils/util";
import * as constants from "../../constants";
import _ from "lodash";
const prettyAjvError = (errors) => JSON.stringify(errors[0], undefined, 2);

var ajv = getLoadedAjv();
const validate = (schemaName, jsonFile, throwError = true) => {
  var validate = ajv.getSchema(schemaName);
  if (!validate(jsonFile)) {
    if (throwError)
      throw new Error(
        `${schemaName} parse error: ${prettyAjvError(validate.errors)}`
      );
    else return false;
  }
  return true;
};

export var findFloorbyCoordinate = (floors, coordinate) =>
  _.findIndex(floors, ({ map_values }) =>
    map_values.some((barcode) => barcode.coordinate == coordinate)
  );

// exported for testing
export const getOdsExcludedBarcode = ({ ods_tuple }) =>
  ods_tuple.match(/^(.+)--\d$/)[1];

// if floor_id is present, then its multifloor
export const detectSingleFloor = (mapJson) =>
  Array.isArray(mapJson) &&
  mapJson.length > 0 &&
  mapJson[0].floor_id == undefined;

export default ({
  mapJson,
  chargerJson = [],
  elevatorJson = [],
  fireEmergencyJson = [],
  odsExcludedJson = { ods_excluded_list: [] },
  ppsJson = [],
  sectorJson = [],
  dockPointJson = [],
  queueDataJson = [],
  zoneJson = {
    header: {
      "content-type": "application/json",
      accept: "application/json",
    },
    type: "POST",
    data: [],
    url: "/api/zonerec",
  },
}) => {
  // the resulting map
  var map = {};
  // map.json is required
  if (!mapJson) throw new Error("map.json is required");
  map["barcodeDistance"] = constants.DEFAULT_BOT_WITH_RACK_THRESHOLD
  // check if mapJson is valid and add it to map. should first detect if single or multi floor
  if (detectSingleFloor(mapJson)) {
    validate("single_floor_map_json", mapJson);
    mapJson = [
      {
        floor_id: 1,
        map_values: mapJson,
      },
    ];
  } else {
    validate("map_json", mapJson);
  }

  if (!map.sectorBarcodeMapping) map.sectorBarcodeMapping = [];
  if (!map.sectorMxUPreferences) map.sectorMxUPreferences = {};
  if (!map.sectors) map.sectors = [];

  // convert coordinate to numbers before adding!
  map["floors"] = mapJson.map(({ floor_id, map_values }) => ({
    floor_id,
    map_values: map_values.map(({ coordinate, ...rest }) => ({
      ...rest,
      coordinate: parseCoordinateString(coordinate),
    })),
    chargers: [],
    fireEmergencies: [],
    odsExcludeds: [],
    ppses: [],
    sectors: [],
    dockPoints: [],
    sectorBarcodeMapping: [],
    sectorMxUPreferences: {},
  }));
  // assert that floors do not have barcodes with same coordinate
  var floors_barcodes = map.floors.map(({ map_values }) =>
    map_values.map((map_value) => map_value.coordinate)
  );
  var concated = [].concat(...floors_barcodes);
  var uniqueCoordinateSet = new Set(concated);
  if (uniqueCoordinateSet.size != concated.length)
    throw new Error(
      `Duplicate barcodes having same coordinate found in map.json, set size ${
        uniqueCoordinateSet.size
      }, num barcodes ${concated.length}`
    );
  // all map_values concated
  const allMapValues = [].concat(
    ...map.floors.map(({ map_values }) => map_values)
  );
  // validate zone_json separately, since we expect single array zone jsons also
  if (validate("single_array_zone_json", zoneJson, false)) {
    zoneJson = zoneJson[0];
  }
  validate("zone_json", zoneJson);
  // check elevator and zone jsons and queue data and add
  // zone and elevator already have ids
  [
    [elevatorJson, "elevator_json", "elevators", (e) => e, null],
    [
      zoneJson,
      "zone_json",
      "zones",
      (e) => e.data.map(({ zonerec }) => zonerec),
      null,
    ],
    [queueDataJson, "queue_data_json", "queueDatas", (e) => e, "queue_data_id"],
  ].forEach(([jsonFile, schemaName, key, convert, idField]) => {
    validate(schemaName, jsonFile);
    var elms = convert(jsonFile);
    // in case of queues also add coordinate for each queue thingy
    if (schemaName == "queue_data_json") {
      if (elms.length != 0) {
        /* eslint-disable no-console*/
        console.warn(
          "WARNING: queue_data.json has queues in it. Inconsistency might arise if two floors have same barcode strings"
        );
        /* eslint-enable no-console*/
      }
      elms = elms.map((elm, idx) => ({
        [idField]: idx + 1,
        data: elm,
        coordinates: elm.map(([barcode]) =>
          findCoordinateForBarcode(allMapValues, barcode)
        ),
      }));
    } else if (idField)
      elms = elms.map((elm, idx) => ({ ...elm, [idField]: idx + 1 }));
    map[key] = elms;
  });

  // map the rest of the jsons (charger, pps, ods_excluded, fire_emergency, dock_points) with
  // correct floor and then add to map
  // adding ids for each entry in map as it will be helpful when we normalize it in frontend
  // normalization is necessary for very large maps with lots of barcodes:
  // https://blog.lavrton.com/optimizing-react-redux-store-for-high-performance-updates-3ae6f7f1e4c1
  [
    [
      chargerJson,
      "charger_json",
      "chargers",
      (e) => e,
      "charger_location",
      "charger_id",
    ],
    [
      fireEmergencyJson,
      "fire_emergency_json",
      "fireEmergencies",
      (e) => e,
      "barcode",
      "fire_emergency_id",
    ],
    [
      odsExcludedJson,
      "ods_excluded_json",
      "odsExcludeds",
      (e) => e.ods_excluded_list,
      getOdsExcludedBarcode,
      "ods_excluded_id",
    ],
    [ppsJson, "pps_json", "ppses", (e) => e, "location", "pps_id"],
    // [sectorJson, "sector_json", "sectors", (e) => e, "sector_id"],
    // TODO: not tested dock_point jsons, should probably do that
    [
      dockPointJson,
      "dock_point_json",
      "dockPoints",
      (e) => e,
      "position",
      "dock_point_id",
    ],
  ].forEach(
    ([jsonFile, schemaName, key, convert, barcodeFindFnOrString, idField]) => {
      validate(schemaName, jsonFile);
      // go through list of things and find correct floor for them, and then add
      // to that floor
      var listOfThings = convert(jsonFile);
      listOfThings.forEach((thing, idx) => {
        var barcode =
          typeof barcodeFindFnOrString == "string"
            ? thing[barcodeFindFnOrString]
            : barcodeFindFnOrString(thing);

        var floorIdx = findFloorIndex(map.floors, barcode);
        if (floorIdx == -1)
          throw new Error(
            `Could not find floor for barcode ${barcode} referenced in ${schemaName}`
          );
        // assign coordinate to thing. this will be used throughout mapcreator to find its position instead of barcode
        thing.coordinate = findCoordinateForBarcode(
          map.floors[floorIdx].map_values,
          barcode
        );
        // pps, charger already have ids i think
        if (idField && !thing[idField]) thing[idField] = idx + 1;
        map.floors[floorIdx][key].push(thing);
      });
    }
  );

  [[sectorJson, "sector_json", "sectors", (e) => e, "sector_id"]].forEach(
    ([jsonFile, schemaName, key, convert, idField]) => {
      validate(schemaName, jsonFile);
      // go through list of things and find correct floor for them, and then add
      // to that floor
      var listOfThings = convert(jsonFile);
      // console.log("listOfThings" , Object.values(listOfThings) ,"type" ,typeof(Object.values(listOfThings)))
      for (const thing of Object.values(listOfThings)) {
        // console.log("thing" , thing , "type" , typeof(thing))
        Object.entries(thing).forEach(([sector_id, arr]) => {
          var obj = { sector_id: arr };
          if (arr !== undefined && arr.length !== 0) {
            var coordinate = arr[0]
              .split(" ")
              .toString()
              .replace("[", "")
              .replace("]", "");
            var floorIdx = findFloorbyCoordinate(map.floors, coordinate);
            if (floorIdx == -1)
              throw new Error(
                `Could not find floor for coordinate ${coordinate} referenced in ${schemaName} ${idField} ${sector_id}`
              );

            map.floors[floorIdx][key].push(obj);
          }
        });
        //
      }
    }
  );
  // TODO: should we run validation here also? it should definitely be done at server
  // side atleast when importing maps.
  return map;
};
