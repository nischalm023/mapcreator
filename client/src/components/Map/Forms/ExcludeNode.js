import React from "react";
import { excludeNode } from "actions/actions";
import { connect } from "react-redux";

const ExcludeButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{textAlign:"-webkit-center", color:"orange"}}
    onClick={() => {
      onClick();
    }}
  >
    Exclude Node
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(excludeNode())
  })
)(ExcludeButton);
