import React from "react";
import { showPath } from "actions/actions";
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
    Show Path
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(showPath())
  })
)(PathButton);
