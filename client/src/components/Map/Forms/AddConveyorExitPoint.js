import React, { Component } from "react";
import {
  selectExitConveyor,
  convertNestedListToList,
  getConveyorExitPointDirection,
  getConveyorExitPointBotDirection,
  getConveyorPointBotDirection,
  getIoPoint
} from "actions/conveyor";
import * as constants from "../../../constants";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import ButtonForm from "./Util/ButtonForm";
import {getNeighbourTiles } from "utils/util";

const checkPointLieOnConveyorBelt = (conveyorTile,selectedMapTiles) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    var selected_tile = convertNestedListToList(value["selected_tile"])
    const entryArray = selectedMapTiles.filter(value => selected_tile.includes(value));
    if(entryArray.length==1){
      return [key,entryArray[0],false]
    }
  }
  return ['','',true]   
};

const checkSameEntryPointOnConveyorBelt = (conveyorTile,exit_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = conveyorTile.conveyor_entry
      for (var i = 0; i < conveyor_entry_details.length; i++) {
          var entry_coordinate = conveyor_entry_details[i].conveyor_entry[0].toString()
          if(entry_coordinate === exit_point){
              return true
          }
      }
  }
  return false
};

const checkSameExitPointOnConveyorBelt = (conveyorTile,exit_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = conveyorTile.conveyor_exit
      for (var i = 0; i < conveyor_exit_details.length; i++) {
          var exit_coordinate = conveyor_exit_details[i].conveyor_exit[0].toString()
          if(exit_coordinate === exit_point){
              return true
          }
      }
  }
  return false
};

const checkSameActvePointOnConveyorBelt = (conveyorTile,exit_point) => {
  if(conveyorTile.conveyor_active.length!==0){
      var conveyor_active_details = conveyorTile.conveyor_active
      for (var i = 0; i < conveyor_active_details.length; i++) {
          var active_coordinate = conveyor_active_details[i].conveyor_active_point[0]
          if(active_coordinate === exit_point){
              return true
          }
      }
  }
  return false
};

const checkSameEndPointOnConveyorBelt = (conveyorTile,exit_point) => {
  if(conveyorTile.hasOwnProperty("conveyor_end")){
      var conveyor_end_details = conveyorTile.conveyor_end[0].toString()
      if(conveyor_end_details === exit_point){
              return true
        }
  }
  return false
};

const checkMultipleExitV1 = (conveyorTile,conveyor_version) => {
  if (conveyorTile.hasOwnProperty("conveyor_exit") && conveyor_version !== constants.DEFAULT_CONVEYOR_VERSION){
    return true
  }
  return false
}

const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile, conveyor_version) => {
  var conveyor_id = ''
  if(map_tile_value.length==1){
     var [conveyor_id,exit_point,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
        var already_entry_point_exist = checkSameEntryPointOnConveyorBelt(conveyorTile[conveyor_id],exit_point)
        var already_exit_point_exist = checkSameExitPointOnConveyorBelt(conveyorTile[conveyor_id],exit_point) 
        var already_active_point_exist = checkSameActvePointOnConveyorBelt(conveyorTile[conveyor_id],exit_point)
        var already_end_point_exist = checkSameEndPointOnConveyorBelt(conveyorTile[conveyor_id],exit_point)
        var no_multiple_exit_v1 = checkMultipleExitV1(conveyorTile[conveyor_id],conveyor_version)
        if(!point_exist && !already_entry_point_exist && !already_exit_point_exist && !already_active_point_exist 
          && !already_end_point_exist && !no_multiple_exit_v1
          ){
          return [conveyor_id,exit_point,false]
        }          
     }
  }
  return [conveyor_id,'',true]
};


let direction_mapping = {0:"North",1:"East",2:"South",3:"West"}
// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddExitPoint extends Component {
  state = {
    bot_direction: "",
    direction: "",
    error: undefined,
    conveyor_id:"",
    show: false,
    exit_io_point:"",
    exit_height:"",
    bot_direction_options: {North: 0, East: 1, South: 2, West: 3}
  };
  handleSubmit = (event,dispatch,conveyor_id,direction,exit_point) => {
        event.preventDefault();
        const formData = {
            direction:parseInt(this.state.direction),
            conveyor_id: conveyor_id,
            exit_point:exit_point,
            exit_height:parseInt(this.state.exit_height)
        };
        this.toggle()
        dispatch(selectExitConveyor(formData));
    };

  onClickExitDirection = (event, selected_tile=null, conveyorTile=null, conveyor_id=null, 
    floor_barcodes=null, direction=null) => {
    this.setState({ direction: event.target.value})
  };

  toggle = (selected_tile=null,conveyorTile=null, conveyor_id=null, 
    floor_barcodes=null,direction=null,io_point=null) => {
            this.setState({ show: !this.state.show});
            if(direction && floor_barcodes){
              var direction_key = Object.keys(direction)
              this.setState({ direction: direction[direction_key[0]] });
            }
          }

  render() {
    
    const { error ,show, exit_io_point,exit_height} = this.state;
    const {conveyor_id,direction,disabled,floor_barcodes,conveyorTile,selected_tile,dispatch,exit_point} = this.props;
    return (
      <div>
          <ButtonForm
            show={show}
            disabled={disabled}
            toggle={()=>this.toggle(selected_tile,conveyorTile,conveyor_id, 
              floor_barcodes,direction)}
            buttonText="Select Conveyor Exit Point"
            >
            <form onSubmit={(e)=>this.handleSubmit(e,dispatch,conveyor_id,direction,exit_point)}>
                <legend>Add Exit point Details</legend>
                <div className="form-group">
                  <label for="direction">Conveyor Exit Direction*</label>
                  {/* <input id="direction" className="form-control" type="text" value={direction_mapping[direction]} disabled/> */}
                  <select 
                    id="direction" 
                    onChange={(e) => this.onClickExitDirection(e, selected_tile, conveyorTile, conveyor_id, floor_barcodes, direction)} 
                    className="form-control" 
                    name="direction"
                    required
                    onInvalid={(e) => e.target.setCustomValidity('No valid exit points found')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    >
                    {Object.keys(direction).map((key) => (
                      <option value={direction[key]}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <br/>
                  <label for="direction">Conveyor Exit Height*</label>
                  <input id="direction" 
                    className="form-control" 
                    type="number" 
                    min="1"
                    onChange = {(e)=>this.setState({exit_height: e.target.value})}
                    required
                  />
                  <br/>
                  <input type="submit" className="btn btn-outline-primary mr-1" value="Submit"></input>
                  <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={this.toggle}
                  >
                      Cancel
                  </button>
              </div>
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
    var conveyor_version = state.conveyorVersion
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
      var [conveyor_id,exit_point,disabled] = shouldBeDisabled(map_tile_value, floor_barcodes, conveyorTile, conveyor_version);
    }
    // find exit direction options
    var direction = getConveyorExitPointDirection(state, floor_barcodes, map_tile_value, conveyorTile, conveyor_id)
    return {
      conveyor_id:conveyor_id,
      direction:direction,
      disabled:disabled,
      exit_point:exit_point,
      selected_tile:map_tile_value,
      conveyorTile:conveyorTile,
      floor_barcodes:floor_barcodes
    }
    
  },
)(AddExitPoint);
