import React, { Component } from "react";
import "./RightSidebar.css";

import AddPPS from "components/Map/Forms/AddPPS";
import AddCharger from "components/Map/Forms/AddCharger";
import AssignDockPoint from "components/Map/Forms/AssignDockPoint";
import ToggleStorable from "components/Map/Forms/ToggleStorable";
import ShowPath from "components/Map/Forms/ShowPath";
import Misaligned from "components/Map/Forms/MisalignedNode";
import HighlightStorable from "components/Map/Forms/HighlightStorable";
import Exclude from "components/Map/Forms/ExcludeNode";
import AddPPSQueue from "components/Map/Forms/AddPPSQueue";
import AddHighwayQueue from "components/Map/Forms/AddHighwayQueue";
import AssignZone from "components/Map/Forms/AssignZone";
import AssignSector from "components/Map/Forms/AssignSector";
import ConveyorCheckboxMode from "components/Map/Forms/ConveyorCheckboxMode"
import AssignODSExcluded from "components/Map/Forms/AssignODSExcluded";
import RemoveODSExcluded from "components/Map/Forms/RemoveODSExcluded";
import AssignEmergencyBarcode from "components/Map/Forms/AssignEmergencyBarcode";
import AddBarcode from "components/Map/Forms/AddBarcode";
import AddMultiBarcode from "components/Map/Forms/AddMultiBarcode";
import AddFloor from "components/Map/Forms/AddFloor";
import RemoveBarcode from "components/Map/Forms/RemoveBarcode";
import UpdateDirection from "components/Map/Forms/UpdateDirection";
import ModifyDistanceBwBarcodes from "components/Map/Forms/ModifyDistanceBwBarcodes";
import AddElevator from "components/Map/Forms/AddElevator";
import AddZone from "components/Map/Forms/AddZone";
import AddSector from "components/Map/Forms/AddSector";
import EditSpecialBarcode from "components/Map/Forms/EditSpecialBarcodes";
import AlignBarcode from "components/Map/Forms/AlignBarcode";
import LinkConveyor from "components/Map/Forms/LinkConveyor";
import AssignIOPoints from "components/Map/Forms/AssignIOPoints";
import CreateToteLocations from "components/Map/Forms/CreateToteLocations";
import ShiftBarcode from "components/Map/Forms/ShiftBarcode";
import AddTransitBarcode from "components/Map/Forms/AddTransitBarcode";
import AddTTPTransitBarcode from "components/Map/Forms/AddTTPTransitBarcode";
import LocateBarcode from "components/Map/Forms/LocateBarcode";
import SectorMSUMapping from "components/Map/Forms/SectorMSUMapping";
import ManageConveyorSystem from "components/Map/Forms/ManageConveyorSystem";
import ManageConnectedConveyorSystem from "components/Map/Forms/ManageConnectedConveyorSystem";
import ViewConveyorSystem from "components/Map/Forms/ViewConveyorSystem";
import AddConveyorEntryPoint from "components/Map/Forms/AddConveyorEntryPoint";
import AddConveyorExitPoint from "components/Map/Forms/AddConveyorExitPoint";
import ConveyorActivePoint from "components/Map/Forms/ConveyorActivePoint";
import ConveyorEndPoint from "components/Map/Forms/ConveyorEndPoint";
import ConveyorDownload from "components/Map/Forms/ConveyorDownload";
import ManageTtpOverlap from "components/Map/Forms/ManageTtpOverlap";
import ViewOverlapBarcodes from "components/Map/Forms/ViewOverlapBarcodes";
import ManageStorableSizeInfo from "components/Map/Forms/ManageStorableSizeInfo";
import manageStorableNeighbour from "components/Map/Forms/multiNeighbourBarcode";
import manageMultipleSizeInfoBarcodeData from "components/Map/Forms/MutipleSizeInfoBarcode";

import {
  QueueCheckbox,
  MultiQueueCheckbox,
  ZoneViewCheckbox,
  SectorViewCheckbox,
  DirectionViewCheckbox,
  ConveyorCheckbox,
  TTPCheckbox,
  IOPointCheckbox,
  ToteStorageCheckbox
} from "./Checkboxes";

class RightSidebar extends Component {
  state = {
    open: false,
    activeIdx: 0
  };
  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    let gsbAgentName = params.get('gsb_agent_name') ? params.get('gsb_agent_name') : null;
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    const {dispatch} = this.props
    if(gsb && (gsbAgentName==="ttp" || gsbAgentName==="ttp_rtp")){
      dispatch({ type: "TOGGLE-TTP-VIEW-MODE" });
    }
  };

  render() {
    const { queueMode, multiQueueMode, zoneViewMode, sectorViewMode, directionViewMode, TTPMode,dispatch } = this.props;
    const { open } = this.state;
    
    return (
      <nav id="rightsidebar" className={open ? "active" : ""}>
        <button
          id="rightsidebar-button"
          className="btn"
          onClick={() => this.setState({ open: !this.state.open })}
        >
          <i className="fa fa-lg fa-bars" />
        </button>
        <div className="menu-data-container">
          <div
            className="row py-1"
            style={{ margin: "0% 5% 0%", marginTop: "0%" }}
          >
            {[
              ToggleStorable,
              AddPPS,
              AddCharger,
              AssignDockPoint,
              AddZone,
              AddSector,
              AssignZone,
              AssignSector,
              AssignODSExcluded,
              SectorMSUMapping,
              RemoveODSExcluded,
              AssignEmergencyBarcode,
              AddBarcode,
              AddMultiBarcode,
              RemoveBarcode,
              UpdateDirection,
              AddPPSQueue,
              AddHighwayQueue,
              ModifyDistanceBwBarcodes,
              AddFloor,
              AddElevator,
              ShowPath,
              Misaligned,
              Exclude,
              EditSpecialBarcode,
              ShiftBarcode,
              AlignBarcode,
              AssignIOPoints,
              CreateToteLocations,
              HighlightStorable,
              ManageTtpOverlap,
              ManageStorableSizeInfo,
              manageStorableNeighbour,
              manageMultipleSizeInfoBarcodeData,
              ViewOverlapBarcodes,
            ].map((Elm, idx) => (
              <div
                key={idx}
                className="pr-1 pt-1"
                style={{ backgroundColor: "#545c64" }}
              >
                <Elm onError={e => this.setState({ e })} />
              </div>
            ))}
          </div>
          <div className="row" style={{ margin: "0% 5% 0%", marginTop: "0%" }}>
              {this.props.TTPMode === true ?<AddTTPTransitBarcode />: <AddTransitBarcode />}
          </div>
          <div className="conveyor-buttons">
            <div className="row">
              <div className="col">
                <LinkConveyor />
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ManageConnectedConveyorSystem />
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ManageConveyorSystem />
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ViewConveyorSystem />
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ConveyorCheckboxMode />
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <AddConveyorEntryPoint/>
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <AddConveyorExitPoint/>
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ConveyorActivePoint/>
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ConveyorEndPoint/>
              </div>
            </div>
            <div className="row py-1">
              <div className="col">
                <ConveyorDownload/>
              </div>
            </div>
          </div>
          <br></br>
          <div className="row">
            <div className="col">
              <TTPCheckbox
                val={TTPMode}
                onChange={() =>
                  dispatch({ type: "TOGGLE-TTP-VIEW-MODE" })
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <QueueCheckbox
                val={queueMode}
                onChange={() => dispatch({ type: "TOGGLE-QUEUE-MODE" })}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <MultiQueueCheckbox
                val={multiQueueMode}
                onChange={() => dispatch({ type: "TOGGLE-MULTI-QUEUE-MODE" })}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <ZoneViewCheckbox
                val={zoneViewMode}
                onChange={() => { 
                  if(sectorViewMode) dispatch({ type: "TOGGLE-SECTOR-VIEW-MODE" }); 
                  dispatch({ type: "TOGGLE-ZONE-VIEW-MODE" });
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <SectorViewCheckbox
                val={sectorViewMode}
                onChange={() => {
                  if(zoneViewMode) dispatch({ type: "TOGGLE-ZONE-VIEW-MODE" });
                  dispatch({ type: "TOGGLE-SECTOR-VIEW-MODE" });
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <DirectionViewCheckbox
                val={directionViewMode}
                onChange={() =>
                  dispatch({ type: "TOGGLE-DIRECTION-VIEW-MODE" })
                }
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col">
              <div style={{ margin: "0% 5% 3% 5%" }}>
                <LocateBarcode />
              </div>
            </div>
          </div>
        </div>
        <small id="version-text">
          {process.env.REACT_APP_VERSION || "unknown version"}
        </small>
      </nav>
    );
  }
}

export default RightSidebar;
