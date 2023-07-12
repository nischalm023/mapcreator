import React from "react";
import ManageConnectedConveyorSystemForm from "./Util/ManageConnectedConveyorSystemForm";
import { connect } from "react-redux";
import {
    convertNestedListToList,
} from "actions/conveyor";
import {updateConnectedConveyor,removeConnectedConveyor} from "actions/connectConveyor";
import "./uploadMaptoGsb.css";
import { getBarcodes } from "../../../utils/selectors";


const schema = () => {
    return {
        title: "Manage Connected Conveyor System",
        type: "object",
    };
};

const checkDisabled = ConveyorDict => {
  const conveyorEnum = Object.keys(ConveyorDict);
  var disable_status = true
  if(conveyorEnum.length>0){
    var disable_status = false
  }
 return disable_status 
};


const ManageConnectedConveyorSystem = ({ onSubmit, disabled, ConnectedconveyorTile,floor_barcodes}) => (
    <ManageConnectedConveyorSystemForm
        schema={schema()}
        disabled={disabled}
        floor_barcodes={floor_barcodes}
        ConnectedconveyorTile={ConnectedconveyorTile}
        onSubmit={onSubmit}
        buttonText={"Manage Connected Conveyor System"}
    />
);

 
export default connect(
    state => {
        let ConnectedconveyorTile = state.normalizedMap.entities.ConnectedconveyorTile;
        var floor_barcodes = {};
        var barcodes = getBarcodes(state)
        var current_floor = state.currentFloor
        var floor_value = state.normalizedMap.entities.floor
        var current_floor_value = floor_value[current_floor]
        
        const barcodeKeys = current_floor_value.map_values;
        barcodeKeys.forEach((barcodeKey) => {
          floor_barcodes[barcodeKey] = barcodes[barcodeKey];
        });
        if(ConnectedconveyorTile == undefined || Object.keys(ConnectedconveyorTile).length==0){
            disabled = true
        }else{
            var disabled = checkDisabled(ConnectedconveyorTile)
        }
        return {
            disabled: disabled,
            floor_barcodes:floor_barcodes,
            ConnectedconveyorTile: ConnectedconveyorTile,
        }
    },
    dispatch => ({
        onSubmit: (formData,remove=false) => {
            if(remove){
                dispatch(removeConnectedConveyor(formData));
            }else{
                dispatch(updateConnectedConveyor(formData));
            }
        }
    })
)(ManageConnectedConveyorSystem);
