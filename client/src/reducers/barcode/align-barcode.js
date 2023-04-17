import { getNeighbouringBarcodesIncludingDisconnected } from "utils/util";
import {getTTPNeighbourBarcodeWorldCoord} from "actions/add-ttp-transit-barcode";
import {calculate_corner_world_cordinate} from "actions/actions";
import {tileToWorldCoordinate} from "utils/selectors/world-coordinate-utils-selectors";
import _ from "lodash";

const shiftNeighboursAndUpdateSizeinfo = (b1, b2, direction, shiftDistance) => {
  // b1 => direction => b2; b1 shifted by shiftDistance towards b2
  // assuming b1, b2 are already cloned objects
  var oppositeDirection = (direction + 2) % 4;
  var newTotalDistance =
    b1.size_info[direction] + b2.size_info[oppositeDirection] - shiftDistance;
  if (newTotalDistance <= 0) {
    throw new Error("Cannot shift that much; getting negative distances.");
  }
  var d1 = Math.floor(newTotalDistance / 2);
  var d2 = newTotalDistance - d1;
  b1.size_info[direction] = d1;
  b2.size_info[oppositeDirection] = d2;
};

const calculateWorldCordinateShiftBarcode = (barcode,distance,direction) => {
  const refBarcodeWorldCoord = {"x":JSON.parse(barcode["world_coordinate"])[0],
                                "y":JSON.parse(barcode["world_coordinate"])[1]};

  const barcodeWorldCoord = getTTPNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    distance,
    direction
  );
  barcode["world_coordinate"] = `[${barcodeWorldCoord["x"]},${barcodeWorldCoord["y"]}]`
  barcode["corner_world_cooordinate"] = calculate_corner_world_cordinate(barcode["size_info"],[barcodeWorldCoord["x"],barcodeWorldCoord["y"]])
};


const breakConnectionInDirection = (barcode, direction) => {
  barcode.neighbours[direction] = [0, 0, 0];
  if (barcode.adjacency) barcode.adjacency[direction] = null;
};

const updateAlignBarcodeWorldCoordinate = (barcode, direction, distance) => {
  var worldcoordinate = JSON.parse(barcode["world_coordinate"])
  if(direction==0){
    barcode.world_coordinate = `[${worldcoordinate[0]},${worldcoordinate[1] - distance}]`
  }
  if(direction==1){
    barcode.world_coordinate = `[${worldcoordinate[0] + distance},${worldcoordinate[1]}]`
  }
  if(direction==2){
    barcode.world_coordinate = `[${worldcoordinate[0]},${worldcoordinate[1] + distance}]`
  }
  if(direction==3){
    barcode.world_coordinate = `[${worldcoordinate[0] - distance},${worldcoordinate[1]}]`
  }
  // barcode.corner_world_cooordinate = calculate_corner_world_cordinate(barcode["size_info"],[worldcoordinate[0],worldcoordinate[1]])
};

const alignBarcode = (state, action) => {
  const { tileId, direction, distance } = action.value;

  var alignBarcode = Object.assign({}, state[tileId]);
  if (!alignBarcode) return state;
  var newState = {};
  var oppositeDirection = (direction + 2) % 4;
  alignBarcode.size_info[direction] = alignBarcode.size_info[direction] - distance
  alignBarcode.size_info[oppositeDirection] = alignBarcode.size_info[oppositeDirection] + distance
  updateAlignBarcodeWorldCoordinate(alignBarcode,direction,distance)
  newState[tileId] = alignBarcode;
  return { ...state, ...newState };
};

export {
  alignBarcode as default,
  shiftNeighboursAndUpdateSizeinfo,
  breakConnectionInDirection
};
