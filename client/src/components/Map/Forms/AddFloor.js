import React, { Component } from "react";
import { connect } from "react-redux";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import ButtonForm from "./Util/ButtonForm";
import { addFloor } from "actions/floor";
import SweetAlertError from "components/SweetAlertError";
import { withFormik, Field } from "formik";
import { object, ref } from "yup";
import { yupNonNegBarcodeDistanceIntSchema,yupPosIntSchema, yupNonNegIntSchema, msuDimensionAndNames, yupMSUMappingSchema, barcodeDistance15xAndNames, barcodeDistance12xAndNames } from "utils/forms";

// form html
// not using BaseForm as more advanced validation needed
const InnerForm = ({ handleSubmit, isSubmitting, values }) => {
  const checkDimensions = (msu_dimensions) => {
    return msu_dimensions == 97.9 ? barcodeDistance12xAndNames : barcodeDistance15xAndNames;
  };
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="floor_id"
        component={props => <FormikedInput {...props} readOnly={true} />}
        label="Floor Id"
        type="text"
      />
      <Field
        name="msu_dimensions"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={msuDimensionAndNames}
          />
        )}
        label="MSU dimension"
      />
      {values.msu_dimensions && values.msu_dimensions !== "Custom" && <Field
        name="barcode_distances"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={checkDimensions(values.msu_dimensions)}
          />
        )}
        label="Barcode Spacing"
      />}
      {values.msu_dimensions === "Custom" && 
        <Field
          name="barcode_distances"
          component={FormikedInput}
          type="number"
          label="Barcode Spacing"
      />}
      <Field
        name="row_start"
        component={FormikedInput}
        label="Row Start"
        type="number"
      />
      <Field
        name="row_end"
        component={FormikedInput}
        label="Row End"
        type="number"
      />
      <Field
        name="column_start"
        component={FormikedInput}
        label="Column Start"
        type="number"
      />
      <Field
        name="column_end"
        component={FormikedInput}
        label="Column End"
        type="number"
      />
      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

// form validation etc.
const Form = withFormik({
  mapPropsToValues: ({ nextFloorId }) => ({
    floor_id: nextFloorId,
    row_start: "",
    row_end: "",
    column_start: "",
    column_end: "",
    msu_dimensions: "",
    barcode_distances: ""
  }),
  validationSchema: () => {
    return object().shape({
      msu_dimensions: yupMSUMappingSchema,
      barcode_distances: yupNonNegBarcodeDistanceIntSchema,
      floor_id: yupPosIntSchema,
      row_start: yupNonNegIntSchema,
      row_end: yupNonNegIntSchema.min(ref("row_start")),
      column_start: yupNonNegIntSchema,
      column_end: yupNonNegIntSchema.min(ref("column_start"))
    });
  },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, dispatch } = props;
    dispatch(addFloor(formValues));
    onSuccess();
  }
})(InnerForm);

class AddFloor extends Component {
  state = {
    error: undefined,
    show: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { nextFloorId, dispatch,disabled } = this.props;
    return (
      <div>
        <SweetAlertError
          title="Server Error"
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <ButtonForm
          show={show}
          disabled={disabled}
          toggle={this.toggle}
          tooltipData={{ id: "add-floor", title: "Add Floor" }}
          buttonText="Add Floor"
          bcolor = "orange"
        >
          <Form
            onSuccess={() => this.toggle()}
            nextFloorId={nextFloorId}
            dispatch={dispatch}
          />
        </ButtonForm>
      </div>
    );
  }
}

export default connect(state => ({
  nextFloorId:
    Math.max(
      ...Object.keys(state.normalizedMap.entities.floor).map(floor_id =>
        parseInt(floor_id)
      )
    ) + 1,
}))(AddFloor);
