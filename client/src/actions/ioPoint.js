import { addEntitiesToFloor, clearTiles } from "./actions";
import { setSuccessMessage, setErrorMessage } from "./../actions/message";
import _ from "lodash";

// 1. Add ioPoint data in state
// 2. set is_conveyor_selected state in ioPoint barcode
export const addIOPoint = (io_point_id, barcodes, bot_direction, agent) => (dispatch, getState) => {
    const state = getState();
    const { currentFloor } = state;
    let i = 0;
    let nonEligibleBarcodes = [];
    let eligibleBarcodes = [];
    for (let key in barcodes) {
        // check if barcode is an IO Point already
        if(state.normalizedMap.entities.barcode[key].isIoPoint){
            // check if storables are linked to this IO point
            let existingIoPoints = state.normalizedMap.entities.ioPoints;
            let currentIoPointId = null;
            for(let key3 in existingIoPoints){
                if(existingIoPoints[key3].barcode===key){
                    currentIoPointId = existingIoPoints[key3].io_point_id;
                }
            }
            let storablesLinked = false;
            let toteStorables = state.normalizedMap.entities.toteStorables;
            for(let key2 in toteStorables){
                if(toteStorables[key2].io_point_id===currentIoPointId){
                    storablesLinked = true;
                    break;
                }
            }
            // do not update if linked to storables
            if(storablesLinked){
                nonEligibleBarcodes.push(state.normalizedMap.entities.barcode[key].barcode);
                continue;
            }
            else{
                // update current IO Point
                var IOPointData = {
                    "io_point_id": currentIoPointId,
                    "barcode": key,
                    "bot_direction": bot_direction,
                    "agent": agent
                }
                dispatch({
                    type: "ADD-IO-POINT",
                    value: IOPointData
                });
                dispatch({
                    type: "IO-POINT-HIGHLIGHT",
                    value: IOPointData
                });
                dispatch(
                    addEntitiesToFloor({
                        currentFloor,
                        floorKey: "ioPointsIds",
                        entities: [{"io_point_id":currentIoPointId}],
                        idField: "io_point_id"
                    })
                );
                eligibleBarcodes.push(state.normalizedMap.entities.barcode[key].barcode);
            }
        }
        else{
            // add new IO point
            var IOPointData = {
                "io_point_id": io_point_id+i,
                "barcode": key,
                "bot_direction": bot_direction,
                "agent": agent
            }
            dispatch({
                type: "ADD-IO-POINT",
                value: IOPointData
            });
            dispatch({
                type: "IO-POINT-HIGHLIGHT",
                value: IOPointData
            });
            dispatch(
                addEntitiesToFloor({
                    currentFloor,
                    floorKey: "ioPointsIds",
                    entities: [{"io_point_id":io_point_id+i}],
                    idField: "io_point_id"
                })
            );
            eligibleBarcodes.push(state.normalizedMap.entities.barcode[key].barcode);
        }
        i++;
    }
    dispatch(clearTiles);
    let message = '';
    if(nonEligibleBarcodes.length>0 && eligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${eligibleBarcodes[0]} ${eligibleBarcodes.length > 1 ? 
            `and ${eligibleBarcodes.length} others` : ''}has/have been created/updated.\n\n<span style="color: red;">IO point(s) for barcodes ${nonEligibleBarcodes}\nis/are linked to tote storables and will not be updated!</span>`
        dispatch(setSuccessMessage(message));
    }
    else if(nonEligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${nonEligibleBarcodes}\nis/are linked to tote storables!
        \nHence these IO point(s) has/have not been updated.`
        dispatch(setErrorMessage(message));
    }
    else if(eligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${eligibleBarcodes[0]} ${eligibleBarcodes.length > 1 ? 
            `and ${eligibleBarcodes.length-1} other(s) ` : ''} has/have been created/updated.`
        dispatch(setSuccessMessage(message));
    }
    return Promise.resolve();
};

export const removeIOPoint = (io_point_id, barcodes, bot_direction, agent) => (dispatch, getState) => {
    const state = getState();
    const { currentFloor } = state;
    let i = 0;
    let nonEligibleBarcodes = [];
    let eligibleBarcodes = [];
    for (let key in barcodes) {
        // check if barcode is an IO Point
        if(state.normalizedMap.entities.barcode[key].isIoPoint){
            // check if storables are linked to this IO point
            let existingIoPoints = state.normalizedMap.entities.ioPoints;
            let currentIoPointId = null;
            for(let key3 in existingIoPoints){
                if(existingIoPoints[key3].barcode===key){
                    currentIoPointId = existingIoPoints[key3].io_point_id;
                }
            }
            let storablesLinked = false;
            let toteStorables = state.normalizedMap.entities.toteStorables;
            for(let key2 in toteStorables){
                if(toteStorables[key2].io_point_id===currentIoPointId){
                    storablesLinked = true;
                    break;
                }
            }
            // do not remove if linked to storables
            if(storablesLinked){
                nonEligibleBarcodes.push(state.normalizedMap.entities.barcode[key].barcode);
                continue;
            }
            else{
                // remove current IO Point
                var IOPointData = {
                    "io_point_id": currentIoPointId,
                    "barcode": key,
                    "bot_direction": bot_direction,
                    "agent": agent
                }
                dispatch({
                    type: "REMOVE-SELECTED-IO-POINT", // remove from global state
                    value: IOPointData
                });
                dispatch({
                    type: "REMOVE-IO-POINT", // remove from dummy
                    value: IOPointData
                });
                dispatch({
                    type: "IO-POINT-REMOVE-HIGHLIGHT", // remove highlight
                    value: IOPointData
                });
                dispatch({
                    type: "DELETE-IO-POINT-BY-ID", // remove from floor
                    value: currentIoPointId
                });
                eligibleBarcodes.push(state.normalizedMap.entities.barcode[key].barcode);
            }
        }
        i++;
    }
    dispatch(clearTiles);
    let message = '';
    if(nonEligibleBarcodes.length>0 && eligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${eligibleBarcodes[0]} ${eligibleBarcodes.length > 1 ?
            `and ${eligibleBarcodes.length} others ` : ''}has/have been deleted.\n\n<span style="color: red;">IO point(s) for barcodes ${nonEligibleBarcodes}\nis/are linked to tote storables and will not be deleted!\nPlease delete the linked tote storables first.</span>`
        dispatch(setSuccessMessage(message));
    }
    else if(nonEligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${nonEligibleBarcodes}\nis/are linked to tote storables!
        \nHence these IO point(s) has/have not been deleted.\nPlease delete the linked tote storables first.`
        dispatch(setErrorMessage(message));
    }
    else if(eligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${eligibleBarcodes[0]} ${eligibleBarcodes.length > 1 ? 
            `and ${eligibleBarcodes.length-1} other(s) ` : ''} has/have been deleted.`
        dispatch(setSuccessMessage(message));
    }
    return Promise.resolve();
};

export const createStorable = (data, barcode, ioPointId, nextToteStorableId, finalSetOfTotes) => (dispatch, getState) => {
    const state = getState();
    const { currentFloor } = state;
    // run in loop for totes from multischema
    for(let key in data.multiSchema){
        var eachStorableData = {
            "barcode": barcode,
            "io_point_id": ioPointId,
            "next_tote_storable_id": data.multiSchema[key].tote_id.value,
            "agent": data.schema.agent,
            "bot_direction": data.schema.bot_direction,
            "io_point": data.schema.io_point,
            "storable_direction": data.multiSchema[key].storable_direction,
            "ndeep": data.multiSchema[key].ndeep,
            "tote_height": data.multiSchema[key].tote_height,
            "tote_id": data.multiSchema[key].tote_id,
            "tote_location": data.multiSchema[key].tote_location,
            "tote_type": data.multiSchema[key].tote_type
        }
        // if tote already exists, update it
        // else if tote does not exist, add it
        dispatch({
            type: "ADD-TOTE-STORABLE",
            value: eachStorableData
        });
        dispatch(
            addEntitiesToFloor({
                currentFloor,
                floorKey: "toteStorablesIds", 
                entities: [{"next_tote_storable_id":data.multiSchema[key].tote_id.value}], 
                idField: "next_tote_storable_id" 
            })
        );
    }    
    // run in loop for removed totes from multischema ie existing - final 
    let totesToBeRemoved = {}
    let existingTotes = state.normalizedMap.entities.toteStorables;
    let existingTotesInIoPoint = Object.fromEntries(
        Object.entries(existingTotes).filter(([key, value]) => value.io_point_id === ioPointId)
    );
    for (const key in existingTotesInIoPoint) {
        if (!finalSetOfTotes.hasOwnProperty(key)) {
            totesToBeRemoved[key] = existingTotesInIoPoint[key];
        }
    }
    for(let key in totesToBeRemoved){
        let tote = totesToBeRemoved[key];
        var eachStorableData = {
            "next_tote_storable_id": tote.tote_id.value,
        }
        dispatch({
            type: "REMOVE-SELECTED-TOTE-STORABLE", // remove from global state
            value: eachStorableData
        });
        dispatch({
            type: "REMOVE-TOTE-STORABLE", // remove from dummy
            value: eachStorableData
        });
        dispatch({
            type: "DELETE-TOTE-STORABLE-BY-ID", // remove from floor
            value: tote.tote_id.value
        });
    }
    dispatch(clearTiles);
    return Promise.resolve();
};