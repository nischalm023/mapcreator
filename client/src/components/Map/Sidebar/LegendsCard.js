import React from "react";
import { connect } from "react-redux";
import NonCollapsibleBaseCard from "./NonCollapsibleBaseCard";
import AllAllowed from "sprites/111.png";
import selectedConveyor from "sprites/conveyor.png";
import entryConveyor from "sprites/entry.png";
import exitConveyor from "sprites/exit.png";
import endConveyor from "sprites/end.png";
import activeConveyor from "sprites/active.png";
import toteStorable from "sprites/totestorables.png"
import conveyorEntryIOPoints from "sprites/conveyor_io_entry.png";
import toteStorableIOPoints from "sprites/iopoint.png";
import conveyorExitIOPoints from "sprites/conveyor_io_exit.png";
import * as constants from "../../../constants";
const title = "Legends";
const LegendsMap = constants.LEGENDSMAP;
const LegendsCard = () => (
  <div className="pt-3">
    <h4 className="menu-title">{title}</h4>
    <NonCollapsibleBaseCard title={title}>
      {LegendsMap.map((e, idx) => {
        return (
          <div className="row" key={idx} style={{ marginLeft: "5%" }}>
            {e.colorCode && <div className="col-1" style={{ height: 20, width: "100%", backgroundColor: e.colorCode, marginTop: 2}}></div>}
            {e.icon && <div className="col-1" style={{ height: 20, width: "100%", marginTop: 2}}>
              <img src={AllAllowed} style={{height: 20}} />
            </div>}
            {e.icon1 && <div>
              <img src={selectedConveyor} style={{ height: 26, marginTop: 2}} />
            </div>}
            {e.icon2 && <div>
              <img src={activeConveyor} style={{height: 26, marginTop: 2}} />
            </div>}
            {e.icon3 && <div>
              <img src={endConveyor} style={{height: 26, marginTop: 2}} />
            </div>}
            {e.icon4 && <div>
              <img src={entryConveyor} style={{height: 26, marginTop: 2}} />
            </div>}
            {e.icon5 && <div>
              <img src={exitConveyor} style={{height: 26, marginTop: 2}} />
            </div>}
            {e.icon6 && <div>
              <img src={toteStorable} style={{height: 26, marginTop: 2}} />
            </div>}
            {e.icon7 && <div style={{textAlign:"center", width: 26}}>
              <img src={toteStorableIOPoints} style={{height: 10, marginTop: 2}} />
            </div>}
            {e.icon8 && <div style={{textAlign:"center", width: 26}}>
              <img src={conveyorEntryIOPoints} style={{height: 10, marginTop: 2}} />
            </div>}
            {e.icon9 && <div style={{textAlign:"center", width: 26}}>
              <img src={conveyorExitIOPoints} style={{height: 10, marginTop: 2}} />
            </div>}
            <div className="col-10 ">{e.name}</div>
          </div>
        );
      })}
    </NonCollapsibleBaseCard>
  </div>
);

export default connect()(LegendsCard);
