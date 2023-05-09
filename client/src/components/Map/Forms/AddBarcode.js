import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  isValidCoordinateKey,
  encode_barcode,
  coordinateKeyToTupleOfIntegers,
  setTtpBarcodeLabel
} from "utils/util";
import * as constants from "../../../constants";
import _ from "lodash";
import { addNewBarcode } from "actions/barcode";
import { getBarcodes } from "../../../utils/selectors";
import titleCase from "title-case";
import {getNeighbourBarcodeWorldCoord} from "actions/add-transit-barcode"

const baseSchema = {
  title: "Add Barcode",
  type: "object"
};

// exported for testing
export const onlyOneTileSelected = selectedMapTiles =>
  Object.keys(selectedMapTiles).length == 1;

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>{
  return barcodes[Object.keys(selectedMapTiles)[0]];
}

export const getValidEmptyNeighbours = (selectedMapTiles, barcodes) => {
  const coordinate = Object.keys(selectedMapTiles)[0];
  const nbTileIds = getNeighbourTiles(coordinate, barcodes);
  const emptyDirTileIdList = _.zip([0, 1, 2, 3], nbTileIds).filter(
    ([, nbTileId]) => !barcodes[nbTileId] && isValidCoordinateKey(nbTileId)
  );
  return emptyDirTileIdList;
};

export const getValidEmptyDirTileIdList = (barcodeDict, emptyNeighbour) => {
  for (let k = 0; k < emptyNeighbour.length; k++) {
    if(barcodeDict.hasOwnProperty(implicitCoordinateKeyToBarcode(emptyNeighbour[k][1]))){
      for (var i = 999; i > 0; i--) {
        for (var j = 1; j < 1000; j++) {
          const coordinate = `${i},${j}`;
          if (barcodeDict.hasOwnProperty(implicitCoordinateKeyToBarcode(coordinate))) {
            continue;
          }else{
            barcodeDict[implicitCoordinateKeyToBarcode(coordinate)] = true
            emptyNeighbour[k][1] = coordinate
            i = -1
            break
          }
          
        }
      }
    }
  }
  return emptyNeighbour;
};

const shouldBeDisabled = (selectedMapTiles, barcodes, state) => (
    !onlyOneTileSelected(selectedMapTiles) ||
    !hasBarcodeForTile(selectedMapTiles, barcodes) ||
    (getValidEmptyNeighbours(selectedMapTiles, barcodes).length == 0)
  );

export const getExistingBarcodesAndCoordinates = (barcodeInfoList) => {
    var barcodes = {};
    var coordinates = {};
    for (var key in barcodeInfoList) {
      if (barcodeInfoList.hasOwnProperty(key)) {
        barcodes[barcodeInfoList[key].barcode] = true;

        coordinates[
          coordinateKeyToTupleOfIntegers(barcodeInfoList[key].coordinate)
        ] = true;
      }
    }
    return { barcodes: barcodes, coordinates: coordinates };
  }

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddBarcode extends Component {
  render() {
    const { selectedMapTiles, barcodes, onSubmit ,state,current_floor, floor_value} = this.props;
    var current_floor_value = floor_value[current_floor]
    var distance = state.barcodeDistance
    var floor_barcodes = {};
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    var barcodeOffset = floor_value[current_floor].barcodeOffset
    var barcodeFormat = floor_value[current_floor].barcodeFormat
    const disabled = shouldBeDisabled(selectedMapTiles, floor_barcodes, state);
    const tooltipData = {
      id: "add-barcode",
      title: "Add a barcode",
      bulletPoints: [
        "Select a barcode with available neighbours to add barcode",
        "Can only add one barcode at a time",
        "Negative coordinates are not supported, so can't add barcode which might result in negative coordinate."
      ]
    };
    if (disabled)
      return (
        <BaseJsonForm
          disabled={disabled}
          schema={baseSchema}
          onSubmit={onSubmit}
          buttonText={"Add Barcode"}
          tooltipId={"add-barcode"}
          tooltipData={tooltipData}
        />
      );
    const coordinate = Object.keys(selectedMapTiles)[0];
    const dirStrs = ["top", "right", "bottom", "left"];
    const emptyDirTileIdList = getValidEmptyNeighbours(
      selectedMapTiles,
      floor_barcodes
    );
    var barcode_cordinate = getExistingBarcodesAndCoordinates(floor_barcodes)
    var validEmptyDirTileIdList =  getValidEmptyDirTileIdList(barcode_cordinate.barcodes,emptyDirTileIdList)
    if(barcodeFormat===constants.TTP_BARCODE_FORMAT){
      var new_validEmptyDirTileIdList = []
      var refBarcodeWorldCoord = JSON.parse(floor_barcodes[Object.keys(selectedMapTiles)[0]]['world_coordinate'])
      for (const [key, value] of Object.entries(validEmptyDirTileIdList)) {
        var refrence_world_cordinate = { x: refBarcodeWorldCoord[0], y: refBarcodeWorldCoord[1] };
        var new_world_coordinate =  getNeighbourBarcodeWorldCoord(
                                      refrence_world_cordinate,
                                      distance*2,
                                      value[0]
                                );
        var ttp_barcode = setTtpBarcodeLabel(floor_barcodes,value[0],new_world_coordinate,JSON.parse(barcodeOffset),distance)
        new_validEmptyDirTileIdList.push([value[0],ttp_barcode])
      }
    }else{
      var new_validEmptyDirTileIdList = []
      for (const [key, value] of Object.entries(validEmptyDirTileIdList)) {
        new_validEmptyDirTileIdList.push([value[0],implicitCoordinateKeyToBarcode(value[1])])
      }
    }
    const keys = new_validEmptyDirTileIdList.map(innerArray => JSON.stringify(innerArray))

    const schema = {
      ...baseSchema,
      required: ["direction", "tileId"],
      properties: {
        direction: {
          type: "string",
          title: "Direction",
          enum: keys,
          enumNames: new_validEmptyDirTileIdList.map(
            ([dir, tileId]) =>
              `${titleCase(dirStrs[dir])} (${tileId})`
          ),
          default: keys[0]
        },
        tileId: {
          type: "string",
          default: coordinate
        }
      }
    };
    const uiSchema = {
      tileId: { "ui:widget": "hidden" }

    };
    return (
      <BaseJsonForm
        disabled={disabled}
        schema={schema}
        onSubmit={onSubmit}
        buttonText={"Add Barcode"}
        uiSchema={uiSchema}
        tooltipData={tooltipData}
      />
    );
  }
}

export default connect(
  state => ({
    selectedMapTiles: state.selection.mapTiles,
    barcodes: getBarcodes(state),
    state:state,
    current_floor: state.currentFloor,
    floor_value:state.normalizedMap.entities.floor,
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      var formDateValue = JSON.parse(formData.direction)
      formData["direction"] = formDateValue[0]
      formData["barcode_value"] = formDateValue[1]
      dispatch(addNewBarcode(formData));
    }
  })
)(AddBarcode);
