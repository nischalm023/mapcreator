export default (state = {}, action) => {
  switch (action.type) {
    case "COORDINATE-BARCODE-MAPPING": {
      var  barcode  = action.value.barcode;
      var mappingBarcodeCoord = {};
      Object.keys(barcode).forEach(function(key) {
        mappingBarcodeCoord[barcode[key]["barcode"]]=key
      });
      return { ...state, ...mappingBarcodeCoord };
    }
  }
  return state;
};




