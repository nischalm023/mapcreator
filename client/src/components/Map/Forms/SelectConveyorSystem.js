import React, { Component } from "react";
import { convertNestedListToList } from "actions/conveyor";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import AddConveyorEntryPoint from "components/Map/Forms/AddConveyorEntryPoint";

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

const checkIfSelectedPointLieOnExistingConveyor = (selectedMapTiles, conveyorTile) => {
  if(conveyorTile == undefined || Object.keys(conveyorTile).length==0){
    return true
  }else{
    for (const [key, value] of Object.entries(conveyorTile)) {
      var selected_tile = convertNestedListToList(value["selected_tile"])
      if(Object.keys(selectedMapTiles).some(r=> selected_tile.includes(r))){
        return true
      } 
    
  }
  }
};

const shouldBeDisabled = (selectedMapTiles, barcodes, conveyorTile) => {
  var check_kariyo = checkIfSelectedPointLieOnExistingConveyor(selectedMapTiles,conveyorTile)
  return (
    !hasBarcodeForTile(selectedMapTiles, barcodes)
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class SelectConveyorSystemPoint extends Component {
  state = {
    show: false,
    error: undefined  
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { selectedMapTiles, barcodes, onClick, conveyorTile } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes, conveyorTile);
    if (disabled || this.state.show)
      return (
        <div>
          <button
              disabled={disabled || this.state.show}
              type="button"
              className="btn btn-secondary"
              style={{ textAlign: "-webkit-center", color: "orange" }}
          >
          Select Conveyor System
          </button>
        </div>
      );
    return (
    <div>
      
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
        Select Conveyor System
      </button>
      <div className="row py-1">
        <div className="col">
          {this.state.show===true?<AddConveyorEntryPoint/>:null}
        </div>
      </div>
      
    </div>

    );
  }
}

export default connect(
  state => ({
    selectedMapTiles: state.selection.mapTiles,
    barcodes: getBarcodes(state),
    conveyorTile:state.normalizedMap.entities.conveyorTile
  }),
  (dispatch) => ({
    // onClick: () => dispatch(selectConveyor()),
  })
)(SelectConveyorSystemPoint);
