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
    handleField1Change = (event,initialData) => {
        const value = event.target.value;
        const field2Value = value === initialData.tileId1 ? initialData.tileId2 : initialData.tileId1;
        this.setState({ field1: value, field2: field2Value });
    };

    handleSubmit = (event,dispatch) => {
        event.preventDefault();
        let aligned = event.target.field1.value;
        let misAligned = event.target.field2.value;
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
                    <form onSubmit={(e)=>this.handleSubmit(e,dispatch)}>
                        <label htmlFor="field1">Aligned Barcode</label><br/>
                        <select id="field1" name="field1" required value={field1} className="alignBarcodeInput"
                            onChange={(e)=>this.handleField1Change(e,initialData)}>
                            <option value={initialData.tileId1}>{initialData.barcodeString1}</option>
                            <option value={initialData.tileId2}>{initialData.barcodeString2}</option>
                        </select>
                        <br/>
                        <br/>
                        <label htmlFor="field2">Misaligned Barcode</label><br/>
                        <select id="field2" name="field2" required value={field2} disabled className="alignBarcodeInput">
                            <option value={initialData.tileId2}>{initialData.barcodeString2}</option>
                            <option value={initialData.tileId1}>{initialData.barcodeString1}</option>
                        </select>
                        <br/>
                        <br/>
                        <label htmlFor="field3">Direction</label><br/>
                        <select id="field3" name="field3" required className="alignBarcodeInput">
                            <option value="vertical">Vertically</option>
                            <option value="horizontal">Horizontally</option>
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

export default connect(
    state => {
        const mapTilesArr = Object.keys(state.selection.mapTiles);
        if (mapTilesArr.length !== 2) {
            return {
                disabled: true
            };
        }
        const tileId1 = mapTilesArr[0];
        const barcodeString1 = coordinateKeyToBarcodeSelector(state, {
            tileId: tileId1
        });
        const tileId2 = mapTilesArr[1];
        const barcodeString2 = coordinateKeyToBarcodeSelector(state, {
            tileId: tileId2
        });
        
        return {
            disabled: false,
            initialData: {
                tileId1,
                tileId2,
                barcodeString1,
                barcodeString2
            },
            mapTilesArr: mapTilesArr
        };
    }
)(AlignBarcode);