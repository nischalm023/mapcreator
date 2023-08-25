import React, { Component } from "react";
import {
  linkIOConveyor,
  convertNestedListToList,
  getConveyorPointDirection,
  getConveyorPointBotDirection,
  getIoPoint
} from "actions/conveyor";
import { connect } from "react-redux";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";
import { getBarcodes } from "../../../utils/selectors";
import ButtonForm from "./Util/ButtonForm";

const checkPointLieOnConveyorBelt = (conveyorTile,selectedMapTiles) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    let entry_point_value = []
    let exit_point_value = []
    var selected_tile = convertNestedListToList(value["selected_tile"])
    const conveyorArray = selectedMapTiles.filter(value => selected_tile.includes(value));
    const ioPointArray = selectedMapTiles.filter(value => !selected_tile.includes(value));
    var all_entry_point = []
    var all_exit_point = []
    if(value.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = value.conveyor_entry
      for (var i = 0; i < conveyor_entry_details.length; i++) {
        if(conveyor_entry_details[i].conveyor_entry[0].toString() === conveyorArray[0]){
          if(conveyorArray.length==1 && ioPointArray.length==1 && !conveyor_entry_details[i].hasOwnProperty('conveyor_io_entry')){
            var direction = conveyor_entry_details[i]["entry_point_direction"]
            return [key,conveyorArray[0],ioPointArray[0],"entry",conveyor_entry_details[i]["conveyor_entry_height"],direction,false]
          }
        }
        
      }
    }
    if(value.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = value.conveyor_exit
      for (var i = 0; i < conveyor_exit_details.length; i++) {
        if(conveyor_exit_details[i].conveyor_exit[0].toString() === conveyorArray[0]){
          if(conveyorArray.length==1 && ioPointArray.length==1 && !conveyor_exit_details[i].hasOwnProperty("conveyor_io_exit")){
            var direction = conveyor_exit_details[i]["exit_point_direction"]
            return [key,conveyorArray[0],ioPointArray[0],"exit",conveyor_exit_details[i]["conveyor_exit_height"],direction,false]
          }
        }
      }
    }
    
    if(all_exit_point.includes(conveyorArray[0])){
      
    }
    
  }
  return ['','','','','','',true]   
};

const checkDuplicateIOPoint = (conveyorTile,io_point) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    if(value.hasOwnProperty("conveyor_entry")){
        var conveyor_entry_details = value["conveyor_entry"]
        for (var i = 0; i < conveyor_entry_details.length; i++) {
          if(conveyor_entry_details[i].hasOwnProperty('conveyor_io_entry')){
            var io_coordinate = JSON.parse(conveyor_entry_details[i].conveyor_io_entry)
            if(io_coordinate.toString() === io_point){
                return true
            }
          }
            
        }
      }
      if(value.hasOwnProperty("conveyor_exit")){
        var conveyor_exit_details = value["conveyor_exit"]
        for (var i = 0; i < conveyor_exit_details.length; i++) {
          if(conveyor_exit_details[i].hasOwnProperty('conveyor_io_exit')){
            var io_coordinate = JSON.parse(conveyor_exit_details[i].conveyor_io_exit)
            if(io_coordinate.toString() === io_point){
                return true
            }
          }
        }
      }
    }
  return false
};

const checkIOPointNotLieOnConveyorBelt = (conveyorTile,io_point) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    var selected_tile = convertNestedListToList(value["selected_tile"])
    if(selected_tile.includes(io_point)){
      return true
    }
  }
  return false
};

const checkIfHaiPortLinked = (haiPortTile,entry_point) => {
  for (const [key, value] of Object.entries(haiPortTile)) {
    if(value["entity_point"] === entry_point){
      return true
    }
  }
  return false
};

const checkIfIoLieOnHai = (haiPortTile,entry_point,io_point) => {
  for (const [key, value] of Object.entries(haiPortTile)) {
    if(value["entity_point"] === entry_point || value["port_coordinate"] === io_point || value["io_coodinate"] === io_point){
      return true
    }
  }
  return false
};

const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile,haiPortTile) => {
  var conveyor_id = ''
  if(map_tile_value.length==2){
     var [conveyor_id,entry_point,io_point,link_entity_value,height,direction,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
      var io_point_not_lie_on_conveyor_belt = checkIOPointNotLieOnConveyorBelt(conveyorTile,io_point)
      var already_exist_io_point = checkDuplicateIOPoint(conveyorTile,io_point)
      var if_hai_port_linked = checkIfHaiPortLinked(haiPortTile,entry_point)
      var is_io_point_not_lie_on_hai_port = checkIfIoLieOnHai(haiPortTile,entry_point,io_point)
      if(!is_io_point_not_lie_on_hai_port && !already_exist_io_point && !io_point_not_lie_on_conveyor_belt && !point_exist && !if_hai_port_linked){
        return [conveyor_id,entry_point,io_point,link_entity_value,height,direction,false]
      }
     }
  }
  return [conveyor_id,'','','','','',true]
};

let direction_mapping = {0:"North",1:"East",2:"South",3:"West"}
// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class LinkIOPOint extends Component {
  state = {
    bot_direction: "",
    show: false,
    bot_direction_options: {North: 0, East: 1, South: 2, West: 3}
  };
  handleSubmit = (event,dispatch,conveyor_id,io_point,link_entity_value,entry_point) => {
        event.preventDefault();
        const formData = {
            bot_direction:parseInt(this.state.bot_direction),
            io_point:io_point,
            conveyor_id: conveyor_id,
            entry_point:entry_point,
            link_entity_value:link_entity_value
        };
        this.toggle()
        dispatch(linkIOConveyor(formData));
    };

  setBotDirectionState = (selected_entry_direction) =>{
    console.log("direction------------",selected_entry_direction)
    let all_directions = {North: 0, East: 1, South: 2, West: 3}
    let possibleBotDirections ={}
    if(parseInt(selected_entry_direction) === 0 || parseInt(selected_entry_direction) === 2){
        possibleBotDirections["East"] = all_directions["East"]
        possibleBotDirections["West"] = all_directions["West"]
      }
    if(parseInt(selected_entry_direction) === 1 || parseInt(selected_entry_direction) === 3){
        possibleBotDirections["North"] = all_directions["North"]
        possibleBotDirections["South"] = all_directions["South"]
      }
    this.setState({ bot_direction_options: possibleBotDirections})
    var possibleBotDirectionsKey = Object.keys(possibleBotDirections)
    this.setState({ bot_direction: possibleBotDirections[possibleBotDirectionsKey[0]]})
    console.log("this.state============",this.state)
  }

  onClickBotDirection = (event) => {
      event.preventDefault();
      this.setState({ bot_direction: event.target.value })
    };
    
  toggle = (selected_tile=null,conveyorTile=null, conveyor_id=null, 
    floor_barcodes=null,direction=null,io_point=null) => {
            this.setState({ show: !this.state.show});
            if(direction!==null && direction!==undefined && floor_barcodes){
              this.setBotDirectionState(direction)
            }
          }

  render() {
    const { error, entryDone ,show,bot_direction} = this.state;
    const {conveyor_id,direction,disabled,floor_barcodes,conveyorTile,selected_tile,dispatch,io_point,entry_point,link_entity_value,height,io_point_coordinate} = this.props;

    return (
      <div>
          <ButtonForm
            show={show}
            disabled={disabled}
            toggle={()=>this.toggle(selected_tile,conveyorTile,conveyor_id, 
              floor_barcodes,direction,io_point)}
            buttonText="Link Conveyor IO Point"
            >
            <form onSubmit={(e)=>this.handleSubmit(e,dispatch,conveyor_id,io_point_coordinate,link_entity_value,entry_point)}>
                <legend>Link IO Point</legend>
                <div className="form-group">
                  {link_entity_value === "entry"? <label for="direction">Conveyor Entry Direction*</label>:
                  <label for="direction">Conveyor Exit Direction*</label>}
                  
                  <input id="direction" className="form-control" type="text" value={direction_mapping[direction]} disabled/>
                  <br/>
                  <label for="type">Bot Orientation Direction*</label>
                    <select onChange={(e)=>this.onClickBotDirection(e)} className="form-control" id="eligible_system" name="eligible_system">
                      {/* {Object.keys(bot_direction).map((key) => (
                        <option value={bot_direction[key]}>
                          {key}
                        </option>
                      ))} */}
                      {Object.keys(this.state.bot_direction_options).map((key) => (
                        <option value={this.state.bot_direction_options[key]}>
                          {key}
                        </option>
                      ))}
                    </select>
                  <br/>
                  <label for="direction">Conveyor IO Point Barcode*</label>
                  <input id="direction" className="form-control" type="text" value={io_point} disabled/>
                  <br/>
                  {link_entity_value === "entry"? <label for="direction">Conveyor Entry Height*</label>:
                  <label for="direction">Conveyor Exit Height*</label>}
                  <input id="direction" 
                    className="form-control" 
                    type="number"
                    value={height}
                    disabled
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
    var haiPortTile = state.normalizedMap.entities.haiPortTile
    var current_floor_value = floor_value[current_floor]
    var floor_barcodes = {};
    var conveyor_id = ''
    var io_point_val=''
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    var map_tile_value = Object.keys(selectedMapTiles)

    if(conveyorTile == undefined || Object.keys(conveyorTile).length==0 || haiPortTile == undefined){
      disabled = true
    }else{
      var [conveyor_id,entry_point,io_point,link_entity_value,height,direction,disabled] = shouldBeDisabled(map_tile_value, floor_barcodes, conveyorTile,haiPortTile);
      if(io_point !==""){
        var io_point_val = floor_barcodes[io_point]["barcode"]
        var io_point_coordinate = io_point
      }
    }
      return {
        conveyor_id:conveyor_id,
        direction:direction,
        disabled:disabled,
        entry_point:entry_point,
        io_point:io_point_val,
        io_point_coordinate:io_point_coordinate,
        link_entity_value:link_entity_value,
        selected_tile:map_tile_value,
        height:height,
        conveyorTile:conveyorTile,
        floor_barcodes:floor_barcodes
      }
    
    
  },
  
)(LinkIOPOint);
