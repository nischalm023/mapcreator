import React, { Component } from "react";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { selectActiveConveyor,convertNestedListToList } from "actions/conveyor";
import { getBarcodes } from "../../../utils/selectors";
import ButtonForm from "./Util/ButtonForm";

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

const IsSelectedTileActivePointOrEndPoint = (conveyorTile,map_tile_value) => {
  if(conveyorTile.hasOwnProperty("conveyor_end") && 
      map_tile_value.includes(conveyorTile["conveyor_end"].toString()))
      {
        return true
      }
  if(conveyorTile["conveyor_active"].length>0){
    var conveyor_active_list = []
    for (var i = 0; i < conveyorTile["conveyor_active"].length; i++) {
      conveyor_active_list.push(conveyorTile["conveyor_active"][i]["conveyor_active_point"])
    }
    var conveyor_active = convertNestedListToList(conveyor_active_list)
    if(map_tile_value.some(item => conveyor_active.includes(item))){
      return true
    }
  }
  return false
};

const checkPointLieInMiddleConveyorBelt = (conveyorTile,map_tile_value) => {
  var selected_tile = convertNestedListToList(conveyorTile)
  if(!map_tile_value.includes(selected_tile[0]) && !map_tile_value.includes(selected_tile[selected_tile.length - 1])){
    return false
  }
  return true
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
      var middle_point= checkPointLieInMiddleConveyorBelt(conveyorTile[conveyor_id][["selected_tile"]],map_tile_value)
      var point_already_exist = IsSelectedTileActivePointOrEndPoint(conveyorTile[conveyor_id],map_tile_value)
      if(!point_exist && !pps_eligible && !middle_point && !point_already_exist){
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
