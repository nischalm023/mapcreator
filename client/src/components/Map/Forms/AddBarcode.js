import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  isValidCoordinateKey,
  encode_barcode,
  coordinateKeyToTupleOfIntegers
} from "utils/util";

import _ from "lodash";
import { addNewBarcode } from "actions/barcode";
import { getBarcodes } from "../../../utils/selectors";
import titleCase from "title-case";

const baseSchema = {
  title: "Add Barcode",
  type: "object"
};

// exported for testing
export const onlyOneTileSelected = selectedMapTiles =>
  Object.keys(selectedMapTiles).length == 1;

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

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

const shouldBeDisabled = (selectedMapTiles, barcodes, state) => {
  return (
    !onlyOneTileSelected(selectedMapTiles) ||
    !hasBarcodeForTile(selectedMapTiles, barcodes) ||
    getValidEmptyNeighbours(selectedMapTiles, barcodes).length == 0 ||
    state.selection.conveyorMode === true
  );
};

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
    const { selectedMapTiles, barcodes, onSubmit ,state } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes, state);
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
      barcodes
    );
    var barcode_cordinate = getExistingBarcodesAndCoordinates(barcodes)
    const validEmptyDirTileIdList =  getValidEmptyDirTileIdList(barcode_cordinate.barcodes,emptyDirTileIdList)
    const keys = validEmptyDirTileIdList.map(innerArray => JSON.stringify(innerArray))
    const schema = {
      ...baseSchema,
      required: ["direction", "tileId"],
      properties: {
        direction: {
          type: "string",
          title: "Direction",
          enum: keys,
          enumNames: validEmptyDirTileIdList.map(
            ([dir, tileId]) =>
              `${titleCase(dirStrs[dir])} (${implicitCoordinateKeyToBarcode(
                tileId
              )})`
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
    state:state
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      var formDateValue = JSON.parse(formData.direction)
      formData["direction"] = formDateValue[0]
      formData["barcode_value"] = implicitCoordinateKeyToBarcode(formDateValue[1])
      dispatch(addNewBarcode(formData));
    }
  })
)(AddBarcode);
