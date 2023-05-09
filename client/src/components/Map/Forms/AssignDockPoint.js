// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";
import { directionSchema, barcodeStringSchema } from "utils/forms";

const schema = {
  title: "Add Dock Point",
  type: "object",
  required: [
    "pps_list",
    "direction",
    "wait_position",
    "exit_position",
    "pptl_frame_type",
    "dock_sequence_number"
  ],
  properties: {
    pps_list: {
      // TODO: array type doesn't work with bootstrap 4 right now, maybe change later
      type: "string",
      default: "",
      title: "List of PPSes eg. 1,2"
    },
    direction: directionSchema,
    wait_position: {
      ...barcodeStringSchema,
      title: "Wait Position eg. 001.002"
    },
    exit_position: {
      ...barcodeStringSchema,
      title: "Exit Position eg. 001.002"
    },
    pptl_frame_type: { type: "string", title: "PPTL Frame type eg. 11" },
    dock_sequence_number: {
      type: "integer",
      title: "Dock Sequence Number eg. 1"
    }
  }
};

var validatePPSList = ({ pps_list }, errors) => {
  var ppses = pps_list.split(",").map(e => Number(e));
  var isOk = ppses.reduce((acc, e) => acc && !isNaN(e), true);
  if (!isOk)
    errors.pps_list.addError("PPSes should be list of numbers eg. 1,2");
  return errors;
};

const AssignDockPoint = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Add Dock Point"}
    validate={validatePPSList}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  () => ({
    onSubmit: () => {
      // state is not accessible here so using a workaround to access it in action creator...
      // TODO: define what needs to be done
    }
  })
)(AssignDockPoint);
