import React, { Component } from "react";
import {
  convertNestedListToList,
} from "actions/conveyor";
import {
  createHaiPort,
} from "actions/haiTemplate";
import { connect } from "react-redux";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";
import { getBarcodes } from "../../../utils/selectors";
import ButtonForm from "./Util/ButtonForm";
import { setErrorMessage } from "actions/message";
import * as constants from "../../../constants";

const entityCheck = (state,mapTile) =>{
  var barcodes = state.normalizedMap.entities.barcode
  var pps_list = []
  var ods_list = []
  var conveyors_list = []
  var conveyor_io_point = []
  var storable_io = []
  var elevator_list = []
  var elevator_entry = []
  var elevator_exit = []
  var charger_list = []
  var special_charger_list = []
  var entry_charger_list = []
  var pps_queue = []
  var pps_state = state.normalizedMap.entities.pps
  var ods_state = state.normalizedMap.entities.odsExcluded
  var chargers_state = state.normalizedMap.entities.charger
  var elevator_state = state.normalizedMap.entities.elevator
  var conveyor_state = state.normalizedMap.entities.conveyorTile
  var tote_state = state.normalizedMap.entities.ioPoints
  var mappingBarcodeCoord = state.normalizedMap.entities.mappingBarcodeCoord
  var errorMessage = ''
  
  for(let pps_key in pps_state){
    let pps = pps_state[pps_key];
    if(pps.coordinate===mapTile){
      pps_list.push(barcodes[pps.coordinate]["barcode"])
    }
    if(pps.queue_barcodes.includes(barcodes[mapTile]["barcode"])){
      pps_queue.push(barcodes[pps.coordinate]["barcode"])
    }
  }
  for(let ods_key in ods_state){
    let ods = ods_state[ods_key];
    if(ods.coordinate===mapTile){
      ods_list.push(barcodes[ods.coordinate]["barcode"])
    }
  }
  for(let charger_key in chargers_state){
    let charger = chargers_state[charger_key];
    var entry_charger_point = barcodes[mappingBarcodeCoord[charger.entry_point_location]]["adjacency"][charger.charger_direction].toString()
    if(charger.coordinate===mapTile){
      charger_list.push(barcodes[charger.coordinate]["barcode"])
    }
    if(charger.entry_point_location===barcodes[mapTile]["barcode"]){
      special_charger_list.push(barcodes[charger.coordinate]["barcode"])
    }
    if(entry_charger_point === mapTile){
      entry_charger_list.push(barcodes[charger.coordinate]["barcode"])
    }
  }
  for(let conveyor_key in conveyor_state){
    let conveyors = conveyor_state[conveyor_key];
    if(Object.keys(conveyors.conveyor_step_id).includes(mapTile)){
      conveyors_list.push(barcodes[mapTile]["barcode"])
    }
    if(conveyors.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = conveyors.conveyor_entry
      for (var entry = 0; entry < conveyor_entry_details.length; entry++) {
        if(conveyor_entry_details[entry].hasOwnProperty("conveyor_io_entry")){
          if(JSON.parse(conveyor_entry_details[entry].conveyor_io_entry).toString() === mapTile){
            conveyor_io_point.push(barcodes[mapTile]["barcode"])
         }
        }
      }
    }
    if(conveyors.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = conveyors.conveyor_exit
      for (var exit = 0; exit < conveyor_exit_details.length; exit++) {
        if(conveyor_exit_details[exit].hasOwnProperty("conveyor_io_exit")){
          if(JSON.parse(conveyor_exit_details[exit].conveyor_io_exit).toString() === mapTile){
            conveyor_io_point.push(barcodes[mapTile]["barcode"])
          }
        }
      }
    }
  }
  for(let io_key in tote_state){
    let tote_io = tote_state[io_key];
    if(tote_io.barcode===mapTile){
      storable_io.push(barcodes[mapTile]["barcode"])
    }
  }
  for(let elevator_key in elevator_state){
    let elevator = elevator_state[elevator_key]
    if(elevator.position === barcodes[mapTile]["barcode"]){
      elevator_list.push(barcodes[mapTile]["barcode"])
    }
    if(elevator.hasOwnProperty("entry_barcodes")){
      var elevator_entry_details = elevator.entry_barcodes
      for (var e_entry = 0; e_entry < elevator_entry_details.length; e_entry++) {
        if(elevator_entry_details[e_entry].barcode === barcodes[mapTile]["barcode"]){
            elevator_entry.push(barcodes[mapTile]["barcode"])
        }
      }
    }
    if(elevator.hasOwnProperty("exit_barcodes")){
      var elevator_exit_details = elevator.exit_barcodes
      for (var e_exit = 0; e_exit < elevator_exit_details.length; e_exit++) {
        if(elevator_exit_details[e_exit].barcode === barcodes[mapTile]["barcode"]){
            elevator_exit.push(barcodes[mapTile]["barcode"])
        }
      }
    }
  }
  return [pps_list,ods_list,conveyors_list,conveyor_io_point,storable_io,elevator_list,elevator_entry,elevator_exit,
    pps_queue,charger_list,special_charger_list]
  
}

const checkEntityPresentInVicinity = (state,mapTiles) =>{
  var errorMessage = ''
  for (var i = 0; i < mapTiles.length; i++) {
    var [pps_list,ods_list,conveyors_list,conveyor_io_point,storable_io,elevator_list,elevator_entry,elevator_exit,
    pps_queue,charger_list,special_charger_list] = entityCheck(state,mapTiles[i])
    if(pps_list.length !== 0 || ods_list.length !== 0 || conveyors_list.length !== 0 || 
      conveyor_io_point.length !== 0 || storable_io.length !== 0 || elevator_list.length !== 0 || elevator_entry.length !== 0 || elevator_exit.length !== 0 ||
      pps_queue.length !== 0 || charger_list.length !== 0 || special_charger_list.length !== 0){
      errorMessage = "Ranger Port cannot be added since there is an entity present in the minimum required distance."
      break;
    }
  }
  return errorMessage
}

const checkIOPointLieOnEntity = (state, io_point) => {
  var [pps_list,ods_list,conveyors_list,conveyor_io_point,storable_io,elevator_list,elevator_entry,elevator_exit,
  pps_queue,charger_list,special_charger_list] = entityCheck(state,io_point)
  var errorMessage = ''
  if(pps_list.length !== 0 || ods_list.length !== 0 || conveyors_list.length !== 0 || 
    conveyor_io_point.length !== 0 || storable_io.length !== 0 || elevator_list.length !== 0 || elevator_entry.length !== 0 || elevator_exit.length !== 0 ||
    pps_queue.length !== 0 || charger_list.length !== 0 || special_charger_list.length !== 0){
    errorMessage = "Ranger Port cannot be added since there is an entity present in the minimum required distance."
  }
  return errorMessage
};


const checkHaiPointLieOnEntity = (state, hai_point) => {
  var [pps_list,ods_list,conveyors_list,conveyor_io_point,storable_io,elevator_list,elevator_entry,elevator_exit,
  pps_queue,charger_list,special_charger_list] = entityCheck(state,hai_point)
  var errorMessage = ''
  if(pps_list.length !== 0 || ods_list.length !== 0 || conveyors_list.length !== 0 || 
     conveyor_io_point.length !== 0 || storable_io.length !== 0 || elevator_list.length !== 0 || 
     elevator_entry.length !== 0 || elevator_exit.length !== 0 ||
     pps_queue.length !== 0 || charger_list.length !== 0 || special_charger_list.length !== 0){
    errorMessage = "Ranger Port cannot be added since there is an entity present in the minimum required distance."
  }
  return errorMessage
};

const checkIfIoPointShiftPossible = (barcodes,hai_point,io_point,direction,entity_val) => {
  if(entity_val == "entry"){
    direction = (direction + 2) % 4
  }
  if (barcodes[io_point].hasOwnProperty('adjacency')){
    var nbTileId = convertNestedListToList(barcodes[io_point]["adjacency"])
  }else{
    var nbTileId = getNeighbourTiles(io_point)
  }
  var hai_port_world_coord  = JSON.parse(barcodes[hai_point]["world_coordinate"])
  var io_point_worldcoordinate =  JSON.parse(barcodes[io_point]["world_coordinate"])
  if(direction == constants.NORTH || direction == constants.SOUTH){
      var distance = Math.abs(Math.abs(hai_port_world_coord[1] - io_point_worldcoordinate[1]) - constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT)
    }
    if(direction == constants.EAST || direction == constants.WEST){
      var distance = Math.abs(Math.abs(hai_port_world_coord[0] - io_point_worldcoordinate[0]) - constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT)
    }
  if(nbTileId[direction] && nbTileId[direction] !== "" && Object.keys(barcodes).includes(nbTileId[direction])){
    var newTotalDistance = barcodes[io_point]["size_info"][direction] + barcodes[io_point]["size_info"][direction] - distance
    if(newTotalDistance<=0){
      return nbTileId[direction]
    }
  }  
  return ""
}

const checkIfIOPortAlreadyExist = (state, io_point,hai_point) => {
  if(state && state !== undefined && state !==null){
    for (const [key, value] of Object.entries(state.normalizedMap.entities.haiPortTile)) {
      if(value["io_coodinate"] === io_point || value["io_coodinate"] === hai_point){
        return true
      }
    }
  }
  return false
};

const checkIOPointNotLieOnConveyorBelt = (state,io_point) => {
  for (const [key, value] of Object.entries(state.normalizedMap.entities.conveyorTile)) {
    var selected_tile = convertNestedListToList(value["selected_tile"])
    if(selected_tile.includes(io_point)){
      return true
    }
  }
  return false
};

const checkIfHaiPortAlreadyExist = (state, hai_point,io_point) => {
  if(state && state !== undefined && state !==null){
    for (const [key, value] of Object.entries(state.normalizedMap.entities.haiPortTile)) {
      if(value["port_coordinate"] === hai_point || value["port_coordinate"] == io_point){
        return true
      }
    }
  }
  return false
};



const checkHaiPortValidation = (conveyorTile,selectedMapTiles) => {
  for (const [key, value] of Object.entries(conveyorTile)) {
    let hai_point = ''
    let io_point = ''
    var entry_point_value = ''
    var exit_point_value = ''
    var entry_direction = ''
    var exit_direction = ''
    var entity_height = ''
    var direction = ''
    if(value.hasOwnProperty("conveyor_entry")){
      var conveyor_entry_details = value.conveyor_entry
      for (var i = 0; i < conveyor_entry_details.length; i++) {
        entry_point_value = convertNestedListToList(conveyor_entry_details[i]["conveyor_entry"])
        entry_direction = conveyor_entry_details[i]["entry_point_direction"]
        entity_height = conveyor_entry_details[i]["conveyor_entry_height"]
        if(entry_point_value[0] === selectedMapTiles && !conveyor_entry_details[i].hasOwnProperty("conveyor_io_entry")){
          return [key,entry_direction,selectedMapTiles,entity_height,"entry",false]
        }
      }
    }
    if(value.hasOwnProperty("conveyor_exit")){
      var conveyor_exit_details = value.conveyor_exit
      for (var i = 0; i < conveyor_exit_details.length; i++) {
        exit_point_value = convertNestedListToList(conveyor_exit_details[i]["conveyor_exit"])
        exit_direction = conveyor_exit_details[i]["exit_point_direction"]
        entity_height = conveyor_exit_details[i]["conveyor_exit_height"]
        if(exit_point_value[0] === selectedMapTiles && !conveyor_exit_details[i].hasOwnProperty("conveyor_io_exit")){
            return [key,exit_direction,selectedMapTiles,entity_height,"exit",false]
        }
      }
    }
  }
  return ['','','','','',true]   
};




const validateIoPoint = (entity_point,direction,barcodes,entity_val) => {
  var hai_point = ''
  var io_point = ''
  if (barcodes[entity_point].hasOwnProperty('adjacency')){
    var nbTileId = convertNestedListToList(barcodes[entity_point]["adjacency"])
  }else{
    var nbTileId = getNeighbourTiles(entity_point)
  }
  
    if(entity_val === "entry"){
      if(nbTileId[(direction+ 2) % 4] !== "" && nbTileId[(direction+ 2) % 4] !== null){
        var hai_point = nbTileId[(direction+ 2) % 4]
        if(Object.keys(barcodes).includes(hai_point)){
          if(barcodes.hasOwnProperty(hai_point)){
              if (barcodes[hai_point].hasOwnProperty('adjacency')){
                var ioNbTileId = convertNestedListToList(barcodes[hai_point]["adjacency"])
              }else{
                var ioNbTileId = getNeighbourTiles(hai_point)
              }

              if(ioNbTileId[(direction+ 2) % 4] !== "" && ioNbTileId[(direction+ 2) % 4] !== null){
                io_point = ioNbTileId[(direction+ 2) % 4]
                if(Object.keys(barcodes).includes(io_point)){
                  return [hai_point,io_point,true]
                }else{
                  return [hai_point,'',true]
                }
              }else{
                return [hai_point,'',true]
              }
            }
          }
        }
        
    } 
    else{
      if(nbTileId[direction] !== "" && nbTileId[direction] !== null){
        var hai_point = nbTileId[direction]
        if(Object.keys(barcodes).includes(hai_point)){
          if(barcodes.hasOwnProperty(hai_point)){
          if (barcodes[hai_point].hasOwnProperty('adjacency')){
            var ioNbTileId = convertNestedListToList(barcodes[hai_point]["adjacency"])
          }else{
              var ioNbTileId = getNeighbourTiles(hai_point)
          }
          if(ioNbTileId[direction] !== "" && ioNbTileId[direction] !== null){
              io_point = ioNbTileId[direction]
              if(Object.keys(barcodes).includes(io_point)){
                  return [hai_point,io_point,true]
                }else{
                  return [hai_point,'',true]
                }
          }else{
              return [hai_point,'',true]
          }
        }
      } 
        }
        
    }
    return ['','',false]
       
};

const CheckIfBarcodePresentInVicinity = (currentFloorBarcodeDict,hai_point,direction,entity_val) => {
  if(entity_val == "entry"){
    direction = (direction + 2) % 4
  }
  var same_eile_coordinate = []
  var barcode_vicinity_exist = []
  var hai_point_wc = JSON.parse(currentFloorBarcodeDict[hai_point]["world_coordinate"])
  for (var barcode in currentFloorBarcodeDict) {
    var barcodeInfo = currentFloorBarcodeDict[barcode];
    var barcodes_wc = JSON.parse(barcodeInfo["world_coordinate"])
    if(direction === constants.NORTH){
      var diff =  hai_point_wc[1] - barcodes_wc[1]
      if(barcodes_wc[0] === hai_point_wc[0] && barcodes_wc[1] < hai_point_wc[1] && diff <= constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT){
        barcode_vicinity_exist.push(barcodeInfo["coordinate"])
      }
      if(barcodes_wc[0] === hai_point_wc[0] && barcodes_wc[1] < hai_point_wc[1]){
        same_eile_coordinate.push(barcodeInfo["coordinate"])
      }
    }
    else if(direction === constants.EAST){
      var diff =  barcodes_wc[0] - hai_point_wc[0]
      if(barcodes_wc[1] === hai_point_wc[1]  && barcodes_wc[0] > hai_point_wc[0] && diff <= constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT){
        barcode_vicinity_exist.push(barcodeInfo["coordinate"])
      }
      if(barcodes_wc[1] === hai_point_wc[1] && barcodes_wc[0] > hai_point_wc[0]){
        same_eile_coordinate.push(barcodeInfo["coordinate"])
      }
    }
    else if(direction === constants.SOUTH){
      var diff = barcodes_wc[1] - hai_point_wc[1]
      if(barcodes_wc[0] === hai_point_wc[0] && barcodes_wc[1] > hai_point_wc[1] && diff <= constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT){
        barcode_vicinity_exist.push(barcodeInfo["coordinate"])
      }
      if(barcodes_wc[0] === hai_point_wc[0] && barcodes_wc[1] > hai_point_wc[1]){
        same_eile_coordinate.push(barcodeInfo["coordinate"])
      }
    }
    else if(direction === constants.WEST){
      var diff =  hai_point_wc[0] - barcodes_wc[0] 
      if(barcodes_wc[1] === hai_point_wc[1] && barcodes_wc[0] < hai_point_wc[0] && diff <= constants.DEFAULT_DISTANCE_HAI_PORT_IO_POINT){
        barcode_vicinity_exist.push(barcodeInfo["coordinate"])
      }
      if(barcodes_wc[1] === hai_point_wc[1] && barcodes_wc[0] < hai_point_wc[0]){
        same_eile_coordinate.push(barcodeInfo["coordinate"])
      }
    }
  }
  if(barcode_vicinity_exist.length !== 0){
    return [barcode_vicinity_exist,same_eile_coordinate,true]
  }
  return ["",same_eile_coordinate,false]
};

const shouldBeDisabled = (state,map_tile_value, barcodes, conveyorTile) => {
  if(map_tile_value.length==1){
    var [conveyor_id,direction,entity_point,entity_height,entity_val,is_hai] =checkHaiPortValidation(conveyorTile,map_tile_value[0])
    if(!is_hai && conveyor_id!==""){
      return [conveyor_id,direction,entity_point,entity_val,entity_height,false]
     }
  }
  return ['','','','','',true]
};

let direction_mapping = {0:"North",1:"East",2:"South",3:"West"}
// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode

class AddHaiPort extends Component {
  state = {
    template_name: "",
    show: false,
    io_point:"",
    hai_point:"",
    remove_io_point:[],
    collect_eile_coordinate:[],
  };
  handleSubmit = (event,entity_height,dispatch,direction,hai_template,entity_val,nextportId,floor_barcodes,conveyor_id,entity_point) => {
        event.preventDefault();
        const formData = {
            template_id:hai_template[this.state.template_name],
            io_point_coordinate:this.state.io_point,
            hai_point_coordinate:this.state.hai_point,
            io_point_barcode:this.state.io_point === "" ? this.state.io_point:floor_barcodes[this.state.io_point]["barcode"],
            hai_point_barcode:floor_barcodes[this.state.hai_point]["barcode"],
            entity_val:entity_val,
            entity_point:entity_point,
            port_id:nextportId,
            conveyor_id:conveyor_id,
            entity_height:entity_height,
            direction:direction,
            remove_io_point:this.state.remove_io_point,
            collect_eile_coordinate:this.state.collect_eile_coordinate
        };
        this.toggle()
        dispatch(createHaiPort(formData));
    };

  toggle = (hai_template=null,dispatch=null,state=null,entity_point=null,direction=null,barcodes=null,entity_val=null
    ) => {
    if(hai_template && state !== undefined && state !== null){
      let remove_io_point = []
      var [hai_point,io_point,is_io_point] = validateIoPoint(entity_point,direction,barcodes,entity_val)
      if(is_io_point){
        var [vicinity_barcode,eile_coordinate,check_any_barcode_exist_in_vicinity] = CheckIfBarcodePresentInVicinity(barcodes,hai_point,direction,entity_val)
        if(vicinity_barcode.length === 1){
          io_point = vicinity_barcode[0]
        }
        if(vicinity_barcode.length > 1){
          if(io_point !== ""){
            if(!vicinity_barcode.includes(io_point)){
              io_point = vicinity_barcode[0]
            }
          }else{
            io_point = vicinity_barcode[0]
          }
          for (var i_data = 0; i_data < vicinity_barcode.length; i_data++) {
            if(vicinity_barcode[i_data] !== io_point){
              remove_io_point.push(vicinity_barcode[i_data])
            }
          }
        }
        if(io_point !== ""){
          console.log("remove_io_point",remove_io_point)
          var is_shift_possible = checkIfIoPointShiftPossible(barcodes,hai_point,io_point,direction,entity_val)
          if(is_shift_possible != ""){
            if(!remove_io_point.includes(is_shift_possible)){
              remove_io_point.push(is_shift_possible)
            }
          }
          console.log("remove_io_point",remove_io_point)
          var is_hai_lie_on_entity = checkHaiPointLieOnEntity(state, hai_point)
          var is_io_point_lie_on_entity = checkIOPointLieOnEntity(state, io_point)
          var is_io_port_already_exist = checkIfIOPortAlreadyExist(state,io_point,hai_point)
          var is_entity_present_in_vicinity = checkEntityPresentInVicinity(state,remove_io_point)
          var is_io_point_on_conveyor_belt = checkIOPointNotLieOnConveyorBelt(state,io_point)
          var is_port_already_exist = checkIfHaiPortAlreadyExist(state,hai_point,io_point)
          if(is_hai_lie_on_entity !==""){
            return dispatch(setErrorMessage(is_hai_lie_on_entity));
          }
          else if(is_io_point_lie_on_entity !=="")   {
            return dispatch(setErrorMessage(is_io_point_lie_on_entity));
          }
          else if(is_entity_present_in_vicinity !=="")   {
            return dispatch(setErrorMessage(is_entity_present_in_vicinity));
          }
          else if( is_io_port_already_exist || is_io_point_on_conveyor_belt || is_port_already_exist){
            return dispatch(setErrorMessage("Ranger Port cannot be added since there is an entity present in the minimum required distance."));
          }else{
            this.setState({ template_name: Object.keys(hai_template)[0],io_point:io_point,hai_point:hai_point,remove_io_point:remove_io_point,collect_eile_coordinate:eile_coordinate})
          }
        }else{
            this.setState({ template_name: Object.keys(hai_template)[0],io_point:io_point,hai_point:hai_point,remove_io_point:remove_io_point,collect_eile_coordinate:eile_coordinate})
        }
    }else{
      return dispatch(setErrorMessage("Ranger Port cannot be added beacause there was no barcode found in the required minimum distance."))
    }
  }
    this.setState({ show: !this.state.show});
  }
  
  changeSchemaHandler = (event) => {
      this.setState({ template_name: event })
    };

  render() {
    const { error, entryDone ,show,template_name,io_point,hai_point} = this.state;
    const {state,conveyor_id,dispatch,direction,entity_height,disabled,entity_point,entity_val,conveyorTile,floor_barcodes,hai_template,nextportId} = this.props;
    if(disabled || disabled == undefined || hai_template === {}){
      return(
        <ButtonForm
            disabled={true}
            buttonText="Add Ranger Port"
            >
        </ButtonForm>
        );
    }else{
      return (
        <div>
            <ButtonForm
              show={show}
              toggle={()=>this.toggle(hai_template,dispatch ,state,entity_point,direction,floor_barcodes,entity_val)}
              disabled={disabled}
              modalClass="manage-conveyor-modal"
              buttonText="Add Ranger Port"
              >
             <form onSubmit={(e)=>this.handleSubmit(e,entity_height,dispatch,direction,hai_template,entity_val,nextportId,floor_barcodes,conveyor_id,entity_point)}
                    >
                <div style={{padding:"0px 20px"}}>
                  <legend id="root__title">Add Ranger Port (Hai Port) from Template</legend>
                    <hr />
                        <div class="row">
                            {entity_val === "entry"?
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor Entry Barcode
                            </div>:
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor Exit Barcode
                            </div>}
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={floor_barcodes[entity_point]["barcode"]}
                                    disabled
                                />
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Selected Conveyor Barcode Type
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                {entity_val === "entry"?<input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue="Conveyor Entry Point"
                                    disabled
                                />:<input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue="Conveyor Exit Point"
                                    disabled
                                />}
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Associated Ranger Port Type
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                              {entity_val === "entry"?
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    value="Unloader"
                                    disabled
                                />:<input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    value="Loader"
                                    disabled
                                />}
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Select Template
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                              <select className="form-control" onChange={(e) => this.changeSchemaHandler(e.target.value)}>
                                {Object.keys(hai_template).map((key) => (
                                    <option value={key}>
                                        {key}
                                </option>
                                ))}
                              </select>  
                            </div>
                        </div>
                </div>
                <br/>
                <div style={{margin:"0px 10px"}}>
                  <button type="submit" style = {{width:"100px"}} 
                    className="btn btn-outline-primary mr-1">
                    Create
                  </button>
                  <button
                    type="button"
                    style = {{width:"100px"}}
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
    var hai_template = {}
    var conveyor_id = ''
    var io_point_val=''
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    var map_tile_value = Object.keys(selectedMapTiles)

    if(floor_barcodes==undefined || Object.keys(floor_barcodes).length==0 || conveyorTile == undefined || Object.keys(conveyorTile).length==0){
      disabled = true
      return {}
    }else{
      var [conveyor_id,direction,entity_point,entity_val,entity_height,disabled] = shouldBeDisabled(state,map_tile_value, floor_barcodes, conveyorTile);
      if(!disabled && disabled !==undefined){
         var haiTemplates = state.normalizedMap.entities.haiPortsTemplate
         for (const [key, value] of Object.entries(haiTemplates)) {
            if(entity_val == "entry" && value["port_type"] === "unloader"){
              hai_template[value["template_display_name"]] = value["template_id"]
            }else if(entity_val == "exit" && value["port_type"] === "loader"){
              hai_template[value["template_display_name"]] = value["template_id"]
            }
         }
      }
    }
      return {
        state:state,
        conveyor_id:conveyor_id,
        direction:direction,
        disabled:disabled,
        entity_point:entity_point,
        entity_val:entity_val,
        conveyorTile:conveyorTile,
        floor_barcodes:floor_barcodes,
        hai_template:hai_template,
        entity_height:entity_height,
        nextportId:
            Math.max(...(state.normalizedMap.entities.map.dummy.haiPort || []), 0) + 1,
      }
    
  },
  
)(AddHaiPort);
