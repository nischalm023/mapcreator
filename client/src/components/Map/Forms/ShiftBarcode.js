// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { shiftBarcode } from "actions/barcode";
import { directionSchema } from "utils/forms";
import { coordinateKeyToBarcodeSelector } from "utils/selectors";

const schema = {
  title: "Shift Barcode",
  type: "object",
  required: ["tileId", "barcodeString", "direction", "distance"],
  properties: {
    // actual thing used
    tileId: { type: "string", title: "Coordinate" },
    // display purpose. better to display barcode string instead of the coordinate
    barcodeString: { type: "string", title: "Barcode" },
    direction: { ...directionSchema, title: "Direction" },
    distance: { title: "Distance", type: "integer", minimum: 1 }
  }
};

const uiSchema = {
  tileId: { "ui:widget": "hidden" },
  barcodeString: { "ui:readonly": true }
};

const tooltipData = {
  id: "shift-barcode",
  title: "Shift Barcode",
  bulletPoints: [
    "Shifts a barcode in a particular direction by the given value.",
    `Automatically disallows movement in perpendicular directions of the shift direction; This is because
    shifting causes heterogeneity. If you want to keep/change neighbour structure, do this using shift-click barcode form.`
  ]
};

const ShiftBarcode = ({ onSubmit, disabled, initialData }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    uiSchema={uiSchema}
    onSubmit={onSubmit}
    buttonText={"Shift Barcode"}
    btnClass="btn-secondary"
    initialData={initialData}
    tooltipData={tooltipData}
  />
);

export default connect(
  state => {
    const mapTilesArr = Object.keys(state.selection.mapTiles);
    if (mapTilesArr.length !== 1) {
      return {
        disabled: true
      };
    }
    const tileId = mapTilesArr[0];
    const barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: tileId
    });
    return {
      disabled: false,
      initialData: {
        tileId,
        barcodeString
      }
    };
  },
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(shiftBarcode(formData));
    }
  })
)(ShiftBarcode);
