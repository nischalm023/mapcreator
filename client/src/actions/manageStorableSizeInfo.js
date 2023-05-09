export const manageStorableSizeData = formData => (dispatch, getState) => {
  const state = getState();
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;

  for (var barcode_data in barcode) {
    var barcodeInfoDict = barcode[barcode_data];
    if(barcodeInfoDict["store_status"] == 1){
      console.log("updated size into before==========",barcode[barcode_data]["coordinate"],barcode[barcode_data]["size_info"])
      barcodeInfoDict["size_info"][0]=formData.North!==undefined?formData.North:barcodeInfoDict["size_info"][0]
      barcodeInfoDict["size_info"][1]=formData.East!==undefined?formData.East:barcodeInfoDict["size_info"][1]
      barcodeInfoDict["size_info"][2]=formData.South!==undefined?formData.South:barcodeInfoDict["size_info"][2]
      barcodeInfoDict["size_info"][3]=formData.West!==undefined?formData.West:barcodeInfoDict["size_info"][3]
      barcode[barcode_data] = barcodeInfoDict;
      console.log("updated size into after==========",barcodeInfoDict["coordinate"],barcodeInfoDict["size_info"])
    }
  }
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcode
  });
  return Promise.resolve();
};