import React from "react";
import { misaligned } from "actions/actions";
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
    Misaligned Node
  </button>
);

export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  (dispatch) => ({
    onClick: () => dispatch(misaligned()),
  })
)(PathButton);
