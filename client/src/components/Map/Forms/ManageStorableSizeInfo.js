// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { manageStorableSizeData } from "actions/manageStorableSizeInfo";

const schema = {
  title: "Manage Storable Size Info",
  type: "object",
  properties: {
    North: { type: "integer", title: "North" },
    South: { type: "integer", title: "South" },
    East: { type: "integer", title: "East" },
    West: { type: "integer", title: "West" }
  }
};

const manageStorableSize = ({ onSubmit ,disabled }) => (
  <BaseJsonForm schema={schema} disabled={disabled} onSubmit={onSubmit} buttonText={"Manage Storable Size Info"} />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      console.log("formData==========================>>>>>11",formData)
      dispatch(manageStorableSizeData(formData));
    }
  })
)(manageStorableSize);
