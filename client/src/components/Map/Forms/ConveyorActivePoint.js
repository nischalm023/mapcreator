import React, { Component } from "react";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { selectActiveConveyor,convertNestedListToList } from "actions/conveyor";
import { getBarcodes } from "../../../utils/selectors";
import ButtonForm from "./Util/ButtonForm";
import {getNeighbourTiles } from "utils/util";

const checkPointLieOnConveyorBelt = (conveyorTile,selectedMapTiles) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    var selected_tile = convertNestedListToList(value["selected_tile"])
    const filteredArray = selectedMapTiles.filter(value => selected_tile.includes(value));
    if(filteredArray.length==1){
      return [key,filteredArray[0],false]
    }
  }
  return ['','',true]   
};

const checkSameEntryPointOnConveyorBelt = (conveyorTile,active_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = conveyorTile.conveyor_entry
      for (var i = 0; i < conveyor_entry_details.length; i++) {
          var entry_coordinate = conveyor_entry_details[i].conveyor_entry[0].toString()
          if(entry_coordinate === active_point){
              return true
          }
      }
  }
  return false
};

const checkSameExitPointOnConveyorBelt = (conveyorTile,active_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = conveyorTile.conveyor_exit
      for (var i = 0; i < conveyor_exit_details.length; i++) {
          var exit_coordinate = conveyor_exit_details[i].conveyor_exit[0].toString()
          if(exit_coordinate === active_point){
              return true
          }
      }
  }
  return false
};

const checkSameActvePointOnConveyorBelt = (conveyorTile,active_point) => {
  if(conveyorTile.conveyor_active.length!==0){
      var conveyor_active_details = conveyorTile.conveyor_active
      for (var i = 0; i < conveyor_active_details.length; i++) {
          var active_coordinate = conveyor_active_details[i].conveyor_active_point[0]
          if(active_coordinate === active_point){
              return true
          }
      }
  }
  return false
};

const checkSameEndPointOnConveyorBelt = (conveyorTile,active_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_end")){
      var conveyor_end_details = conveyorTile.conveyor_end[0].toString()
      if(conveyor_end_details === active_point){
              return true
        }
  }
  return false
};


const checkPpsEligibleSystem = (pps_dict,map_tile_value) => {
  for (const [key, value] of Object.entries(pps_dict)) {
    if( value["eligible_system"] !== undefined){
        var eligible_system = value["eligible_system"].join("_")
            if(map_tile_value.includes(value["coordinate"]) && (eligible_system == "ttp" || eligible_system == "ttp_rtp")){
                return [key,value["coordinate"],false]
            }
        }
    }
  return ['','',true]
};

const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile,pps_dict) => {
  var conveyor_id = ''
  var pps_id = ''
  var pps_coordinate = ''
  var active_point_coordinate = ''
  if(map_tile_value.length==2){
     var [conveyor_id,active_point_coordinate,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
      var [pps_id,pps_coordinate,pps_eligible] = checkPpsEligibleSystem(pps_dict,map_tile_value)
      var already_entry_point_exist = checkSameEntryPointOnConveyorBelt(conveyorTile[conveyor_id],active_point_coordinate)
      var already_exit_point_exist = checkSameExitPointOnConveyorBelt(conveyorTile[conveyor_id],active_point_coordinate) 
      var already_active_point_exist = checkSameActvePointOnConveyorBelt(conveyorTile[conveyor_id],active_point_coordinate)
      var already_end_point_exist = checkSameEndPointOnConveyorBelt(conveyorTile[conveyor_id],active_point_coordinate)
      if(!point_exist && !pps_eligible && !already_entry_point_exist 
        && !already_exit_point_exist && !already_active_point_exist && !already_end_point_exist){
        return [conveyor_id,pps_id,pps_coordinate,active_point_coordinate,false]
      }
     }
  }
  return [conveyor_id,pps_id,pps_coordinate,active_point_coordinate,true]
};


// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class ConveyorActivePoint extends Component {
  state = {
    show: false,
    error: undefined
  };
  handleSubmit = (event,dispatch,pps_id,conveyor_id,active_point_coordinate,pps_coordinate) => {
        event.preventDefault();
        const formData = {
            pps_id:pps_id,
            conveyor_id:conveyor_id,
            active_point: [active_point_coordinate],
            pps_coordinate:pps_coordinate
        };
        this.toggle()
        dispatch(selectActiveConveyor(formData));
    };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { onClick,pps_id,conveyor_id,disabled,dispatch,active_point_coordinate,pps_coordinate,active_point_barcode } = this.props;
    return (
    <div>
      <SweetAlertError
          title="Server Error"
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <ButtonForm
            show={show}
            disabled={disabled}
            toggle={this.toggle}
            buttonText="Select Conveyor Active Point"
            >
        <form onSubmit={(e)=>this.handleSubmit(e,dispatch,pps_id,conveyor_id,active_point_coordinate,pps_coordinate)}>
            <legend>An active point at barcode {active_point_barcode} for Conveyor ID {conveyor_id} will be
            created and associated to PPS ID {pps_id}. Do you want to continue?</legend>
            <input type="submit" className="btn btn-outline-primary mr-1" value="Ok"></input>
            <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={this.toggle}
            >
                Cancel
            </button>
        </form>
      </ButtonForm>
    </div>

    );
  }
}

export default connect(
  state => {
    var selectedMapTiles = state.selection.mapTiles
    var barcodes = getBarcodes(state)
    var current_floor = state.currentFloor
    var floor_value = state.normalizedMap.entities.floor
    var conveyorTile = state.normalizedMap.entities.conveyorTile
    var pps_dict = state.normalizedMap.entities.pps
    var current_floor_value = floor_value[current_floor]
    var floor_barcodes = {};
    var conveyor_id = ''
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    var map_tile_value = Object.keys(selectedMapTiles)

    if(conveyorTile == undefined || Object.keys(conveyorTile).length==0){
      disabled = true
    }else{
      var [conveyor_id,pps_id,pps_coordinate,active_point_coordinate,disabled] = shouldBeDisabled(map_tile_value, floor_barcodes, conveyorTile,pps_dict);
      var active_point_barcode = ""
      if(active_point_coordinate !== undefined && active_point_coordinate!==""){
        active_point_barcode = floor_barcodes[active_point_coordinate].barcode
      }
    }
    return{
          pps_id:pps_id,
          conveyor_id:conveyor_id,
          disabled:disabled,
          pps_coordinate:pps_coordinate,
          active_point_coordinate:active_point_coordinate,
          active_point_barcode:active_point_barcode
    }
  }
)(ConveyorActivePoint);
