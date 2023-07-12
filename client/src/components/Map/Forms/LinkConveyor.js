import React, { Component } from "react";
import { connect } from "react-redux";
import ButtonForm from "./Util/ButtonForm";
import SweetAlertError from "components/SweetAlertError";
import { coordinateKeyToBarcodeSelector } from "utils/selectors";
import { getBarcodes } from "../../../utils/selectors";
import {convertNestedListToList} from "actions/conveyor";
import {getNeighbourTiles } from "utils/util";
import {linkConveyorSystem} from "actions/connectConveyor";
import {clearTiles} from "actions/actions";
import { setErrorMessage } from "actions/message";

const checkPointLieOnConveyorBelt = (conveyorTile,tile1,tile2,barcodes) => {
    var tile1_status = false
    var tile2_status = false 
    var adjacent_status = false 
    let conveyor_id_source = "" 
    let conveyor_id_destination = "" 
    var conveyor_status = false
    var link_direction = ""
    for (const [key, value] of Object.entries(conveyorTile)) {
        var selected_tile = convertNestedListToList(value["selected_tile"])
        if(selected_tile.includes(tile1)){
            tile1_status=true
            conveyor_id_source = value["conveyor_id"]
        }
        if(selected_tile.includes(tile2)){
            tile2_status=true
            conveyor_id_destination = value["conveyor_id"]
        }
    }
    if(barcodes[tile1].hasOwnProperty('adjacency')) {
          var nbTileId = convertNestedListToList(barcodes[tile1]["adjacency"])
        }
        else {
          var nbTileId = getNeighbourTiles(tile1)
        }
    if(nbTileId.indexOf(tile2)>-1){
        adjacent_status=true
        link_direction = nbTileId.indexOf(tile2)

    }
    if(conveyor_id_source!="" && conveyor_id_destination!=="" && conveyor_id_source!=conveyor_id_destination){
        conveyor_status = true
    }
    if(tile1_status === true && tile2_status === true && adjacent_status==true && conveyor_status===true){
      return [false,link_direction,conveyor_id_source,conveyor_id_destination]
    }
return [true,"","",""]  
};

const direction_mapping = {0:"North",1:"East",2:"South",3:"West"}

class LinkConveyor extends Component {
    state = {
        error: undefined,
        show: false,
        source_barcode:"",
        tote_direction:"",
        destination_barcode:"",
    };
    toggle = (initialData=null,link_direction=null,connectedconveyorTile=null,dispatch=null) => {
        if(!initialData){
            this.setState({ show: !this.state.show,source_barcode:"",destination_barcode:"",tote_direction:""});
            return;
        }
        let error
        error = false
        if(connectedconveyorTile!==null && connectedconveyorTile !== undefined && Object.keys(connectedconveyorTile).length!==0){
            Object.keys(connectedconveyorTile).forEach(function (key, index) {
            if(connectedconveyorTile[key]["source_conveyor_tile"] === initialData.tileId_source &&
                connectedconveyorTile[key]["destination_conveyor_tile"] === initialData.tileId_destination
                ){
                error = true
            }
            if(connectedconveyorTile[key]["source_conveyor_tile"] === initialData.tileId_destination &&
                connectedconveyorTile[key]["destination_conveyor_tile"] === initialData.tileId_source
                ){
                error = true
            }
            })
        }
        if(!error){
            this.setState({ 
            show: !this.state.show,
            source_barcode:initialData.barcodeString_source,
            destination_barcode:initialData.barcodeString_destination,
            tote_direction:link_direction
            });
        }else{
             var error_text = `Conveyor Systems ( ID :${initialData.conveyor_id_source},${initialData.conveyor_id_destination} ) are already connected.`
             return dispatch(setErrorMessage(error_text))
        }
        
    }

    changeDirectionHandlar = (value) => {
        if(this.state.source_barcode !== value){
            var destination = this.state.source_barcode
        }else{
            var destination = this.state.destination_barcode
        }
        this.setState({ 
            source_barcode:value,
            destination_barcode:destination,
            tote_direction:(this.state.tote_direction + 2) % 4
            });
    };

    handleSubmit = (event,dispatch,initialData,source_barcode, tote_direction, destination_barcode, nextConnectedConveyorId, barcode_mapping, connectedconveyorTile) => {
        event.preventDefault();
        let error
        error = false
        Object.keys(connectedconveyorTile).forEach(function (key, index) {
            if( connectedconveyorTile[key]["direction"] === tote_direction &&
                connectedconveyorTile[key]["source_conveyor_tile"] === barcode_mapping[source_barcode] &&
                connectedconveyorTile[key]["destination_conveyor_tile"] === barcode_mapping[destination_barcode]
                ){
                error = true
            }
        })
        if(!error){
            const formData = {
            source_conveyor_tile:barcode_mapping[source_barcode],
            destination_conveyor_tile:barcode_mapping[destination_barcode],
            direction: tote_direction,
            conveyor_id_source:initialData.conveyor_id_source,
            conveyor_id_destination:initialData.conveyor_id_destination,
            connected_conveyor_id:nextConnectedConveyorId 
        };
        this.toggle()
        dispatch(linkConveyorSystem(formData));
        }else{
            this.toggle()
            dispatch(clearTiles);
        }
        
        
    };
    render() {
        const { error, show, source_barcode, destination_barcode, tote_direction} = this.state;
        const { disabled, initialData, barcode_mapping, link_direction,nextConnectedConveyorId, connectedconveyorTile, dispatch} = this.props;
        return (
            <div>
                <SweetAlertError
                    title="Server Error"
                    error={error}
                    onConfirm={() => this.setState({ error: undefined })}
                />
                <ButtonForm
                    show={show}
                    disabled={disabled}
                    toggle={() => this.toggle(initialData,link_direction,connectedconveyorTile,dispatch)}
                    buttonText="Connect Conveyor Systems"
                >
                    {initialData!==undefined && link_direction !== undefined &&
                    <form onSubmit={(e)=>this.handleSubmit(e, dispatch, initialData, source_barcode, tote_direction, destination_barcode, nextConnectedConveyorId, barcode_mapping, connectedconveyorTile)}>
                       <legend>Connect Conveyor Systems</legend>
                       <div className="form-group">
                          <label for="direction">Origin Barcode</label>
                            <select className="form-control" value={source_barcode} onChange={(e) => this.changeDirectionHandlar(e.target.value)} id="direction" name="pick-direction">
                              <option value={source_barcode}>{source_barcode}</option>
                              <option value={destination_barcode}>{destination_barcode}</option>
                            </select>
                          <br/>
                          <label for="type">Destination Barcode</label>
                              <input
                                className="form-control" 
                                type="text" 
                                defaultValue={destination_barcode}
                                value={destination_barcode}
                                required
                                disabled
                              />
                          <br/>
                          <label for="type">Tote Travel Direction</label>
                              <input 
                                className="form-control" 
                                type="text"
                                defaultValue={direction_mapping[tote_direction]}
                                value={direction_mapping[tote_direction]}
                                required
                                disabled
                              />
                          <br/>
                        <input type="submit" className="btn btn-outline-primary mr-1" value="Submit"></input>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={this.toggle}
                        >
                            Cancel
                        </button>
                    </div>  

                    </form>}
                </ButtonForm>
            </div>
        );
    }
}

export default connect(
    state => {
        var connectedconveyorTile = state.normalizedMap.entities.ConnectedconveyorTile
        var conveyorTile = state.normalizedMap.entities.conveyorTile
        var barcode = getBarcodes(state)
        const mapTilesArr = Object.keys(state.selection.mapTiles);
        const tileId_source = mapTilesArr[0];
        const tileId_destination = mapTilesArr[1];
        if (mapTilesArr.length !== 2) {
            return {
                disabled: true
            };
        }
        var barcode_mapping = state.normalizedMap.entities.mappingBarcodeCoord
        const barcodeString_source = coordinateKeyToBarcodeSelector(state, {
            tileId: tileId_source
        }); 
        const barcodeString_destination = coordinateKeyToBarcodeSelector(state, {
            tileId: tileId_destination
        });
        if(conveyorTile == undefined || Object.keys(conveyorTile).length==0){
             disabled = true
        }else{
            var [disabled,link_direction,conveyor_id_source,conveyor_id_destination] = checkPointLieOnConveyorBelt(conveyorTile,tileId_source,tileId_destination,barcode)
        }
        return {
            disabled: disabled,
            nextConnectedConveyorId:
            Math.max(...(state.normalizedMap.entities.map.dummy.connectedConveyor || []), 0) + 1,
            initialData: {
                tileId_source,
                tileId_destination,
                barcodeString_source,
                barcodeString_destination,
                conveyor_id_destination,
                conveyor_id_source,
            },
            link_direction,
            barcode_mapping,
            connectedconveyorTile
        };
    }
)(LinkConveyor);