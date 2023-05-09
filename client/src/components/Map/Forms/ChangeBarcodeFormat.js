import React,{useState,useEffect} from "react";
import { connect } from "react-redux";
import { changeBarcodeFormat } from "actions/changeBarcodeFormat";
import ChangeBarcodeOffset from "components/Map/Forms/ChangeBarcodeOffset";
import * as constants from "../../../constants";

const ChangeBarcodeFormat = ({ onClick, current_floor,floor_value,dispatch }) => {
  var current_floor_value = floor_value[current_floor]
  if(current_floor_value.hasOwnProperty("barcodeOffset")){
    var barcodeOffset = JSON.parse(current_floor_value.barcodeOffset)
    var barcode_format = current_floor_value.barcodeFormat
    var barcode_offset = `${barcodeOffset[0]},${barcodeOffset[1]}`
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbAgentName = params.get('gsb_agent_name') ? params.get('gsb_agent_name') : null;
    if(gsb && gsbAgentName){
      var barcode_format
      if(gsbAgentName === "ttp" || gsbAgentName === "ttp_rtp"){
        barcode_format = constants.TTP_BARCODE_FORMAT
      }else{
        barcode_format = constants.DEFAULT_BARCODE_FORMAT
        }
      }
    else{
      var barcode_format = current_floor_value.barcodeFormat
    }
    const [count, setCount] = useState(0);
    useEffect(() => {
      if(gsb && (gsbAgentName==="ttp" || gsbAgentName==="ttp_rtp")){
        dispatch(changeBarcodeFormat(constants.TTP_BARCODE_FORMAT));
    }
    },[gsb,gsbAgentName]);
    
    return(
    <form className="form-inline">
      <div className="form-group">
        <label className="col-form-label pr-2">Change Barcode Format:</label>
        <select
          className="form-control"
          onChange={onClick}
          defaultValue={barcode_format}
        >
      <option value={constants.DEFAULT_BARCODE_FORMAT} >Default Format</option>
      <option value={constants.TTP_BARCODE_FORMAT} >TTP Barcode Format (xx xxxx xxxx)</option>
       
      </select>
      </div>
      {barcode_format =="ttp_format" && 
          <div className="form-group pl-2">
            <label className="col-form-label pr-2">Barcode Offset (mm)</label>
            <input type="text" id ="offset_val" value={barcode_offset} readOnly></input> 
            <div className="pl-2">
              <ChangeBarcodeOffset/>
            </div>
          </div>
      }
    </form>
    )
  }else{
    return(null)
  }
  
};

export default connect(
   state => ({
    current_floor: state.currentFloor,
    floor_value:state.normalizedMap.entities.floor
  }),
  dispatch => ({
    onClick: e => dispatch(changeBarcodeFormat(e.target.value))
  })
)(ChangeBarcodeFormat);
