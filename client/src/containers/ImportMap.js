import React, { Component } from "react";
import importMap from "common/utils/import-map";
import JSONFileInput from "components/JSONFileInput";
import { handleErrors } from "utils/util";
import { withRouter } from "react-router-dom";
import SweetAlertError from "components/SweetAlertError";
import { createMap } from "utils/api";
import _ from "lodash";

class ImportMap extends Component {
  state = {
    name: "",
    error: undefined
  };
  
  onRead = stateKey => json => {
    // should do validation here or not? probably not, just do it once submit is pressed
    this.setState({ [stateKey]: json });
  };

  onError = error => this.setState({ error });

  onClear = stateKey => () => {
    this.setState({ [stateKey]: undefined });
  };

  onSubmit = e => {
    e.preventDefault();
    // validate the import by converting everything into the map using import function
    let imported;
    try {
      imported = importMap(_.omit(this.state, ["name", "error"]));
    } catch (error) {
      this.setState({ error: error.message });
      return;
    }
    // save
    const { name } = this.state;
    const { history } = this.props;
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsb_solution_id');
    let gsbAgentId = params.get('gsb_agent_id');
    let gsbFunctionalAreaId = params.get('functional_area_id');
    let gsbAgentName = params.get("gsb_agent_name")
    let uid = params.get('uid');
    let gsbUser  = params.get('gsb_user');
    for(let i=0;i<imported.floors.length;i++){
      for(let j=0;j<imported.floors[i].map_values.length;j++){
        if(imported.floors[i].map_values[j].isIoPoint){
          delete imported.floors[i].map_values[j].isIoPoint
          }
//        if(imported.floors[i].map_values[j].grid_attribute){
//          imported.floors[i].map_values[j].grid_attribute = ''
//        }
      }
      //Delete PPS Point for non RTP PPS since conveyor json is not uploaded
//      console.log(">>>>>>>>>>>>>>>>>>>>string",JSON.stringify(imported.floors[i].ppses))
//      for(let j=0;j<imported.floors[i].ppses.length;j++){
//        if(imported.floors[i].ppses[j]){
//            for(let k=0;k<imported.floors[i].ppses[j].pps_points.length;k++){
//                if(imported.floors[i].ppses[j].pps_points[k] && imported.floors[i].ppses[j].pps_points[k].type !== "rtp"){
//                    delete imported.floors[i].ppses[j].pps_points[k]
//                }
//            }
//            imported.floors[i].ppses[j].pps_points = imported.floors[i].ppses[j].pps_points.filter(elm => elm);
//            // //Delete PPS Point key since no pps point present
//            // var isPpsPointPresent = false;
//            // for(let k=0;k<imported.floors[i].ppses[j].pps_points.length;k++){
//            //     if(imported.floors[i].ppses[j].pps_points[k] && imported.floors[i].ppses[j].pps_points[k] !== null){
//            //         isPpsPointPresent = true;
//            //     }
//            // }
//            // if(!isPpsPointPresent){
//            //     delete imported.floors[i].ppses[j].pps_points
//            // }
//        }
//      }
    }
    createMap(imported, name, gsb, uid, 'import', gsbSolutionId, gsbAgentId, gsbFunctionalAreaId, gsbUser)
      .then(handleErrors)
      .then(res => res.json())
      .then(id => {
        if(gsb){
          return history.push(`/map/${id}?gsb=true&gsb_solution_id=${gsbSolutionId}&gsb_agent_id=${gsbAgentId}&functional_area_id=${gsbFunctionalAreaId}&uid=${uid}&gsb_agent_name=${gsbAgentName}&gsb_user=${gsbUser}`)
        } else {
          return history.push(`/map/${id}`)
        }
      })
      .catch(error => this.setState({ error }));
  };
  
  render() {
    const { error } = this.state;
    return (
      <div className="container">
        {/* sweetalert here*/}
        <SweetAlertError
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <h3 className="display-5 pb-4">Specify files to import from</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group row">
            <label htmlFor="name" className="col-form-label col-sm-3">
              Name
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="name"
                className="form-control"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </div>
          </div>
          {[
            ["map", "map.json", "mapJson"],
            ["pps", "pps.json", "ppsJson"],
            ["charger", "charger.json", "chargerJson"],
            ["zone", "zone.json", "zoneJson"],
            ["sector", "sector.json", "sectorJson"],
            ["ods_excluded", "ods_excluded.json", "odsExcludedJson"],
            ["fire_emergency", "fire_emergency.json", "fireEmergencyJson"],
            ["elevator", "elevator.json", "elevatorJson"]
          ].map(([idField, label, stateKey], idx) => (
            <JSONFileInput
              onClear={this.onClear(stateKey)}
              onRead={this.onRead(stateKey)}
              onError={this.onError}
              idField={idField}
              label={label}
              key={idx}
            />
          ))}
          <div className="form-group row">
            <div className="col-sm-10">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(ImportMap);
