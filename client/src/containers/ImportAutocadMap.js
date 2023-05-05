import React, { Component } from "react";
import importMap from "common/utils/import-map";
import JSONFileInput from "components/JSONFileInput";
import { handleErrors } from "utils/util";
import { withRouter } from "react-router-dom";
import SweetAlertError from "components/SweetAlertError";
import { createMap , runHaiMapConversionScriptToMap, requestAutocadFileFromGsb} from "utils/api";
import _ from "lodash";
class ImportMap extends Component {
  state = {
    name: "",
    error: undefined,
  };
  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsb_solution_id');
    let gsbAgentId = params.get('gsb_agent_id');
    let gsbFunctionalAreaId = params.get('functional_area_id');
    let uid = params.get('uid');
    let name  = params.get('name');
    if(gsb){
      this.getAutocadFileFromGsb(gsb,gsbSolutionId,gsbAgentId,gsbFunctionalAreaId,uid);
    }
  };
  handleChange = (evt) => {
      this.setState({["autocad"]: evt.target.files[0]});
  };

  onRead = (stateKey) => (json) => {
    console.log(" in on read", json,stateKey)
    // should do validation here or not? probably not, just do it once submit is pressed
    this.setState({ [stateKey]: json });
    console.log(" in on read", this.state)

  };

  onError = (error) => this.setState({ error });

  onClear = (stateKey) => () => {
    this.setState({ [stateKey]: undefined });
  };

  createMap = (imported) => {
    const { history } = this.props;
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsb_solution_id');
    let gsbAgentId = params.get('gsb_agent_id');
    let gsbFunctionalAreaId = params.get('functional_area_id');
    let uid = params.get('uid');
    const name = params.get('name');
    console.log("name",name)
    createMap(imported, name, gsb, uid, 'autocad_import', gsbSolutionId, gsbAgentId, gsbFunctionalAreaId)
      .then(handleErrors)
      .then((res) => res.json())
      .then(id => {
        if(gsb){
          return history.push(`/map/${id}?gsb=true&gsb_solution_id=${gsbSolutionId}&gsb_agent_id=${gsbAgentId}&functional_area_id=${gsbFunctionalAreaId}&uid=${uid}`)
        } else {
          return history.push(`/map/${id}`)
        }
      })
      .catch((error) => this.setState({ error }));
  }
  fetchDoc = async(url) => {
    try{
      const response = await fetch(url,{
        method: "GET", responseType: 'blob'
      })
      const data = await response.blob();
       return {message: 'Fetched data successfully','status': 200 , data: data}
    }
    catch(error){
      return { message: 'Failed to fetch data','status': 400 };
    };
  }
  getAutocadFileFromGsb = (gsb,gsbSolutionId,gsbAgentId,gsbFunctionalAreaId,uid,name) => {
    let imported;
    var data = {'gsb': gsb, 'gsb_solution_id': gsbSolutionId, 'gsb_agent_id': gsbAgentId,'gsb_functional_area_id': gsbFunctionalAreaId,
    'gsb_uid': uid , 'name':name
  }
    var xls_file_url = requestAutocadFileFromGsb(data)
                      .then((res) => res.json())
                      .then((response) => {
                        try{
                        console.log("responseee" , response)  
                          this.fetchDoc(response.data[0]["fileuri"])
                          .then((response)=>{
                            console.log("response====", response);
                            if(response.status===200){
                              var script_request = runHaiMapConversionScriptToMap(response.data)
                              .then((script_response)=>{
                                if (script_response["status"] == "404"){
                                 this.setState({ 'error':script_response["content"] })
                                }
                                else{
                                  imported = importMap(_.omit(script_response["content"], ["name", "error"]));
                                  this.createMap(imported)
                                }
                              })
                            }  
                          }) 
                          return  {message: 'Fetched url successfully','status': 200 , data: response}
                        }
                        catch(error){
                          console.log("errorrr", response)
                          return { message: 'Failed to fetch url data','status': 400 };
                        }
                      })
  }
  onSubmit = (e) => {
    e.preventDefault();
    // validate the import by converting everything into the map using import function
    let imported;
    try {
      if(this.state["autocad"]){
            var response = runHaiMapConversionScriptToMap(this.state["autocad"]).then(
            response=>{
                  if (response["status"] == "404"){
                   this.setState({ 'error':response["content"] })
                  }
                  else{
                  imported = importMap(_.omit(response["content"], ["name", "error"]));
                  this.createMap(imported)
                }
            });
      }
    } catch (error) {
      console.log(error.message);
      this.setState({ error: error.message });
      return;
    }
    
  };

  render() {
    // console.log(" State ",this.state);
    const { error } = this.state;
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsb_solution_id');
    let gsbAgentId = params.get('gsb_agent_id');
    let gsbFunctionalAreaId = params.get('functional_area_id');
    let uid = params.get('uid');
    
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
                onChange={(e) => this.setState({ name: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group row justify-content-between">
            <label for="fileSelect" className="col-form-label col-sm-3">autocad.xls</label>
              <div className="col-sm-9">
                <input
                 type={"file"} 
                 onChange={this.handleChange}
                 accept={".xls"} />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-10">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
	  <div className="form-group row">
            <div className="col-sm-10">
              <p>Click <a href="http://gsb-dev.greymatter.greyorange.com:3006/" target="_blank">here </a>to convert Autocad(.dwg) file to xls</p>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(ImportMap);
