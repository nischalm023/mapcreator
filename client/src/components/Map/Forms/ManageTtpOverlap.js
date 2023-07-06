import React from "react";
import { manage_ttp_overlap } from "actions/manage_ttp_overlap";
import { connect } from "react-redux";

const PathButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{ textAlign: "-webkit-center", color: "orange" }}
    onClick={() => {
      onClick();
    }}
  >
    Resolve Barcode Overlaps
  </button>
);

export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  (dispatch) => ({
    onClick: () => dispatch(manage_ttp_overlap()),
  })
)(PathButton);
