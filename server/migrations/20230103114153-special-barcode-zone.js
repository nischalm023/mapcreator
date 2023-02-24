"use strict";
// technically models should not be used in migrations since they are
// prone to change between source code changes, whereas migrations can be
// run independent from current source code.
// However in our case we will not really be changing the Map model much
// so its ok to use model definition in migration since we will only be
// modifying data and not the model description itself (hopefully)
import { Map } from "../models/index";
import { getNeighbouringBarcodes } from "../../client/src/utils/util";
import { normalizeMap } from "../../client/src/utils/normalizr";

module.exports = {
  up: () => {
    // DEPRECATED! Following method of iterating over maps and applying migration won't work
    // on large dbs. see rename-ods-to-ods-excluded migration for correct way of doing this.
    return Map.findAll().then(maps => {
      // DONT DO Promise.all! it gives OOM in docker container when theres ~700 maps
      // TODO: figure out more permanent solution so people don't make this mistake again
      return maps.reduce((previousPromise, map) => {
        return previousPromise.then(() => {
          const { map: mapObj } = map;
          // normalize map so barcodes can be accessed by keys. this will just be used
          // for easy access to barcodes instead of doing a linear search through array
          // each time
          var normalizedMap = normalizeMap(map);
          var barcodesDict = normalizedMap.entities.barcode;
          // iterate over all floors
          mapObj.floors.forEach(floor => {
            // iterate over map_values (barcodes) and find all special barcodes
            var specialBarcodes = floor.map_values.filter(
              barcode => barcode.special
            );
            // get the zone of their (2) neighbours. Just use the zone of the first one?
            specialBarcodes.forEach(specialBarcode => {
              // neighbour barcodes
              var neighbours = getNeighbouringBarcodes(
                specialBarcode.coordinate,
                barcodesDict
              );
              // just using first available neighbour
              var adjacentBarcode = neighbours.find(x => x != null);
              // set the zone equal to this adjacent's zone (only if it exists!)
              if (adjacentBarcode) specialBarcode.zone = adjacentBarcode.zone;
            });
          });
          return map.update({ map: mapObj });
        });
      }, Promise.resolve());
    });
  },

  down: () => {
    // not undoing since no need.
    return Promise.resolve();
  }
};
