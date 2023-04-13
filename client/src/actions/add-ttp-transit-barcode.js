import {
  getNeighbouringBarcodesWithNbFilter,
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey,
  getNeighbourBarcodeIncludingDisconnectedInDirection
} from "utils/util";
import {
  getBarcodes,
  getTileIdHavingWorldCoordinate,
  getExistingBarcodesAndCoordinates,
  tileToWorldCoordinate,
  getNewCoordinate
} from "utils/selectors";
import _ from "lodash";
import {calculate_corner_world_cordinate} from "./actions";
// TODO: correct place for this function
export const isValidNewBarcode = (barcode, state) => {
  const existingBarcodesAndCoordinates = getExistingBarcodesAndCoordinates(
    state
  );
  const existingBarcodes = existingBarcodesAndCoordinates.barcodes;
  if (existingBarcodes.hasOwnProperty(barcode)) {
    return false;
  } else {
    return true;
  }
};

export const validateTransitBarcodeForm = (formData, state) => {
  const { tileId, newBarcode, direction, distance } = formData;
  const barcodes = getBarcodes(state);
  if (isValidNewBarcode(newBarcode, state)) {
    const refBarcodeInfo = barcodes[tileId];
    if (refBarcodeInfo.size_info[direction] * 2 > distance) {
      const nTileId = getNeighbourBarcodeIncludingDisconnectedInDirection(
        tileId,
        barcodes,
        direction
      );
      if (nTileId != null) {
        return true;
      }
      return {
        error: `Cannot Add transit barcode in direction: ${direction} of coordinate: ${tileId}`
      };
    }
    return {
      error: `Transit barcode will overlap with existing barcode in direction: ${direction}`
    };
  }
  return { error: `Barcode:  ${newBarcode} already exists in map` };
};

const getTransitCoordinate = state => {
  const coordinate = getNewCoordinate(state);
  return tupleOfIntegersToCoordinateKey(coordinate);
};

// TODO: Can merge both getWorldCoordUsingNeighbour from world-coordinate-utils-selectors
export const getTTPNeighbourBarcodeWorldCoord = (
  refBarcodeWorldCoord,
  distance,
  direction
) => {
  const barcodeWorldCoord = { x: 0, y: 0 };
  switch (true) {
    case direction == 0:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y - distance;
      return barcodeWorldCoord;
    case direction == 1:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x + distance;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y;
      return barcodeWorldCoord;
    case direction == 2:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y + distance;
      return barcodeWorldCoord;
    case direction == 3:
      barcodeWorldCoord.x = refBarcodeWorldCoord.x - distance;
      barcodeWorldCoord.y = refBarcodeWorldCoord.y;
      return barcodeWorldCoord;
    default:
      throw new Error("Wrong direction in input");
  }
};

const getUpdatedBarcodeInfo = (
  barcodeInfo,
  direction,
  size,
  transitCoordinate,
  neighbours,
  refDirection
) => {
  const oppositeDirection = getOppositDirection(direction);
  const oppositeRefDirection = getOppositDirection(refDirection);
  var currentNeighbourStructure = barcodeInfo.neighbours;
  barcodeInfo.size_info[oppositeDirection] = size;
  // Adjacency update,
  var barcodeInfoWorldCoord = JSON.parse(barcodeInfo["world_coordinate"])
  barcodeInfo["corner_world_cooordinate"] = calculate_corner_world_cordinate(barcodeInfo["size_info"],barcodeInfoWorldCoord)
  const adjacency = [null, null, null, null];
  for (var neighbourDir in neighbours) {
    if (neighbourDir == oppositeDirection) {
      adjacency[neighbourDir] = coordinateKeyToTupleOfIntegers(
        transitCoordinate
      );
        currentNeighbourStructure[neighbourDir] = [1, 1, 1];
    } else {
      const nBarcodeInfo = neighbours[neighbourDir];
      if (nBarcodeInfo != null) {
        adjacency[neighbourDir] = coordinateKeyToTupleOfIntegers(
          nBarcodeInfo.coordinate
        );
      }
    }
  }
  barcodeInfo.adjacency = adjacency;
  return barcodeInfo;
};

const getOppositDirection = dir => {
  return (dir + 2) % 4;
};

export const getUpdatedBarcodes = (
  transitBarcodeInfo,
  newState,
  refDirection
) => {
  const updatedBarcodes = [];
  for (var dir = 0; dir < 4; dir++) {
    const neighbourIndir = transitBarcodeInfo.adjacency[dir];
    if (neighbourIndir != null) {
      const neighbourIndirTileId = tupleOfIntegersToCoordinateKey(
        neighbourIndir
      );
      var get_diretion = getOppositDirection(dir)
      const barcodeInfo = newState[neighbourIndirTileId];

      const neighbours = getNeighbouringBarcodesWithNbFilter(
        neighbourIndirTileId,
        newState,
        [[0,0,0]]
      );
      const size = transitBarcodeInfo.size_info[dir];
      const updatedBarcodeInfo = getUpdatedBarcodeInfo(
        barcodeInfo,
        dir,
        size,
        transitBarcodeInfo.coordinate,
        neighbours,
        refDirection
      );
      updatedBarcodes.push(updatedBarcodeInfo);
    }
  }
  return updatedBarcodes;
};

const axis = (value) => {
    var opposite = null;
    switch(value){
      case "x":
        opposite = 0;
        break;
      case "y":
        opposite = 1;
        break;
    }
    return opposite;
}

const overlap_vertical_north_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {

    if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]>transit_corner_coordinate1[axis("x")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_north_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]<transit_corner_coordinate1[axis("x")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_south_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]>transit_corner_coordinate1[axis("x")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_south_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]<transit_corner_coordinate1[axis("x")]){
           return true;
        }
    }
    return false;
}

const overlap_horizontal_north_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]<transit_corner_coordinate1[axis("y")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_north_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]<transit_corner_coordinate1[axis("y")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_south_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]>transit_corner_coordinate1[axis("y")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_south_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")] > transit_corner_coordinate1[axis("y")]){
         return true;
      }
  }
  return false;
}

const corner_direction_mapping = (value) => {
  var opposite = null;
  switch(value){
      case "ne":
          opposite = 0;
          break;
      case "se":
          opposite = 1;
          break;
      case "sw":
          opposite = 2;
          break;
      case "nw":
          opposite = 3;
      break;
  }
  return opposite;
}

const direction_mapping = (value) => {
  var opposite = null;
  switch(value){
    case "top":
        opposite = 0;
        break;
    case "right":
        opposite = 1;
        break;
    case "bottom":
        opposite = 2;
        break;
    case "left":
        opposite = 3;
    break;
  }
  return opposite;
}

const AdjustBottomTransitPosition = (gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
   for (const [key, value] of Object.entries(gridView)) {
      if(overlap_vertical_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("sw")])){
          value['size_info'][direction_mapping("left")] = transit_size_info[direction_mapping("right")]
          var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
          value['corner_world_cooordinate'] = corner_coordinate
          transit_corner_world_coordinate[corner_direction_mapping("se")]=corner_coordinate[corner_direction_mapping("sw")]
          transit_size_info[direction] =  corner_coordinate[corner_direction_mapping("sw")][1]- transit_world_cordinate[1]

        }
        if(overlap_vertical_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("se")])){
          value['size_info'][direction_mapping("right")] =  transit_size_info[direction_mapping("left")]
          var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
          value['corner_world_cooordinate'] = corner_coordinate
          transit_corner_world_coordinate[corner_direction_mapping("sw")]=corner_coordinate[corner_direction_mapping("se")]
          transit_size_info[direction] = corner_coordinate[corner_direction_mapping("se")][1] -  transit_world_cordinate[1]
        }
    }
}

const AdjustTopTransitPosition = (gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
   for (const [key, value] of Object.entries(gridView)) {
      if(overlap_vertical_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("nw")])){
          value['size_info'][direction_mapping("left")] = transit_size_info[direction_mapping("right")]
          var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
          value['corner_world_cooordinate'] = corner_coordinate
          transit_corner_world_coordinate[corner_direction_mapping("ne")]=corner_coordinate[corner_direction_mapping("nw")]
          transit_size_info[direction] =  transit_world_cordinate[1]- corner_coordinate[corner_direction_mapping("nw")][1]
        }
        if(overlap_vertical_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("ne")])){
          value['size_info'][direction_mapping("right")] =  transit_size_info[direction_mapping("left")]
          var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
          value['corner_world_cooordinate'] = corner_coordinate
          transit_corner_world_coordinate[corner_direction_mapping("nw")]=corner_coordinate[corner_direction_mapping("ne")]
          transit_size_info[direction] =  transit_world_cordinate[1]- corner_coordinate[corner_direction_mapping("ne")][1]
        }
    }
}

const AdjustRightTransitPosition = (gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
   for (const [key, value] of Object.entries(gridView)) {
    if(overlap_horizontal_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")],
    transit_corner_world_coordinate[corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("se")])){
      value['size_info'][direction_mapping("bottom")] = transit_size_info[direction_mapping("top")]
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
      transit_corner_world_coordinate[corner_direction_mapping("ne")]=corner_coordinate[corner_direction_mapping("se")]
      transit_size_info[direction] =  corner_coordinate[corner_direction_mapping("se")][0] - transit_world_cordinate[0]
    }
    if(overlap_horizontal_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],
    transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("ne")])){
      value['size_info'][direction_mapping("top")] =  transit_size_info[direction_mapping("bottom")]
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
      transit_corner_world_coordinate[corner_direction_mapping("se")]=corner_coordinate[corner_direction_mapping("ne")]
      transit_size_info[direction] =  corner_coordinate[corner_direction_mapping("ne")][0] - transit_world_cordinate[0]
    }
  }
}

 const AdjustLeftTransitPosition = (gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
    for (const [key, value] of Object.entries(gridView)) {
      if(overlap_horizontal_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")],
      transit_corner_world_coordinate[corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("sw")])){
        value['size_info'][direction_mapping("bottom")] =  transit_size_info[direction_mapping("top")]
        var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
        value['corner_world_cooordinate'] = corner_coordinate
        transit_corner_world_coordinate[corner_direction_mapping("nw")]=corner_coordinate[corner_direction_mapping("sw")]
        transit_size_info[direction] =  transit_world_cordinate[0] - corner_coordinate[corner_direction_mapping("sw")][0]
      }
      if(overlap_horizontal_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],
       transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("nw")])){
           value['size_info'][direction_mapping("top")] = transit_size_info[direction_mapping("bottom")]
           var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
           value['corner_world_cooordinate'] = corner_coordinate
           transit_corner_world_coordinate[corner_direction_mapping("sw")]=corner_coordinate[corner_direction_mapping("nw")]
           transit_size_info[direction] =  transit_world_cordinate[0] - corner_coordinate[corner_direction_mapping("nw")][0]
      }   
    }
 }

const getTransitBarcodeInfo = (state, formData) => {
  const { tileId, newBarcode, direction, distance } = formData;
  const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId });
  const barcodes = getBarcodes(state);
  const refBarcodeInfo = barcodes[tileId];
  const oldNeighbour = getNeighbourBarcodeIncludingDisconnectedInDirection(
    tileId,
    barcodes,
    direction
  ); // Of ref barcode
  const transitBarcodeWorldCoord = getTTPNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    distance,
    direction
  );
  const transitBarcodeCoordinate = getTransitCoordinate(state);

  const transitBarcodeWorldCoordinate = `[${transitBarcodeWorldCoord["x"]},${transitBarcodeWorldCoord["y"]}]`
  // SizeInfo
  const sizeInfo = _.cloneDeep(refBarcodeInfo.size_info);
  const nTileId = getNeighbourBarcodeIncludingDisconnectedInDirection(
        tileId,
        barcodes,
        direction
      );
  if (nTileId == null) {
    sizeInfo[(direction + 2) % 4] = distance / 2; 
  }else{
    sizeInfo[direction] =
      (2 * refBarcodeInfo.size_info[direction] - distance) / 2;
    sizeInfo[(direction + 2) % 4] = distance / 2;
  }
  var cornerWorldCooordinate = calculate_corner_world_cordinate(sizeInfo,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
  // Adjacency and Neighbour structure

  if(direction == 0){
    var barcodes_info = AdjustTopTransitPosition(barcodes,cornerWorldCooordinate,sizeInfo,direction,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
   }
  if(direction == 1){
    // var barcodes_info = barcodes
    var barcodes_info = AdjustRightTransitPosition(barcodes,cornerWorldCooordinate,sizeInfo,direction,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
   }
  if(direction == 2){
    var barcodes_info = AdjustBottomTransitPosition(barcodes,cornerWorldCooordinate,sizeInfo,direction,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
   }
  if(direction == 3){
    // var barcodes_info = barcodes
    var barcodes_info = AdjustLeftTransitPosition(barcodes,cornerWorldCooordinate,sizeInfo,direction,[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
   }
  const adjacency = [null, null, null, null];
  const nStructure = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (var dir = 0; dir < 4; dir++) {
    const nWorldCoord = getTTPNeighbourBarcodeWorldCoord(
      transitBarcodeWorldCoord,
      2 * sizeInfo[dir],
      dir
    );
    const nTileIdWC = getTileIdHavingWorldCoordinate(state, nWorldCoord);
    if (nTileIdWC != undefined) {
      adjacency[dir] = coordinateKeyToTupleOfIntegers(nTileIdWC);
      if (dir != getOppositDirection(direction)) {
        nStructure[dir] = refBarcodeInfo.neighbours[dir];
      }
      else if(dir == getOppositDirection(direction) && oldNeighbour===null){
        nStructure[dir] = [1, 1, 1]
        refBarcodeInfo.neighbours[direction]=[1, 1, 1]
      }
      else {
        nStructure[dir] = oldNeighbour.neighbours[dir];
      }
    }
  }
  var unit = {
    store_status: 0,
    zone: refBarcodeInfo.zone,
    barcode: newBarcode,
    botid: "null",
    neighbours: nStructure,
    coordinate: transitBarcodeCoordinate,
    blocked: false,
    size_info: sizeInfo,
    adjacency: adjacency,
    world_coordinate:transitBarcodeWorldCoordinate,
    world_coordinate_reference_neighbour:tileId,
    corner_world_cooordinate: cornerWorldCooordinate
  };
  return unit;
};

// Barcode Exists: B_1-9, Barcode Doesn't Exists: N0, Transit Barcode: TB
// case 1:
//    B3   N0   B4
//    B1   TB   B2
//    B5   N0   B6
// case 2:
//    B3   B7   B4
//    B1   TB   B2
//    B5   N0   B6
// case 2:
//    B3   N0   B4
//    B1   TB   B2
//    B5   B8   B6
// case 3:
//    B3   B7   B4
//    B1   TB   B2
//    B5   B8   B6

// B1,B7,B2,B8 will be modified and TB will be added
export const getUpdatedAndTTPTransitBarcodes = (state, formData) => {
  const barcodes = getBarcodes(state);
  const newState = _.cloneDeep(barcodes);
  var { direction } = formData;
  var transitBarcodeInfo = getTransitBarcodeInfo(state, formData);
  const updatedBarcodes = getUpdatedBarcodes(
    transitBarcodeInfo,
    newState,
    direction
  );
  return [updatedBarcodes, transitBarcodeInfo];
};
