import React, { Component } from "react";
import { connect } from "react-redux";
import { locateBarcode } from "actions/barcode";
import { barcodeStringSchema } from "utils/forms";

class LocateBarcode extends Component {
  state = {
    barcodeString: ""
  };
  render() {
    const { dispatch } = this.props;
    const { barcodeString } = this.state;
    const regex = new RegExp(barcodeStringSchema.pattern);
    return (
      <form className="form-inline">
        <label className="sr-only" htmlFor="barcodeInput">
          Name
        </label>
        <input
          type="text"
          className="form-control mr-1"
          id="barcodeInput"
          placeholder="Enter Barcode"
          value={barcodeString}
          onChange={e => this.setState({ barcodeString: e.target.value })}
          style={{ width: "150px" }}
        />
        <button
          disabled={!regex.test(barcodeString)}
          onClick={e => {
            e.preventDefault();
            dispatch(locateBarcode(barcodeString));
          }}
          className="btn btn-secondary"
          style={{ textAlign: "-webkit-center", color: "orange" }}
        >
          Locate
        </button>
      </form>
    );
  }
}

export default connect()(LocateBarcode);
