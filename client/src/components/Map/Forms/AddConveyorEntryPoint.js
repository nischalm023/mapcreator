import React, { Component } from "react";
import { selectEntryConveyor } from "actions/conveyor";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import AddConveyorExitPoint from "components/Map/Forms/AddConveyorExitPoint";

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

const shouldBeDisabled = (selectedMapTiles, barcodes) => {
  return (
    !hasBarcodeForTile(selectedMapTiles, barcodes)
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddEntryPoint extends Component {
  state = {
    entryDone: false,
    error: undefined
  };
  toggle = () => {
    this.setState({ entryDone: true },() => {
    })
  };
  render() {
    const { error, entryDone } = this.state;
    const { selectedMapTiles, barcodes, onClick } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes);
    if (disabled || this.state.entryDone)
      return (
        <div>
          <button
              disabled={disabled || this.state.entryDone}
              type="button"
              className="btn btn-secondary"
              style={{ textAlign: "-webkit-center", color: "orange" }}
          >
          Select Conveyor Entry Point
          </button>
          <div className="row py-1">
            <div className="col">
              {this.state.entryDone===true?<AddConveyorExitPoint/>:null}
            </div>
          </div>
        </div>
      );
    return (
    <div>
      <SweetAlertError
          title="Server Error"
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
      <button
            disabled={this.state.entryDone}
            type="button"
            className="btn btn-secondary"
            style={{ textAlign: "-webkit-center", color: "orange" }}
            onClick={() => {
                var onClicks = onClick();
                if(onClicks===true){
                 this.toggle()
                }
            }}
        >
        Select Conveyor Entry Point
      </button>
      <div className="row py-1">
        <div className="col">
          {this.state.entryDone===true?<AddConveyorExitPoint/>:null}
        </div>
      </div>
    </div>

    );
  }
}

export default connect(
  state => ({
    selectedMapTiles: state.selection.mapTiles,
    barcodes: getBarcodes(state)
  }),
  (dispatch) => ({
    onClick: () => dispatch(selectEntryConveyor()),
  })
)(AddEntryPoint);
