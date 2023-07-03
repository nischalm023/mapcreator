import React from "react";
import CreateToteLocationsForm from "./Util/CreateToteLocationsForm";
import { connect } from "react-redux";
import { createStorable } from "actions/ioPoint";
import "./uploadMaptoGsb.css";
import * as constants from "../../../constants";
import { getBarcodes } from "../../../utils/selectors";

const schema = () => {
    return {
        title: "Create/Manage Tote Locations",
        type: "object",
    };
};


const CreateToteLocations = ({ onSubmit, disabled, barcode, nextToteStorableId, ioPointBarcode, ioPointId, agent, botDirection, existingTotes,existing_location_list,floor_barcodes}) => (
    <CreateToteLocationsForm
        schema={schema()}
        disabled={disabled}
        onSubmit={onSubmit}
        barcode={barcode}
        nextToteStorableId={nextToteStorableId}
        buttonText={"Create/Manage Tote Locations"}
        ioPointBarcode={ioPointBarcode}
        ioPointId={ioPointId}
        agent={agent}
        botDirection={botDirection}
        existingTotes={existingTotes}
        existing_location_list={existing_location_list}
        floor_barcodes={floor_barcodes}
    />
);

export const existingStorableLocation = (bot_direction,storable_direction,io_point_x,io_point_y) =>{
    if(bot_direction=="north"){
        if(storable_direction == "east"){
            var x = io_point_x + constants.STORABLE_OFFSET_X
            var y = io_point_y - constants.STORABLE_OFFSET_Y
        }else{
            var x = io_point_x - constants.STORABLE_OFFSET_X
            var y = io_point_y - constants.STORABLE_OFFSET_Y
        }
    }
    if(bot_direction=="south"){
        if(storable_direction == "east"){
            var x = io_point_x + constants.STORABLE_OFFSET_X
            var y = io_point_y + constants.STORABLE_OFFSET_Y
        }else{
            var x = io_point_x - constants.STORABLE_OFFSET_X
            var y = io_point_y + constants.STORABLE_OFFSET_Y
        }
    }
    if(bot_direction=="west"){
        if(storable_direction == "north"){
            var x = io_point_x - constants.STORABLE_OFFSET_Y 
            var y = io_point_y - constants.STORABLE_OFFSET_X
        }else{
            var x = io_point_x - constants.STORABLE_OFFSET_Y
            var y = io_point_y + constants.STORABLE_OFFSET_X
        }
    }
    if(bot_direction=="east"){
        if(storable_direction == "north"){
            var x = io_point_x + constants.STORABLE_OFFSET_Y
            var y = io_point_y - constants.STORABLE_OFFSET_X
        }else{
            var x = io_point_x + constants.STORABLE_OFFSET_Y
            var y = io_point_y + constants.STORABLE_OFFSET_X 
        }
    }
    return [x,y]
}

export default connect(
    state => {
        var barcodes = getBarcodes(state)
        var current_floor = state.currentFloor
        var floor_value = state.normalizedMap.entities.floor
        var current_floor_value = floor_value[current_floor]
        var floor_barcodes = {};
        const barcodeKeys = current_floor_value.map_values;
        barcodeKeys.forEach((barcodeKey) => {
          floor_barcodes[barcodeKey] = barcodes[barcodeKey];
        });
        let selectedTile = Object.keys(state.selection.mapTiles)
        let selectedBarcode = selectedTile.length!==0 ? state.normalizedMap.entities.barcode[selectedTile[0]] : null
        // calculate all fields required for the form(IO Point Barcode, Agent, Bot Direction, Storable Direction)
        // also calculate the next possible tote id
        let ioPointBarcode = null;
        let ioPointId = null;
        let agent = null;
        let botDirection = null;
        let existingTotes = {};
        var existing_location_list = []
        if(selectedBarcode && selectedBarcode.isIoPoint){
            ioPointBarcode = selectedBarcode.barcode;
            let ioPoints = state.normalizedMap.entities.ioPoints;
            let ioPointObj = Object.values(ioPoints).find(obj => obj.barcode === selectedTile[0]);
            ioPointId = ioPointObj.io_point_id;
            agent = ioPointObj.agent;
            botDirection = ioPointObj.bot_direction; // botDirection: ["north", "south"]
            existingTotes = state.normalizedMap.entities.toteStorables;
            for (const [key, value] of Object.entries(existingTotes)) {
              var bot_direction =  value["bot_direction"]["value"]["value"]
              var storable_direction = value["storable_direction"]["value"]["value"]
              if(Object.keys(value["barcode"])[0]!== selectedTile[0]){
                var io_point_worldcoordinate = JSON.parse(floor_barcodes[Object.keys(value["barcode"])[0]]["world_coordinate"])
                var [x,y] = existingStorableLocation(bot_direction,storable_direction,io_point_worldcoordinate[0],io_point_worldcoordinate[1])
                existing_location_list.push(`[${x},${y}]`)
              }
              
            }
        }
        return {
            disabled: Object.keys(state.selection.mapTiles).length !== 1
                        || !selectedBarcode.isIoPoint,
            barcode: state.selection.mapTiles,
            nextToteStorableId: Math.max(...(state.normalizedMap.entities.map.dummy.toteStorablesIds || []), 0) + 1,
            ioPointBarcode: ioPointBarcode,
            ioPointId: ioPointId,
            agent: agent,
            botDirection: botDirection,
            existingTotes: existingTotes,
            existing_location_list:existing_location_list,
            floor_barcodes
        }
    },
    dispatch => ({
        onSubmit: (formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes) => {
            dispatch(createStorable(formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes));
        }
    })
)(CreateToteLocations);
