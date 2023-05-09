// exports mapcreator's represention of map (map.json schema) to multiple output
// json files (map.json, pps.json, fire_emergency.json etc.)
import { denormalizeMap } from "utils/normalizr";
import conveyor_json from "common/utils/conveyor_json";
import toteStorage_json from "common/utils/tote_storage_json";

export default (withWorldCoordinate, singleFloor = false) => {
  if(Object.keys(withWorldCoordinate.entities.conveyorTile).length > 0){
    var conveyorJson = conveyor_json(withWorldCoordinate);
    withWorldCoordinate.entities.DownloadconveyorTile = conveyorJson
  }
  var toteStorageJson = toteStorage_json(withWorldCoordinate);
  withWorldCoordinate.entities.DownloadToteStorage = toteStorageJson
  var mapObj = denormalizeMap(withWorldCoordinate);
  var map = mapObj.map;
  var ret = {};
  ret.elevator = map.elevators;
  ret.conveyor = withWorldCoordinate.entities.DownloadconveyorTile;
  ret.tote_storage = withWorldCoordinate.entities.DownloadToteStorage;
  ret.zone = {
    header: {
      "content-type": "application/json",
      accept: "application/json",
    },
    type: "POST",
    data: map.zones.map((zone) => ({ zonerec: zone })),
    url: "/api/zonerec",
  };
  ret.sector = map.sectors,
  ret.queue_data = map.queueDatas.map(({ data }) => data);
  ret.sectorBarcodeMapping = [
    withWorldCoordinate.entities.sectorBarcodeMapping,
  ];
  ret.sectorMxUPreferences = withWorldCoordinate.entities.sectorMxUPreferences;

  ret.map = map.floors.map(({ floor_id, map_values }) => ({
    floor_id,
    map_values:map_values.map((barcode) => {
        delete barcode.corner_world_cooordinate
        delete barcode.default_barcode
        if (barcode.conveyor_selected_status !== undefined){
            delete barcode.conveyor_selected_status
        }
        if (barcode.remove_conveyor_tile !== undefined){
            delete barcode.remove_conveyor_tile
        }
        if (barcode.grid_attribute !== undefined && barcode.grid_attribute === 0){
            delete barcode.grid_attribute
        }
        return barcode
    }),
  }));

  ret.map = map.floors.map(({ floor_id, map_values }) => {
    var barcode_val = map_values[0]["barcode"]
    if(/^(\d{10})$/.test(barcode_val)){
      var vda_data = ""
      for(var i = 0; i < map_values.length; i++) {
        if(map_values[i].world_coordinate_reference_neighbour=="0,0"){
          var vda_data = {"barcode":map_values[i]["barcode"],"vda5050_coordinate":map_values[i]["vda_world_coordinate"]}
          break
        }
      }
      if(vda_data ===""){
        var vda_data = {"barcode":barcode_val,"vda5050_coordinate":map_values[0]["vda_world_coordinate"]}
      }
      return({
        floor_id,
        map_values:map_values.map(({ coordinate, ...rest }) => ({
      ...rest,
      coordinate: `[${coordinate}]`,
    })),
        vda5050_reference:vda_data
      })
    }else{
      return({
        floor_id,
        map_values: map_values.map(({ coordinate, ...rest }) => ({
        ...rest,
        coordinate: `[${coordinate}]`,
        })),
      })
    }
  })

  // make single floor if required
  if (singleFloor) {
    ret.map = ret.map[0];
  }
  // merge things from all floors into respective files
  // don't forget dock_point.json and queue_data.json even though not used
  // charger and pps need to have id attached
  [
    ["charger", "chargers", (e) => e, null],
    ["pps", "ppses", (e) => e, null],
    ["fire_emergency", "fireEmergencies", (e) => e, "fire_emergency_id"],
    [
      "ods_excluded",
      "odsExcludeds",
      (e) => ({ ods_excluded_list: e }),
      "ods_excluded_id",
    ],
    ["dock_point", "dockPoints", (e) => e, "dock_field"],
  ].forEach(([outKey, floorKey, convert, idFieldNotRequired]) => {
    // start with empty list
    var list = [];
    // destructuring with variable name very cool
    map.floors.forEach(({ [floorKey]: things }) => {
      // add to the list
      // we already have id present for each thing. remove it if it's not supposed
      // to be present in output json files
      if (idFieldNotRequired) {
        things = things.map((thing) => {
          delete thing[idFieldNotRequired];
          return thing;
        });
      }
      // remove 'coordinate' field which was just used internally for mapcreator for indexing.
      things = things.map((thing) => {
        delete thing.coordinate;
        return thing;
      });
      list = [...list, ...things];
    });
    ret[outKey] = convert(list);
  });
  return ret;
};
