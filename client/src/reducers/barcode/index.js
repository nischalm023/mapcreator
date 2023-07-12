import { deleteNeighbourFromBarcode } from "utils/util";
import _ from "lodash";
import { addPPSQueue, addHighwayQueue } from "./queue-barcodes";
import { addElevator, editElevatorCoordinates } from "./elevator-barcodes";
import { editBarcode } from "./edit-barcode";
import { modifyDistanceBetweenBarcodes } from "./distance-between-barcodes";
import * as constants from "../../constants";
import {
  deleteChargerData,
  deletePPSQueue,
  deleteElevator,
} from "./delete-entities";
import { stringify_number,
        encode_barcode, 
        ConvertTTPFormatBarcodeIntoDefaultFormat, 
        getArbitraryOriginValue,
        calculateVdaBarcode,
        calculateVsdWorldCordinate
      } from "utils/util";
import shiftBarcode from "./shift-barcode";
import alignBarcode from "./align-barcode"
import { getNeighbouringBarcodesIncludingDisconnected } from "../../utils/util";

export default (state = {}, action) => {
  var newState = _.clone(state);
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      return addPPSQueue(state, action);

    case "ADD-QUEUE-BARCODES-TO-HIGHWAY":
      return addHighwayQueue(state, action);

    case "TOGGLE-STORABLE": {
      const { selectedTiles, makeStorable } = action.value;
      let newState = {};
      for (let tileId of selectedTiles) {
        newState[tileId] = { ...state[tileId], store_status: makeStorable };
      }
      return Object.assign({}, state, newState);
    }
    case "SHOW-PATH": {
      const { path, showPath } = action.value;

      let newState = {};
      var i = 0;

      while (i < path.length) {
        newState[path[i]] = { ...state[path[i]], path_status: showPath[i] };
        i++;
      }

      return Object.assign({}, state, newState);
    }
    case "MISALIGNED": {
      const { misaligned_node, node_status } = action.value;
      let newState = {};
      var j = 0;
      while (j < misaligned_node.length) {
        newState[misaligned_node[j]] = {
          ...state[misaligned_node[j]],
          node_status: node_status,
        };
        j++;
      }

      return Object.assign({}, state, newState);
    }
    case "HIGHLIGHT": {
      const { highlight, highlight_status } = action.value;

      let newState = {};
      var k = 0;

      while (k < highlight.length) {
        newState[highlight[k]] = { ...state[highlight[k]], highlight_status: highlight_status};
        k++;
      }

      return Object.assign({}, state, newState);
    }
    case "IO-POINT-HIGHLIGHT": {
      const { barcode } = action.value;
      const conveyor_tile = [barcode.split(',').map(Number)];
      let newState = {};
      var k = 0;

      while (k < conveyor_tile.length) {
        newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], isIoPoint: true};
        k++;
      }
      return Object.assign({}, state, newState);
    }
    case "HIGHLIGHT-SUCCESS-OVERLAP-BAROCDE": {
      const success_overlap_barcode = action.value[Object.keys(action.value)[0]] 
      const success_overlap_barcode_status = action.value[Object.keys(action.value)[1]] 
      let newState = {};
      var k = 0;

      while (k < success_overlap_barcode.length) {
        newState[success_overlap_barcode[k]] = { ...state[success_overlap_barcode[k]], success_overlap_barcode_status: success_overlap_barcode_status};
        k++;
      }
      return Object.assign({}, state, newState);
    }
    case "IO-POINT-REMOVE-HIGHLIGHT": {
      const { barcode } = action.value;
      const conveyor_tile = [barcode.split(',').map(Number)];
      let newState = { ...state };
      var k = 0;

      while (k < conveyor_tile.length) {
        if (newState[conveyor_tile[k]]) {
          newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], isIoPoint: false};
          delete newState[conveyor_tile[k]].isIoPoint;
        }
        k++;
      }
      return Object.assign({}, state, newState);
    }

    case "REMOVE-CONVEYOR-EXIT-IO-POINT-STRIPES": {
      const { conveyor_io_exit_point } = action.value;
      const conveyor_tile = (JSON.parse(conveyor_io_exit_point)).toString()
      let newState = { ...state };
      var k = 0;
      if (newState[conveyor_tile]) {
          newState[conveyor_tile] = { ...state[conveyor_tile], conveyorExitIO: false};
          delete newState[conveyor_tile].conveyorExitIO;
      }
      return Object.assign({}, state, newState);
    }
    case "REMOVE-CONVEYOR-ENTRY-IO-POINT-STRIPES": {
      const { conveyor_io_entry_point } = action.value;
      const conveyor_tile = (JSON.parse(conveyor_io_entry_point)).toString()
      let newState = { ...state };
      var k = 0;
      if (newState[conveyor_tile]) {
          newState[conveyor_tile] = { ...state[conveyor_tile], conveyorEntryIO: false};
          delete newState[conveyor_tile].conveyorEntryIO;
      }
      return Object.assign({}, state, newState);
    }

    case "HIGHLIGHT-UNSUCCESS-OVERLAP-BAROCDE": {
      const unsuccess_overlap_barcode = action.value[Object.keys(action.value)[0]] 
      const unsuccess_overlap_barcode_status = action.value[Object.keys(action.value)[1]] 
      let newState = {};
      var k = 0;

      while (k < unsuccess_overlap_barcode.length) {
        newState[unsuccess_overlap_barcode[k]] = { ...state[unsuccess_overlap_barcode[k]], unsuccess_overlap_barcode_status: unsuccess_overlap_barcode_status};
        k++;
      }
      return Object.assign({}, state, newState);
    }
    case "CONVEYOR-TILES-STRIPES": {
      const conveyor_tile = action.value[Object.keys(action.value)[0]] 
      const grid_attribute = action.value[Object.keys(action.value)[1]] 
      let newState = {};
      var k = 0;

      while (k < conveyor_tile.length) {
        newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], grid_attribute: grid_attribute};
        k++;
      }
      return Object.assign({}, state, newState);
    }
    case "CONVEYOR-TILES-ENTRY-IO-POINT-STRIPES": {
      const conveyor_tile = action.value[Object.keys(action.value)[0]] 
      const grid_attribute = action.value[Object.keys(action.value)[1]] 
      let newState = {};
      var k = 0;

      while (k < conveyor_tile.length) {
        newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], conveyorEntryIO: grid_attribute};
        k++;
      }
      return Object.assign({}, state, newState);
    }

    case "CONVEYOR-TILES-EXIT-IO-POINT-STRIPES": {
      const conveyor_tile = action.value[Object.keys(action.value)[0]] 
      const grid_attribute = action.value[Object.keys(action.value)[1]] 
      let newState = {};
      var k = 0;

      while (k < conveyor_tile.length) {
        newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], conveyorExitIO: grid_attribute};
        k++;
      }
      return Object.assign({}, state, newState);
    }

    case "HIGHLIGHT-SELECTED-REMOVED-CONVEYOR":{
      const { conveyor_tile, remove_conveyor_tile } = action.value;

      let newState = {};
      var k = 0;

      while (k < conveyor_tile.length) {
        newState[conveyor_tile[k]] = { ...state[conveyor_tile[k]], remove_conveyor_tile: remove_conveyor_tile};
        k++;
      }
      return Object.assign({}, state, newState);

    }
    case "DELETE-BARCODES": {
      // iterate over all barcodes and just see if their neighbours exist. if not, make the edge [0,0,0]
      let newState = {};
      var tileIdMap = action.value;
      for (let key of Object.keys(tileIdMap)) {
        if (state[key]) {
          var neighbours = getNeighbouringBarcodesIncludingDisconnected(
            key,
            state
          );
          for (const [idx, nb] of neighbours.entries()) {
            if (nb && !tileIdMap[nb.coordinate]) {
              // its a valid neighbour of the deleted barcode that itself won't be deleted
              if (!newState[nb.coordinate])
                newState[nb.coordinate] = state[nb.coordinate];
              newState[nb.coordinate] = deleteNeighbourFromBarcode(
                newState[nb.coordinate],
                (idx + 2) % 4,
                false
              );
            }
          }
        }
      }
      return { ..._.omit(state, Object.keys(tileIdMap)), ...newState };
    }

    case "MODIFY-DISTANCE-BETWEEN-BARCODES":
      return modifyDistanceBetweenBarcodes(state, action);

    case "MODIFY-BARCODE-NEIGHBOURS": {
      let { tileId, values } = action.value;
      if (!state[tileId]) return state;
      var newBarcode = _.cloneDeep(state[tileId]);
      ["top", "right", "bottom", "left"].forEach((key, idx) => {
        var matches = values[key].neighbours.match(/(\d),(\d),(\d)/);
        newBarcode.neighbours[idx] = [
          parseInt(matches[1]),
          parseInt(matches[2]),
          parseInt(matches[3]),
        ];
        newBarcode.size_info[idx] = parseInt(values[key].sizeInfo);
      });
      return { ...state, [tileId]: newBarcode };
    }

    case "MODIFY-MULTI-BARCODE-NEIGHBOURS": {
      let { mapTiles, values } = action.value;
      let newState = {};
      Object.keys(mapTiles).forEach((tileId) => {
        var newBarcode = _.cloneDeep(state[tileId]);
        var matches = values.neighbours.match(/(\d),(\d),(\d)/);
        newBarcode.neighbours[values.pick_direction] = [
          parseInt(matches[1]),
          parseInt(matches[2]),
          parseInt(matches[3]),
        ];
        newState[tileId] = {
          ...state[tileId],
          neighbours: newBarcode.neighbours,
        };
      });
      return Object.assign({}, state, newState);
    }

    case "ADD-FLOOR": {
      const { map_values } = action.value;
      const keys = map_values.map((barcode) => barcode.coordinate);
      const newBarcodesObj = _.fromPairs(_.zip(keys, map_values));
      return { ...state, ...newBarcodesObj };
    }

    case "CHANGE-BARCODE-FORMAT-ON-BASIS-OF-MODE": {
      const { barcode_value, barcodesDict,barcodeOffset} = action.value;
      var newBarcodeDict = {}
      if(barcode_value===constants.DEFAULT_BARCODE_FORMAT){
        Object.entries(barcodesDict).forEach(([key, value]) => {
          if(value.hasOwnProperty("default_barcode") && /^(\d+\.\d+)$/.test(value["default_barcode"])){
            value["barcode"] = value["default_barcode"]
          }else{
            var new_barcode = ConvertTTPFormatBarcodeIntoDefaultFormat(key,value)
            value["barcode"] = new_barcode
          }
          newBarcodeDict[key] = value
        })
        return { ...state, ...newBarcodeDict}
      }else{
        var offset_value = getArbitraryOriginValue(barcodesDict)
        for (var barcode in barcodesDict){
            var barcodeInfo = barcodesDict[barcode]
            var GM_barcode = calculateVdaBarcode(JSON.parse(barcodeInfo["world_coordinate"]),offset_value,JSON.parse(barcodeOffset))
            var vsd_world_coordinate = calculateVsdWorldCordinate(JSON.parse(barcodeInfo["world_coordinate"]),offset_value,JSON.parse(barcodeOffset))
            barcodeInfo["barcode"] = GM_barcode
            barcodeInfo["vda_world_coordinate"] = vsd_world_coordinate
            newBarcodeDict[barcode] = barcodeInfo
        }
        return { ...state, ...newBarcodeDict}
      }
      }
    case "ASSIGN-ZONE": {
      const { zone_id, mapTiles } = action.value;
      let newState = {};
      Object.keys(mapTiles).forEach(
        (key) => (newState[key] = { ...state[key], zone: zone_id })
      );
      return { ...state, ...newState };
    }

    case "ASSIGN-SECTOR": {
      const { sector_id, mapTiles } = action.value;
      let newState = {};
      Object.keys(mapTiles).forEach(
        (key) =>
          (newState[key] = { ...state[key], sector: parseInt(sector_id) })
      );
      return { ...state, ...newState };
    }
    case "MANAGE-OVERLAP-BAROCDE":{
      let newState = action.value
      return { ...state, ...newState };
    }
    case "VIEW-OVERLAP-BAROCDES":{
      let newState = action.value
      return { ...state, ...newState };
    }
    case "ADD-ELEVATOR":
      return addElevator(state, action);

    case "EDIT-ELEVATOR-COORDINATES":
      return editElevatorCoordinates(state, action);

    case "EDIT-BARCODE":
      return editBarcode(state, action);

    case "DELETE-CHARGER-DATA":
      return deleteChargerData(state, action);

    case "DELETE-PPS-QUEUE":
      return deletePPSQueue(state, action);

    case "DELETE-ELEVATOR":
      return deleteElevator(state, action);

    case "SHIFT-BARCODE":
      return shiftBarcode(state, action);
    case "ALIGN-BARCODE":
      return alignBarcode(state, action);
  }
  return state;
};
