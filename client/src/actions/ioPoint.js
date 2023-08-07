import { addEntitiesToFloor, clearTiles } from "./actions";
import { setSuccessMessage, setErrorMessage } from "./../actions/message";
import _ from "lodash";

// 1. Add ioPoint data in state
// 2. set isIoPoint state in ioPoint barcode
export const addIOPoint = (io_point_id, barcodes, bot_direction, agent) => (dispatch, getState) => {
    const state = getState();
    const { currentFloor } = state;
    let i = 0;
    let nonEligibleBarcodes = [];
    let eligibleBarcodes = [];
    var tote_bot_direction = []
    var selected_barcode = Object.keys(barcodes)
    let not_eligible_direction = []
    let eligible_direction = []
    if(selected_barcode.length === 1 && state.normalizedMap.entities.barcode[selected_barcode[0]].isIoPoint){
        let toteStorables = state.normalizedMap.entities.toteStorables;
        let existingIoPoints = state.normalizedMap.entities.ioPoints;
        let currentIoPointId = null;
        for(let key_e in existingIoPoints){
            if(existingIoPoints[key_e].barcode===selected_barcode[0]){
                currentIoPointId = existingIoPoints[key_e].io_point_id;
            }
        }
        for(let key_single in toteStorables){
            if(parseInt(toteStorables[key_single].io_point_id) === currentIoPointId){
                tote_bot_direction.push(toteStorables[key_single]["bot_direction"].value.value)
            }
        }
        if(tote_bot_direction.length>0){
            tote_bot_direction = [...new Set(tote_bot_direction)]
            not_eligible_direction = tote_bot_direction.filter(function(itm){
                                            return bot_direction.indexOf(itm)==-1;
                                    });
            if(not_eligible_direction.length === 0){
                eligible_direction = bot_direction.filter(function(itm){
                                return tote_bot_direction.indexOf(itm)==-1;
                            });
            }
            if(eligible_direction.length>0){
                var IOPointData = {
                    "io_point_id": currentIoPointId,
                    "barcode": selected_barcode[0],
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
                eligibleBarcodes.push(state.normalizedMap.entities.barcode[selected_barcode[0]].barcode);

            }
        }
        else{
            var IOPointData = {
                    "io_point_id": currentIoPointId,
                    "barcode": selected_barcode[0],
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
                eligibleBarcodes.push(state.normalizedMap.entities.barcode[selected_barcode[0]].barcode);
        }
    }else{
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
    }
    
    dispatch(clearTiles);
    let message = '';
    if(not_eligible_direction.length>0 && selected_barcode.length===1){
        message = `IO point(s) for barcode(s) ${state.normalizedMap.entities.barcode[selected_barcode[0]].barcode}\nalready associated with ${tote_bot_direction.join("/")} bot direction!
        \nHence these IO point(s) has/have not been updated.`
        dispatch(setErrorMessage(message));
    }
    if(nonEligibleBarcodes.length>0 && eligibleBarcodes.length>0){
        message = `IO point(s) for barcode(s) ${eligibleBarcodes[0]} ${eligibleBarcodes.length > 1 ? 
            `and ${eligibleBarcodes.length-1} others` : ''}has/have been created/updated.\n\n<span style="color: red;">IO point(s) for barcodes ${nonEligibleBarcodes}\nis/are linked to tote storables and will not be updated!</span>`
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
            `and ${eligibleBarcodes.length-1} others ` : ''}has/have been deleted.\n\n<span style="color: red;">IO point(s) for barcodes ${nonEligibleBarcodes}\nis/are linked to tote storables and will not be deleted!\nPlease delete the linked tote storables first.</span>`
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

const getLocationData = (toteStorables,location_id) => {
    for (const [key1, value] of Object.entries(toteStorables)) {
        if(value.tote_location.value === location_id){
            return value
        }
    }
}

export const createStorable = (data, barcode, ioPointId, nextToteStorableId, finalSetOfTotes,selectedIoPoint,io_locationId_mapping) => (dispatch, getState) => {
    const state = getState();
    const { currentFloor } = state;
    let ioPoints = state.normalizedMap.entities.ioPoints;
    let toteStorables = state.normalizedMap.entities.toteStorables;
    let barcodes_list = state.normalizedMap.entities.barcode
    let barcode_mapping = state.normalizedMap.entities.mappingBarcodeCoord
    // run in loop for totes from multischema
    dispatch({
        type: "HIGHLIGHT-TOTE-STORAGE",
        });
    if(selectedIoPoint.length === 1){
        for(let key in data.multiSchema){
            var eachStorableData = {
                "barcode": barcode,
                "io_point_id": ioPointId,
                "next_tote_storable_id": data.multiSchema[key].tote_id.value,
                "agent": data.schema.agent,
                "bot_direction": data.multiSchema[key].bot_direction,
                "io_point": data.schema.io_point,
                "storable_direction": data.multiSchema[key].storable_direction,
                "ndeep": data.multiSchema[key].ndeep,
                "tote_height": data.multiSchema[key].tote_height,
                "tote_id": data.multiSchema[key].tote_id,
                "tote_location": data.multiSchema[key].tote_location,
                "tote_type": data.multiSchema[key].tote_type
            }
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
            // if tote already exists, update it
            // else if tote does not exist, add it
            
        }
    }else{
        var next_tote_id = Math.max(...(state.normalizedMap.entities.map.dummy.toteStorablesIds || []), 0) + 1
        var io_point_dict = {}
        for (const [key2, value] of Object.entries(ioPoints)) {
            io_point_dict[value["barcode"]] = value["io_point_id"]
        }
        for (var i = 0; i < selectedIoPoint.length; i++) {
            var io_has_no_storable = false
            for(let _key in data.multiSchema){
                var barcode_val={}
                barcode_val[selectedIoPoint[i]] = true

                if(io_locationId_mapping.length>0){
                    console.log("io_locationId_mapping[0]>>>>>>>>>>>",io_locationId_mapping[0],selectedIoPoint[i])
                    if(Object.values(io_locationId_mapping[0]).includes(selectedIoPoint[i])){
                        var io_has_no_storable = true
                    }
                }
                console.log("io_has_no_storable>>>>>>>>>",io_has_no_storable)
                if(data.multiSchema[_key].location_status === "existing" && io_has_no_storable){
                    for (var j = 0; j < io_locationId_mapping.length; j++) {
                        var loc_data = Object.keys(io_locationId_mapping[j])
                        if(loc_data.includes(data.multiSchema[_key].old_location)){
                            for (var k = 0; k < loc_data.length; k++) {
                                var get_location_data = getLocationData(toteStorables,loc_data[k])
                                var eachStorableData = {
                                    "barcode": get_location_data.barcode,
                                    "io_point_id": get_location_data.io_point_id,
                                    "next_tote_storable_id": get_location_data.next_tote_storable_id,
                                    "agent": get_location_data.agent,
                                    "bot_direction": data.multiSchema[_key].bot_direction,
                                    "io_point": get_location_data.io_point,
                                    "storable_direction": data.multiSchema[_key].storable_direction,
                                    "ndeep": data.multiSchema[_key].ndeep,
                                    "tote_height": data.multiSchema[_key].tote_height,
                                    "tote_id": get_location_data.tote_id,
                                    "tote_location": get_location_data.tote_location,
                                    "tote_type": get_location_data.tote_type
                                }
                                dispatch({
                                    type: "ADD-TOTE-STORABLE",
                                    value: eachStorableData
                                    });
                                    // dispatch(
                                    //     addEntitiesToFloor({
                                    //         currentFloor,
                                    //         floorKey: "toteStorablesIds", 
                                    //         entities: [{"next_tote_storable_id":get_location_data.tote_id.value}], 
                                    //         idField: "next_tote_storable_id" 
                                    //     })
                                    //  );
                            }
                        }
                    }
                   
                }else{
                    var tote_location_value = 'TLOC_'+String(next_tote_id).padStart(7, '0')
                    var eachStorableData = {
                    "barcode": barcode_val,
                    "io_point_id": io_point_dict[selectedIoPoint[i]],
                    "next_tote_storable_id": next_tote_id,
                    "agent": data.schema.agent,
                    "bot_direction": data.multiSchema[_key].bot_direction,
                    "io_point": { type: "string", title: "Tote Id", value: barcodes_list[selectedIoPoint[i]]["barcode"]},
                    "storable_direction": data.multiSchema[_key].storable_direction,
                    "ndeep": data.multiSchema[_key].ndeep,
                    "tote_height": data.multiSchema[_key].tote_height,
                    "tote_id": { type: "string", title: "Tote Id", value: next_tote_id },
                    "tote_location": { type: "string", title: "Tote Location", value: tote_location_value},
                    "tote_type": data.multiSchema[_key].tote_type
                    }
                    dispatch({
                        type: "ADD-TOTE-STORABLE",
                        value: eachStorableData
                        });
                    dispatch(
                            addEntitiesToFloor({
                                currentFloor,
                                floorKey: "toteStorablesIds", 
                                entities: [{"next_tote_storable_id":next_tote_id}], 
                                idField: "next_tote_storable_id" 
                            })
                         );
                    next_tote_id = next_tote_id + 1
                }

                
                
             }

        }
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
    if(selectedIoPoint.length === 1){
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
    }else{
        for(let a in totesToBeRemoved){
            let tote_data = totesToBeRemoved[a];
            for (var l = 0; l < io_locationId_mapping.length; l++){
                var loc_data = Object.keys(io_locationId_mapping[l])
                    if(loc_data.includes(tote_data.tote_location.value)){
                        for (var m = 0; m < loc_data.length; m++) {
                            var tote_location_data = getLocationData(toteStorables,loc_data[m])
                            var multiEachStorableData = {
                                    "next_tote_storable_id": tote_location_data.tote_id.value,
                                }
                            dispatch({
                                type: "REMOVE-SELECTED-TOTE-STORABLE", // remove from global state
                                value: multiEachStorableData
                            });
                            dispatch({
                                type: "REMOVE-TOTE-STORABLE", // remove from dummy
                                value: multiEachStorableData
                            });
                            dispatch({
                                type: "DELETE-TOTE-STORABLE-BY-ID", // remove from floor
                                value: tote_location_data.tote_id.value
                            });

                        }

                    }
            }

        }
    }
    
    dispatch(clearTiles);
    return Promise.resolve();
};