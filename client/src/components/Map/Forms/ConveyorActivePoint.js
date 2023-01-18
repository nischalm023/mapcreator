import React, { Component } from "react";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { selectActiveConveyor } from "actions/conveyor";

const checkConveyorSystem = (ConveyorDict,conveyor_id) => {
  const conveyorEnum = Object.keys(ConveyorDict);
  var disable_status = true
  if(ConveyorDict.hasOwnProperty(conveyor_id)){
    var disable_status = false
  }
 return disable_status 
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddBarcode extends Component {
  state = {
    show: false,
    error: undefined
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { onClick, ConveyorDict,conveyor_id } = this.props;
    const disabled = checkConveyorSystem(ConveyorDict,conveyor_id[0]);
    return (
    <div>
      <SweetAlertError
          title="Server Error"
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
      <button
            type="button"
            disabled={disabled}
            className="btn btn-secondary"
            style={{ textAlign: "-webkit-center", color: "orange" }}
            onClick={() => {
                onClick();
                this.toggle()
            }}
        >
        Select Conveyor Active Point
      </button>
    </div>

    );
  }
}

export default connect(
  state => ({
    ConveyorDict: state.normalizedMap.entities.conveyorTile || {},
    conveyor_id:state.normalizedMap.entities.map.dummy.current_conveyor_id,
  }),
  (dispatch) => ({
    onClick: () => dispatch(selectActiveConveyor()),
  })
)(AddBarcode);
