import React, { Component } from "react";
import { selectExitConveyor } from "actions/conveyor";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import ConveyorEndPoint from "components/Map/Forms/ConveyorEndPoint";
import ConveyorActivePoint from "components/Map/Forms/ConveyorActivePoint";
import ConveyorDownload from "components/Map/Forms/ConveyorDownload";

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

const shouldBeDisabled = (selectedMapTiles, barcodes) => {
  return (
    !hasBarcodeForTile(selectedMapTiles, barcodes)
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddExitPoint extends Component {
  state = {
    show: false,
    error: undefined
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { selectedMapTiles, barcodes, onClick } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes);
    if (disabled)
      return (
        <div>
          <button
              disabled={disabled || this.state.show}
              type="button"
              className="btn btn-secondary"
              style={{ textAlign: "-webkit-center", color: "orange" }}
          >
          Select Conveyor Exit Point
          </button>
          <div className="row py-1">
            <div className="col">
              {this.state.show===true?<ConveyorEndPoint/>:null}
              <div className="row py-1">
                <div className="col">
                  {this.state.show===true?<ConveyorActivePoint/>:null}
                  <div className="row py-1">
                    <div className="col">
                        {this.state.show===true?<ConveyorDownload/>:null}
                    </div>
                  </div>
                </div>
              </div>
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
            disabled={this.state.show}
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
        Select Conveyor Exit Point
      </button>
      <div className="row py-1">
            <div className="col">
              {this.state.show===true?<ConveyorEndPoint/>:null}
              <div className="row py-1">
                <div className="col">
                  {this.state.show===true?<ConveyorActivePoint/>:null}
                  <div className="row py-1">
                    <div className="col">
                        {this.state.show===true?<ConveyorDownload/>:null}
                    </div>
                  </div>
                </div>
              </div>
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
    onClick: () => dispatch(selectExitConveyor()),
  })
)(AddExitPoint);
