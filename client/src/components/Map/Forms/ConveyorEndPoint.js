import React, { Component } from "react";
import { selectEndConveyor,convertNestedListToList } from "actions/conveyor";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";

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

const IsSelectedTileActivePointOrEndPoint = (conveyorTile,map_tile_value) => {
  if(conveyorTile.hasOwnProperty("conveyor_end")){
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


const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile) => {
  var conveyor_id = ''
  if(map_tile_value.length==1){
     var [conveyor_id,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
      var middle_point= checkPointLieInMiddleConveyorBelt(conveyorTile[conveyor_id][["selected_tile"]],map_tile_value)
      var point_already_exist = IsSelectedTileActivePointOrEndPoint(conveyorTile[conveyor_id],map_tile_value)
      if(!point_exist && !middle_point && !point_already_exist){
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
