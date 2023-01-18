import React, { Component } from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  isValidCoordinateKey
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

const shouldBeDisabled = (selectedMapTiles, barcodes, state) => {
  return (
    !onlyOneTileSelected(selectedMapTiles) ||
    !hasBarcodeForTile(selectedMapTiles, barcodes) ||
    getValidEmptyNeighbours(selectedMapTiles, barcodes).length == 0 ||
    state.selection.conveyorMode === true
  );
};

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
    const keys = _.unzip(emptyDirTileIdList)[0];
    const schema = {
      ...baseSchema,
      required: ["direction", "tileId"],
      properties: {
        direction: {
          type: "integer",
          title: "Direction",
          enum: keys,
          enumNames: emptyDirTileIdList.map(
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
      dispatch(addNewBarcode(formData));
    }
  })
)(AddBarcode);
