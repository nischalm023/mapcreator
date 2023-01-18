// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { assignSector } from "actions/sector";
import { sectorBarcodeMapping } from "actions/sectorBarcodeMapping";

const makeSchema = sectorDict => {
  const sectorEnum = Object.keys(sectorDict);
  const defaultSector = sectorEnum[0];
  return {
    title: "Assign Sector",
    type: "object",
    required: ["sector_id"],
    properties: {
      sector_id: {
        type: "string",
        title: "Sector name",
        enum: sectorEnum,
        enumNames: sectorEnum,
        default: defaultSector
      }
    }
  };
};

const AssignSector = ({ onSubmit, disabled, sectorDict }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={makeSchema(sectorDict)}
    onSubmit={onSubmit}
    buttonText={"Assign Sector"}
  />
);

export default connect(
  state => ({
    disabled:
      Object.keys(state.selection.mapTiles).length === 0 ||
      Object.keys(state.normalizedMap.entities.sector) === 0 || state.selection.conveyorMode === true,
    sectorDict: state.normalizedMap.entities.sector || {}
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(assignSector(formData));
      dispatch(sectorBarcodeMapping(formData));
      // TODO: define what needs to be done
    }
  })
)(AssignSector);
