import React from "react";
import ManageConveyorSystemForm from "./Util/ManageConveyorSystemForm";
import { connect } from "react-redux";
import {
    updateConveyor,
    removeConveyor,
    convertNestedListToList,
    getConveyorPointBotDirection,
    getConveyorExitPointDirection,
    getConveyorPointDirection,
    getConveyorExitPointBotDirection
} from "actions/conveyor";
import "./uploadMaptoGsb.css";
import { getBarcodes } from "../../../utils/selectors";


const schema = () => {
    return {
        title: "Manage Conveyor System",
        type: "object",
    };
};

const checkPointLieOnConveyorBelt = (conveyorTile,selectedMapTiles) => {
    if(selectedMapTiles.length==1){
        for (const [key, value] of Object.entries(conveyorTile)) {
        var selected_tile = convertNestedListToList(value["selected_tile"])
        const filteredArray = selectedMapTiles.filter(value => selected_tile.includes(value));
        if(filteredArray.length==1){
          return false
        }
      }
    }
  return true  
};

const ManageConveyorSystem = ({ onSubmit, disabled, conveyorInfo, allConveyorIds, 
                                pps_ids,
                                // entry_bot_direction_options, exit_bot_direction_options,
                                entry_direction_options, exit_direction_options,
                                floor_barcodes}) => (
    <ManageConveyorSystemForm
        schema={schema()}
        disabled={disabled}
        conveyorInfo={conveyorInfo}
        allConveyorIds={allConveyorIds}
        pps_ids={pps_ids}
        // entry_bot_direction_options={entry_bot_direction_options}
        // exit_bot_direction_options={exit_bot_direction_options}
        entry_direction_options={entry_direction_options}
        exit_direction_options={exit_direction_options}
        floor_barcodes={floor_barcodes}
        onSubmit={onSubmit}
        buttonText={"Manage Conveyor System"}
    />
);

const getPpsIds = (pps_dict) => {
    var pps_ids = []
    for (const [key, value] of Object.entries(pps_dict)) {
    if( value["eligible_system"] !== undefined){
        var eligible_system = value["eligible_system"].join("_")
            if (eligible_system == "ttp" || eligible_system == "ttp_rtp") {
                pps_ids.push(key)
            }
        }
    }
    return pps_ids
};


 
export default connect(
    state => {
        let conveyorTiles = state.normalizedMap.entities.conveyorTile;
        
        // find conveyor info related to the selected tile
        let conveyorInfo = {};
        let pps_ids = [];
        let allConveyorIds = [];
        var floor_barcodes = {};
        let exit_bot_direction_options = {};
        let entry_bot_direction_options = {};
        let entry_direction_options = {};
        let exit_direction_options = {};
        for(let key in conveyorTiles){
            let conveyorTile = conveyorTiles[key];
            allConveyorIds.push(conveyorTile.conveyor_id);
        }
        var selectedMapTiles = state.selection.mapTiles
        var map_tile_value = Object.keys(selectedMapTiles)
        if (Object.keys(state.selection.mapTiles).length === 1){

            let selectedTile = Object.keys(state.selection.mapTiles);
            // check if tile is part of a conveyor system
            for(let key in conveyorTiles){
                let conveyorTile = conveyorTiles[key];
                if(conveyorTile.selected_tile.some(tile => tile.toString() === selectedTile[0])){
                    conveyorInfo = conveyorTile;
                    break;
                }
            }
            pps_ids = getPpsIds(state.normalizedMap.entities.pps);
            
            if(conveyorInfo && Object.keys(conveyorInfo).length !=0){
                var barcodes = getBarcodes(state)
                var current_floor = state.currentFloor
                var floor_value = state.normalizedMap.entities.floor
                var current_floor_value = floor_value[current_floor]
                
                const barcodeKeys = current_floor_value.map_values;
                barcodeKeys.forEach((barcodeKey) => {
                  floor_barcodes[barcodeKey] = barcodes[barcodeKey];
                });
                if(conveyorInfo.hasOwnProperty("conveyor_entry")){
                    // entry_bot_direction_options = getConveyorPointBotDirection(floor_barcodes, [conveyorInfo.conveyor_entry.toString()] ,
                    //                                 conveyorInfo.entry_point_direction, conveyorTiles, conveyorInfo.conveyor_id)
                    entry_direction_options = getConveyorPointDirection(state, floor_barcodes, [conveyorInfo.conveyor_entry.toString()], 
                                                    conveyorTiles, conveyorInfo.conveyor_id)
                }
                if(conveyorInfo.hasOwnProperty("conveyor_exit")){
                    // exit_bot_direction_options = getConveyorPointBotDirection(floor_barcodes, [conveyorInfo.conveyor_exit.toString()] ,
                    //                                 conveyorInfo.exit_point_direction, conveyorTiles, conveyorInfo.conveyor_id)
                    exit_direction_options = getConveyorExitPointDirection(state, floor_barcodes, [conveyorInfo.conveyor_exit.toString()] , 
                                                    conveyorTiles, conveyorInfo.conveyor_id)
                }
            }
            
        }
        if(conveyorTiles == undefined || Object.keys(conveyorTiles).length==0){
            disabled = true
        }else{
            var disabled = checkPointLieOnConveyorBelt(conveyorTiles,map_tile_value)
        }
        
        return {
            disabled: disabled,
            conveyorInfo: conveyorInfo,
            allConveyorIds: allConveyorIds,
            pps_ids: pps_ids,
            // entry_bot_direction_options:entry_bot_direction_options,
            // exit_bot_direction_options:exit_bot_direction_options,
            entry_direction_options:entry_direction_options,
            exit_direction_options:exit_direction_options,
            floor_barcodes:floor_barcodes
        }
    },
    dispatch => ({
        onSubmit: (formData,remove=false) => {
            if(remove){
                dispatch(removeConveyor(formData))
            }else{
                dispatch(updateConveyor(formData));
            }
        }
    })
)(ManageConveyorSystem);
