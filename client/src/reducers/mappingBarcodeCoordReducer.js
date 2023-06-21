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
    case "ADD-COORDINATE-BARCODE-MAPPING": {
      var  new_barcode  = action.value.barcode;
      var coordinate_key = action.value.coordinate;
      var new_mappingBarcodeCoord = {};
      new_mappingBarcodeCoord[new_barcode]=coordinate_key
      return { ...state, ...new_mappingBarcodeCoord };
    }
  }
  return state;
};




