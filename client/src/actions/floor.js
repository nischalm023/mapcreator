import { createFloorFromCoordinateData } from "utils/util";
import { getBarcodes } from "utils/selectors";
import _ from "lodash";
import { setErrorMessage } from "./message";

export const addFloor = ({
  floor_id,
  row_start,
  row_end,
  column_start,
  column_end,
  msu_dimensions,
  barcode_distances
}) => (dispatch, getState) => {
  var floorData = createFloorFromCoordinateData({
    floor_id,
    row_start,
    row_end,
    column_start,
    column_end,
    msu_dimensions,
    barcode_distances
  });
  var barcodes = getBarcodes(getState());
  // show error if a barcode already exists
  var intersection = _.intersection(
    Object.keys(barcodes),
    floorData.map_values.map(barcode => barcode.coordinate)
  );
  if (intersection.length) {
    return dispatch(setErrorMessage("Existing barcodes detected in range."));
  }

  // resetting the value of export_floor_id in state
  dispatch({
    type: "CHANGE-EXPORT-FLOOR-ID",
    value: true
  });

  return dispatch({
    type: "ADD-FLOOR",
    value: floorData
  });
};
