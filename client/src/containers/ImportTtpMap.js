import React, { Component } from "react";
import importMap from "common/utils/import-map";
import JSONFileInput from "components/JSONFileInput";
import { handleErrors } from "utils/util";
import { withRouter } from "react-router-dom";
import SweetAlertError from "components/SweetAlertError";
import { fetchMap, saveMap, downloadMap, updateAutocadMap } from "actions/actions";
import { getMap, stitchingTtpRtpMapApi, createMap} from "utils/api";
import StitchingDirectionViewTooltip from "components/Map/Sidebar/StitchingDirectionViewTooltip";
import DistanceStitchingDirectionViewTooltip from "components/Map/Sidebar/DistanceStitchingDirectionViewTooltip";

import _ from "lodash";

class ImportMap extends Component {
  state = {
    name:"",
    map_flag: "",
    error: undefined,
    stitching:"0 0",
    rtp_ref_point:"",
    ttp_ref_point:"",
    map_id:"",
    rtp_map:"",
    delta:"",
    ttp_map:"",
    rtp_file_upload:false
  };
  

  handleChange = (evt) => {
      this.setState({["autocad"]: evt.target.files[0]});
  };
  handleChangeTtpMap = (evt) => {
    const fileReader = new FileReader();
    fileReader.readAsText(evt.target.files[0], "UTF-8");
    fileReader.onload = evt => {

      this.setState({["ttp_map"]:JSON.parse(evt.target.result || '{}')});
    };
  };
  handleChangeRtpMap = (evt) => {
    const fileReader = new FileReader();
    fileReader.readAsText(evt.target.files[0], "UTF-8");
    fileReader.onload = evt => {
      this.setState({
        ["rtp_map"]: JSON.parse(evt.target.result || '{}'),
        "rtp_file_upload":true
        });
    };
  };

  onError = (error) => this.setState({ error });

  onClear = (stateKey) => () => {
    this.setState({ [stateKey]: undefined });
  };

  setMapFlag(event) {
    {(event) => this.setState({ map_flag: event.target.value })}
  }
  
  fetchGetApiData = (map_id) => {
      return getMap(parseInt(map_id)).catch((error) => this.setState({ error }));
  }

  createMap = (imported) => {
    const { name } = this.state;
    const { history } = this.props;
    createMap(imported, name)
      .then(handleErrors)
      .then((res) => res.json())
      .then(id => {
          return history.push(`/map/${id}`)
      })
      .catch((error) => this.setState({ error }));
  }

  onSubmit = async (e) => {
    e.preventDefault()
    if(this.state.map_id!==""){
      var response = await this.fetchGetApiData(this.state.map_id);
      if(response.ok){
        var map_data = await response.json()
        var rtp_map_data = map_data.map.floors[0].map_values
        this.setState({"rtp_map":rtp_map_data})
      }else{
        this.setState({ 'error':"Map does not exist"})
        return
      }
    }
    var gtp_coordinate  = "["+this.state.rtp_ref_point.split(" ").map((val) => parseInt(val))+"]"

    var api_data = JSON.stringify({
        "gtp_json": this.state.rtp_map,
        "ttp_json": this.state.ttp_map, 
        "delta": this.state.delta, 
        "stitch_cord": this.state.stitching,
        "ttp_ref_point":this.state.ttp_ref_point,
        "gtp_ref_point":this.state.rtp_ref_point,
        })
    var response = stitchingTtpRtpMapApi(api_data).then(
      response=>{
        if (response["status"] == "404"){
             this.setState({ 'error':response["content"] })
            }
        else{
          var imported = importMap(_.omit(response["content"], ["name", "error"]));
          this.createMap(imported)
          }
      });
}

  render() {
    const { error,map_id } = this.state;
    console.log("states",this.state)
    return (
      <div className="container">
        {/* sweetalert here*/}
        <SweetAlertError
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <h3 className="display-5 pb-4">Stitch TTP and RTP Maps</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group row justify-content-between">
            <label  className="col-form-label col-sm-3">Select Map Type</label>
              <div className="col-sm-9" onChange={(e) => this.setState({ map_flag: e.target.value })}>
                <input className="row-sm-3 " type="radio" value="disjoint"/> Disjoint
                <label className="col-form-label col-sm-3"></label>
                <input className="row-sm-3 " type="radio" value="co_existence"/> Co-existence
              </div>
          </div>
           <div className="form-group row">
            <label className="col-form-label col-sm-3">
              Name
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="name"
                className="form-control"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group row justify-content-between">
            <label className="col-form-label col-sm-3">TTP Map</label>
              <div className="col-sm-9">
                <input
                 type={"file"} 
                 id="ttp_map_id"
                 onChange={this.handleChangeTtpMap}
                 accept={".json"}
                 required />
            </div>
          </div>
          <div className="form-group row justify-content-between">
            <label className="col-form-label col-sm-3">RTP Map</label>
              <div className="d-flex justify-content-between col-sm-9">
                <input
                 type={"file"} 
                 disabled={this.state.map_id!==""}
                 onChange={this.handleChangeRtpMap}
                 accept={".json"}
                 required />
                <label htmlFor="name" className="col-form-label col-sm-2">
                  OR
                </label>
                <label htmlFor="name" className="col-form-label col-sm-2">
                  RTP Map Id
                </label>
                  <input
                    type="text"
                    id="ttp_ref_point"
                    disabled={this.state.rtp_file_upload===true}
                    className="form-control col-sm-3"
                    value={this.state.map_id}
                    onChange={(e) => this.setState({ map_id: e.target.value })}
                    pattern="\d+"
                    required
                  />
              </div>
          </div>
          <div className="form-group row">
            <label className="col-form-label col-sm-3">
              RTP Coordinate Reference Point
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="rtp_ref_point"
                className="form-control"
                value={this.state.rtp_ref_point}
                onChange={(e) => this.setState({ rtp_ref_point: e.target.value })}
                placeholder="Enter RTP reference coordinate (eg -> x y)"
                pattern="-?\d+\s-?\d+"
                required
              />
            </div>
          </div>
          <div className="form-group row">
            <label className="col-form-label col-sm-3">
              TTP Reference Point
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="ttp_ref_point"
                className="form-control"
                value={this.state.ttp_ref_point}
                onChange={(e) => this.setState({ ttp_ref_point: e.target.value })}
                placeholder=" Enter TTP reference coordinate (eg -> x y)"
                pattern="-?\d+\s-?\d+"
                required
              />
            </div>
          </div>
          <div className="form-group row">
            <label className="col-form-label col-sm-3">
              Distance Between RTP And TTP Reference Point
            </label>
            <div className="d-flex align-items-center col-sm-9">
              <DistanceStitchingDirectionViewTooltip />
              <input
                type="text"
                id="delta"
                className="form-control"
                value={this.state.delta}
                onChange={(e) => this.setState({ delta: e.target.value })}
                placeholder="The distance specified will be the offset between the two input maps"
                pattern="-?\d+\s-?\d+"
                required
              />
              <i
                className="fa fa-question-circle"
                style={{ marginLeft: "10px", color: "darkgrey" }}
                data-tip
                data-for="distance-direction-view-tooltip"
                />
            </div>
          </div>
            <div className="form-group row">
              <label className="col-form-label col-sm-3">
                Stitching X and Y direction
              </label>
              <div className="d-flex align-items-center col-sm-9">
                <StitchingDirectionViewTooltip />
                <select onChange={(e) => this.setState({ stitching: e.target.value })} className="form-control">
                  <option value="0 0">North</option>
                  <option value="0 1">East</option>
                  <option value="1 0">South</option>
                  <option value="1 1">West</option>
                </select>
                <i
                className="fa fa-question-circle"
                style={{ marginLeft: "10px", color: "darkgrey" }}
                data-tip
                data-for="stitching-direction-view-tooltip"
                />
              </div>
            </div>
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
