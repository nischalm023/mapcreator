import React, { Component } from "react";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { downloadConveyor } from "actions/conveyor";


const validateConveyorEntity = (conveyorTile) => {
  var failed_list = []
  for (const [key, value] of Object.entries(conveyorTile)) {
     if(value.conveyor_active.length === 0 || !value.hasOwnProperty("conveyor_exit") || !value.hasOwnProperty("conveyor_entry")){
        failed_list.push(key)
     }
  }
  if(failed_list.length !== 0){
    return true
  }else{
    return false
  }
};


// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class DownloadConveyorSystem extends Component {
  state = {
    show: false,
    error: undefined
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { ConveyorDict,onClick,disabled } = this.props;
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
        Download Conveyor System
      </button>
    </div>

    );
  }
}

export default connect(
  state => {
    var conveyorTile = state.normalizedMap.entities.conveyorTile
    if(conveyorTile == undefined || Object.keys(conveyorTile).length==0){
      disabled = true
    }else{
      var disabled = validateConveyorEntity(conveyorTile);
    }
    return{
          disabled:disabled,
    }
  },
  (dispatch) => ({
    onClick: () => dispatch(downloadConveyor()),
  })
)(DownloadConveyorSystem);
