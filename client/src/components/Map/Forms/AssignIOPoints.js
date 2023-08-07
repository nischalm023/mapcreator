import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addIOPoint, removeIOPoint } from "actions/ioPoint";
import _ from "lodash";
import "./uploadMaptoGsb.css";


const schema = {
    title: "Assign/Manage Storable IO Points",
    type: "object",
    required: ["bot_direction", "agent"],
    properties: {
        bot_direction: {
            type: "array",
            title: "Bot Orientation",
            items: {
                type: "string",
                enum: ["north", "west", "south", "east"],
                enumNames: ["North", "West", "South", "East"],

            },
            default: [],
            uniqueItems: true,
        },
        agent: {
            type: "string",
            title: "Agent",
            default: "ttp",
            enum: ["ttp", "rtp"],
            enumNames: ["HAI-TTP-A42D", "RTP"]
        },
    }
};
const uiSchema = {
    agent: { "ui:readonly": true },
    bot_direction: {

        "ui:widget": "checkboxes",
        "ui:options": {
            inline: true,
        },
    },
};

const handleSubmit = (form, barcodes, nextIOPointId, dispatch) => {
    dispatch(addIOPoint(nextIOPointId, barcodes, form.formData.bot_direction, form.formData.agent));
};

const handleRemove = (form, barcodes, nextIOPointId, dispatch) => {
    dispatch(removeIOPoint(nextIOPointId, barcodes, form.bot_direction, form.agent));
};

const isSelectedBarcodeIoPoint = (selected_barcode,barcodes,ioPoint) => {
    if(ioPoint !==undefined && selected_barcode.length === 1){
        if(barcodes[selected_barcode[0]].hasOwnProperty("isIoPoint")){
            for (const [key, value] of Object.entries(ioPoint)) {
                if(value["barcode"] === selected_barcode[0]){
                    return value["bot_direction"]
                }
            }
        }
    }
    return []
};

class AssignIOPoints extends Component {
    render() {
        const {disabled, barcodes, nextIOPointId, dispatch,all_barcodes,ioPoint} = this.props;
        var selected_barcode_condition = isSelectedBarcodeIoPoint(Object.keys(barcodes),all_barcodes,ioPoint)
        schema.properties.bot_direction.default = []
        if(selected_barcode_condition.length>0){
            schema.properties.bot_direction.default = selected_barcode_condition
        }
        return ( <BaseJsonForm
            disabled={disabled}
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleSubmit}
            onRemove={handleRemove}
            buttonText={"Assign/Manage Storable IO Points"}
            barcodes={barcodes}
            nextIOPointId={nextIOPointId}
            dispatch={dispatch}
            style={{ marginLeft: "20%", textAlign: "-webkit-center", color: "orange" }}
        />)
    }
}

export default connect(
    state => {
        return {
            disabled: Object.keys(state.selection.mapTiles).length === 0,
            barcodes: state.selection.mapTiles,
            nextIOPointId: Math.max(...(state.normalizedMap.entities.map.dummy.ioPointsIds || []), 0) + 1,
            all_barcodes:state.normalizedMap.entities.barcode,
            ioPoint:state.normalizedMap.entities.ioPoints
        };
    }
)(AssignIOPoints);
