import React from "react";
import ManageHaiPortForm from "./Util/ManageHaiPortForm";
import { connect } from "react-redux";
import {
    convertNestedListToList,
} from "actions/conveyor";
import {updateHaiPort,removeHaiPort} from "actions/haiTemplate";
import "./uploadMaptoGsb.css";
import { getBarcodes } from "../../../utils/selectors";


const schema = () => {
    return {
        title: "Manage Ranger Port",
        type: "object",
    };
};

const checkPortExist = (haiPortTile, hai_point) => {
    for (const [key, value] of Object.entries(haiPortTile)) {
      if(value["port_coordinate"] === hai_point){
        return [value["port_coordinate"],
                value["port_id"],
                value["entity_val"],
                value["entity_height"],
                value["direction"],
                value["entity_point"],
                value["io_coodinate"],
                value["template_id"],
                value["port_id_value"],
                true]
      }
    }
  return ['','','','','','','','','',false]
};

const checkDisabled = (selected_tile,haiPortTile,haiPortsTemplate) => {
    var selected_tile_val = Object.keys(selected_tile)
    if(selected_tile_val.length === 1 ){
        var [port_coordinate,port_id,entity_val,entity_heigth,direction,entity_point,io_point,template_id,port_id_value,check_port_exist] = checkPortExist(haiPortTile,selected_tile_val[0])
        if(check_port_exist){
            var template_info = haiPortsTemplate[template_id]
            return [false,
                    port_id,
                    template_info["template_display_name"],
                    template_info["tray_count"],
                    template_info["support_agent"],
                    template_info["port_type"],
                    template_info["length"],
                    template_info["breadth"],
                    template_info["height"],
                    entity_val,
                    entity_heigth,
                    direction,
                    entity_point,
                    io_point,
                    port_coordinate,
                    port_id_value]
        }
    }
  return [true,'','','','','','','','','','','','','','','']
};

const ManageConveyorPort = ({ onSubmit, disabled,floor_barcodes,port_info,all_port_list}) => (
    <ManageHaiPortForm
        schema={schema()}
        disabled={disabled}
        floor_barcodes={floor_barcodes}
        port_info ={port_info}
        onSubmit={onSubmit}
        all_port_list={all_port_list}
        buttonText={"Manage Ranger Port"}
    />
);

 
export default connect(
    state => {
        let haiPortTile = state.normalizedMap.entities.haiPortTile
        let haiPortsTemplate = state.normalizedMap.entities.haiPortsTemplate
        var floor_barcodes = {};
        var barcodes = getBarcodes(state)
        var current_floor = state.currentFloor
        var floor_value = state.normalizedMap.entities.floor
        var current_floor_value = floor_value[current_floor]
        var selected_tile = state.selection.mapTiles
        const barcodeKeys = current_floor_value.map_values;
        var all_port_list = []
        barcodeKeys.forEach((barcodeKey) => {
          floor_barcodes[barcodeKey] = barcodes[barcodeKey];
        });
        var port_info = {}
        if(haiPortTile == undefined || Object.keys(haiPortTile).length==0){
            disabled = true
        }else{
            var [disabled,
                port_id,
                template_display_name,
                tray_count,
                support_agent,
                port_type,
                length,
                breadth,
                height,
                entity_val,
                entity_height,
                direction,
                entity_point,
                io_point,
                port_coordinate,
                port_id_value] = checkDisabled(selected_tile,haiPortTile,haiPortsTemplate)
            if(!disabled){
                for (const [key, value] of Object.entries(haiPortTile)) {
                    if(value["port_id"] !== port_id){
                        all_port_list.push(value["port_id_value"])
                    }
                }
                port_info["port_id"] = port_id
                port_info["template_display_name"] =  template_display_name
                port_info["tray_count"] =  tray_count
                port_info["support_agent"] =  support_agent
                port_info["port_type"] =  port_type 
                port_info["length"] = length 
                port_info["breadth"] = breadth
                port_info["height"] = height 
                port_info["entity_val"] = entity_val 
                port_info["entity_height"] = entity_height 
                port_info["direction"] =  direction
                port_info["entity_point"] =  entity_point
                port_info["io_point"] =  io_point
                port_info["port_coordinate"] =  port_coordinate
                port_info["port_id_value"] = port_id_value  

            }
        }
        return {
            disabled: disabled,
            port_info:port_info,
            all_port_list:all_port_list,
            floor_barcodes:floor_barcodes
        }
    },
    dispatch => ({
        onSubmit: (formData,remove=false) => {
            if(remove){
                dispatch(removeHaiPort(formData));
            }else{
                dispatch(updateHaiPort(formData));
            }
        }
    })
)(ManageConveyorPort);
