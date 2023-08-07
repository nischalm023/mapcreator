import React from "react";
import { connect } from "react-redux";
import { checkSelectedBarcodeAsIoPoint } from "./CreateToteLocations"
import { setErrorMessage } from "actions/message";


const checkLocationExistsOnIOBarcode = (selected_barcodes,tote_storables) => {
  var with_location_barcode = []
  var with_no_location = []
  for (var i = 0; i < selected_barcodes.length; i++) {
    for (const [key, value] of Object.entries(tote_storables)) {
      if(Object.keys(value["barcode"])[0] === selected_barcodes[i]){
        with_location_barcode.push(selected_barcodes[i])
        break
      }
    }
  }
  var with_no_location=selected_barcodes.filter(function(itm){
    return with_location_barcode.indexOf(itm)==-1;
  });
  return with_no_location
}

const HighlightStorable = ({ onClick, all_barcodes,selected_barcodes,tote_storables}) => {
  var disabled = true
  var all_selected_point_io = checkSelectedBarcodeAsIoPoint(selected_barcodes,all_barcodes)
  if(all_selected_point_io && selected_barcodes.length !== 0){
    var disabled = false
  }
  if(!disabled){
    var no_location_cordinate = checkLocationExistsOnIOBarcode(selected_barcodes,tote_storables)
    var no_location_barcode = []
    if(no_location_cordinate.length!==0){
      for (var i = 0; i < no_location_cordinate.length; i++) {
        no_location_barcode.push(all_barcodes[no_location_cordinate[i]].barcode)
      }
    }
  }
  return(
      <button
      disabled={disabled}
      type="button"
      className="btn btn-secondary"
      style={{ textAlign: "-webkit-center", color: "orange" }}
      onClick={() => {
        onClick(no_location_barcode);
      }}
    >
     Highlight Tote Storable(s)
    </button>
);
}

export default connect(
  state => ({
    all_barcodes:state.normalizedMap.entities.barcode,
    selected_barcodes: Object.keys(state.selection.mapTiles),
    tote_storables:state.normalizedMap.entities.toteStorables
  }),
  (dispatch) => ({
    onClick: (no_location_barcode) => {
      if(no_location_barcode.length !==0){
        dispatch(setErrorMessage(`No associated tote storable locations found for IO point(s) :( ${no_location_barcode.join(",")} ). Any linked tote storable found for other IO point(s) will be highlighted.`))
        dispatch({
          type: "HIGHLIGHT-TOTE-STORAGE",
        })
        dispatch({
          type: "CLEAR-SELECTED-TILES",
        })
      }else{
      dispatch({
        type: "HIGHLIGHT-TOTE-STORAGE",
        })
      dispatch({
        type: "CLEAR-SELECTED-TILES",
        })
      }
    }
  })
)(HighlightStorable);
