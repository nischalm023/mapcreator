// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addOdsExcludeds } from "actions/odsExcluded";
import { directionSchema } from "utils/forms";

const schema = {
  title: "Assign ODS Excluded",
  type: "object",
  required: ["direction"],
  properties: {
    direction: {
      ...directionSchema,
      title: "ODS Excluded direction"
    }
  }
};

const AssignODSExcluded = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign ODS Excluded"}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      // state is not accessible here so using a workaround to access it in action creator...
      dispatch(addOdsExcludeds(formData));
    }
  })
)(AssignODSExcluded);
