import React, { Component } from "react";
import { handleErrors, zoneToColorMapper, sectorToColorMapper } from "utils/util";
import {
  setSuccessMessage,
  clearSuccessMessage,
  setErrorMessage,
  clearErrorMessage
} from "actions/message";
import { Link } from "react-router-dom";
import moment from "moment";
import SearchBar from "components/SavedMaps/SearchBar";
import { getAllMaps,postMapDataToGsb,getMap } from "utils/api";
import { normalizeMap, denormalizeMap } from "utils/normalizr";
import { fetchMap, clearMap } from "actions/actions";
import {
 
  getBarcodes,
  getStorableCoordinatesCount,
  getZoneToColorMap,
  getSectorToColorMap
} from "utils/selectors";
import exportMap from "common/utils/export-map";

import ContentLoader from "components/SavedMaps/ContentLoader";
import "./savedMap.css";
import { connect } from "react-redux";
import SweetAlertError from "components/SweetAlertError";
import SweetAlertSuccess from "components/SweetAlertSuccess";

class SavedMaps extends Component {
  state = {
    maps: [],
    loading: false,
    api_loading:false,
    listView:false,
    listId:"",
    map_name:"",
    error:undefined
  };
  componentDidMount() {
    this.setState({ loading: true });
    // fetch maps
    getAllMaps()
      .then(handleErrors)
      .then(res => res.json())
      .then(maps => this.setState({ maps, loading: false }))
      // TODO: not doing anything with error right now
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  
  exportMapDatatoGsb = (map_id,name,gsb,gsbSolutionId,
                        gsbAgentId,gsbFunctionalAreaId,solutionVersion,requestedUser) => {
    this.setState({ api_loading: true });
    var data = new FormData();
    data.append('map_tool_id', map_id);
    data.append('title', name);
    data.append('gsb_solution_id', gsbSolutionId);
    data.append('gsb_agent_id', gsbAgentId);
    data.append('functional_area_id', gsbFunctionalAreaId);
    // data.append('uid', gsbUid);
    data.append('requested_user', requestedUser);
    data.append('gsb_solution_version', solutionVersion);
    data.append('username', requestedUser);
    let mapData = {};
    this.props.dispatch(
      fetchMap(
        map_id,
        () =>{
              let { globalState } = this.props;
              // let withWorldCoordinate = addWorldCoordinateAndDenormalize(normalizedMap);
              globalState.normalizedMap.entities.sectorBarcodeMapping = {};
              Object.keys(globalState.normalizedMap.entities.barcode).forEach((key) => {
                if (globalState.normalizedMap.entities.barcode[key].sector == undefined)
                globalState.normalizedMap.entities.barcode[key].sector = "undefined";
                if (
                  globalState.normalizedMap.entities.sectorBarcodeMapping[
                    globalState.normalizedMap.entities.barcode[key].sector
                  ] == undefined
                )
                globalState.normalizedMap.entities.sectorBarcodeMapping[
                  globalState.normalizedMap.entities.barcode[key].sector
                  ] = [];
                  globalState.normalizedMap.entities.sectorBarcodeMapping[
                    globalState.normalizedMap.entities.barcode[key].sector
                ].push("[" + key + "]");
              });
              // setSectorsBarcodeMapping(this.props.dispatch, getState);
              const mapObj = denormalizeMap(globalState.normalizedMap);
              const exportedJson = exportMap(globalState.normalizedMap, false,globalState.conveyorVersion);
              let chargerDict = globalState.normalizedMap.entities['charger'] || {};
              let chargers = Object.entries(chargerDict).map(([, val]) => val);
              let ppsDict = globalState.normalizedMap.entities['pps'] || {};
              let ppses = Object.entries(ppsDict).map(([, val]) => val);
              let elevatorDict = globalState.normalizedMap.entities['elevator'] || {};
              let elevators = Object.entries(elevatorDict).map(([, val]) => val);
              let storables = getStorableCoordinatesCount(globalState);
              let barcodes = getBarcodes(globalState);
              let zoneToColorMap = getZoneToColorMap(globalState);
              let sectorToColorMap = getSectorToColorMap(globalState);
    
              let mapData;
              Object.keys(exportedJson).forEach((keyName) => {
                  if (keyName !== "sector") {
                    if (keyName === "sectorBarcodeMapping"){
                      data.append('files', new File([new Blob([JSON.stringify(exportedJson[keyName])], { type: 'application/json' })], 'sector.json', {type: "application/json"}));
                    } else if (keyName === "map") {
                        let gsbExportedJson = exportedJson[keyName].map(({ floor_id, map_values }) => {
                        var barcode_val = map_values[0]["barcode"]
                          if(/^(\d{10})$/.test(barcode_val)){ 
                            var vda_data = ""
                            for(var i = 0; i < map_values.length; i++) {
                                if(map_values[i].world_coordinate_reference_neighbour=="0,0"){
                                  var vda_data = {"barcode":map_values[i]["barcode"],"vda5050_coordinate":map_values[i]["vda_world_coordinate"]}
                                  break
                                }
                            }
                            if(vda_data ===""){
                             var vda_data = {"barcode":barcode_val,"vda5050_coordinate":map_values[0]["vda_world_coordinate"]}
                            }
                            return({
                              floor_id,
                              map_values:map_values,
                              vda5050_reference:vda_data
                            })
                          }else{
                            return({
                              floor_id,
                              map_values:map_values,
                            })
                          }
                      })
                      mapData = gsbExportedJson;
                      data.append('files', new File([new Blob([JSON.stringify(mapData)], { type: 'application/json' })], 'map.json', {type: "application/json"}));
                    } else {
                      data.append('files', new File([new Blob([JSON.stringify(exportedJson[keyName])], { type: 'application/json' })], `${keyName}.json`, {type: "application/json"}));
                    }
                  }
              });
              data.append('total_chargers', chargers.length);
              data.append('total_ppses', ppses.length);
              data.append('total_elevators', elevators.length);
              data.append('total_zones', Object.keys(zoneToColorMap).length);
              data.append('total_sectors', Object.keys(sectorToColorMap).length);
              data.append('total_storables', storables);
              data.append('total_barcodes', Object.keys(barcodes).length);
              return postMapDataToGsb(data)
      .then(handleErrors)
      .then((res) => res.text())
      .then(
        (res) => {
          // localStorage.setItem(`map_${id}_sol_${gsbSolutionId}`, true)
          this.props.dispatch(clearMap);
          this.setState({ api_loading: false });
          return this.props.dispatch(setSuccessMessage(res))
        }
      )
      .catch((error) => {
        this.props.dispatch(clearMap);
          this.setState({ api_loading: false });
          this.props.dispatch(setErrorMessage(error))
         }
          );
        }
      )
    )
    
}

  render() {
    const { maps, loading,api_loading,listView,listId,map_name} = this.state;
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsb_solution_id');
    let gsbAgentId = params.get('gsb_agent_id');
    let gsbFunctionalAreaId = params.get('functional_area_id');
    let solutionVersion = params.get('gsb_solution_version');
    let requestedUser = params.get('requested_user');
    return (

      <div className="container">
        <SweetAlertError
              error={this.props.errorMessage}
              onConfirm={() => {
                this.props.dispatch(clearErrorMessage())
              }}
            />
            <SweetAlertSuccess
              message={this.props.successMessage}
              onConfirm={() => {
              this.props.dispatch(clearSuccessMessage())
              window.close()
            }
          }
            />
        {api_loading && 
        <div className="Loader-background">
        <div className="Loader"></div> 
        </div>}
        <div className="row">
          <div className = "col-sm-10">
            <h3 className="display-5">Choose from existing maps</h3>
          </div>
          {
          gsb?
            <div className= "row">
              <button 
                type="button" 
                className="btn btn-secondary mr-2 exportToGsb"
                disabled={!listView}
                onClick={() =>{
                    if(listId!=""){
                       this.exportMapDatatoGsb(listId,map_name,gsb,gsbSolutionId,
                        gsbAgentId,gsbFunctionalAreaId,solutionVersion,requestedUser)
                        }
                      }
                  }
                >
                Export and Close
              </button>
            </div>:""
          }
        </div>
        <SearchBar
          listView={listView}
          onResults={results =>
            results.json().then(maps => this.setState({ maps }))
          }
        />
        {loading ? (
          <ContentLoader />
        ) : maps.length ? (
          <table className="table">
            <thead>
              <tr>
              <th scope="col"></th>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Created on</th>
                <th scope="col">Updated on</th>
              </tr>
            </thead>
            <tbody>
              {maps.map(({ id, name, createdAt, updatedAt }, idx) => (
                <tr className={listId !==id && listView && "saved-map-disabled-row"}  key={idx}>
                  {gsb?<td><input type="checkbox" onChange={() =>
                        this.setState({ listView: !this.state.listView,listId:id,map_name:name})
                      } 
                        />&nbsp;
                    </td>:""}
                  <th scope="row">{id}</th>
                  <td className={listId ===id && listView && "saved-map-disabled-row"}>
                    {gsb?<Link to={`/map/${id}?checked_version=${gsb}&gsb=${gsb}&gsb_solution_id=${gsbSolutionId}&gsb_agent_id=${gsbAgentId}&functional_area_id=${gsbFunctionalAreaId}&gsb_solution_version=${solutionVersion}&requested_user=${requestedUser}`}>{name}</Link>:
                    <Link to={`/map/${id}`}>{name}</Link>
                  }
                    
                  </td>
                  <td className={listId ===id && listView && "saved-map-disabled-row"}>{moment(createdAt).format("lll")}</td>
                  <td className={listId ===id && listView && "saved-map-disabled-row"}>{moment(updatedAt).format("lll")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No maps found.</p>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  globalState: state,
  normalizedMap: state.normalizedMap,
  successMessage: state.successMessage,
  errorMessage: state.errorMessage,
}))(SavedMaps);
