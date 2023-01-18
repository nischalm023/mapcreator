import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import {
  getNeighbourTiles,
  isValidCoordinateKey,
  checkValidDirection
} from "utils/util";
import _ from "lodash";
import { addNewMultipleBarcode } from "actions/barcode";
import { getBarcodes } from "../../../utils/selectors";
import titleCase from "title-case";

const baseSchema = {
  title: "Add Multiple Barcodes",
  type: "object"
};

// exported for testing
export const onlyOneTileSelected = selectedMapTiles =>
  Object.keys(selectedMapTiles).length == 1;

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

export const getValidEmptyNeighbours = (selectedMapTiles, barcodes) => {
  var emptyDirTileIdListObj = {};
  Object.keys(selectedMapTiles).forEach(function(key) {
    let nbTileIds = getNeighbourTiles(key, barcodes);
    emptyDirTileIdListObj[key] = _.zip([0, 1, 2, 3], nbTileIds).filter(
      ([, nbTileId]) => !barcodes[nbTileId] && isValidCoordinateKey(nbTileId)
    );
  });
  var emptyDirTileIdList = checkValidDirection(emptyDirTileIdListObj);
  return emptyDirTileIdList;
};

const shouldBeDisabled = (selectedMapTiles, barcodes, conveyorMode) => {
  return (
    !hasBarcodeForTile(selectedMapTiles, barcodes) ||
    getValidEmptyNeighbours(selectedMapTiles, barcodes).length == 0 ||
    conveyorMode === true
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddBarcode extends Component {
  render() {
    const { selectedMapTiles, barcodes, onSubmit, conveyorMode } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes, conveyorMode);
    const tooltipData = {
      id: "add-multi-barcode",
      title: "Add multiple barcodes",
      bulletPoints: [
        "Select a set of barcodes (Rows or Column) with available neighbours to add barcodes",
        "Can only add multiple rows or columns at a time",
        "Negative coordinates are not supported, so can't add barcode which might result in negative coordinate."
      ]
    };
    if (disabled)
      return (
        <BaseJsonForm
          disabled={disabled}
          schema={baseSchema}
          onSubmit={onSubmit}
          buttonText={"Add Multiple Barcodes"}
          tooltipId={"add-multi-barcode"}
          tooltipData={tooltipData}
        />
      );
    const coordinate = Object.keys(selectedMapTiles);
    const dirStrs = ["top", "right", "bottom", "left"];
    const emptyDirTileIdList = getValidEmptyNeighbours(
      selectedMapTiles,
      barcodes
    );
    var keys = [];
    emptyDirTileIdList.map((val) => {
      keys.push(val[0][0]);
    });
    const schema = {
      ...baseSchema,
      required: ["direction", "tileId"],
      properties: {
        direction: {
          type: "integer",
          title: "Direction",
          enum: keys,
          enumNames: keys.map(
            (dir) =>
              `${titleCase(dirStrs[dir])}`
          ),
          default: keys[0]
        },
        tileId: {
          type: "string",
          default: JSON.stringify(coordinate)
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
        buttonText={"Add Multiple Barcodes"}
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
    conveyorMode:state.selection.conveyorMode
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addNewMultipleBarcode(formData));
    }
  })
)(AddBarcode);
