import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addIOPoint, removeIOPoint } from "actions/ioPoint";
import _ from "lodash";
import "./uploadMaptoGsb.css";


const schema = {
    title: "Assign/Manage IO Points",
    type: "object",
    required: ["bot_direction", "agent"],
    properties: {
        bot_direction: {
            type: "string",
            title: "Bot Direction",
            default: "north",
            enum: ["north", "west", "south", "east"],
            enumNames: ["North", "West", "South", "East"]
        },
        agent: {
            type: "string",
            title: "Agent",
            default: "ttp",
            enum: ["ttp", "rtp"],
            enumNames: ["TTP", "RTP"]
        },
    }
};

const uiSchema = {
    agent: { "ui:readonly": true }
};

const handleSubmit = (form, barcodes, nextIOPointId, dispatch) => {
    dispatch(addIOPoint(nextIOPointId, barcodes, form.formData.bot_direction, form.formData.agent));
};

const handleRemove = (form, barcodes, nextIOPointId, dispatch) => {
    console.log(">>>>>>>>>>>. remove clicked!!!!!!!")
    console.log(">>>>>>>>> remove form before dispatch:",form)
    dispatch(removeIOPoint(nextIOPointId, barcodes, form.bot_direction, form.agent));
};

class AssignIOPoints extends Component {
    render() {
        const {disabled, barcodes, nextIOPointId, dispatch} = this.props;
        return ( <BaseJsonForm
            disabled={disabled}
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleSubmit}
            onRemove={handleRemove}
            buttonText={"Assign/Manage IO Points"}
            barcodes={barcodes}
            nextIOPointId={nextIOPointId}
            dispatch={dispatch}
            style={{ marginLeft: "20%", textAlign: "-webkit-center", color: "orange" }}
        />)
    }
}

export default connect(
    state => {
        // let selectedTiles = Object.keys(state.selection.mapTiles)
        // let isIoPoint = false;
        // for(let tile of selectedTiles){
        //     let selectedBarcode = state.normalizedMap.entities.barcode[tile];
        //     isIoPoint = selectedBarcode.isIoPoint;
        //     if(isIoPoint){
        //         break;
        //     }
        // }
        return {
            disabled: Object.keys(state.selection.mapTiles).length === 0 
                        || state.selection.conveyorMode === true,
            barcodes: state.selection.mapTiles,
            nextIOPointId: Math.max(...(state.normalizedMap.entities.map.dummy.ioPointsIds || []), 0) + 1,
        };
    }
)(AssignIOPoints);
