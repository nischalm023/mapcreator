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

const AdjustBottomTransitPosition = (success_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_vertical_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("sw")],value['corner_world_cooordinate'][corner_direction_mapping("sw")])){
              var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "bottom"
				payload["overlapping_direction"] = "se"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
        }
        if(overlap_vertical_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("se")],value['corner_world_cooordinate'][corner_direction_mapping("se")])){
              var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "bottom"
				payload["overlapping_direction"] = "sw"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
        }
      }
    }
    return [success_overlap_barcode,gridView]
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

const AdjustRightTransitPosition = (success_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {
    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_horizontal_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")],
          transit_corner_world_coordinate[corner_direction_mapping("ne")],transit_corner_world_coordinate[corner_direction_mapping("se")],value['corner_world_cooordinate'][corner_direction_mapping("se")])){
            var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "right"
				payload["overlapping_direction"] = "ne"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
          }
          if(overlap_horizontal_south_east(value['corner_world_cooordinate'][corner_direction_mapping("nw")],
          transit_corner_world_coordinate[corner_direction_mapping("se")],transit_corner_world_coordinate[corner_direction_mapping("ne")],value['corner_world_cooordinate'][corner_direction_mapping("ne")])){
            var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "right"
				payload["overlapping_direction"] = "se"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
          }
      }

  }
  return [success_overlap_barcode,gridView]
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

const AdjustLeftTransitPosition = (success_overlap_barcode,transit_barcode,gridView,transit_corner_world_coordinate,transit_size_info,direction,transit_world_cordinate) => {

    for (const [key, value] of Object.entries(gridView)) {
      if (key!==transit_barcode){
      var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
      value['corner_world_cooordinate'] = corner_coordinate
        var ref_world_cordinate = JSON.parse(value["world_coordinate"])
        if(overlap_horizontal_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")],
          transit_corner_world_coordinate[corner_direction_mapping("nw")],transit_corner_world_coordinate[corner_direction_mapping("sw")],value['corner_world_cooordinate'][corner_direction_mapping("sw")])){
            var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "left"
				payload["overlapping_direction"] = "nw"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
          }
          if(overlap_horizontal_south_west(value['corner_world_cooordinate'][corner_direction_mapping("ne")],
           transit_corner_world_coordinate[corner_direction_mapping("sw")],transit_corner_world_coordinate[corner_direction_mapping("nw")],value['corner_world_cooordinate'][corner_direction_mapping("nw")])){
           var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "left"
				payload["overlapping_direction"] = "sw"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
          }
      }

    }
    return [success_overlap_barcode,gridView]
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

const AdjustTopTransitPosition = (success_overlap_barcode, transit_barcode, gridView, transit_corner_world_coordinate, transit_size_info, direction, transit_world_cordinate) => {

	for (const [key, value] of Object.entries(gridView)) {
		if (key !== transit_barcode) {
		    var corner_coordinate = calculate_corner_world_cordinate(value["size_info"],JSON.parse(value["world_coordinate"]))
            value['corner_world_cooordinate'] = corner_coordinate
			var ref_world_cordinate = JSON.parse(value["world_coordinate"])
			if (overlap_vertical_north_east(value['corner_world_cooordinate'][corner_direction_mapping("sw")], transit_corner_world_coordinate[corner_direction_mapping("ne")], transit_corner_world_coordinate[corner_direction_mapping("nw")], value['corner_world_cooordinate'][corner_direction_mapping("nw")])) {
				var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "top"
				payload["overlapping_direction"] = "ne"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
			}
			if (overlap_vertical_north_west(value['corner_world_cooordinate'][corner_direction_mapping("se")], transit_corner_world_coordinate[corner_direction_mapping("nw")], transit_corner_world_coordinate[corner_direction_mapping("ne")], value['corner_world_cooordinate'][corner_direction_mapping("ne")])) {
				var payloadList = success_overlap_barcode[transit_barcode]
				if (payloadList === undefined) {
					payloadList = []
				}
				var payload = {}
				payload["direction"] = "top"
				payload["overlapping_direction"] = "nw"
				payload["transit_barcode"] = transit_barcode
				payload["overlapping_barcode"] = key
				payloadList.push(payload)
				success_overlap_barcode[transit_barcode] = payloadList
			}
		}
	}
	return [success_overlap_barcode, gridView]
}

const resize_if_overlapp_is_not_storable = (barcode, transit_barcode, overlapping_barcode, minSize, direction1, direction2, axis) => {
	var ref_world_cordinate = JSON.parse(barcode[overlapping_barcode]["world_coordinate"])
	var transit_world_cordinate = JSON.parse(barcode[transit_barcode]["world_coordinate"])
	var distance_between_wc = Math.abs(Math.abs(ref_world_cordinate[axis]) - Math.abs(transit_world_cordinate[axis]));
	var overlapping_distance = distance_between_wc -
		(barcode[transit_barcode]['size_info'][direction_mapping(direction1)] +
			barcode[overlapping_barcode]['size_info'][direction_mapping(direction2)])
	console.log("overlapping_distance",overlapping_distance)
	if (barcode[transit_barcode]['size_info'][direction_mapping(direction1)] + overlapping_distance > minSize) {
	    console.log("condition1")
		barcode[transit_barcode]['size_info'][direction_mapping(direction1)] = barcode[transit_barcode]['size_info'][direction_mapping(direction1)] + overlapping_distance;
	} else {
	    console.log("condition2")
		var distance_between_wc = Math.abs(Math.abs(ref_world_cordinate[axis]) - Math.abs(transit_world_cordinate[axis])) / 2;
		if (distance_between_wc > minSize) {
			barcode[transit_barcode]['size_info'][direction_mapping(direction1)] = distance_between_wc;
			barcode[overlapping_barcode]['size_info'][direction_mapping(direction2)] = distance_between_wc;
		}
		else{
		    console.log("Re-sizing of Storable barcode not allowed end", overlapping_barcode, transit_barcode)
		    //unsuccess_overlap_barcode.push(overlapping_barcode)
		    //unsuccess_overlap_barcode.push(transit_barcode)
		}
	}
	return barcode
}

const equal_resize = (barcode, transit_barcode, overlapping_barcode, direction1, direction2, minSize, axis) => {
	var ref_world_cordinate = JSON.parse(barcode[overlapping_barcode]["world_coordinate"])
	var transit_world_cordinate = JSON.parse(barcode[transit_barcode]["world_coordinate"])
	var distance_between_wc = Math.abs(Math.abs(ref_world_cordinate[axis]) - Math.abs(transit_world_cordinate[axis]));
	var overlapping_distance = distance_between_wc -
		(barcode[transit_barcode]['size_info'][direction_mapping(direction1)] +
			barcode[overlapping_barcode]['size_info'][direction_mapping(direction2)])
	var distance_between_wc = Math.abs(Math.abs(ref_world_cordinate[axis]) - Math.abs(transit_world_cordinate[axis])) / 2;
	if (distance_between_wc > minSize) {
		barcode[transit_barcode]['size_info'][direction_mapping(direction1)] = distance_between_wc;
		barcode[overlapping_barcode]['size_info'][direction_mapping(direction2)] = distance_between_wc;
	}
	else{
	        console.log("Re-sizing of Storable barcode not allowed end", overlapping_barcode, transit_barcode)
          console.log("in function>>>>>>>>>>>>>>>>>equal_resize")
		    //unsuccess_overlap_barcode.push(overlapping_barcode)
		    //unsuccess_overlap_barcode.push(transit_barcode)
	}
	return barcode
}

const resize_if_overlapp_is_storable = (barcode, transit_barcode, overlapping_barcode, minSize, direction1, direction2, reverse, axis) => {
	var ref_world_cordinate = JSON.parse(barcode[overlapping_barcode]["world_coordinate"])
	var transit_world_cordinate = JSON.parse(barcode[transit_barcode]["world_coordinate"])
	var distance_between_wc = Math.abs(Math.abs(ref_world_cordinate[axis]) - Math.abs(transit_world_cordinate[axis]));
	console.log("distance_between_wc",distance_between_wc)
	var overlapping_distance = distance_between_wc -
		(barcode[transit_barcode]['size_info'][direction_mapping(direction1)] +
			barcode[overlapping_barcode]['size_info'][direction_mapping(direction2)])
	console.log("overlapping_distance",overlapping_distance)
	if (barcode[transit_barcode]['size_info'][direction_mapping(direction1)] + overlapping_distance > minSize) {
		barcode[transit_barcode]['size_info'][direction_mapping(direction1)] = barcode[transit_barcode]['size_info'][direction_mapping(direction1)] + overlapping_distance;
	}
	else {

		if (reverse) {
			console.log("Resizing not allowed for ", transit_barcode)
		} else {
			console.log("Resizing not allowed for ", overlapping_barcode)
		}
		//unsuccess_overlap_barcode.push(overlapping_barcode)
		//unsuccess_overlap_barcode.push(transit_barcode)
	}
    //console.log("unsuccess_overlap_barcode", unsuccess_overlap_barcode)
	return barcode
}

const resize_single_overlap = (barcode, success_overlap_barcode ,success_overlap_barcode_data, overlap_direction1, overlap_direction2, direction1, direction2, min_ttp,min_rtp, min_ttp_storable, min_rtp_storable, axis) => {
                var transit_barcode = success_overlap_barcode_data["transit_barcode"]
				var overlapping_barcode = success_overlap_barcode_data["overlapping_barcode"]
				//var unsuccess_overlap_barcode = unsuccess_overlap_barcode || []
				 console.log("transit_barcode", transit_barcode)
				 console.log("success_overlap_barcode", success_overlap_barcode_data)
				 console.log("overlapping_barcode", overlapping_barcode)
				 console.log("transit_barcode", barcode[transit_barcode]['size_info'])
				 console.log("overlapping_barcode", barcode[overlapping_barcode]['size_info'])
				if (barcode[transit_barcode]["ttp_type_attibute"] != undefined && barcode[transit_barcode]["ttp_type_attibute"]) {
					if (barcode[overlapping_barcode]["ttp_type_attibute"] != undefined && barcode[overlapping_barcode]["ttp_type_attibute"]) {
						console.log("transit_barcode_type == overlapping_barcode_type == ttp")
						if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
						    barcode = equal_resize(barcode, transit_barcode, overlapping_barcode, direction2, direction1, min_ttp, axis)
						}
						else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
						    barcode = equal_resize(barcode, transit_barcode, overlapping_barcode, direction1, direction2, min_ttp, axis)
						}
					} else {
						console.log("transit_barcode_type == ttp && overlapping_barcode_type == rtp")
						if (barcode[overlapping_barcode]["store_status"] == 0) {
							console.log("store_status == 0")
							if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
							    console.log("store_status == ne")
								barcode = resize_if_overlapp_is_not_storable(barcode, transit_barcode, overlapping_barcode, min_ttp, direction2, direction1, axis)
							} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
							    console.log("store_status == nw")
								barcode = resize_if_overlapp_is_not_storable(barcode, transit_barcode, overlapping_barcode, min_ttp, direction1, direction2, axis)
							}
						} else {
							console.log("store_status != 0")
							if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
								barcode = resize_if_overlapp_is_storable(barcode, transit_barcode, overlapping_barcode, min_ttp_storable, direction2, direction1, false, axis)
							} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
								barcode = resize_if_overlapp_is_storable(barcode, transit_barcode, overlapping_barcode, min_ttp_storable, direction1, direction2, false, axis)
							}
						}
					}
				} else {
					if (barcode[overlapping_barcode]["ttp_type_attibute"] != undefined && barcode[overlapping_barcode]["ttp_type_attibute"]) {
						console.log("transit_barcode_type == rtp && overlapping_barcode_type == ttp")
						if (barcode[transit_barcode]["store_status"] == 0) {
						    console.log("store_status == 0")
							if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
								barcode = resize_if_overlapp_is_not_storable(barcode, overlapping_barcode, transit_barcode, min_ttp, direction1, direction2, axis)
							} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
								barcode = resize_if_overlapp_is_not_storable(barcode, overlapping_barcode, transit_barcode, min_ttp, direction2, direction1, axis)
							}
						} else {
						    console.log("store_status != 0")
							if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
								barcode = resize_if_overlapp_is_storable(barcode, overlapping_barcode, transit_barcode, min_ttp_storable, direction1, direction2, false, axis)
							} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
								barcode = resize_if_overlapp_is_storable(barcode, overlapping_barcode, transit_barcode, min_ttp_storable, direction2, direction1, false, axis)
							}
						}
					} else {
					    console.log("transit_barcode_type == rtp && overlapping_barcode_type == rtp")
						if (barcode[transit_barcode]["store_status"] == 0) {
						    console.log("transit_barcode_type store_status == 0")
							if (barcode[overlapping_barcode]["store_status"] == 0) {
							    console.log("overlapping_barcode store_status == 0")
								if(success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
						            barcode = equal_resize(barcode, transit_barcode, overlapping_barcode, direction2, direction1, min_rtp, axis)
						        }
						        else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
						            barcode = equal_resize(barcode, transit_barcode, overlapping_barcode, direction1, direction2, min_rtp, axis)
						        }
							} else {
							    console.log("overlapping_barcode store_status != 0")
								// console.log("success_overlap_barcode[success_overlap_barcode_data]", success_overlap_barcode[success_overlap_barcode_data])
								// console.log("success_overlap_barcode[success_overlap_barcode_data]", barcode[success_overlap_barcode_data])
								if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
									barcode = resize_if_overlapp_is_storable(barcode,  transit_barcode, overlapping_barcode, min_rtp_storable, direction2, direction1, false, axis)
								} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
									barcode = resize_if_overlapp_is_storable(barcode, transit_barcode, overlapping_barcode, min_rtp_storable, direction1, direction2, false, axis)
								}
							}
						} else {
						    console.log("transit_barcode_type store_status != 0")
							if (barcode[overlapping_barcode]["store_status"] == 0) {
							    console.log("overlapping_barcode store_status == 0")
								// console.log("success_overlap_barcode[success_overlap_barcode_data]", success_overlap_barcode[success_overlap_barcode_data])
								// console.log("success_overlap_barcode[success_overlap_barcode_data]", barcode[success_overlap_barcode_data])
								if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction1) {
								    console.log(overlap_direction1)
								    //console.log("result",resize_if_overlapp_is_storable(barcode, overlapping_barcode, transit_barcode, min_rtp_storable, direction1, direction2, true, unsuccess_overlap_barcode))
									barcode = resize_if_overlapp_is_storable(barcode, overlapping_barcode, transit_barcode, min_rtp_storable, direction1, direction2, true, axis)
								} else if (success_overlap_barcode_data["overlapping_direction"] == overlap_direction2) {
									barcode = resize_if_overlapp_is_storable(barcode, overlapping_barcode, transit_barcode, min_rtp_storable, direction2, direction1, true, axis)
								}
							} else{
							        console.log("Re-sizing of Storable barcode not allowed end", overlapping_barcode, transit_barcode)
                      console.log("in function>>>>>>>>>>>>>>>>>resize_single_overlap")
	                        	    //unsuccess_overlap_barcode.push(overlapping_barcode)
		                            //unsuccess_overlap_barcode.push(transit_barcode)
	                        }
						}
					}
					//console.log("Re-sizing of Storable barcode not allowed end")
				}
            console.log("transit_barcode", barcode[transit_barcode]['size_info'])
 			console.log("overlapping_barcode", barcode[overlapping_barcode]['size_info'])

			return barcode
}

export const manage_ttp_overlap = (barcode,hai_barcode=null,manage_hai_overlap = false) => (dispatch, getState) => {
  const state = getState();
  // var {
  //   normalizedMap: {
  //     entities: { barcode },
  //   },
  // } = state;
  var updated_barcodeDict
  if(manage_hai_overlap){
    updated_barcodeDict = JSON.parse(JSON.stringify(hai_barcode));
  }else{
    updated_barcodeDict = JSON.parse(JSON.stringify(barcode));
  }
  
  //var success_overlap_barcode = []
  // var success_overlap_barcode = {}
  var unsuccess_overlap_barcode = []
  var success_overlap_barcode_abc = []

console.log("Manage Overlap Barcodes Start")

//  for (var dir = 0; dir < 4; dir++) {
//    for (var barcode_data in barcode) {
//        var barcodeInfoDict = barcode[barcode_data];
//        var cornerWorldCooordinate = barcodeInfoDict["corner_world_cooordinate"]
//        var size_info = barcodeInfoDict["size_info"]
//        var world_coordinate = JSON.parse(barcodeInfoDict["world_coordinate"])
//            if(dir===0){
//              [success_overlap_barcode,updated_barcodeDict] = AdjustTopTransitPosition(success_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
//            }
//            // if(dir===1){
//            //   [success_overlap_barcode,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustRightTransitPosition(success_overlap_barcode,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
//            // }
//            // if(dir===2){
//            //     [success_overlap_barcode,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustBottomTransitPosition(success_overlap_barcode,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
//            // }
//            // if(dir===3){
//            //     [success_overlap_barcode,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustLeftTransitPosition(success_overlap_barcode,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
//            // }
//      }
//  }
//var direction_list = [0,2,1,3]
//for (var dir = 0; dir < 4; dir++) {
//for (var dir in direction_list){
var direction_list = new Set([0,2,1,3]);
direction_list.forEach (function(dir) {
	var success_overlap_barcode= {}
	//console.log(">>>>>>>>>>>>>>>>>",dir)
	for (var barcode_data in barcode) {
		//console.log("start>>>>>")
		var barcodeInfoDict = updated_barcodeDict[barcode_data];
		var cornerWorldCooordinate = barcodeInfoDict["corner_world_cooordinate"]
		var size_info = barcodeInfoDict["size_info"]
		var world_coordinate = JSON.parse(barcodeInfoDict["world_coordinate"])
		if (dir == 0) {
			[success_overlap_barcode, updated_barcodeDict] = AdjustTopTransitPosition(success_overlap_barcode, barcode_data, updated_barcodeDict, cornerWorldCooordinate, size_info, dir, world_coordinate)
		}
 		 if(dir==1){
 		   [success_overlap_barcode,updated_barcodeDict] = AdjustRightTransitPosition(success_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		 if(dir==2){
 		     [success_overlap_barcode,updated_barcodeDict] = AdjustBottomTransitPosition(success_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		 if(dir==3){
 		     [success_overlap_barcode,updated_barcodeDict] = AdjustLeftTransitPosition(success_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
 		 }
 		console.log("end>>>>> loop1", dir)
	}

	console.log("success_overlap_barcode",success_overlap_barcode)

	if (dir == 0) {
		for (var success_overlap_barcode_data in success_overlap_barcode) {
			if (success_overlap_barcode[success_overlap_barcode_data].length == 1) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "ne", "nw", "left", "right", 10,10, 530, 530, 0);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 2) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "ne", "nw", "left", "right", 10,10, 530, 530, 0);
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][1], "ne", "nw", "left", "right", 10,10, 530, 530, 0);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 3) {
				continue;
				console.log("hurray>>>3", success_overlap_barcode[success_overlap_barcode_data])
			}
		}
	}
	if (dir == 1) {
		for (var success_overlap_barcode_data in success_overlap_barcode) {
			if (success_overlap_barcode[success_overlap_barcode_data].length == 1) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "se", "ne", "top", "bottom", 10,10, 530, 530, 1);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 2) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "se", "ne", "top", "bottom", 10,10, 530, 530, 1);
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][1], "se", "ne", "top", "bottom", 10,10, 530, 530, 1);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 3) {
				continue;
				console.log("hurray>>>3", success_overlap_barcode[success_overlap_barcode_data])
			}
		}
	}
	if (dir == 2) {
		for (var success_overlap_barcode_data in success_overlap_barcode) {
			if (success_overlap_barcode[success_overlap_barcode_data].length == 1) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "sw", "se", "right", "left", 10,10, 530, 530, 0);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 2) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "sw", "se", "right", "left", 10,10, 530, 530, 0);
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][1], "sw", "se", "right", "left", 10,10, 530, 530, 0);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 3) {
				continue;
				console.log("hurray>>>3", success_overlap_barcode[success_overlap_barcode_data])
			}
		}
	}
	if (dir == 3) {
		for (var success_overlap_barcode_data in success_overlap_barcode) {
			if (success_overlap_barcode[success_overlap_barcode_data].length == 1) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "nw", "sw", "bottom", "top", 10,10, 530, 530, 1);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 2) {
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][0], "nw", "sw", "bottom", "top", 10,10, 530, 530, 1);
				updated_barcodeDict = resize_single_overlap (updated_barcodeDict, success_overlap_barcode, success_overlap_barcode[success_overlap_barcode_data][1], "nw", "sw", "bottom", "top", 10,10, 530, 530, 1);
			} else if (success_overlap_barcode[success_overlap_barcode_data].length == 3) {
				continue;
				console.log("hurray>>>3", success_overlap_barcode[success_overlap_barcode_data])
			}
		}
	}
	//alert("hello");
	//console.log(">>>>>>>>>>>>>>>>>", success_overlap_barcode);
})

console.log("Manage Overlap Barcodes End")

//for (var dir = 0; dir < 4; dir++) {
//	//console.log(">>>>>>>>>>>>>>>>>",dir)
//	for (var barcode_data in updated_barcodeDict) {
//		//console.log("start>>>>>")
//		var barcodeInfoDict = updated_barcodeDict[barcode_data];
//		var cornerWorldCooordinate = barcodeInfoDict["corner_world_cooordinate"]
//		var size_info = barcodeInfoDict["size_info"]
//		var world_coordinate = JSON.parse(barcodeInfoDict["world_coordinate"])
//		if (dir === 0) {
//			[success_overlap_barcode_abc, unsuccess_overlap_barcode, updated_barcodeDict] = AdjustTopTransitPosition1(success_overlap_barcode_abc, unsuccess_overlap_barcode, barcode_data, updated_barcodeDict, cornerWorldCooordinate, size_info, dir, world_coordinate)
//		}
// 		 if(dir===1){
// 		   [success_overlap_barcode_abc,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustRightTransitPosition1(success_overlap_barcode_abc,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
// 		 }
// 		 if(dir===2){
// 		     [success_overlap_barcode_abc,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustBottomTransitPosition1(success_overlap_barcode_abc,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
// 		 }
// 		 if(dir===3){
// 		     [success_overlap_barcode_abc,unsuccess_overlap_barcode,updated_barcodeDict] = AdjustLeftTransitPosition1(success_overlap_barcode_abc,unsuccess_overlap_barcode,barcode_data,updated_barcodeDict,cornerWorldCooordinate,size_info,dir,world_coordinate)
// 		 }
// 		console.log("end>>>>>",dir)
//	}
//	//alert("hello");
//	//console.log(">>>>>>>>>>>>>>>>>", success_overlap_barcode);
//}
  //success_overlap_barcode_abc = [...new Set(success_overlap_barcode_abc)]
  //unsuccess_overlap_barcode = [...new Set(unsuccess_overlap_barcode)]
//  success_overlap_barcode = success_overlap_barcode.filter( function( el ) {
//  return unsuccess_overlap_barcode.indexOf( el ) < 0;
//    } );
  //success_overlap_barcode_abc = StringtoListFormat(success_overlap_barcode_abc)
  //unsuccess_overlap_barcode = StringtoListFormat(unsuccess_overlap_barcode)
  if(manage_hai_overlap){
    return updated_barcodeDict
  }else{
    dispatch({
      type: "MANAGE-OVERLAP-BAROCDE",
      value: updated_barcodeDict
    });
    return dispatch(clearTiles);

}
 
//  dispatch({
//    type: "HIGHLIGHT-SUCCESS-OVERLAP-BAROCDE",
//    value: {"barcodeDict":success_overlap_barcode_abc,"success_overlap_barcode_status":0}
//  });
//  dispatch({
//    type: "HIGHLIGHT-UNSUCCESS-OVERLAP-BAROCDE",
//    value: {"barcodeDict":unsuccess_overlap_barcode,"unsuccess_overlap_barcode_status":0}
//  });
}
