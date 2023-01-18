// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import RackJsonForm from "./Util/RackJsonForm";
import { connect } from "react-redux";
import { sectorMxUPreferences } from "actions/sectorMxUPreferences";

const schema = (sectorDict, sectorMxUPreferences) => {
  const sectorEnum = Object.keys(sectorDict);
  const defaultSector = sectorEnum[0];
  return {
    title: "Sector MxU Preferences",
    type: "object",
    required: ["rack_id", "sectors"],
    properties: {
      rack_id: { type: "string", title: "Rack Type", value: "" },
      sectors: { type: "array", title: "Sectors", value: "", sectors: sectorEnum, default: defaultSector }
    },
    sectorMxUPreferences: sectorMxUPreferences
  };
};

const SectorMSUMapping = ({ onSubmit, disabled, sectorDict, sectorMxUPreferences }) => (
  <RackJsonForm
    disabled={disabled}
    schema={schema(sectorDict, sectorMxUPreferences)}
    onSubmit={onSubmit}
    buttonText={"Sector MxU Preferences"}
  />
);

export default connect(
  state => ({
    sectorDict: state.normalizedMap.entities.sector || {},
    sectorMxUPreferences: state.normalizedMap.entities.sectorMxUPreferences || {},
    disabled:state.selection.conveyorMode === true

    //disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: (formData) => {
      dispatch(sectorMxUPreferences(formData));
      return false;
      //dispatch(addOdsExcludeds(formData));
    }
  })
)(SectorMSUMapping);
