// technically components should not be connected to app state but it's ok for our case.
import React,{ Component }  from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { addPPSes } from "actions/pps";
import { directionSchema } from "utils/forms";
import ButtonForm from "./Util/ButtonForm";

// const EligibleTypeSchema = {
//   type: "string",
//   title: "Eligible Type",
//   default: "RTP",
//   enum: ["rtp", "ttp", "rtp_ttp"],
//   enumNames: ["RTP", "TTP", "TTP+RTP"]
// };

// const ppsTypeSchema = {
//   type: "string",
//   title: "PPS Type",
//   default: "manual",
//   enum: ["ppp_manual", "ara", "manual"],
//   enumNames: ["PPP (manual)", "ARA", "Manual"]
// };

// const schema = {
//   title: "Add PPS",
//   type: "object",
//   required: ["pick_direction", "type", "eligible_system"],
//   properties: {
//     pick_direction: { ...directionSchema, title: "Pick Direction" },
//     type: ppsTypeSchema,
//     eligible_system:EligibleTypeSchema
//   }
// };

// const AddPPS = ({ onSubmit, disabled }) => (
//   <BaseJsonForm
//     disabled={disabled}
//     schema={schema}
//     onSubmit={onSubmit}
//     buttonText={"Assign PPS"}
//     style={{ marginLeft:"20%", textAlign:"-webkit-center", color:"orange"}}
//   />
// );

class AddPPS extends Component {
    state = {
        error: undefined,
        show: false,
        eligible_type:"rtp",
        pick_direction:0,
        pps_type:"manual"
    };
    toggle = () => this.setState({ show: !this.state.show });
    onClick = (e) => this.setState({ eligible_type: e.target.value })
    handleSubmit = (event,dispatch) => {
        event.preventDefault();
        let eligible_type = this.state.eligible_type;
        let pick_direction = this.state.pick_direction;
        let pps_type = this.state.pps_type;
        const formData = {
            eligible_type:eligible_type,
            pick_direction:parseInt(pick_direction),
            type: pps_type 
        };
        this.toggle()
        dispatch(addPPSes(formData));
    };
    render() {
        const { error, show, eligible_type, pick_direction, pps_type} = this.state;
        const { disabled ,dispatch} = this.props;
        return (
            <div>
                <SweetAlertError
                    title="Server Error"
                    error={error}
                    onConfirm={() => this.setState({ error: undefined })}
                />
                <ButtonForm
                    show={show}
                    disabled={disabled}
                    toggle={this.toggle}
                    buttonText="Add PPS"
                >
                    
                    <form onSubmit={(e)=>this.handleSubmit(e,dispatch)}>
                        <legend>Add PPS</legend>
                        <div className="form-group">
                          <label for="direction">Pick Direction*</label>
                            <select onClick={(e)=>this.setState({ pick_direction: e.target.value })} className="form-control" id="direction" name="pick-direction">
                              <option value="0">Top</option>
                              <option value="1">Right</option>
                              <option value="2">Bottom</option>
                              <option value="3">Left</option>
                            </select>
                          <br/>
                          <label for="type">Eligible Agent</label>
                            <select onClick={(e)=>this.onClick(e)} className="form-control" id="eligible_system" name="eligible_system">
                              <option value="rtp">RTP</option>
                              <option value="ttp">TTP</option>
                              <option value="ttp_rtp">TTP+RTP</option>
                            </select>
                          <br/>
                          {eligible_type == "ttp" && 
                          <div>
                            <label for="type">PPS Type</label>
                              <select onClick={(e)=>this.setState({ pps_type: e.target.value })} className="form-control" id="type" name="pps-type">
                                <option value="manual">Manual</option>
                              </select>
                          <br/>
                          </div>
                          }
                          {eligible_type != "ttp" && 
                          <div>
                          <label for="type">PPS Type</label>
                            <select onClick={(e)=>this.setState({ pps_type: e.target.value })} className="form-control" id="type" name="pps-type">
                              <option value="manual">Manual</option>
                              <option value="ara">ARA</option>
                              <option value="ppp_manual">PPP (manual)</option>
                            </select>
                          <br/>
                          </div>
                        }
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
            </div>
        );
    }
}

// //only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0 || state.selection.conveyorMode === true
  }),
  // dispatch => ({
  //   onSubmit: ({ formData }) => {
  //     dispatch(addPPSes(formData));
  //   }
  // })
)(AddPPS);
