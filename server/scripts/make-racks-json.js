/* eslint-disable */
import { Map } from "server/models/index";
var fs = require("fs");

var getRacksJson = async (id, racktype = "11") => {
  if (!id) {
    return;
  }
  var map = await Map.findByPk(id);
  if (!map) {
    return;
  }
  const { map: mapObj } = map;
  // assuming single floor
  var racks = mapObj.floors[0].map_values
    .filter(barcode => barcode.store_status)
    .map((barcode, idx) => ({
      position: barcode.barcode,
      direction: 0,
      last_store_position: barcode.barcode,
      id: ("000" + (idx + 1)).slice(-3),
      racktype,
      reserved_store_position: "undefined",
      is_stored: true,
      lifted_butler_id: null
    }));
  return racks;
};
if (require.main === module) {
  getRacksJson(process.argv[2], process.argv[4]).then(racks => {
    if (!process.argv[3]) {
      console.log("Need file name.");
      return;
    }
    fs.writeFileSync(process.argv[3], JSON.stringify(racks, 2), "utf8");
    console.log("Done.");
  });
}

export default getRacksJson;
