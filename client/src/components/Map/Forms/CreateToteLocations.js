import React from "react";
import CreateToteLocationsForm from "./Util/CreateToteLocationsForm";
import { connect } from "react-redux";
import { sectorMxUPreferences } from "actions/sectorMxUPreferences";
import { createStorable } from "actions/ioPoint";
import "./uploadMaptoGsb.css";


const schema = () => {
    // const sectorEnum = Object.keys(sectorDict);
    // const defaultSector = sectorEnum[0];
    return {
        title: "Create/Manage Tote Locations",
        type: "object",
        // required: ["rack_id", "sectors"],
        // properties: {
        //     rack_id: { type: "string", title: "Rack Type", value: "" },
        //     sectors: { type: "array", title: "Sectors", value: "", sectors: sectorEnum, default: defaultSector }
        // },
        // sectorMxUPreferences: sectorMxUPreferences
    };
};


const CreateToteLocations = ({ onSubmit, disabled, barcode, nextToteStorableId, ioPointBarcode, ioPointId, agent, botDirection ,storableDirections, existingTotes}) => (
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
        storableDirections={storableDirections}
        existingTotes={existingTotes}
    />
);

export default connect(
    state => {
        let selectedTile = Object.keys(state.selection.mapTiles)
        let selectedBarcode = selectedTile.length!==0 ? state.normalizedMap.entities.barcode[selectedTile[0]] : null
        // calculate all fields required for the form(IO Point Barcode, Agent, Bot Direction, Storable Direction)
        // also calculate the next possible tote id
        let ioPointBarcode = null;
        let ioPointId = null;
        let agent = null;
        let botDirection = null;
        let storableDirections = null;
        let existingTotes = {};
        if(selectedBarcode && selectedBarcode.isIoPoint){
            ioPointBarcode = selectedBarcode.barcode;
            let ioPoints = state.normalizedMap.entities.ioPoints;
            let ioPointObj = Object.values(ioPoints).find(obj => obj.barcode === selectedTile[0]);
            ioPointId = ioPointObj.io_point_id;
            agent = ioPointObj.agent;
            botDirection = ioPointObj.bot_direction;
            if(botDirection=="north" || botDirection=="south"){
                storableDirections = ["west", "east"];
            }
            else if(botDirection=="west" || botDirection=="east"){
                storableDirections = ["north", "south"];
            }
            existingTotes = state.normalizedMap.entities.toteStorables;
            // for(let key in state.normalizedMap.entities.toteStorables){
            //     let toteStorable = state.normalizedMap.entities.toteStorables[key];
            //     for(let key2 in toteStorable.multiSchema){
            //         let tote = toteStorable.multiSchema[key2];
            //         nextToteId = Math.max(tote.tote_id.value,nextToteId);
            //     }
            // }
            // nextToteId = nextToteId + 1;
        }
        return {
            disabled: Object.keys(state.selection.mapTiles).length !== 1
                        || state.selection.conveyorMode === true
                        || !selectedBarcode.isIoPoint,
            barcode: state.selection.mapTiles,
            nextToteStorableId: Math.max(...(state.normalizedMap.entities.map.dummy.toteStorablesIds || []), 0) + 1,
            ioPointBarcode: ioPointBarcode,
            ioPointId: ioPointId,
            agent: agent,
            botDirection: botDirection,
            storableDirections: storableDirections,
            existingTotes: existingTotes,
        }
    },
    dispatch => ({
        onSubmit: (formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes) => {
            dispatch(createStorable(formData, barcode, ioPointId, nextToteStorableId, finalSetOfTotes));
        }
    })
)(CreateToteLocations);
