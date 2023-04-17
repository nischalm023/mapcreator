import React, { Component } from "react";
import { connect } from "react-redux";
import ButtonForm from "./Util/ButtonForm";
import SweetAlertError from "components/SweetAlertError";
import { coordinateKeyToBarcodeSelector } from "utils/selectors";
import { alignBarcode } from "actions/barcode";

import "./alignBarcode.css";


class AlignBarcode extends Component {
    state = {
        error: undefined,
        show: false,
        field1: "-",
        field2: "-"
    };
    toggle = () => this.setState({ show: !this.state.show });
    
    handleSubmit = (event,dispatch,initialData) => {
        event.preventDefault();
        let aligned = initialData.tileId1;
        let misAligned = initialData.tileId2;
        let direction = event.target.field3.value;
        const formData = {
            alignedBarcode:aligned,
            tileId:misAligned,
            axis: direction 
        };
        this.toggle()
        dispatch(alignBarcode(formData));
    };
    render() {
        const { error, show, field1, field2 } = this.state;
        const { disabled, initialData ,dispatch} = this.props;
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
                    toggle={this.toggle}
                    buttonText="Align Barcodes"
                >
                    {initialData!==undefined &&
                    <form onSubmit={(e)=>this.handleSubmit(e,dispatch,initialData)}>
                        <label htmlFor="field3">Direction</label><br/>
                        <select id="field3" name="field3" required className="alignBarcodeInput">
                            <option value="vertical" disabled={!initialData.directionValidate[0]}>Vertically</option>
                            <option value="horizontal" disabled={!initialData.directionValidate[1]}>Horizontally</option>
                        </select>
                        <br/>
                        <br/>

                        <input type="submit" value="Submit"></input>
                    </form>}
                </ButtonForm>
            </div>
        );
    }
}

const isAlignBarcodeValid = (state,tile_1,tile_2) => {
    var barcodes = state.normalizedMap.entities.barcode
    var horizontalAlignValid = false
    var verticalAlignValid = false
    var alignBarcodeWorldCoordinate = JSON.parse(barcodes[tile_1]["world_coordinate"])
    var misalignBarcodeWorldCoordinate = JSON.parse(barcodes[tile_2]["world_coordinate"])
    var size_info_1 = barcodes[tile_1]["size_info"]
    var size_info_2 = barcodes[tile_2]["size_info"]
    var direction = 0
    var distance = 0
    if(alignBarcodeWorldCoordinate[1] < misalignBarcodeWorldCoordinate[1]){
        if(alignBarcodeWorldCoordinate[1] < misalignBarcodeWorldCoordinate[1]+size_info_2[2] && 
            alignBarcodeWorldCoordinate[1] > misalignBarcodeWorldCoordinate[1]- size_info_2[0]){
            horizontalAlignValid = true
    }
    }
    if(alignBarcodeWorldCoordinate[1] > misalignBarcodeWorldCoordinate[1]){
        if(alignBarcodeWorldCoordinate[1] < misalignBarcodeWorldCoordinate[1]+ size_info_2[2] &&
         alignBarcodeWorldCoordinate[1] > misalignBarcodeWorldCoordinate[1]- size_info_2[0]
            ){
            horizontalAlignValid = true
    }
    }
    if(alignBarcodeWorldCoordinate[0] < misalignBarcodeWorldCoordinate[0]){
        if(alignBarcodeWorldCoordinate[0] < misalignBarcodeWorldCoordinate[0]+ size_info_2[1] && 
            alignBarcodeWorldCoordinate[0] > misalignBarcodeWorldCoordinate[0]- size_info_2[3]){
            verticalAlignValid = true
    }
    }
    if(alignBarcodeWorldCoordinate[0] > misalignBarcodeWorldCoordinate[0]){
        if(alignBarcodeWorldCoordinate[0] < misalignBarcodeWorldCoordinate[0]+ size_info_2[1] &&
                alignBarcodeWorldCoordinate[0] > misalignBarcodeWorldCoordinate[0]- size_info_2[3]){
            verticalAlignValid = true
    }
    }
    return [verticalAlignValid,horizontalAlignValid] 
    };

export default connect(
    state => {
        const mapTilesArr = Object.keys(state.selection.mapTiles);
        if (mapTilesArr.length !== 2) {
            return {
                disabled: true
            };
        }
        const tileId1 = mapTilesArr[0];
        const tileId2 = mapTilesArr[1];
        var directionValidate = isAlignBarcodeValid(state,tileId1,tileId2)
        if (directionValidate.length == 2 && !directionValidate[0] && !directionValidate[1]) {
            return {
                disabled: true
            };
        }
        return {
            disabled: false,
            initialData: {
                tileId1,
                tileId2,
                directionValidate
            },
            mapTilesArr: mapTilesArr
        };
    }
)(AlignBarcode);