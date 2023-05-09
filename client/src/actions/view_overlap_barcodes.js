import {
  getNeighbouringBarcodesWithNbFilter,
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey,
  getNeighbourBarcodeIncludingDisconnectedInDirection,
  getBarcodeOffsetAndFormat,
  setCoexistenceBarcodeLabel
} from "utils/util";
import {
  getBarcodes,
  getTileIdHavingWorldCoordinate,
  getExistingBarcodesAndCoordinates,
  tileToWorldCoordinate,
  getNewCoordinate
} from "utils/selectors";
import _ from "lodash";
import {DEFAULT_BARCODE_FORMAT,TTP_BARCODE_FORMAT } from "../constants";
import {calculate_corner_world_cordinate,clearTiles} from "./actions";
import {StringtoListFormat} from "./conveyor";


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

const overlap_vertical_north_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {

    if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]>=transit_corner_coordinate1[axis("x")] && ref_corner_coordinate1[axis("y")] <= transit_corner_coordinate[axis("y")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_north_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]<=transit_corner_coordinate1[axis("x")] && ref_corner_coordinate1[axis("y")] <= transit_corner_coordinate[axis("y")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_south_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]>=transit_corner_coordinate1[axis("x")] && ref_corner_coordinate1[axis("y")] >= transit_corner_coordinate[axis("y")]){
           return true;
        }
    }
    return false;
}

const overlap_vertical_south_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
    if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
        if(ref_corner_coordinate[axis("x")]<=transit_corner_coordinate1[axis("x")] && ref_corner_coordinate1[axis("y")] >= transit_corner_coordinate[axis("y")]){
           return true;
        }
    }
    return false;
}

const overlap_horizontal_north_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]<=transit_corner_coordinate1[axis("y")] && ref_corner_coordinate1[axis("x")] >= transit_corner_coordinate[axis("x")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_north_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] > transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]<=transit_corner_coordinate1[axis("y")] && ref_corner_coordinate1[axis("x")] <= transit_corner_coordinate[axis("x")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_south_west = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] >  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")]>=transit_corner_coordinate1[axis("y")] && ref_corner_coordinate1[axis("x")] <= transit_corner_coordinate[axis("x")]){
         return true;
      }
  }
  return false;
}

const overlap_horizontal_south_east = (ref_corner_coordinate,transit_corner_coordinate,transit_corner_coordinate1,ref_corner_coordinate1) => {
  if(ref_corner_coordinate[axis("x")] <  transit_corner_coordinate[axis("x")] && ref_corner_coordinate[axis("y")] < transit_corner_coordinate[axis("y")]){
      if(ref_corner_coordinate[axis("y")] >= transit_corner_coordinate1[axis("y")] && ref_corner_coordinate1[axis("x")] >= transit_corner_coordinate[axis("x")]){
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

const AdjustBottomTransitPosition1 = (success_overlap_barcode,unsuccess_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_vertical_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("sw")],value['corner_world_cooordinate'][corner_direction_mapping("sw")])){
              success_overlap_barcode.push(key)
        }
        if(overlap_vertical_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("se")],value['corner_world_cooordinate'][corner_direction_mapping("se")])){
              success_overlap_barcode.push(key)
        }
      }
    }
    return [success_overlap_barcode,unsuccess_overlap_barcode,gridView]
}

const AdjustRightTransitPosition1 = (success_overlap_barcode,unsuccess_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_horizontal_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")],
          transit_corner_world_coordinate[corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("se")],value['corner_world_cooordinate'][corner_direction_mapping("se")])){
            success_overlap_barcode.push(key)
          }
          if(overlap_horizontal_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],
          transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("ne")],value['corner_world_cooordinate'][corner_direction_mapping("ne")])){
            success_overlap_barcode.push(key)
          }
      }

  }
  return [success_overlap_barcode,unsuccess_overlap_barcode,gridView]
}

const AdjustLeftTransitPosition1 = (success_overlap_barcode,unsuccess_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {

    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_horizontal_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")],
          transit_corner_world_coordinate[corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("sw")],value['corner_world_cooordinate'][corner_direction_mapping("sw")])){
            success_overlap_barcode.push(key)
          }
          if(overlap_horizontal_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],
           transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("nw")],value['corner_world_cooordinate'][corner_direction_mapping("nw")])){
           success_overlap_barcode.push(key)
          }
      }

    }
    return [success_overlap_barcode,unsuccess_overlap_barcode,gridView]
 }

const AdjustTopTransitPosition1 = (success_overlap_barcode,unsuccess_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {

  for (const [key, value] of Object.entries(gridView)) {
    if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
      var ref_world_cordinate = JSON.parse(value["world_coordinate"])
      if(overlap_vertical_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("nw")],value['corner_world_cooordinate'][corner_direction_mapping("nw")])){
        success_overlap_barcode.push(key)
    }
    if(overlap_vertical_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("ne")],value['corner_world_cooordinate'][corner_direction_mapping("ne")])){
        success_overlap_barcode.push(key)
      }
    }
}
return [success_overlap_barcode,unsuccess_overlap_barcode,gridView]
}

export const view_overlap_barcode = () => (dispatch, getState) => {
  const state = getState();
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;
  var updated_barcodeDict
  updated_barcodeDict = JSON.parse(JSON.stringify(barcode));
  var unsuccess_overlap_barcode = []
  var success_overlap_barcode_list = []

console.log("View Overlap Barcodes Start")

for (var dir = 0; dir < 4; dir++) {
	for (var barcode_data in updated_barcodeDict) {
		var barcodeInfoDict = updated_barcodeDict[barcode_data];
		var cornerWorldCooordinate = barcodeInfoDict["corner_world_cooordinate"]
		var size_info = barcodeInfoDict["size_info"]
		var world_coordinate = JSON.parse(barcodeInfoDict["world_coordinate"])
		if (dir === 0) {
			[success_overlap_barcode_list, unsuccess_overlap_barcode, updated_barcodeDict] = AdjustTopTransitPosition1(success_overlap_barcode_list, unsuccess_overlap_barcode, barcode_data, updated_barcodeDict, cornerWorldCooordinate, size_info, dir, world_coordinate)
		}
 		 if(dir===1){
 		   [success_overlap_barcode_list,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustRightTransitPosition1(success_overlap_barcode_list,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		 if(dir===2){
 		     [success_overlap_barcode_list,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustBottomTransitPosition1(success_overlap_barcode_list,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		 if(dir===3){
 		     [success_overlap_barcode_list,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustLeftTransitPosition1(success_overlap_barcode_list,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		console.log("end>>>>>", dir)
	}
}
console.log("View Overlap Barcodes End")
  success_overlap_barcode_list = [...new Set(success_overlap_barcode_list)]
  success_overlap_barcode_list = StringtoListFormat(success_overlap_barcode_list)

  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: updated_barcodeDict
  });
//  dispatch({
//    type: "HIGHLIGHT-SUCCESS-OVERLAP-BAROCDE",
//    value: {"barcodeDict":success_overlap_barcode_list,"success_overlap_barcode_status":1}
//  });
  dispatch({
    type: "HIGHLIGHT-UNSUCCESS-OVERLAP-BAROCDE",
    value: {"barcodeDict":success_overlap_barcode_list,"unsuccess_overlap_barcode_status":0}
  });
  return dispatch(clearTiles);
}