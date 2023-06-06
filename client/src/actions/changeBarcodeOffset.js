import { setErrorMessage } from "./message";
import { DEFAULT_BARCODE_FORMAT,MILIMETER_PER_DM } from "../constants";

export const validateBarcodesDistance = (barcodeDict,updated_vda_offset,current_vda_offset) => {
  var new_vda_offset = JSON.parse(updated_vda_offset)
  var vda_coordinate_list = []
    for (var barcode in barcodeDict) {
      var barcodeInfo = barcodeDict[barcode];
      if(barcodeInfo.hasOwnProperty("vda_world_coordinate")){
        var convert = JSON.parse(barcodeInfo["vda_world_coordinate"])
        vda_coordinate_list.push(convert)
      }
    }
    // [high_x,high_y]
    const highest_y = vda_coordinate_list.reduce((a, b) => a[1] > b[1] ? a : b);
    const highest_x = vda_coordinate_list.reduce((a, b) => a[0] > b[0] ? a : b);
    var highest_vda_coordinate = [highest_x[0],highest_y[1]]
    if(highest_x[0]-current_vda_offset[0]+new_vda_offset[0]>MILIMETER_PER_DM*10){
      return {
          error: true,
          reason: "VDA offset cannot be greator than 1000000"
        };
    }
    if(highest_x[1]-current_vda_offset[1]+new_vda_offset[1]>MILIMETER_PER_DM*10){
      return {
          error: true,
          reason: "VDA offset cannot be greator than 1000000"
        };
    }
    return { error: false };
  }



export const changeBarcodeOffset = (dispatch,updated_vda_offset,currentFloor,barcode_value,barcode_dict,current_vda_offset)  => (dispatch, getState) => {
  
  const { error, reason } = validateBarcodesDistance(barcode_dict,updated_vda_offset,current_vda_offset);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  dispatch({
    type: "BARCODE-FLOOR-OFFSET-VALUE",
    value: {"barcodeOffset":updated_vda_offset,"currentFloor":currentFloor}
  })
    dispatch({
    type:"CHANGE-BARCODE-FORMAT-ON-BASIS-OF-MODE",
    value:{"barcode_value":barcode_value,"barcodesDict":barcode_dict,"barcodeOffset":updated_vda_offset}
  })
  return true
};
