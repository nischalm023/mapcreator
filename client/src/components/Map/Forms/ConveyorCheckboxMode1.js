import React, { Component } from "react";
import { connect } from "react-redux";
import { FormikedInput } from "components/InlineTextInput";
import ButtonForm from "./Util/ButtonForm";
import { addConveyorId,convertNestedListToList } from "actions/conveyor";
import { withFormik, Field } from "formik";
import { number, object, string, array } from "yup";
import { yupPosIntSchema } from "utils/forms";
import { getBarcodes } from "../../../utils/selectors";
import {getNeighbouringCoordinateKeys, getNeighbourTiles } from "utils/util";


const InnerForm = ({ handleSubmit, isSubmitting, values }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="conveyor_id"
        component={props => <FormikedInput {...props} readOnly={true} />}
        label="Conveyor Id"
        type="text"
      />
      <Field
        name="conveyor_entry_height"
        component={FormikedInput}
        label="Conveyor Entry Height"
        type="number"
      />
      <Field
        name="conveyor_exit_height"
        component={FormikedInput}
        label="Conveyor Exit Height"
        type="number"
      />

      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

const Form = withFormik({
  mapPropsToValues: ({ nextConveyorId }) => ({
    conveyor_id: nextConveyorId,
    conveyor_entry_height: "",
    conveyor_exit_height: "",
  }),
  validationSchema: () => {
    return object().shape({
      conveyor_entry_height: number()
        .required("Required")
        .integer("Should be integer")
        .min(1, "Conveyor entry height cannot be zero or negative."),
      conveyor_exit_height: number()
        .required("Required")
        .integer("Should be integer")
        .min(1, "Conveyor entry height cannot be zero or negative."),
    });
  },
  
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, dispatch } = props;
    dispatch(addConveyorId(formValues));
    onSuccess();
  }
})(InnerForm);

const shouldBeDisabled = (tileIds,barcodesDict,conveyorTile) => {
  if (tileIds.length < 3){
    return true
  }
  if(conveyorTile != undefined || Object.keys(conveyorTile).length>=1){
      for (const [key, value] of Object.entries(conveyorTile)) {
        var selected_tile = convertNestedListToList(value["selected_tile"])
        if(tileIds.some(r=> selected_tile.includes(r))){
          return true
        } 
      }
  }
  for (var i = 1; i < tileIds.length; i++) {
    var curTileId = tileIds[i];
    var prevTileId = tileIds[i - 1];
    // make sure prev barcode has current barcode as neighbour
    if (
      getNeighbouringCoordinateKeys(prevTileId, barcodesDict).find(
        coordinateKey => coordinateKey == curTileId
      ) === undefined
    )
      return true
  }

  return false;
  };

class ConveyorCheckboxMode extends Component {
  state = {
    error: undefined,
    show: false,
    handle_submit: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  onSuccessSubmit = () => {
    this.setState({ handle_submit:true,show: !this.state.show});
  }
  render() {
    const { error, show, handle_submit} = this.state;
    const { nextConveyorId, dispatch,selectedMapTiles,current_floor, floor_value,barcodes,conveyorTile } = this.props;
    var current_floor_value = floor_value[current_floor]
    var floor_barcodes = {};
    const barcodeKeys = current_floor_value.map_values;
    barcodeKeys.forEach((barcodeKey) => {
      floor_barcodes[barcodeKey] = barcodes[barcodeKey];
    });
    const disabled = shouldBeDisabled(selectedMapTiles,floor_barcodes,conveyorTile);
    return (
      <div>
        <ButtonForm
          show={show}
          disabled={disabled}
          toggle={this.toggle}
          tooltipData={{ id: "add-conveyor", title: "Add Conveyor System" }}
          buttonText="Add Conveyor System"
          bcolor = "orange"
        >
          <Form
            onSuccess={() => this.onSuccessSubmit()}
            nextConveyorId={nextConveyorId}
            dispatch={dispatch}
          />
        </ButtonForm>
      </div>
    );
  }
}

export default connect(state => ({
  nextConveyorId:
    Math.max(...(state.normalizedMap.entities.map.dummy.conveyors || []), 0) + 1,
  selectedMapTiles:Object.keys(state.selection.mapTiles),
  barcodes: getBarcodes(state),
  current_floor: state.currentFloor,
  floor_value:state.normalizedMap.entities.floor,
  conveyorTile:state.normalizedMap.entities.conveyorTile
}))(ConveyorCheckboxMode);
