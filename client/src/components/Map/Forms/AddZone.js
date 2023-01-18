// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addZone } from "actions/zone";

const schema = {
  title: "Add Zone",
  type: "object",
  required: ["zone_id"],
  properties: {
    zone_id: { type: "string", title: "Zone ID" }
  }
};

const AddZone = ({ onSubmit ,disabled }) => (
  <BaseJsonForm schema={schema} disabled={disabled} onSubmit={onSubmit} buttonText={"Add Zone"} />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addZone(formData));
    }
  })
)(AddZone);
