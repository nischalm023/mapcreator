import React from "react";
import { addTransitBarcode } from "actions/barcode";
import { connect } from "react-redux";
import BaseJsonForm from "./Util/BaseJsonForm";
import { directionSchema, barcodeStringSchema } from "utils/forms";
import { coordinateKeyToBarcodeSelector, getNewBarcode } from "utils/selectors";
import * as constants from "../../../constants";
import {setTtpBarcodeLabel} from "utils/util";
import {getNeighbourBarcodeWorldCoord} from "actions/add-transit-barcode"

const schema = {
  title: "Add Transit Barcode",
  type: "object",
  required: ["tileId", "barcodeString", "newBarcode", "direction", "distance"],
  properties: {
    // actual thing used
    tileId: { type: "string", title: "Coordinate" },
    // display purpose. better to display barcode string instead of the coordinate
    barcodeString: { ...barcodeStringSchema, type: "string", title: "Barcode" },
    newBarcode: {
      ...barcodeStringSchema,
      type: "string",
      title: "Transit Barcode"
    },
    direction: {
      ...directionSchema,
      title: "Direction(W.R.T. Selected Barcode)"
    },
    distance: { title: "Distance", type: "integer", minimum: 50 }
  }
};

const newBarcodeWidget = (props) => {
  return (
    <div class="form-group">
      <input type="text" className="form-control" value={props.value}/>
      <span className="help-block text-muted">The actual barcode value will get updated on submit</span>
    </div>
    

  );
};

const widgets = {
  newBarcodeWidget: newBarcodeWidget
}

const uiSchema = {
  tileId: { "ui:widget": "hidden" },
  barcodeString: { "ui:readonly": true },
  newBarcode:{"ui:widget":newBarcodeWidget}
};

const TransitBarcode = ({ onSubmit, disabled, initialData }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    uiSchema={uiSchema}
    onSubmit={onSubmit}
    buttonText={"Add Transit Barcode"}
    initialData={initialData}
  />
);

export default connect(
  state => {
    const mapTilesArr = Object.keys(state.selection.mapTiles);
    
    if (mapTilesArr.length != 1) {
      return { disabled: true };
    }
    const tileId = mapTilesArr[0];
    var floor_value = state.normalizedMap.entities.floor
    var barcodes = state.normalizedMap.entities.barcode
    var current_floor = state.currentFloor
    var current_floor_value = floor_value[current_floor]
    var distance = state.barcodeDistance
    var floor_barcodes = {};
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    const barcodeString = floor_barcodes[tileId]["barcode"]
    var barcodeOffset = floor_value[current_floor].barcodeOffset
    var barcodeFormat = floor_value[current_floor].barcodeFormat
    if(barcodeFormat===constants.TTP_BARCODE_FORMAT){
      var refBarcodeWorldCoord = JSON.parse(floor_barcodes[tileId]['world_coordinate'])
      var refrence_world_cordinate = { x: refBarcodeWorldCoord[0], y: refBarcodeWorldCoord[1] };
      var new_world_coordinate =  getNeighbourBarcodeWorldCoord(
                                      refrence_world_cordinate,
                                      750,
                                      0
                                );
      var newBarcode = setTtpBarcodeLabel(floor_barcodes,0,new_world_coordinate,JSON.parse(barcodeOffset),750)
    }else{
      var newBarcode = getNewBarcode(state);
    }
    return {
      disabled: false,
      initialData: {
        tileId,
        barcodeString,
        newBarcode: newBarcode,
        distance: 750
      }
    };
  },
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addTransitBarcode(formData));
    }
  })
)(TransitBarcode);
