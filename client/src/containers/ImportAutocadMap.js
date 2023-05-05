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
    loading:false
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
      this.setState({ loading: true });
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
   var responce_data= {"content":{"chargerJson":[{"charger_direction":2,"charger_id":2,"charger_location":"114.119","charger_type":"side_dock","entry_point_direction":2,"entry_point_location":"114.119","mode":"manual","reinit_point_direction":2,"reinit_point_location":"114.119","status":"disconnected"},{"charger_direction":1,"charger_id":1,"charger_location":"002.012","charger_type":"side_dock","entry_point_direction":1,"entry_point_location":"002.012","mode":"manual","reinit_point_direction":1,"reinit_point_location":"002.012","status":"disconnected"}],"elevatorJson":[{"coordinate_list":[{"coordinate":[3,2],"direction":0}],"elevator_id":1,"entry_barcodes":[{"barcode":"002.004","boom_barrier_id":1,"floor_id":1}],"exit_barcodes":[{"barcode":"002.002","boom_barrier_id":1,"floor_id":1}],"position":"002.003","reinit_barcodes":[],"type":"c_type"},{"coordinate_list":[{"coordinate":[117,116],"direction":0}],"elevator_id":2,"entry_barcodes":[{"barcode":"116.118","boom_barrier_id":1,"floor_id":2}],"exit_barcodes":[{"barcode":"116.116","boom_barrier_id":1,"floor_id":2}],"position":"116.117","reinit_barcodes":[],"type":"c_type"}],"mapJson":[{"floor_id":1,"map_values":[{"adjacency":[[8,0],null,[8,2],null],"barcode":"001.008","blocked":false,"botid":"null","coordinate":"[8,1]","neighbours":[[0,0,0],[0,0,0],[1,1,1],[0,0,0]],"sector":1,"size_info":[750,750,500,750],"store_status":1,"zone":"defzone"},{"adjacency":[[1,0],[0,2],[1,3],[2,2]],"barcode":"002.001","blocked":false,"botid":"null","coordinate":"[1,2]","neighbours":[[0,0,0],[0,0,0],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,750,500,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[2,0],[1,2],[2,3],[3,2]],"barcode":"002.002","blocked":false,"botid":"null","coordinate":"[2,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,1000,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[3,0],[2,2],[3,5],[4,2]],"barcode":"002.003","blocked":false,"botid":"null","coordinate":"[3,2]","neighbours":[[0,0,0],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[750,750,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[4,0],[3,2],[4,3],[5,2]],"barcode":"002.004","blocked":false,"botid":"null","coordinate":"[4,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,750,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[5,0],[4,2],[5,3],[6,2]],"barcode":"002.005","blocked":false,"botid":"null","coordinate":"[5,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[6,0],[5,2],[6,3],[7,2]],"barcode":"002.006","blocked":false,"botid":"null","coordinate":"[6,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[7,0],[6,2],[7,3],[8,2]],"barcode":"002.007","blocked":false,"botid":"null","coordinate":"[7,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[8,1],[7,2],[8,3],[9,2]],"barcode":"002.008","blocked":false,"botid":"null","coordinate":"[8,2]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[500,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[9,0],[8,2],[9,3],[10,2]],"barcode":"002.009","blocked":false,"botid":"null","coordinate":"[9,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[10,0],[9,2],[10,3],[11,2]],"barcode":"002.010","blocked":false,"botid":"null","coordinate":"[10,2]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,500,500,195],"store_status":0,"zone":"defzone"},{"adjacency":[null,[10,2],null,[12,2]],"barcode":"002.011","blocked":false,"botid":"null","coordinate":"[11,2]","neighbours":[[0,0,0],[1,1,1],[0,0,0],[1,1,0]],"sector":1,"size_info":[750,195,750,305],"store_status":0,"zone":"defzone"},{"adjacency":[null,null,null,null],"barcode":"002.012","blocked":false,"botid":"null","coordinate":"[12,2]","neighbours":[[0,0,0],[1,1,0],[0,0,0],[1,0,0]],"sector":1,"size_info":[750,305,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[1,2],[0,3],[1,5],[2,3]],"barcode":"003.001","blocked":false,"botid":"null","coordinate":"[1,3]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,750,650,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[2,2],[1,3],[2,5],null],"barcode":"003.002","blocked":false,"botid":"null","coordinate":"[2,3]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[0,0,0]],"sector":2,"size_info":[500,1000,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[4,2],null,[4,5],[5,3]],"barcode":"003.004","blocked":false,"botid":"null","coordinate":"[4,3]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,750,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[5,2],[4,3],[5,5],[6,3]],"barcode":"003.005","blocked":false,"botid":"null","coordinate":"[5,3]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,500,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[6,2],[5,3],[6,4],[7,3]],"barcode":"003.006","blocked":false,"botid":"null","coordinate":"[6,3]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":2,"size_info":[500,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[7,2],[6,3],[7,5],[8,3]],"barcode":"003.007","blocked":false,"botid":"null","coordinate":"[7,3]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,500,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[8,2],[7,3],[8,5],[9,3]],"barcode":"003.008","blocked":false,"botid":"null","coordinate":"[8,3]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,500,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[9,2],[8,3],[9,4],[10,3]],"barcode":"003.009","blocked":false,"botid":"null","coordinate":"[9,3]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":2,"size_info":[500,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[10,2],[9,3],[10,5],[13,3]],"barcode":"003.010","blocked":false,"botid":"null","coordinate":"[10,3]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[0,0,0]],"sector":2,"size_info":[500,500,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[6,3],null,[6,5],null],"barcode":"004.006","blocked":false,"botid":"null","coordinate":"[6,4]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[0,0,0]],"sector":1,"size_info":[500,750,750,750],"store_status":1,"zone":"defzone"},{"adjacency":[[9,3],null,[9,5],[13,4]],"barcode":"004.009","blocked":false,"botid":"null","coordinate":"[9,4]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[0,0,0]],"sector":1,"size_info":[500,750,750,750],"store_status":1,"zone":"defzone"}]},{"floor_id":2,"map_values":[{"adjacency":[[113,112],[112,113],[113,114],[114,113]],"barcode":"113.113","blocked":false,"botid":"null","coordinate":"[113,113]","neighbours":[[0,0,0],[0,0,0],[1,1,1],[1,1,1]],"sector":2,"size_info":[650,750,500,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[114,112],[113,113],[114,116],[115,113]],"barcode":"113.114","blocked":false,"botid":"null","coordinate":"[114,113]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":2,"size_info":[650,1000,1000,750],"store_status":0,"zone":"defzone"},{"adjacency":[[115,112],[114,113],[115,114],null],"barcode":"113.115","blocked":false,"botid":"null","coordinate":"[115,113]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[0,0,0]],"sector":2,"size_info":[650,750,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[113,113],[112,114],[113,116],null],"barcode":"114.113","blocked":false,"botid":"null","coordinate":"[113,114]","neighbours":[[1,1,1],[0,0,0],[1,1,1],[0,0,0]],"sector":2,"size_info":[500,750,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[115,113],null,[115,116],null],"barcode":"114.115","blocked":false,"botid":"null","coordinate":"[115,114]","neighbours":[[1,1,1],[0,0,0],[1,1,1],[0,0,0]],"sector":2,"size_info":[500,750,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[null,null,null,null],"barcode":"114.119","blocked":false,"botid":"null","coordinate":"[119,114]","neighbours":[[1,0,0],[0,0,0],[1,1,0],[0,0,0]],"sector":1,"size_info":[750,750,305,750],"store_status":0,"zone":"defzone"},{"adjacency":[[119,114],null,[119,116],null],"barcode":"115.119","blocked":false,"botid":"null","coordinate":"[119,115]","neighbours":[[1,1,0],[0,0,0],[1,1,1],[0,0,0]],"sector":1,"size_info":[305,750,195,750],"store_status":0,"zone":"defzone"},{"adjacency":[[113,114],[112,116],[113,117],[114,116]],"barcode":"116.113","blocked":false,"botid":"null","coordinate":"[113,116]","neighbours":[[1,1,1],[0,0,0],[1,1,1],[1,1,1]],"sector":1,"size_info":[650,750,500,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[114,113],[113,116],[114,117],[115,116]],"barcode":"116.114","blocked":false,"botid":"null","coordinate":"[114,116]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[650,1000,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[115,114],[114,116],[115,117],[116,116]],"barcode":"116.115","blocked":false,"botid":"null","coordinate":"[115,116]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":2,"size_info":[650,750,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[116,112],[115,116],[116,117],[117,116]],"barcode":"116.116","blocked":false,"botid":"null","coordinate":"[116,116]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,750,500,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[117,112],[116,116],[117,118],[118,116]],"barcode":"116.117","blocked":false,"botid":"null","coordinate":"[117,116]","neighbours":[[0,0,0],[1,1,1],[0,0,0],[1,1,1]],"sector":1,"size_info":[750,1000,750,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[118,112],[117,116],[118,117],[119,116]],"barcode":"116.118","blocked":false,"botid":"null","coordinate":"[118,116]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[750,1000,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[119,115],[118,116],[119,117],[120,116]],"barcode":"116.119","blocked":false,"botid":"null","coordinate":"[119,116]","neighbours":[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],"sector":1,"size_info":[195,500,500,500],"store_status":0,"zone":"defzone"},{"adjacency":[[120,112],[119,116],[120,117],[121,116]],"barcode":"116.120","blocked":false,"botid":"null","coordinate":"[120,116]","neighbours":[[0,0,0],[1,1,1],[1,1,1],[0,0,0]],"sector":1,"size_info":[750,500,500,750],"store_status":0,"zone":"defzone"},{"adjacency":[[113,116],[112,117],[113,118],[114,117]],"barcode":"117.113","blocked":false,"botid":"null","coordinate":"[113,117]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,750,750,1000],"store_status":0,"zone":"defzone"},{"adjacency":[[114,116],[113,117],[114,118],[115,117]],"barcode":"117.114","blocked":false,"botid":"null","coordinate":"[114,117]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,1000,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[115,116],[114,117],[115,118],[116,117]],"barcode":"117.115","blocked":false,"botid":"null","coordinate":"[115,117]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,750,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[116,116],[115,117],[116,118],null],"barcode":"117.116","blocked":false,"botid":"null","coordinate":"[116,117]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[0,0,0]],"sector":2,"size_info":[500,750,750,750],"store_status":0,"zone":"defzone"},{"adjacency":[[118,116],null,[118,118],[119,117]],"barcode":"117.118","blocked":false,"botid":"null","coordinate":"[118,117]","neighbours":[[1,1,1],[0,0,0],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,750,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[119,116],[118,117],[119,118],[120,117]],"barcode":"117.119","blocked":false,"botid":"null","coordinate":"[119,117]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[1,1,1]],"sector":2,"size_info":[500,500,750,500],"store_status":0,"zone":"defzone"},{"adjacency":[[120,116],[119,117],[120,118],[121,117]],"barcode":"117.120","blocked":false,"botid":"null","coordinate":"[120,117]","neighbours":[[1,1,1],[1,1,1],[0,0,0],[0,0,0]],"sector":2,"size_info":[500,500,750,750],"store_status":0,"zone":"defzone"}]}],"odsExcludedJson":{"ods_excluded_list":[{"excluded":true,"ods_tuple":"114.113--3"},{"excluded":true,"ods_tuple":"113.113--3"},{"excluded":true,"ods_tuple":"113.114--3"},{"excluded":true,"ods_tuple":"113.115--3"},{"excluded":true,"ods_tuple":"114.115--3"},{"excluded":true,"ods_tuple":"117.115--3"},{"excluded":true,"ods_tuple":"116.115--3"},{"excluded":true,"ods_tuple":"002.003--3"},{"excluded":true,"ods_tuple":"116.113--1"},{"excluded":true,"ods_tuple":"116.113--2"},{"excluded":true,"ods_tuple":"116.116--3"},{"excluded":true,"ods_tuple":"116.117--3"},{"excluded":true,"ods_tuple":"116.118--3"},{"excluded":true,"ods_tuple":"116.119--3"},{"excluded":true,"ods_tuple":"116.120--3"},{"excluded":true,"ods_tuple":"117.113--1"},{"excluded":true,"ods_tuple":"117.113--2"},{"excluded":true,"ods_tuple":"117.116--3"},{"excluded":true,"ods_tuple":"117.118--3"},{"excluded":true,"ods_tuple":"117.119--3"},{"excluded":true,"ods_tuple":"117.120--3"},{"excluded":true,"ods_tuple":"002.001--1"},{"excluded":true,"ods_tuple":"002.001--2"},{"excluded":true,"ods_tuple":"002.004--3"},{"excluded":true,"ods_tuple":"002.005--3"},{"excluded":true,"ods_tuple":"002.006--3"},{"excluded":true,"ods_tuple":"002.007--3"},{"excluded":true,"ods_tuple":"002.008--3"},{"excluded":true,"ods_tuple":"002.009--3"},{"excluded":true,"ods_tuple":"002.010--3"},{"excluded":true,"ods_tuple":"003.001--1"},{"excluded":true,"ods_tuple":"003.001--2"},{"excluded":true,"ods_tuple":"003.004--3"},{"excluded":true,"ods_tuple":"003.005--3"},{"excluded":true,"ods_tuple":"003.006--3"},{"excluded":true,"ods_tuple":"003.007--3"},{"excluded":true,"ods_tuple":"003.008--3"},{"excluded":true,"ods_tuple":"003.009--3"},{"excluded":true,"ods_tuple":"003.010--3"}]},"ppsJson":[{"allowed_modes":["put","pick","audit"],"location":"117.113","pick_direction":0,"pick_position":"117.113","pps_id":2,"pps_url":"http://localhost:8181/pps/1/api/","put_docking_positions":[],"queue_barcodes":[],"status":"disconnected","type":"manual"},{"allowed_modes":["put","pick","audit"],"location":"002.001","pick_direction":3,"pick_position":"002.001","pps_id":1,"pps_url":"http://localhost:8181/pps/1/api/","put_docking_positions":[],"queue_barcodes":[],"status":"disconnected","type":"manual"}],"zoneJson":{"data":[{"zonerec":{"blocked":false,"paused":false,"zone_id":"1"}},{"zonerec":{"blocked":false,"paused":false,"zone_id":"2"}}],"header":{"accept":"application/json","content-type":"application/json"},"type":"POST","url":"/api/zonerec"}},"status":200}
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
                            else{
                              imported = importMap(_.omit(responce_data["content"], ["name", "error"]));
                              this.createMap(imported) 
                              this.setState({loading: false })                          
                            }
                          }) 
                          return  {message: 'Fetched url successfully','status': 200 , data: response}
                        }
                        catch(error){
                          this.setState({loading: false })
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
    const { error,loading } = this.state;
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
        {loading && 
        <div className="Loader-background">
        <div className="Loader"></div> 
        </div>}
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
