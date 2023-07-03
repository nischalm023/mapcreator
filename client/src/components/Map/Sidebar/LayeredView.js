import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { removePps, removePpsQueue } from "actions/pps";
import RemoveItemForm from "../Forms/Util/RemoveItemForm";
import ClickableBarcodeString from "./ClickableBarcodeString";

import {
  IOPointCheckbox,
  ToteStorageCheckbox
} from "./Checkboxes";

const LayeredView = ({ioPointCheckbox,storableCheckbox,dispatch }) => {
  return (
    <div className="pt-3">
      <h4 className="menu-title">View Layers</h4>
      <div className="card my-1">
            <div className="row">
                <div className="col">
                  <IOPointCheckbox
                  onChange={() =>{
                    dispatch({ type: "TOGGLE-IO-POINT-MODE" })
                  }
                  }
                  val={ioPointCheckbox}
                />       
                </div>
            </div>   
            <div className="row">
                <div className="col">
                  <ToteStorageCheckbox
                  onChange={() =>
                    dispatch({ type: "TOGGLE-TOTE-STORAGE-MODE" })
                  }
                  val={storableCheckbox}
                />                
                </div>
              </div>   
          </div>
    </div>
  );
};

export default connect(state => ({
  ioPointCheckbox:state.selection.iopointMode,
  storableCheckbox:state.selection.totestorageMode
}))(LayeredView);
