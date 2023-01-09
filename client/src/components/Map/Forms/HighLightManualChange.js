import React from "react";
import { showHighlight } from "actions/actions";
import { connect } from "react-redux";

const PathButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{textAlign:"-webkit-center", color:"orange"}}
    onClick={() => {
      onClick();
    }}
  >
    Highlight Manual Edit
  </button>
);

export default connect(
  state => ({}),
  dispatch => ({
    onClick: () => dispatch(showHighlight())
  })
)(PathButton);
