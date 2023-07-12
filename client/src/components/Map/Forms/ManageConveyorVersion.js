// technically components should not be connected to app state but it's ok for our case.
import React,{ Component }  from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { addPPSes } from "actions/pps";
import { directionSchema } from "utils/forms";
import ButtonForm from "./Util/ButtonForm";
import * as constants from "../../../constants";
import { Modal } from 'reactstrap';

class AddPPS extends Component {
    state = {
        error: undefined,
        show: false,
        selected_version:"v1",
        conveyorModalShow:false
    };
    toggle = (current_version) => {
      if(!this.state.show){
        this.setState({ 
          error: undefined,
          selected_version:this.state.selected_version,
        });
      }
      this.setState({ show: !this.state.show})
    }
    handleSubmit = (event,dispatch,conveyorVersion) => {
        event.preventDefault();
        this.toggle()
        if(conveyorVersion === constants.DEFAULT_CONVEYOR_VERSION){
          dispatch({
            type: "CHANGE-CONVEYOR-VERSION",
            value: this.state.selected_version,
          }); 
        }
        else if(this.state.selected_version === constants.DEFAULT_CONVEYOR_VERSION){
          this.setState({
            conveyorModalShow : true,
          })
        }
        else{
          dispatch({
            type: "CHANGE-CONVEYOR-VERSION",
            value: this.state.selected_version,
          }); 
        }
    };

    handleConveyorOKClick(){
    const {dispatch} = this.props;
    this.setState({
      conveyorModalShow : false
    })
    dispatch({
            type: "CHANGE-CONVEYOR-VERSION",
            value: this.state.selected_version,
          }); 
    }

    render() {
        const { error, show, selected_version,conveyorModalShow} = this.state;
        const { dispatch,connectedConveyorTile,conveyorVersion} = this.props;
        return (
            <div>
                <SweetAlertError
                    title="Server Error"
                    error={error}
                    onConfirm={() => this.setState({ error: undefined })}
                />
                <ButtonForm
                    show={show}
                    toggle={this.toggle}
                    type="button"
                    btnClass="btn btn-outline-secondary"
                    buttonText="Manage JSON Schema Versions"
                    bcolor=""
                >
                    
                    <form onSubmit={(e)=>this.handleSubmit(e,dispatch,conveyorVersion)}>
                        <legend>Manage JSON Schema Versions</legend>
                        <div className="form-group">
                          <label for="direction">Conveyor JSON</label>
                          {(conveyorVersion !==undefined && conveyorVersion !== constants.DEFAULT_CONVEYOR_VERSION) && 
                            <select 
                              onChange={(e)=>this.setState({ selected_version: e.target.value })}
                              className="form-control"
                              defaultValue={conveyorVersion}
                              >
                              {constants.CONVEYOR_VERSION.map((key) => (
                                <option value={key}>{key}</option>
                            ))}
                            </select>
                          }
                          {(conveyorVersion !==undefined && conveyorVersion === constants.DEFAULT_CONVEYOR_VERSION) && 
                            <select className="form-control" disabled>
                              <option value={constants.DEFAULT_CONVEYOR_VERSION}>{constants.DEFAULT_CONVEYOR_VERSION}</option>
                            </select>
                          }
                          <br/>
                          <input type="submit" className="btn btn-outline-primary mr-1" value="Submit"></input>
                          <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={this.toggle}
                          >
                              Cancel
                          </button>
                      </div>
                    </form>
                </ButtonForm>
                <Modal isOpen={this.state.conveyorModalShow} toggle = {() => {this.setState({conveyorModalShow: !this.state.conveyorModalShow})}} className = "confirmation-modal">
                <span>This will result in a permanent JSON Schema change from v1 to v2.</span>
                <br/>
                <span> Do you want to continue?</span>
                <br></br>
                <div>
                  <button onClick={() => {this.handleConveyorOKClick()}} className="btn btn-outline-primary mr-1">
                    OK
                    </button>
                  <button className="btn btn-outline-danger" onClick={() => {
                    this.setState({
                      conveyorModalShow: false
                    })
                  }}
                  >Cancel
                  </button>
                </div>
            </Modal>  
            </div>
        );
    }
}

export default connect(
  state => {
    var connectedConveyorTile = state.normalizedMap.entities.ConnectedconveyorTile
    var conveyor_version = state.conveyorVersion
    if(connectedConveyorTile !== undefined ){
      return{
        conveyorVersion:conveyor_version,
        connectedConveyorTile:connectedConveyorTile,

      }
    }

  },
)(AddPPS);
