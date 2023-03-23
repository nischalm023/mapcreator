import React from "react";
import { connect } from "react-redux";
import { changeBarcodeFormat } from "actions/changeBarcodeFormat";

const ChangeBarcodeFormat = ({ value, onClick, options }) => (
  <form className="form-inline">
    <div className="form-group">
      <label className="col-form-label pr-2">Change Barcode Format:</label>
      <select
        className="form-control"
        onClick={onClick}
      >
      <option value="default_format">Default Format</option>
      <option value="ttp_format">TTP Barcode Format (xy xxxx yyyy)</option>
    </select>
    </div>
  </form>
);

export default connect(
  () => ({}),
  dispatch => ({
    onClick: e => dispatch(changeBarcodeFormat(e.target.value))
  })
)(ChangeBarcodeFormat);
