import React from "react";
import { view_overlap_barcode } from "actions/view_overlap_barcodes";
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
    View Overlap Barcodes
  </button>
);

export default connect(
  state => ({
    disabled: state.selection.conveyorMode === true
  }),
  (dispatch) => ({
    onClick: () => dispatch(view_overlap_barcode()),
  })
)(PathButton);
