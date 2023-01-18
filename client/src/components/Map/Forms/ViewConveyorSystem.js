import React, { Component } from "react";
import { connect } from "react-redux";
import ButtonForm from "./Util/ButtonForm";
import { viewConveyor } from "actions/conveyor";
import Form from "react-jsonschema-form";

const makeSchema = ConveyorDict => {
  const conveyorEnum = Object.keys(ConveyorDict);
  const defaultSector = conveyorEnum[0];
  return {
    title: "Select Conveyor ID to View",
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
        if(ConveyorDict[conveyorEnum[i]].hasOwnProperty("conveyor_active")){
          if(ConveyorDict[conveyorEnum[i]]["conveyor_active"].length>0){
              var disable_status = false
              {break}
          }
        }
          
      }
  }
 return disable_status 
};


class ViewConveyorSystem extends Component {
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
      ...rest
    } = this.props;
  
    const { formData } = this.state;
    const fullFormData = { ...initialData, ...formData };
    const { error, show} = this.state;
    var disabled = checkConveyorSystem(ConveyorDict)
    return (
      <div>
        <ButtonForm
          disabled = {disabled}
          show={this.state.show}
          toggle={this.toggle}
          tooltipData={{ id: "view-conveyor", title: "View Conveyor System" }}
          buttonText="View Conveyor System"
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
      dispatch(viewConveyor(formData));
    }
  })
)(ViewConveyorSystem);