import React, { Component } from "react";
import {
  selectEntryConveyor,
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
    var selected_tile = convertNestedListToList(value["selected_tile"])
    const entryArray = selectedMapTiles.filter(value => selected_tile.includes(value));
    const ioPointArray = selectedMapTiles.filter(value => !selected_tile.includes(value));
    if(entryArray.length==1 && ioPointArray.length==1){
      return [key,entryArray[0],ioPointArray[0],false]
    }
  }
  return ['','','',true]   
};

const checkPointAlreadyExistOnConveyorBelt = (conveyorTile) => {
  if(conveyorTile.hasOwnProperty("conveyor_entry")){
    return true
  }
  return false
};

const checkExistPointConveyorBelt = (conveyorTile,map_tile_value) => {
  if(conveyorTile.hasOwnProperty("conveyor_exit") && conveyorTile["conveyor_exit"].toString()==map_tile_value){
    return true
  }
  return false
};

const checkPointAlreadyExist = (conveyorTile,io_point) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    if(value.hasOwnProperty("conveyor_io_exit")){
      var io_point_exist = JSON.parse(value["conveyor_io_exit"])
      if(io_point_exist.toString() === io_point){
        return true
      }
    }
    if(value.hasOwnProperty("conveyor_io_entry")){
      var io_point_entry = JSON.parse(value["conveyor_io_entry"])
      if(io_point_entry.toString() === io_point){
        return true
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

const checkPointLieOnEdgeInConveyorBelt = (conveyorTile,tileId,barcodes) => {
  var selected_tile = convertNestedListToList(conveyorTile)
  if (barcodes[tileId].hasOwnProperty('adjacency')) {
          var nbTileId = convertNestedListToList(barcodes[tileId]["adjacency"])
        }
        else {
          var nbTileId = getNeighbourTiles(tileId)
        }
  const filteredArray = selected_tile.filter(value => nbTileId.includes(value));
  if(filteredArray.length===1){
    return false
  }
  return true
};

const shouldBeDisabled = (map_tile_value, barcodes, conveyorTile) => {
  var conveyor_id = ''
  if(map_tile_value.length==2){
     var [conveyor_id,entry_point,io_point,point_exist] =checkPointLieOnConveyorBelt(conveyorTile,map_tile_value)
     if(conveyor_id!=''){
      var io_point_not_lie_on_conveyor_belt = checkIOPointNotLieOnConveyorBelt(conveyorTile,io_point)
      var one_entry_point_exist = checkPointAlreadyExistOnConveyorBelt(conveyorTile[conveyor_id])
      var io_point_exist = checkPointAlreadyExist(conveyorTile,io_point)
      // var edge_point_exist = checkPointLieOnEdgeInConveyorBelt(conveyorTile[conveyor_id]["selected_tile"],entry_point,barcodes)
      var check_exit_point = checkExistPointConveyorBelt(conveyorTile[conveyor_id],entry_point)
      if(!io_point_exist && !io_point_not_lie_on_conveyor_belt && !point_exist && !one_entry_point_exist && !check_exit_point){
        return [conveyor_id,entry_point,io_point,false]
      }
     }
  }
  return [conveyor_id,'','',true]
};

let direction_mapping = {0:"North",1:"East",2:"South",3:"West"}
// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddEntryPoint extends Component {
  state = {
    bot_direction: "",
    direction: "",
    error: undefined,
    conveyor_id:"",
    show: false,
    entry_io_point:"",
    entry_height:"",
    bot_direction_options: {North: 0, East: 1, South: 2, West: 3}
  };
  handleSubmit = (event,dispatch,conveyor_id,direction,entry_point) => {
        event.preventDefault();
        const formData = {
            bot_direction:parseInt(this.state.bot_direction),
            direction:parseInt(this.state.direction),
            entry_io_point:this.state.entry_io_point,
            conveyor_id: conveyor_id,
            conveyor_entry:entry_point,
            entry_height:parseInt(this.state.entry_height)
        };
        this.toggle()
        dispatch(selectEntryConveyor(formData));
    };

  setBotDirectionState = (selected_entry_direction) =>{
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
  }

  onClickEntryDirection = (event, selected_tile=null, conveyorTile=null, conveyor_id=null, 
                            floor_barcodes=null, direction=null) => {
    this.setState({ direction: event.target.value})
    this.setBotDirectionState(event.target.value)
  };
  onClickBotDirection = (event) => {
      event.preventDefault();
      this.setState({ bot_direction: event.target.value })
    };
    
  toggle = (selected_tile=null,conveyorTile=null, conveyor_id=null, 
    floor_barcodes=null,direction=null,io_point=null) => {
            this.setState({ show: !this.state.show});
            if(direction && floor_barcodes){
              var direction_key = Object.keys(direction)
              this.setState({ direction: direction[direction_key[0]] });
              this.setBotDirectionState(direction[direction_key[0]])
              this.setState({ entry_io_point:floor_barcodes[io_point]["barcode"]})
            }
          }

  render() {
    const { error, entryDone ,show,entry_io_point,bot_direction,entry_height} = this.state;
    // const {conveyor_id,direction,disabled, bot_direction,floor_barcodes,conveyorTile,selected_tile,dispatch} = this.props;
    const {conveyor_id,direction,disabled,floor_barcodes,conveyorTile,selected_tile,dispatch,io_point,entry_point} = this.props;

    return (
      <div>
          <ButtonForm
            show={show}
            disabled={disabled}
            toggle={()=>this.toggle(selected_tile,conveyorTile,conveyor_id, 
              floor_barcodes,direction,io_point)}
            buttonText="Select Conveyor Entry Point"
            >
            <form onSubmit={(e)=>this.handleSubmit(e,dispatch,conveyor_id,direction,entry_point)}>
                <legend>Add Entry point Details</legend>
                <div className="form-group">
                  <label for="direction">Conveyor Entry Direction*</label>
                  {/* <input id="direction" className="form-control" type="text" value={direction_mapping[direction]}/> */}
                  <select 
                    id="entry-direction" 
                    onChange={(e) => this.onClickEntryDirection(e, selected_tile, conveyorTile, conveyor_id, floor_barcodes, direction)} 
                    className="form-control" 
                    name="direction"
                    required
                    onInvalid={(e) => e.target.setCustomValidity('No valid entry points found')}
                    onInput={(e) => e.target.setCustomValidity('')}
                    >
                    {Object.keys(direction).map((key) => (
                      <option value={direction[key]}>
                        {key}
                      </option>
                    ))}
                  </select>
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
                  <input id="direction" className="form-control" type="text" value={entry_io_point} disabled/>
                  <br/>
                  <label for="direction">Conveyor Entry Height*</label>
                  <input id="direction" 
                    className="form-control" 
                    type="number" 
                    onChange = {(e)=>this.setState({entry_height: e.target.value})}
                    min="1"
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
      var [conveyor_id,entry_point,io_point,disabled] = shouldBeDisabled(map_tile_value, floor_barcodes, conveyorTile);
    }
    // find entry direction options
    var direction = getConveyorPointDirection(state, floor_barcodes, map_tile_value, conveyorTile, conveyor_id)
    // find bot direction options
    // var bot_direction = getConveyorPointBotDirection(floor_barcodes, map_tile_value, direction, conveyorTile, conveyor_id)
    return {
      conveyor_id:conveyor_id,
      direction:direction,
      disabled:disabled,
      entry_point:entry_point,
      io_point:io_point,
      // bot_direction:bot_direction,
      selected_tile:map_tile_value,
      conveyorTile:conveyorTile,
      floor_barcodes:floor_barcodes
    }
    
  },
  
)(AddEntryPoint);
