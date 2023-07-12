import {
  getBarcodeSize,
} from "utils/selectors/barcode-selectors";
import { clearTiles } from "./actions";


export const manageMultipleNeighbourData = formData => (dispatch, getState) => {
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
    barcodeInfoDict["neighbours"][0]=formData.North!==""?formData.North:barcodeInfoDict["neighbours"][0]
    barcodeInfoDict["neighbours"][1]=formData.East!==""?formData.East:barcodeInfoDict["neighbours"][1]
    barcodeInfoDict["neighbours"][2]=formData.South!==""?formData.South:barcodeInfoDict["neighbours"][2]
    barcodeInfoDict["neighbours"][3]=formData.West!==""?formData.West:barcodeInfoDict["neighbours"][3]
    barcode[tileId] = barcodeInfoDict;
  });
  dispatch({
    type: "VIEW-OVERLAP-BAROCDES",
    value: barcode
  });
  dispatch(clearTiles);
  return Promise.resolve();
};