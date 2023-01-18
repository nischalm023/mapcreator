import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { specialBarcodesSelector} from "utils/selectors";
import { connect } from "react-redux";
import { editSpecialBarcode } from "actions/actions";
import {barcodeStringSchema}  from "utils/forms";


const makeSchema = (specialBarcodeValues) => ({
  title: "Edit Special Barcode",
  type: "object",
  required: ["coordinate", "new_barcode"],
  properties: {
    coordinate: {
      type: "string",
      title: "Old Barcode",
      enum: specialBarcodeValues.map(c => c.coordinate),
      enumNames: specialBarcodeValues.map(b => b.barcode)
    },
    new_barcode: { ...barcodeStringSchema, title: "New Barcode" },
  }
});

const EditBarcode = ({ onSubmit, specialBarcodeValues,disabled }) => (
  <BaseJsonForm
    schema={makeSchema(specialBarcodeValues)}
    disabled={disabled}
    onSubmit={onSubmit}
    buttonText={"Edit Special Barcode"}
  />
);
export default connect(
  state => ({
    specialBarcodeValues: specialBarcodesSelector(state),
    disabled:state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(editSpecialBarcode(formData));
    }
  })
)(EditBarcode);
