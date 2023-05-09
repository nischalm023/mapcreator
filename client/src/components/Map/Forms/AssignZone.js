// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { assignZone } from "actions/zone";

const makeSchema = zoneDict => {
  const zoneEnum = Object.keys(zoneDict);
  const defaultZone = zoneEnum[0];
  return {
    title: "Assign Zone",
    type: "object",
    required: ["zone_id"],
    properties: {
      zone_id: {
        type: "string",
        title: "Zone name",
        enum: zoneEnum,
        enumNames: zoneEnum,
        default: defaultZone
      }
    }
  };
};

const AssignZone = ({ onSubmit, disabled, zoneDict }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={makeSchema(zoneDict)}
    onSubmit={onSubmit}
    buttonText={"Assign Zone"}
  />
);

export default connect(
  state => ({
    disabled:
      Object.keys(state.selection.mapTiles).length === 0 ||
      Object.keys(state.normalizedMap.entities.zone) === 0,
    zoneDict: state.normalizedMap.entities.zone || {}
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(assignZone(formData));
      // TODO: define what needs to be done
    }
  })
)(AssignZone);
