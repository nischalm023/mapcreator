import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { barcodeStringSchema } from "utils/forms";
import { addElevator } from "actions/elevator";
import {
  coordinateKeyToBarcodeSelector,
  getElevatorIds
} from "utils/selectors";

const elevatorTypeSchema = {
  type: "string",
  title: "Type",
  default: "c_type",
  enum: ["c_type", "z_type"],
  enumNames: ["C Type", "Z Type"]
};

const schema = {
  title: "Add Elevator",
  type: "object",
  required: ["elevator_id", "position", "type"],
  properties: {
    elevator_id: { type: "integer", title: "Id" },
    position: { ...barcodeStringSchema, title: "Position" },
    type: elevatorTypeSchema
  }
};

const uiSchema = {
  elevator_id: { "ui:readonly": true },
  position: { "ui:readonly": true }
};

const AddElevator = ({ onSubmit, disabled, initialData }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    uiSchema={uiSchema}
    onSubmit={onSubmit}
    buttonText={"Add Elevator"}
    initialData={initialData}
  />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => {
    const mapTilesArr = Object.keys(state.selection.mapTiles);
    if (mapTilesArr.length !== 1) {
      return {
        disabled: true
      };
    }
    const coordinate = mapTilesArr[0];
    const position = coordinateKeyToBarcodeSelector(state, {
      tileId: coordinate
    });
    return {
      disabled: false,
      initialData: {
        coordinate_list: [coordinate],
        position,
        elevator_id: Math.max(...(getElevatorIds(state) || []), 0) + 1
      }
    };
  },
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addElevator(formData));
    }
  })
)(AddElevator);
