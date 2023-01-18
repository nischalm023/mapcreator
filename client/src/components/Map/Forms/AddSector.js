// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addSector } from "actions/sector";

const schema = {
  title: "Add Sector",
  type: "object",
  required: ["sector_id"],
  properties: {
    sector_id: { type: "number", title: "Sector ID" }
  }
};

const AddSector = ({ onSubmit, disabled }) => (
  <BaseJsonForm schema={schema} disabled={disabled} onSubmit={onSubmit} buttonText={"Add Sector"} />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addSector(formData));
    }
  })
)(AddSector);
