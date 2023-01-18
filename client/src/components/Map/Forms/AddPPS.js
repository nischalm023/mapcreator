// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addPPSes } from "actions/pps";
import { directionSchema } from "utils/forms";

const ppsTypeSchema = {
  type: "string",
  title: "PPS Type",
  default: "manual",
  enum: ["ppp_manual", "ara", "manual"],
  enumNames: ["PPP (manual)", "ARA", "Manual"]
};

const schema = {
  title: "Add PPS",
  type: "object",
  required: ["pick_direction", "type"],
  properties: {
    pick_direction: { ...directionSchema, title: "Pick Direction" },
    type: ppsTypeSchema
  }
};

const AddPPS = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign PPS"}
    style={{ marginLeft:"20%", textAlign:"-webkit-center", color:"orange"}}
  />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0 || state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addPPSes(formData));
    }
  })
)(AddPPS);
