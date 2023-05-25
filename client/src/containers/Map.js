// main mapcreator page
import React, { Component } from "react";
import MapViewport from "components/Map/MapViewport";
import { connect } from "react-redux";
import { fetchMap, saveMap, downloadMap, updateAutocadMap} from "actions/actions";
import importMap from "common/utils/import-map";
import { modifyNeighbours } from "actions/barcode";
import { Modal } from 'reactstrap';
import "./ConfirmationModal.css"
import {
  setSuccessMessage,
  clearSuccessMessage,
  setErrorMessage,
  clearErrorMessage
} from "actions/message";
import SweetAlertError from "components/SweetAlertError";
import SweetAlertSuccess from "components/SweetAlertSuccess";

import LeftSidebar from "components/Map/Sidebar/LeftSidebar";
import RightSidebar from "components/Map/Sidebar/RightSidebar";
import BarcodeViewPopup from "components/Map/BarcodeViewPopup";
import ChangeFloorDropdown from "components/Map/Forms/ChangeFloorDropdown";
import ChangeBarcodeFormat from "components/Map/Forms/ChangeBarcodeFormat";
import CopyMap from "components/Map/Forms/CopyMap";
import DeleteMap from "components/Map/Forms/DeleteMap";
import RequestValidation from "components/Map/Forms/RequestValidation";
import SampleRacksJson from "components/Map/SampleRacksJson";
import UploadMapDetailsToGsb from "components/Map/Forms/UploadMapDetailsToGsb";
import { runSanity , showHighlight } from "actions/actions";
import { runHaiMapConversionScriptToMap} from "utils/api";
import _, { floor } from "lodash";
import { dispatch } from "d3";
const pendo = window.pendo;

class Map extends Component {
  state = {
    barcodeView: {
      show: false,
      tileId: null
    },
    modalShow : false,
    floor : false,
    emptyIOList : []
  };
  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      dispatch
    } = this.props;
    dispatch(fetchMap(id));
  };

  validateIOPoint = (entities) => {
    var IO_dict = entities.ioPoints
    var tote_storables_dict = entities.toteStorables
    var empty_IO_list = []
    let all_IO_arr = []
    let tote_linked_IO_arr = []
    for(let key in IO_dict){
      all_IO_arr.push(IO_dict[key].barcode)
    }
    for(let key in tote_storables_dict){
      tote_linked_IO_arr.push(Object.keys(tote_storables_dict[key].barcode)[0])
    }
    let empty_IO_list_IOpoint_id = all_IO_arr.filter(io_point => !tote_linked_IO_arr.includes(io_point))
    for(let i=0 ;i<empty_IO_list_IOpoint_id.length;i++){
      for(let j in entities.barcode){
        if(empty_IO_list_IOpoint_id[i] === entities.barcode[j].coordinate){
          empty_IO_list.push(entities.barcode[j].barcode)
        }
      }
    }
    return empty_IO_list
  }
  handleDownloadClick(nMap,floor = null){
    const {dispatch} = this.props;
    let empty_IO_list = this.validateIOPoint(nMap.entities)
    this.setState({
      emptyIOList : empty_IO_list
    })
    if(floor){
      this.setState({
        floor : true
      })
    }
    else{
      this.setState({
        floor : false
      })
    }
    if(empty_IO_list.length!==0){
      this.setState({
        modalShow : true
      })
    }
    else{
      if(this.state.floor){
        dispatch(downloadMap(true))
      }
      else{
        dispatch(downloadMap())
      }
    }
  }

  handleConfirmationOKClick(){
    const {dispatch} = this.props;
    this.setState({
      modalShow : false
    })
    if(this.state.floor){
      dispatch(downloadMap(true))
    }
    else{
      dispatch(downloadMap())
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.nMap.entities.mapObj != this.props.nMap.entities.mapObj && Object.keys(this.props.nMap.entities.mapObj)[0] != 1) {
      const mapId = this.props.nMap ? Object.entries(this.props.nMap.entities.mapObj)[0][1].id : 0;
      pendo.initialize({visitor: {id: mapId, full_name: this.props.nMap.entities.mapObj[mapId].name}, account: {id: "MAPCREATOR"}});
    }
  }

  handleChange = (evt) => {
      this.setState({importMap : {["autocad"]: evt.target.files[0]}});
  };

  onSubmit = (e) => {
    e.preventDefault();
    // validate the import by converting everything into the map using import function
    let imported;
    if(this.state.importMap["autocad"]){
          var response = runHaiMapConversionScriptToMap(this.state.importMap["autocad"]).then(
          response=>{
            const { nMap,dispatch,errorMessage,successMessage,queueMode,zoneViewMode,sectorViewMode,directionViewMode } = this.props;
            if(response.status == "404"){
              dispatch(setErrorMessage(response["content"]))
            }
            else{
            imported = importMap(_.omit(response['content'], ["name", "error"]));
            const mapId = this.props.nMap ? Object.entries(this.props.nMap.entities.mapObj)[0][1].id : 0;
            dispatch(updateAutocadMap(
                  mapId,
                  imported,
                  error => dispatch(setErrorMessage(error)),
                  () =>
                  dispatch(setSuccessMessage("Successfully saved map."))
                  )
                )
          }
          });
      }
    }

  render() {
    const {
      nMap,
      dispatch,
      errorMessage,
      successMessage,
      queueMode,
      conveyorMode,
      TTPMode,
      zoneViewMode,
      sectorViewMode,
      directionViewMode
    } = this.props;
    // mapId may be different from params since it may not have been fetched yet...
    const mapId = nMap ? Object.entries(nMap.entities.mapObj)[0][1].id : 0;
    const params = new URLSearchParams(window.location.search);
    let mapVisualize = params.get('visualize') ? eval(params.get('visualize')) : false;
    const gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    const solutionId = params.get('gsb_solution_id') ? eval(params.get('gsb_solution_id')) : null;
    const agentId = params.get('gsb_agent_id') ? params.get('gsb_agent_id') : null;
    const functionalAreaId = params.get('functional_area_id') ? params.get('functional_area_id') : null;
    const uid = params.get('uid') ? params.get('uid') : null;
    
    return (
      <div>
        <div style={{ float: "left" }}>
          <div className={mapVisualize ? "d-none" : "container content"}>
            <SweetAlertError
              error={errorMessage}
              onConfirm={() => dispatch(clearErrorMessage())}
            />
            <SweetAlertSuccess
              message={successMessage}
              onConfirm={() => dispatch(clearSuccessMessage())}
            />
            <div className="row justify-content-between p-0">
              <div className="col-3">
                <h3 className="display-5">
                  {nMap ? nMap.entities.mapObj[mapId].name : "..."}
                </h3>
              </div>
              <div className="col-9">
                <div className="float-right">
                  <SampleRacksJson />
                  <DeleteMap />
                  <RequestValidation />
                  <span className={nMap && nMap.entities.mapObj[mapId].sanity ? "btn btn-success" : "btn btn-danger"}>{nMap && nMap.entities.mapObj[mapId].sanity ? "Valid" : "Invalid"}</span>
                  &nbsp;
                  {
                    gsb 
                      ? 
                    <UploadMapDetailsToGsb solutionId={solutionId} agentId={agentId} functionalAreaId={functionalAreaId} uid={uid} mapId={mapId} /> 
                      : 
                    "" 
                  }
                </div>
              </div>
            </div>
            <LeftSidebar />
            <RightSidebar
              dispatch={dispatch}
              queueMode={queueMode}
              conveyorMode={conveyorMode}
              TTPMode={TTPMode}
              zoneViewMode={zoneViewMode}
              sectorViewMode={sectorViewMode}
              directionViewMode={directionViewMode}
            />
            <form onSubmit={this.onSubmit}>
              <div className="form-row">
                <div className="col float-right">
                  <label for="fileSelect" >Import autocad file &nbsp;</label>
                  <input
                   type={"file"} 
                   onChange={this.handleChange}
                   accept={".xls"} />
                  <button type="submit" style={{'border-radius':'6%','border-color':'lightgrey'}}>
                    Submit
                  </button>
                </div>
              </div>
            </form>
            <div className="row py-2 p-2">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  bcolor="orange"
                  onClick={() => {
                    dispatch(showHighlight());
                  }}
                >
                  Highlight Manual Edits
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  style={{ textAlign: "-webkit-center", color: "grey" }}
                  onClick={() =>
                    dispatch(
                      saveMap(
                        error => dispatch(setErrorMessage(error)),
                        () =>
                          dispatch(setSuccessMessage("Successfully saved map."))
                      )
                    )
                  }
                >
                  Save
                </button>
                <CopyMap />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  bcolor="orange"
                  onClick={() => {
                    // dispatch(downloadMap());
                    this.handleDownloadClick(nMap)
                  }}
                >
                  Download
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    dispatch(runSanity(this.state.nMap));
                  }}
                >
                  Run Data Sanity
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    this.handleDownloadClick(nMap,true)                  
                  }}
                >
                  Download as Single Floor
                </button>
              </div>
              <div className="col float-right">
                <ChangeFloorDropdown />
              </div>
              <div className="row py-2 p-2">
                <div className="col float-right">
                  <ChangeBarcodeFormat />
                </div>
              </div>
            </div>
          </div>
          <div className="row" id="pixi-canvas-wrapper">
            <MapViewport
              onShiftClickOnMapTile={tileId =>
                this.setState({
                  barcodeView: {
                    tileId,
                    show: true
                  }
                })
              }
            />
          </div>
          <BarcodeViewPopup
            show={this.state.barcodeView.show}
            toggle={() =>
              this.setState({
                barcodeView: {
                  ...this.state.barcodeView,
                  show: !this.state.barcodeView.show
                }
              })
            }
            barcode={
              nMap && this.state.barcodeView.tileId
                ? nMap.entities.barcode[this.state.barcodeView.tileId]
                : undefined
            }
            onSubmit={values =>
              dispatch(modifyNeighbours(this.state.barcodeView.tileId, values))
            }
          />
        </div>
        <Modal isOpen={this.state.modalShow} toggle = {() => {this.setState({modalShow: !this.state.modalShow})}} className = "confirmation-modal">
                <span>There are no tote storables linked to IO points for barcodes  {this.state.emptyIOList[0]} {this.state.emptyIOList.length > 1 ? `and ${this.state.emptyIOList.length-1} other(s) ` : ''}. Do you still want to download?</span>
                <br></br>
                <div>
                  <button onClick={() => {this.handleConfirmationOKClick()}} className="btn btn-outline-primary mr-1">
                    OK
                    </button>
                  <button className="btn btn-outline-danger" onClick={() => {
                    this.setState({
                      modalShow: false
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

export default connect(state => ({
  nMap: state.normalizedMap,
  queueMode: state.selection.queueMode,
  conveyorMode: state.selection.conveyorMode,
  TTPMode:state.selection.TTPMode,
  successMessage: state.successMessage,
  errorMessage: state.errorMessage,
  zoneViewMode: state.selection.zoneViewMode,
  sectorViewMode: state.selection.sectorViewMode,
  directionViewMode: state.selection.directionViewMode
}))(Map);
