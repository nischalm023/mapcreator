import React from "react";
import { addTTPTransitBarcode } from "actions/barcode";
import { connect } from "react-redux";
import BaseJsonForm from "./Util/BaseJsonForm";
import { directionSchema, barcodeStringSchema } from "utils/forms";
import { coordinateKeyToBarcodeSelector, getNewBarcode } from "utils/selectors";
const schema = {
  title: "Add TTP Transit Barcode",
  type: "object",
  required: ["tileId", "barcodeString", "newBarcode", "direction", "distance"],
  properties: {
    // actual thing used
    tileId: { type: "string", title: "Coordinate" },
    // display purpose. better to display barcode string instead of the coordinate
    barcodeString: { ...barcodeStringSchema, type: "string", title: "Barcode" },
    newBarcode: {
      ...barcodeStringSchema,
      type: "string",
      title: "Transit Barcode"
    },
    direction: {
      ...directionSchema,
      title: "Direction(W.R.T. Selected Barcode)"
    },
    distance: { title: "Distance", type: "integer", minimum: 50 }
  }
};

const uiSchema = {
  tileId: { "ui:widget": "hidden" },
  barcodeString: { "ui:readonly": true }
};

const TransitBarcode = ({ onSubmit, disabled, initialData }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    uiSchema={uiSchema}
    onSubmit={onSubmit}
    buttonText={"Add TTP Transit Barcode"}
    initialData={initialData}
  />
);

export default connect(
  state => {
    const mapTilesArr = Object.keys(state.selection.mapTiles);
    
    if (mapTilesArr.length != 1) {
      return { disabled: true };
    }
    if (state.selection.conveyorMode === true){
      return {
        disabled: true
      };
    }
    const tileId = mapTilesArr[0];
    const barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: tileId
    });
    const newBarcode = getNewBarcode(state);
    
    return {
      disabled: false,
      initialData: {
        tileId,
        barcodeString,
        newBarcode: newBarcode,
        distance: 750
      }
    };
  },
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addTTPTransitBarcode(formData));
    }
  })
)(TransitBarcode);
