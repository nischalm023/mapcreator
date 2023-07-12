import React from "react";
import SelectConveyorSystemForm from "./Util/SelectConveyorSystemForm";
import { connect } from "react-redux";
import { convertNestedListToList,addConveyorId } from "actions/conveyor";
import { getBarcodes } from "../../../utils/selectors";
import {getNeighbouringCoordinateKeys } from "utils/util";

const schema = () => {
    return {
        title: "Select Conveyor System",
        type: "object",
    };
};

const ConveyorCheckboxMode = ({ onSubmit, disabled, nextConveyorId,map_tile_value,floor_barcodes}) => (
    <SelectConveyorSystemForm
        schema={schema()}
        disabled={disabled}
        nextConveyorId={nextConveyorId}
        selected_tile={map_tile_value}
        onSubmit={onSubmit}
        floor_barcodes={floor_barcodes}
        buttonText={"Add Conveyor System"}
    />
);



const shouldBeDisabled = (tileIds,barcodesDict,conveyorTile) => {
  if (tileIds.length < 3){
    return true
  }
  if(conveyorTile != undefined || Object.keys(conveyorTile).length>=1){
      for (const [key, value] of Object.entries(conveyorTile)) {
        var selected_tile = convertNestedListToList(value["selected_tile"])
        if(tileIds.some(r=> selected_tile.includes(r))){
          return true
        } 
      }
  }
  // for (var i = 1; i < tileIds.length; i++) {
  //   var curTileId = tileIds[i];
  //   var prevTileId = tileIds[i - 1];
  //   // make sure prev barcode has current barcode as neighbour
  //   if (
  //     getNeighbouringCoordinateKeys(prevTileId, barcodesDict).find(
  //       coordinateKey => coordinateKey == curTileId
  //     ) === undefined
  //   )
  //     return true
  // }

  return false;
  };
 
export default connect(
    state => {
        var barcodes = getBarcodes(state)
        var current_floor = state.currentFloor
        var floor_value = state.normalizedMap.entities.floor
        var conveyorTiles = state.normalizedMap.entities.conveyorTile
        var current_floor_value = floor_value[current_floor]
        var floor_barcodes = {};
        const barcodeKeys = current_floor_value.map_values;
        barcodeKeys.forEach((barcodeKey) => {
          floor_barcodes[barcodeKey] = barcodes[barcodeKey];
        });
        var selectedMapTiles = state.selection.mapTiles
        var map_tile_value = Object.keys(selectedMapTiles)
        var disabled = shouldBeDisabled(map_tile_value,floor_barcodes,conveyorTiles)
        return {
            disabled: disabled,
            nextConveyorId:
            Math.max(...(state.normalizedMap.entities.map.dummy.conveyors || []), 0) + 1,
            map_tile_value:map_tile_value,
            floor_barcodes:floor_barcodes
        }
    },
    dispatch => ({
        onSubmit: (formData) => {
            dispatch(addConveyorId(formData))
            }
        }
    )
)(ConveyorCheckboxMode);
