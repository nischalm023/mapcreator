// technically components should not be connected to app state but it's ok for our case.
import React,{ Component }  from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { addPPSes } from "actions/pps";
import { directionSchema } from "utils/forms";
import ButtonForm from "./Util/ButtonForm";

class AddPPS extends Component {
    state = {
        error: undefined,
        show: false,
        eligible_type:"rtp",
        pick_direction:0,
        pps_type:"manual"
    };
    toggle = () => {
      if(!this.state.show){
        const params = new URLSearchParams(window.location.search);
        let gsbAgentName = params.get('gsb_agent_name') ? params.get('gsb_agent_name') : 'rtp';
        let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
        this.setState({ 
          error: undefined,
          eligible_type:gsbAgentName,
          pick_direction:0,
          pps_type:"manual" 
        });
      }
      this.setState({ show: !this.state.show})
    }
    onClickk = (e) => {
      this.setState({ eligible_type: e.target.value })
    }
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

    componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    let gsbAgentName = params.get('gsb_agent_name') ? params.get('gsb_agent_name') : null;
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    if(gsbAgentName=="ttp"){
          this.setState({ eligible_type: "ttp" })
        }
    if(gsbAgentName=="ttp_rtp"){
          this.setState({ eligible_type: "ttp_rtp" })
        }
    if(gsbAgentName=="rtp"){
          this.setState({ eligible_type: "rtp" })
        }

    };
    render() {
        const { error, show, eligible_type, pick_direction, pps_type} = this.state;
        const params = new URLSearchParams(window.location.search);
        let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
        let gsbAgentName = params.get('gsb_agent_name') ? params.get('gsb_agent_name') : 'rtp';
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
                            <select onChange={(e)=>this.setState({ pick_direction: e.target.value })} className="form-control" id="direction" name="pick-direction">
                              <option value="0">Top</option>
                              <option value="1">Right</option>
                              <option value="2">Bottom</option>
                              <option value="3">Left</option>
                            </select>
                          <br/>
                          <label for="type">Eligible Agent</label>
                            <select 
                              onChange={(e)=>this.onClickk(e)} 
                              className="form-control" 
                              id="eligible_system" 
                              name="eligible_system"
                              defaultValue={gsbAgentName}
                            >
                              <option value="rtp">RTP</option>
                              <option value="ttp">TTP</option>
                              <option value="ttp_rtp">TTP+RTP</option>
                            </select>
                          <br/>
                          {(eligible_type == "ttp" || eligible_type == "ttp_rtp") && 
                          <div>
                            <label for="type">PPS Type</label>
                              <select onChange={(e)=>this.setState({ pps_type: e.target.value })} className="form-control" id="type" name="pps-type">
                                <option value="manual">Manual</option>
                              </select>
                          <br/>
                          </div>
                          }
                          {(eligible_type != "ttp" && eligible_type != "ttp_rtp") && 
                          <div>
                          <label for="type">PPS Type</label>
                            <select onChange={(e)=>this.setState({ pps_type: e.target.value })} className="form-control" id="type" name="pps-type">
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

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
)(AddPPS);
