import React from "react";
import { removeBarcodes } from "actions/barcode";
import { connect } from "react-redux";

const RemoveBarcodeButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{textAlign:"-webkit-center", color:"orange"}}
    onClick={() => {
      onClick();
    }}
  >
    Remove Barcodes
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(removeBarcodes)
  })
)(RemoveBarcodeButton);
