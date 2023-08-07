import React from "react";
import CreateToteLocationsForm from "./Util/CreateToteLocationsForm";
import { connect,useDispatch } from "react-redux";
import { createStorable } from "actions/ioPoint";
import "./uploadMaptoGsb.css";
import * as constants from "../../../constants";
import { getBarcodes } from "../../../utils/selectors";
import { setErrorMessage } from "actions/message";

const schema = () => {
    return {
        title: "Create/Manage Tote Locations",
        type: "object",
    };
};


const CreateToteLocations = ({ onError,onSubmit, disabled, barcode, nextToteStorableId, ioPointBarcode, ioPointId, agent, botDirection, existingTotes,existing_location_list,selectedIoPoint,floor_barcodes,all_storable_id,io_locationId_mapping,is_disabled,message,io_without_storable,io_with_storable}) => (
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
        selectedIoPoint={selectedIoPoint}
        floor_barcodes={floor_barcodes}
        all_storable_id={all_storable_id}
        io_locationId_mapping={io_locationId_mapping}
        onError={onError}
        is_disabled={is_disabled}
        message={message}
        io_without_storable={io_without_storable} 
        io_with_storable={io_with_storable}
    />
);

export const checkSelectedBarcodeAsIoPoint = (selectedTiles,barcodes) => {
  var not_io_point = []  

  for (var i = 0; i < selectedTiles.length; i++) {
    if(!barcodes[selectedTiles[i]].hasOwnProperty("isIoPoint") && !barcodes[selectedTiles[i]].isIoPoint){
        not_io_point.push(selectedTiles[i])
    }
  }
  if(not_io_point.length !==0 ){
    return false
  }
  return true
};

const checkSelectedBarcodeBotDirection = (ioPoints,selectedTile) => {
    var io_point_dict = {}
    var bot_direction_list = []
    for (const [key, value] of Object.entries(ioPoints)) {
        io_point_dict[value["barcode"]] = value["bot_direction"]
    }
    for (var i = 0; i < selectedTile.length; i++) {
        bot_direction_list.push(io_point_dict[selectedTile[i]])
    } 
    var commons_bot_direction = bot_direction_list.slice(1).reduce(function(result, currentArray) {
    return currentArray.filter(function(currentItem) {
        return result.indexOf(currentItem) !== -1;
        });
    }, bot_direction_list[0]);
    if(commons_bot_direction.length > 0){
        return [commons_bot_direction,true]
    }else{
        return [commons_bot_direction,false]
    }

};


const areLocationElementsSame = (data) => {
    const sortedData = {};
    for (const key in data) {
        const sortedSubElements = data[key].sort((obj1, obj2) => {
            const keys1 = Object.keys(obj1).sort();
            const keys2 = Object.keys(obj2).sort();

            for (let i = 0; i < Math.min(keys1.length, keys2.length); i++) {
                const key1 = keys1[i];
                const key2 = keys2[i];
                if (key1 !== key2) {
                    return key1.localeCompare(key2);
                 }
        
                const value1 = obj1[key1];
                const value2 = obj2[key2];
            
                if (value1 !== value2) {
                    return value1 - value2;
                 }
            }
        
            return keys1.length - keys2.length;
        });
        sortedData[key] = sortedSubElements;
    }
    const sortedDataValues = Object.values(sortedData);
    const firstElement = sortedDataValues[0];
    for (let i = 1; i < sortedDataValues.length; i++) {
        if (JSON.stringify(firstElement) !== JSON.stringify(sortedDataValues[i])) {
            return false;
        }
    }
    return true;
}

const checkSameToteLocation = (selected_tile,existingTotes) => {
    if(selected_tile.length === 1){
        return true
    }
    var all_storable_data = {}
    for (const [key, value] of Object.entries(existingTotes)) {
        var barcode = Object.keys(value["barcode"])[0]
        if(selected_tile.includes(barcode)){
            var location_dict = {}
            if(!Object.keys(all_storable_data).includes(barcode)){
                var io_location_list = []
                location_dict["bot_direction"] = value["bot_direction"].value.value
                location_dict["storable_direction"] = value["storable_direction"].value.value
                location_dict["ndeep"] = value["ndeep"].value.value
                location_dict["height"] = value["tote_height"].value
                io_location_list.push(location_dict)
                all_storable_data[barcode] = io_location_list
            }
            else{
               location_dict["bot_direction"] = value["bot_direction"].value.value
                location_dict["storable_direction"] = value["storable_direction"].value.value
                location_dict["ndeep"] = value["ndeep"].value.value
                location_dict["height"] = value["tote_height"].value
                io_location_list = all_storable_data[barcode]
                io_location_list.push(location_dict)
                all_storable_data[barcode] = io_location_list 
            }
        }
    }
    var result = areLocationElementsSame(all_storable_data)
    return result
  
};

const setMappingLocation = (data) => {
   const output = {};
    for (const key in data) {
        data[key].forEach(item => {
        const { bot_direction, storable_direction, ndeep, height, tote_location } = item;
        const row = `${tote_location} : ${key}`;
        if (!output[bot_direction]) {
            output[bot_direction] = {};
        }
        if (!output[bot_direction][storable_direction]) {
            output[bot_direction][storable_direction] = {};
        }
        if (!output[bot_direction][storable_direction][ndeep]) {
            output[bot_direction][storable_direction][ndeep] = {};
        }
        if (!output[bot_direction][storable_direction][ndeep][height]) {
            output[bot_direction][storable_direction][ndeep][height] = [];
        }
        output[bot_direction][storable_direction][ndeep][height].push(row);
        });
    }

    const result = [];
    for (const bot_direction in output) {
        for (const storable_direction in output[bot_direction]) {
            for (const ndeep in output[bot_direction][storable_direction]) {
                for (const height in output[bot_direction][storable_direction][ndeep]) {
                    result.push(Object.fromEntries(output[bot_direction][storable_direction][ndeep][height].map(row => [row.split(' : ')[0], row.split(' : ')[1]])));
                }
            }
        }
    }
    return result

}

const IOLocatioIdMapping = (existingTotes,selected_tile) => {
    //  if(selected_tile.length === 1){
    //     return []
    // }
    var all_storable_data = {}
    for (const [key, value] of Object.entries(existingTotes)) {
        var barcode = Object.keys(value["barcode"])[0]
        if(selected_tile.includes(barcode)){
            var location_dict = {}
            if(!Object.keys(all_storable_data).includes(barcode)){
                var io_location_list = []
                location_dict["bot_direction"] = value["bot_direction"].value.value
                location_dict["storable_direction"] = value["storable_direction"].value.value
                location_dict["ndeep"] = value["ndeep"].value.value
                location_dict["height"] = value["tote_height"].value
                location_dict["tote_location"] = value["tote_location"].value
                io_location_list.push(location_dict)
                all_storable_data[barcode] = io_location_list
            }
            else{
               location_dict["bot_direction"] = value["bot_direction"].value.value
                location_dict["storable_direction"] = value["storable_direction"].value.value
                location_dict["ndeep"] = value["ndeep"].value.value
                location_dict["height"] = value["tote_height"].value
                location_dict["tote_location"] = value["tote_location"].value
                io_location_list = all_storable_data[barcode]
                io_location_list.push(location_dict)
                all_storable_data[barcode] = io_location_list 
            }
        }
    }
    var mapping_list = setMappingLocation(all_storable_data)
    return mapping_list
};

const shouldBeDisabled = (ioPoints,selectedTile,existingTotes,barcodes) => {
    var check_io_barcode = checkSelectedBarcodeAsIoPoint(selectedTile,barcodes)
    if(check_io_barcode){
        var [check_bot_direction,check_bot_direction_status] = checkSelectedBarcodeBotDirection(ioPoints,selectedTile)
        if(check_bot_direction_status){
            var existing_tote_location = checkSameToteLocation(selectedTile,existingTotes)
            if(existing_tote_location){
                return [check_bot_direction,false,"success"]
            }
            else{
                 return [[],true,"Tote storable location linked to the selected IO points must have the same attributes."]
            }
        }else{
            return [[],true,"The selected IO points must have atleast one common bot entry direction."]
        }
    }else{
        return [[],true,"All selected barcode should be associate with IO Points barcode."]
    }
};


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

const getIOPOintWithWithoutStorable = (selectedIoPoint,io_locationId_mapping) => {
 var io_with_storable = []
 var io_without_storable = []
 for (var i = 0; i < selectedIoPoint.length; i++) {
    if(io_locationId_mapping.length>0){
        if(Object.values(io_locationId_mapping[0]).includes(selectedIoPoint[i])){
            io_with_storable.push(selectedIoPoint[i])
        }else{
            io_without_storable.push(selectedIoPoint[i])
        }
    }else{
        io_without_storable.push(selectedIoPoint[i])
    }
 }
 return [io_without_storable,io_with_storable]

};

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
        var is_disabled = true
        var disabled = true
        if(selectedBarcode){
            if(Object.keys(state.selection.mapTiles).length === 1 && selectedBarcode.isIoPoint)
                var disabled = false
            else if(Object.keys(state.selection.mapTiles).length > 1){
                var check_io_barcode = checkSelectedBarcodeAsIoPoint(selectedTile,floor_barcodes)
                if(check_io_barcode){
                    var disabled = false
                }
            }
        }
        if(selectedBarcode && selectedBarcode.isIoPoint){
            ioPointBarcode = selectedBarcode.barcode;
            let ioPoints = state.normalizedMap.entities.ioPoints;
            existingTotes = state.normalizedMap.entities.toteStorables;
            var [bot_direction,is_disabled,message] = shouldBeDisabled(ioPoints,selectedTile,existingTotes,floor_barcodes)
            var io_without_storable = []
            var io_with_storable = []
            if(!is_disabled){
                var io_locationId_mapping = IOLocatioIdMapping(existingTotes,selectedTile)
                var [io_without_storable,io_with_storable] = getIOPOintWithWithoutStorable(selectedTile,io_locationId_mapping)
            }
            existingTotes = state.normalizedMap.entities.toteStorables;
            var get_location_barcode = ""
            for (var i = 0; i < selectedTile.length; i++) {
                for (const [key, value] of Object.entries(existingTotes)) {
                    if(Object.keys(value["barcode"])[0] === selectedTile[i]){
                        var get_location_barcode = selectedTile[i]
                        break
                    }
                }
            }
            if(get_location_barcode===""){
                var get_location_barcode = selectedTile[0]
            } 
            let ioPointObj = Object.values(ioPoints).find(obj => obj.barcode === get_location_barcode);
            ioPointId = ioPointObj.io_point_id;
            agent = ioPointObj.agent;
            botDirection = bot_direction
            // botDirection = ioPointObj.bot_direction; // botDirection: ["north", "south"]
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
            disabled: disabled,
            barcode: state.selection.mapTiles,
            nextToteStorableId: Math.max(...(state.normalizedMap.entities.map.dummy.toteStorablesIds || []), 0) + 1,
            ioPointBarcode: ioPointBarcode,
            ioPointId: ioPointId,
            agent: agent,
            botDirection: botDirection,
            existingTotes: existingTotes,
            existing_location_list:existing_location_list,
            selectedIoPoint:selectedTile,
            floor_barcodes,
            all_storable_id:state.normalizedMap.entities.map.dummy.toteStorablesIds,
            io_locationId_mapping:io_locationId_mapping,
            is_disabled:is_disabled,
            message:message,
            io_without_storable:io_without_storable,
            io_with_storable:io_with_storable
        }
    },
    dispatch => ({
        onError:(message)=>{
            dispatch(setErrorMessage(message))
        },
        onSubmit: (formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes,selectedIoPoint,io_locationId_mapping) => {
            dispatch(createStorable(formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes,selectedIoPoint,io_locationId_mapping));
        }
    })
)(CreateToteLocations);
