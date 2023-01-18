import React, { Component } from "react";
import { connect } from "react-redux";
import ButtonForm from "./Util/ButtonForm";
import { removeConveyor } from "actions/conveyor";
import Form from "react-jsonschema-form";

const makeSchema = ConveyorDict => {
  const conveyorEnum = Object.keys(ConveyorDict);
  const defaultSector = conveyorEnum[0];
  return {
    title: "Select Conveyor ID to Remove",
    type: "object",
    required: ["conveyor_id"],
    properties: {
      conveyor_id: {
        type: "string",
        title: "Conveyor Id",
        enum: conveyorEnum,
        enumNames: conveyorEnum,
        default: defaultSector
      }
    }
  };
};

const checkConveyorSystem = ConveyorDict => {
  const conveyorEnum = Object.keys(ConveyorDict);
  var disable_status = true
  if(conveyorEnum.length>0){
      for (var i = 0; i < conveyorEnum.length; i++) {
        if(ConveyorDict[conveyorEnum[i]].hasOwnProperty("selected_tile")){
          if(ConveyorDict[conveyorEnum[i]]["selected_tile"].length>0){
              disable_status = false
              {break}
          }
        }
      }
  }
 return disable_status 
};


class RemoveConveyorSystem extends Component {
  state = {
    error: undefined,
    show: false,
    formData: {},
  };
  toggle = () => this.setState({ show: !this.state.show, formData: {}});
  render() {
    const {
      schema,
      onSubmit,
      onError = () => {},
      initialData = {},
      dispatch,
      ConveyorDict,
    } = this.props;
  
    const { formData } = this.state;
    const { error, show} = this.state;
    var disabled = checkConveyorSystem(ConveyorDict)
    return (
      <div>
        <ButtonForm
          show={this.state.show}
          toggle={this.toggle}
          disabled={disabled}
          tooltipData={{ id: "remove-conveyor", title: "Remove Conveyor System" }}
          buttonText="Remove Conveyor System"
          bcolor = "orange"
        >
        <Form
          schema={makeSchema(ConveyorDict)}
          onSubmit={formData => {
            onSubmit(formData);
            this.toggle();
          }}
        >
        <div>
            <button type="submit" className="btn btn-outline-primary mr-1">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={this.toggle}
            >
              Cancel
            </button>
          </div>
        </Form>
        </ButtonForm>
      </div>
    );
  }
}

export default connect(
  state => ({
    ConveyorDict: state.normalizedMap.entities.conveyorTile || {}
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(removeConveyor(formData));
    }
  })
)(RemoveConveyorSystem);