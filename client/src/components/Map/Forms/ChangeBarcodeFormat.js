import React,{useState} from "react";
import { connect } from "react-redux";
import { changeBarcodeFormat } from "actions/changeBarcodeFormat";
import ChangeBarcodeOffset from "components/Map/Forms/ChangeBarcodeOffset";

const ChangeBarcodeFormat = ({ onClick, current_floor,floor_value }) => {
  var current_floor_value = floor_value[current_floor]
  if(current_floor_value.hasOwnProperty("barcodeOffset")){
    var barcodeOffset = JSON.parse(current_floor_value.barcodeOffset)
    var barcode_format = current_floor_value.barcodeFormat
    var barcode_offset = `${barcodeOffset[0]},${barcodeOffset[1]}`

    return(
    <form className="form-inline">
      <div className="form-group">
        <label className="col-form-label pr-2">Change Barcode Format:</label>
        <select
          className="form-control"
          onClick={onClick}
        >

      <option value="default_format" selected={barcode_format == "default_format"}>Default Format</option>
      <option value="ttp_format" selected={barcode_format == "ttp_format"}>TTP Barcode Format (xx xxxx xxxx)</option>
       
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
