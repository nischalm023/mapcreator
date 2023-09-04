import React, { Component } from "react";
import { selectEndConveyor,convertNestedListToList } from "actions/conveyor";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import {getNeighbourTiles } from "utils/util";

const checkPointLieOnConveyorBelt = (conveyorTile,selectedMapTiles) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    var selected_tile = convertNestedListToList(value["selected_tile"])
    const filteredArray = selectedMapTiles.filter(value => selected_tile.includes(value));
    if(filteredArray.length==1){
      return [key,false]
    }
  }
  return ['',true]   
};

const checkPointLieInMiddleConveyorBelt = (conveyorTile,tileId,barcodes) => {
  var selected_tile = convertNestedListToList(conveyorTile)
  if (barcodes[tileId].hasOwnProperty('adjacency')) {
          var nbTileId = convertNestedListToList(barcodes[tileId]["adjacency"])
        }
        else {
          var nbTileId = getNeighbourTiles(tileId)
        }
  const filteredArray = selected_tile.filter(value => nbTileId.includes(value));
  if(filteredArray.length>1){
    return false
  }
  return true
};

const checkSameEntryPointOnConveyorBelt = (conveyorTile,end_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = conveyorTile.conveyor_entry
      for (var i = 0; i < conveyor_entry_details.length; i++) {
          var entry_coordinate = conveyor_entry_details[i].conveyor_entry[0].toString()
          if(entry_coordinate === end_point){
              return true
          }
      }
  }
  return false
};

const checkSameExitPointOnConveyorBelt = (conveyorTile,end_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = conveyorTile.conveyor_exit
      for (var i = 0; i < conveyor_exit_details.length; i++) {
          var exit_coordinate = conveyor_exit_details[i].conveyor_exit[0].toString()
          if(exit_coordinate === end_point){
              return true
          }
      }
  }
  return false
};

const checkSameActvePointOnConveyorBelt = (conveyorTile,end_point) => {
  if(conveyorTile.conveyor_active.length!==0){
      var conveyor_active_details = conveyorTile.conveyor_active
      for (var i = 0; i < conveyor_active_details.length; i++) {
          var active_coordinate = conveyor_active_details[i].conveyor_active_point[0]
          if(active_coordinate === end_point){
              return true
          }
      }
  }
  return false
};

const checkSameEndPointOnConveyorBelt = (conveyorTile,end_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_end")){
      var conveyor_end_details = conveyorTile.conveyor_end[0].toString()
      if(conveyor_end_details === end_point){
              return true
        }
  }
  return false
};

const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile) => {
  var conveyor_id = ''
  if(map_tile_value.length==1){
     var [conveyor_id,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
      var middle_point= checkPointLieInMiddleConveyorBelt(conveyorTile[conveyor_id][["selected_tile"]],map_tile_value[0],barcodes)
      var already_entry_point_exist = checkSameEntryPointOnConveyorBelt(conveyorTile[conveyor_id],map_tile_value[0])
      var already_exit_point_exist = checkSameExitPointOnConveyorBelt(conveyorTile[conveyor_id],map_tile_value[0]) 
      var already_active_point_exist = checkSameActvePointOnConveyorBelt(conveyorTile[conveyor_id],map_tile_value[0])
      var already_end_point_exist = checkSameEndPointOnConveyorBelt(conveyorTile[conveyor_id],map_tile_value[0])
      if(!point_exist && !middle_point && !already_entry_point_exist && !already_exit_point_exist
        && !already_active_point_exist && !already_end_point_exist){
        return [conveyor_id,false]
      }
     }
  }
  return [conveyor_id,true]
};


// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddEndPoint extends Component {
  state = {
    show: false,
    error: undefined
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { onClick, ConveyorDict,conveyor_id,disabled,dispatch } = this.props;
    return (
    <div>
      <button
            type="button"
            disabled={disabled}
            className="btn btn-secondary"
            style={{ textAlign: "-webkit-center", color: "orange" }}
            onClick={() => {
                dispatch(selectEndConveyor(conveyor_id))
                this.toggle()
            }}
        >
        Select Conveyor End Point
      </button>
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
      var [conveyor_id,disabled] = shouldBeDisabled(map_tile_value, floor_barcodes, conveyorTile);
    }
    return{
          conveyor_id:conveyor_id,
          disabled:disabled,
    }
  }
)(AddEndPoint);
