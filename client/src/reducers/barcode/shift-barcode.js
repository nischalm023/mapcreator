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

const shiftBarcode = (state, action) => {
  const { tileId, direction, distance } = action.value;

  var shiftedBarcode = Object.assign({}, state[tileId]);
  if (!shiftedBarcode) return state;
  var nbBarcodes = _.cloneDeep(
    getNeighbouringBarcodesIncludingDisconnected(tileId, state)
  );
  var oppositeDirection = (direction + 2) % 4;
  var newState = {};
  if (nbBarcodes[direction]) {
    shiftNeighboursAndUpdateSizeinfo(
      shiftedBarcode,
      nbBarcodes[direction],
      direction,
      distance
    );
    var nbBarcodesWorldCordinate = JSON.parse(nbBarcodes[direction]["world_coordinate"])
    nbBarcodes[direction]["corner_world_cooordinate"]=calculate_corner_world_cordinate(nbBarcodes[direction]["size_info"],[nbBarcodesWorldCordinate[0],nbBarcodesWorldCordinate[1]])
  }
  if (nbBarcodes[oppositeDirection]) {
    shiftNeighboursAndUpdateSizeinfo(
      shiftedBarcode,
      nbBarcodes[oppositeDirection],
      oppositeDirection,
      -distance
    );
    var nbBarcodesWorldCordinate = JSON.parse(nbBarcodes[oppositeDirection]["world_coordinate"])
    nbBarcodes[oppositeDirection]["corner_world_cooordinate"]=calculate_corner_world_cordinate(nbBarcodes[oppositeDirection]["size_info"],[nbBarcodesWorldCordinate[0],nbBarcodesWorldCordinate[1]])
  }
  // break connectivity with perpendicular direction
  // doing this always since very hard to determine if barcodes are aligned
  // or not
  var perpDir1 = (direction + 1) % 4;
  var perpDir2 = (direction + 3) % 4;
  if (nbBarcodes[perpDir1]) {
    breakConnectionInDirection(nbBarcodes[perpDir1], perpDir2);
    breakConnectionInDirection(shiftedBarcode, perpDir1);
  }
  if (nbBarcodes[perpDir2]) {
    breakConnectionInDirection(nbBarcodes[perpDir2], perpDir1);
    breakConnectionInDirection(shiftedBarcode, perpDir2);
  }
  calculateWorldCordinateShiftBarcode(shiftedBarcode,distance,direction)

  nbBarcodes.filter(b => b).forEach(b => (newState[b.coordinate] = b));
  newState[tileId] = shiftedBarcode;
  return { ...state, ...newState };
};

export {
  shiftBarcode as default,
  shiftNeighboursAndUpdateSizeinfo,
  breakConnectionInDirection
};
