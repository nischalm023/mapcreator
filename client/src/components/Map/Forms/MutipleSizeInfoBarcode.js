// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { manageMultipleSizeInfoData } from "actions/manageMultipleSizeInfoBarcode";

const schema = {
  title: "Multi Barcode Size Info Edit",
  type: "object",
  properties: {
    North: { type: "integer", title: "North" },
    South: { type: "integer", title: "South" },
    East: { type: "integer", title: "East" },
    West: { type: "integer", title: "West" }
  }
};

const manageMultipleSizeInfoBarcodeData = ({ onSubmit ,disabled }) => (
  <BaseJsonForm schema={schema} disabled={disabled} onSubmit={onSubmit} buttonText={"Multi Barcode Size Info Edit"} />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(manageMultipleSizeInfoData(formData));
    }
  })
)(manageMultipleSizeInfoBarcodeData);
