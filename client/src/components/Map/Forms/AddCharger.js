// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { addChargers } from "actions/charger";
import { directionSchema } from "utils/forms";

const chargerTypes = ["bottom_dock","side_dock"];
const chargerNames = ["Bottom Dock", "Side Dock"];

const chargerTypeSchema = {
  type: "string",
  title: "Charger Type",
  default: "bottom_dock",
  enum: chargerTypes,
  enumNames: chargerNames
};

const schema = {
  title: "Add Charger",
  type: "object",
  required: ["charger_direction", "charger_type"],
  properties: {
    charger_direction: {
      ...directionSchema,
      title: "Charger Direction"
    },
    charger_type: chargerTypeSchema
  }
};

const tooltipData = {
  id: "add-charger",
  title: "Add a charger",
  bulletPoints: [
    "Can only add one charger at a time.",
    "Can't add charger at periphery in a direction so that entry point would be outside map, please don't try.",
    "Also creates a special barcode with barcode 500.500 and above to accomodate map expansion",
    "Distance b/w special barcode and its neighbours is hardcoded but can be changed later in json"
  ]
};

const AddCharger = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign Charger"}
    tooltipData={tooltipData}
  />
);

export default connect(
  state => ({
    // TODO: disabling adding multiple chargers; adding neighbouring chargers together messes up
    // adjacency, should be fixed...
    disabled: Object.keys(state.selection.mapTiles).length !== 1 || state.selection.conveyorMode === true
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addChargers(formData));
    }
  })
)(AddCharger);