import { setErrorMessage } from "./message";
import { DEFAULT_BARCODE_FORMAT,MILIMETER_PER_DM } from "../constants";

export const validateBarcodesDistance = (barcodesDict) => {
  for (var barcode in barcodesDict){
    var barcodeInfo = barcodesDict[barcode]
    if(barcodeInfo.hasOwnProperty("vda_world_coordinate")){
      var world_cordinate = JSON.parse(barcodeInfo["vda_world_coordinate"])
      if((Math.abs(world_cordinate[0])>MILIMETER_PER_DM*10) || (Math.abs(world_cordinate[1])>MILIMETER_PER_DM*10)){
        return {
          error: true,
          reason: "Distance of barcode should not be greator than 1 km from origin"
        };
      }
    }else{
      return {
          error: true,
          reason: "Please save your map before change of barcode format"
        };
    }
    
  }
  return { error: false };
};


export const changeBarcodeFormat = barcode_value => (dispatch, getState) => {
  const state = getState();
  const { normalizedMap,barcodeOffset,currentFloor } = state;
  dispatch({
    type: "CHANGE-FLOOR-BARCODE-FORMAT-MODE",
    value: {barcode_value,currentFloor}
  });
  var barcodesDict = {};
  const floorInfo = normalizedMap.entities.floor;
  const barcodeKeys = floorInfo[currentFloor].map_values;
  const current_offset = floorInfo[currentFloor].barcodeOffset
  barcodeKeys.forEach((barcodeKey) => {
      barcodesDict[barcodeKey] = normalizedMap.entities.barcode[barcodeKey];
    });
  dispatch({
    type: "BARCODE-FLOOR-OFFSET-VALUE",
    value: {"barcodeOffset":current_offset,currentFloor}
  });
  dispatch({
    type:"CHANGE-BARCODE-FORMAT-ON-BASIS-OF-MODE",
    value:{"barcode_value":barcode_value,"barcodesDict":barcodesDict,"barcodeOffset":current_offset}
  })
  const { error, reason } = validateBarcodesDistance(barcodesDict);
  if (error) {
      dispatch({
          type: "CHANGE-FLOOR-BARCODE-FORMAT-MODE",
          value: {"barcode_value":DEFAULT_BARCODE_FORMAT,currentFloor}
        });
      dispatch({
        type:"CHANGE-BARCODE-FORMAT-ON-BASIS-OF-MODE",
        value:{"barcode_value":DEFAULT_BARCODE_FORMAT,"barcodesDict":barcodesDict,"barcodeOffset":current_offset}
      })
      return dispatch(setErrorMessage(reason));
    }
  return Promise.resolve();
};
