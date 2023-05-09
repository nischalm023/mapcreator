import React, { Component } from "react";
import { connect } from "react-redux";
import ButtonForm from "./Util/ButtonForm";
import { viewConveyor,viewModalConveyor } from "actions/conveyor";
import Form from "react-jsonschema-form";
// import FormModal from "./Util/FormModal";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const makeSchema = ConveyorDict => {
  let conveyorEnum = Object.keys(ConveyorDict);
  if(conveyorEnum.length>0){
    conveyorEnum = ['All'].concat(conveyorEnum)
  }
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
    var disable_status = false
  }
 return disable_status 
};


class ViewConveyorSystem extends Component {
  state = {
    error: undefined,
    show: false,
    conveyor_id:"",
    formData: {},
  };
  toggle = () => {
    this.setState({ show: !this.state.show,formData: {}})
  };
  modal_toggle = (formData) => {
    this.setState({ conveyor_id:formData.formData})
  };
  render() {
    const {
      schema,
      onSubmit,
      onClick,
      onError = () => {},
      initialData = {},
      dispatch,
      ConveyorDict,
      ConveyorView,
      ...rest
    } = this.props;
    const { error, show,conveyor_id,formData} = this.state;
    var disabled = checkConveyorSystem(ConveyorDict)
    var conveyor_id_val = conveyor_id.conveyor_id
    // if(conveyor_id_val!="All"){
    var conveyor_data = ConveyorDict[conveyor_id_val]
    // }else{

    // }
    
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
            this.modal_toggle(formData)
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
        <div key = {1} className="modal fade" tabIndex="-1" role="dialog">
          <Modal isOpen={ConveyorView}>
              <ModalHeader>View Conveyor Details</ModalHeader>
              <ModalBody>
              <table border = "1">
                 <tr>
                    <th style={{padding: '10px'}}>Conveyor Id</th>
                    <th style={{padding: '10px'}}>Conveyor Entry Height</th>
                    <th style={{padding: '10px'}}>Conveyor Exit Height</th>
                 </tr>
                  {Object.keys(ConveyorDict).map(( listValue, index ) => {
                    if(conveyor_id_val ==="All"){
                      return (
                        <tr key={index}>
                          <td style={{padding: '10px'}}>{ConveyorDict[listValue]["conveyor_id"]}</td>
                          <td style={{padding: '10px'}}>{ConveyorDict[listValue]["conveyor_entry_height"]}</td>
                          <td style={{padding: '10px'}}>{ConveyorDict[listValue]["conveyor_exit_height"]}</td>
                        </tr>
                      );
                    }
                    })}
                  {(conveyor_id_val && conveyor_id_val !=="All" &&  Object.keys(ConveyorDict).length !=0) &&  
                    <tr>
                        <td style={{padding: '10px'}}>{conveyor_data["conveyor_id"]}</td>
                        <td style={{padding: '10px'}}>{conveyor_data["conveyor_entry_height"]}</td>
                        <td style={{padding: '10px'}}>{conveyor_data["conveyor_exit_height"]}</td>
                    </tr>
                  }
                 
              </table>
              <br/>
              <button onClick={() => {
                  onClick(conveyor_id);
              }}
              >ok</button>
              </ModalBody>
          </Modal>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    ConveyorDict: state.normalizedMap.entities.conveyorTile || {},
    ConveyorView: state.viewConveyor
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(viewConveyor(formData));
    },
    onClick: (conveyor_id) => {
      dispatch(viewModalConveyor(conveyor_id));
    }
  })
)(ViewConveyorSystem);