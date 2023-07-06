import {
  getBarcodeSize,
} from "utils/selectors/barcode-selectors";
import { clearTiles } from "./actions";


export const manageMultipleSizeInfoData = formData => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles }
  } = state;
  const {
    normalizedMap: {
      entities: { barcode },
    },
  } = state;

  Object.keys(mapTiles).map(tileId => {
    var barcodeInfoDict = barcode[tileId];
    barcodeInfoDict["size_info"][0]=formData.North!==undefined?formData.North:barcodeInfoDict["size_info"][0]
    barcodeInfoDict["size_info"][1]=formData.East!==undefined?formData.East:barcodeInfoDict["size_info"][1]
    barcodeInfoDict["size_info"][2]=formData.South!==undefined?formData.South:barcodeInfoDict["size_info"][2]
    barcodeInfoDict["size_info"][3]=formData.West!==undefined?formData.West:barcodeInfoDict["size_info"][3]
    barcode[tileId] = barcodeInfoDict;
  });
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcode
  });
  dispatch(clearTiles);
  return Promise.resolve();
};