// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { modifyMultipleNeighbours } from "actions/barcode";
import { directionSchema } from "utils/forms";

const neighboursSchema = {
  type: "string",
  title: "Neighbours",
  default: "1,1,1",
  pattern: "^[01], *[01], *[01]$"
};

const schema = {
  title: "Update Direction",
  type: "object",
  required: ["pick_direction", "neighbours"],
  properties: {
    pick_direction: { ...directionSchema, title: "Pick Direction" },
    neighbours: neighboursSchema
  }
};

const UpdateDirection = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Update Direction"}
    style={{ marginLeft:"20%", textAlign:"-webkit-center", color:"orange"}}
  />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(modifyMultipleNeighbours(formData));
    }
  })
)(UpdateDirection);
