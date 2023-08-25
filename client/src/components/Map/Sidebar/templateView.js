import React from "react";
import { connect } from "react-redux";
import BaseCardHaiPort from "./BaseCardHaiPort";
import CreateHaiTemplate from "../Forms/CreateHaiTemplate";
import ManageHaiTemplate from "../Forms/ManageHaiTemplate";
import { locateBarcode } from "actions/barcode";
import {
  createHaiTemplate,
  manageHaiTemplate,
  cloneHaiTemplate,
  removeHaiTemplate
} from "actions/haiTemplate";
import "./BaseCard.css";

const templateView = ({ nextTemplateId, haiTemplateData,haiPortData, dispatch }) => {
  var multiHaiTemplate = [];
  var _this = this;
  if(haiTemplateData !== undefined && Object.keys(haiTemplateData).length !== 0){
    Object.keys(haiTemplateData).forEach(function (key, index) {
      var key_template_data = haiTemplateData[key]
      var port_data_list = []
      Object.keys(haiPortData).forEach(function (port, port_index){
        {parseInt(haiPortData[port]["template_id"]) === parseInt(key_template_data.template_id) && 
          port_data_list.push(<div className="w-100 d-flex gap-3 mb-1">
            <input type="text" className="w-100" value={haiPortData[port]["port_id_value"]} style={{"textAlign": "center"}} disabled/>
            <button
              className="btn"
              type="button"
              onClick={() => {
                dispatch(locateBarcode(haiPortData[port]["port_barcode"]))
              }}
            >
            <i className="fa fa-map-marker text-warning" />
            </button>
          </div>)

        }
      })
                  
          
      multiHaiTemplate.push(
        <div key={"hai_template" + index}>
          <div className="d-flex align-items-start gap-2 p-2 ">
              <ManageHaiTemplate
                haiTemplateData={haiTemplateData}
                template_name={key_template_data.template_display_name}
                port_type={key_template_data.port_type}
                tray_count={key_template_data.tray_count}
                length={key_template_data.length}
                breadth={key_template_data.breadth}
                height={key_template_data.height}
                template_id={key_template_data.template_id}
                nextTemplateId={nextTemplateId}
                port_data_list={port_data_list}
                onSubmit={(formValues,remove=false) =>{
                  if(remove){
                      dispatch(removeHaiTemplate(key_template_data.template_id,key_template_data.template_display_name))
                  }else{
                      dispatch(manageHaiTemplate(formValues))
                    }
                  }
                }
              />
              <button
                  className="btn"
                  type="button"
                  onClick={() => {dispatch(cloneHaiTemplate(
                    key_template_data.template_display_name,
                    key_template_data.port_type,
                    key_template_data.tray_count,
                    key_template_data.length,
                    key_template_data.breadth,
                    key_template_data.height,
                    key_template_data.template_id,
                    key_template_data.support_agent
                    ))}}
              >
                <i className="fa fa-clone" />
              </button>
              
              <BaseCardHaiPort title={haiTemplateData[key]["template_display_name"]} templatePortData templatePortbutton>
                {port_data_list}
              </BaseCardHaiPort>
          </div>
        </div>
      )
    });
  }
  
  return (
    <div className="pt-3">
      <h4 className="menu-title">Templates</h4>
        <BaseCardHaiPort title="Ranger Port Template">
          <div>
              <CreateHaiTemplate
                nextTemplateId={nextTemplateId}
                haiTemplateData={haiTemplateData}
                onSubmit={formValues =>{
                  dispatch(createHaiTemplate(formValues))
                  }
                }
              />
                {multiHaiTemplate}
          
        </div>
        <br />
        </BaseCardHaiPort>
    </div>
  );
};

export default connect(state => ({
  nextTemplateId:
            Math.max(...(state.normalizedMap.entities.map.dummy.haiPortsTemplateIds || []), 0) + 1,
  haiTemplateData:state.normalizedMap.entities.haiPortsTemplate,
  haiPortData:state.normalizedMap.entities.haiPortTile
}))(templateView);
