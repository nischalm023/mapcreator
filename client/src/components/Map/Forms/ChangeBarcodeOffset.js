import React, { Component } from "react";
import ButtonForm from "./Util/ButtonForm";
import { deleteMap } from "actions/actions";
import { connect } from "react-redux";
import { getMapId, getMapName } from "utils/selectors";
import { withRouter } from "react-router-dom";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import { withFormik, Field } from "formik";
import { object, ref } from "yup";
import { yupMinMaxIntSchema } from "utils/forms";
import { changeBarcodeOffset } from "actions/changeBarcodeOffset";

const InnerForm = ({ handleSubmit, isSubmitting, values,onClear }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="offset_x"
        component={FormikedInput}
        label="Offset X"
        type="number"
      />
      <Field
        name="offset_y"
        component={FormikedInput}
        label="Offset Y"
        type="number"
      />
      <span>
        This may result in all barcode being change.
        Are you sure you want to continue?
      </span>
      <div>
        <button type="submit" disabled={isSubmitting} className="btn btn-outline-primary mr-1">
          Submit
        </button>
        <button type="button" onClick={()=>onClear()} className="btn btn-outline-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

// form validation etc.
const Form = withFormik({
  mapPropsToValues: ({ current_vda_offset }) => ({
    offset_x: current_vda_offset[0],
    offset_y: current_vda_offset[1]
  }),
  validationSchema: () => {
    return object().shape({
      offset_x: yupMinMaxIntSchema,
      offset_y: yupMinMaxIntSchema,
    });
  },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, onClear,dispatch,current_vda_offset,barcode_value,barcode_dict,currentFloor} = props;
    var updated_vda_offset = `[${formValues.offset_x},${formValues.offset_y}]`
    dispatch(changeBarcodeOffset(dispatch,updated_vda_offset,currentFloor,barcode_value,barcode_dict,current_vda_offset))
    
    onSuccess();
  }
})(InnerForm);

class ChangeBarcodeOffset extends Component {
  state = {
    show: false,
    name: "",
    on_hover:false,
    bgcolor:"red"
  }
  toggle = () => this.setState({ show: !this.state.show });
  MouseOver = () => this.setState({ on_hover: true ,"bgcolor":"white"})
  MouseOut = () => this.setState({ on_hover: false ,"bgcolor":"red"});
  render() {
    const { show, name,bgcolor } = this.state;
    const { dispatch,current_floor,floor_value,barcodes} = this.props;
    var current_floor_value = floor_value[current_floor]
    var barcodeOffset = JSON.parse(current_floor_value.barcodeOffset)
    var barcodeFormat = current_floor_value.barcodeFormat
    var barcodesDict = {};
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      barcodesDict[barcodeKey] = barcodes[barcodeKey];
    });
    return (
      <ButtonForm
        buttonText="Set Offset Value"
        btnClass="btn-outline-danger"
        wrapInButtonGroup={false}
        show={show}
        toggle={this.toggle}
        style={{textAlign:"-webkit-center", color:"black"}}
        title="Set Grid Offset"
        bcolor = {bgcolor}
        handleMouseEnter={this.MouseOver}
        handleMouseLeave={this.MouseOut}

      >
      <Form
        onSuccess={() => this.toggle()}
        onClear={() => this.toggle()}
        dispatch={dispatch}
        current_vda_offset={barcodeOffset}
        barcode_value={barcodeFormat} 
        barcode_dict={barcodesDict}
        currentFloor={current_floor}
      />
      </ButtonForm>
    );
  }
}

// add both redux and react-router decorators
export default withRouter(
  connect(state => ({
    current_floor: state.currentFloor,
    floor_value:state.normalizedMap.entities.floor,
    barcodes:state.normalizedMap.entities.barcode
  }))(ChangeBarcodeOffset)
);
