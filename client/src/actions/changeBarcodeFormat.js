import { setErrorMessage } from "./message";

export const validateBarcodesDistance = (barcodesDict) => {
  for (var barcode in barcodesDict){
    var barcodeInfo = barcodesDict[barcode]
    if(barcodeInfo.hasOwnProperty("world_coordinate")){
      var world_cordinate = JSON.parse(barcodeInfo["world_coordinate"])
      if((Math.abs(world_cordinate[0])>100000) || (Math.abs(world_cordinate[1])>100000)){
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
  const { error, reason } = validateBarcodesDistance(barcodesDict);
  if (error) {
    return dispatch(setErrorMessage(reason));
  }
  dispatch({
    type: "BARCODE-FLOOR-OFFSET-VALUE",
    value: {"barcodeOffset":current_offset,currentFloor}
  });
  dispatch({
    type:"CHANGE-BARCODE-FORMAT-ON-BASIS-OF-MODE",
    value:{"barcode_value":barcode_value,"barcodesDict":barcodesDict,"barcodeOffset":current_offset}
  })
  
  return Promise.resolve();
};
