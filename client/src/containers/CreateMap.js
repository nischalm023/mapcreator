import React, { Component } from "react";
import { withFormik, Field } from "formik";
import { withRouter } from "react-router-dom";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import { createMapFromCoordinateData, handleErrors } from "utils/util";
import SweetAlertError from "components/SweetAlertError";
import { string, object, ref } from "yup";
import { yupNonNegIntSchema, msuDimensionAndNames, barcodeDistance12xAndNames, barcodeDistance15xAndNames, yupMSUMappingSchema } from "utils/forms";
import { createMap } from "utils/api";
import guideImg from "sprites/guide.png";

// form html
const InnerForm = ({ handleSubmit, isSubmitting, values }) => {
  const checkDimensions = (msu_dimensions) => {
    return msu_dimensions == 97.9 ? barcodeDistance12xAndNames : barcodeDistance15xAndNames;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Field name="name" component={FormikedInput} label="Name" type="text" />
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
      {values.msu_dimensions && <Field
        name="barcode_distances"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={checkDimensions(values.msu_dimensions)}
          />
        )}
        label="Barcode Distances"
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
        name="col_start"
        component={FormikedInput}
        label="Column Start"
        type="number"
      />
      <Field
        name="col_end"
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
  mapPropsToValues: () => ({
    name: "",
    row_start: "",
    row_end: "",
    col_start: "",
    col_end: "",
    msu_dimensions: "",
    barcode_distances: ""
  }),
  validationSchema: () => {
    return object().shape({
      name: string().required(),
      msu_dimensions: yupMSUMappingSchema,
      barcode_distances: yupMSUMappingSchema,
      row_start: yupNonNegIntSchema,
      row_end: yupNonNegIntSchema.min(ref("row_start")),
      col_start: yupNonNegIntSchema,
      col_end: yupNonNegIntSchema.min(ref("col_start"))
    });
  },
  handleSubmit: (
    { name, row_start, row_end, col_start, col_end, msu_dimensions, barcode_distances },
    { props, setSubmitting }
  ) => {
    // creating a map with row_start etc.
    var map = createMapFromCoordinateData(
      row_start,
      row_end,
      col_start,
      col_end,
      msu_dimensions,
      barcode_distances
    );
    const { onServerError, onSuccess } = props;
    // API call to save Map created in DB
    createMap(map, name)
      .then(handleErrors)
      .then(res => res.json())
      .then(id => {
        setSubmitting(false);
        onSuccess(id);
      })
      .catch(error => {
        setSubmitting(false);
        onServerError(error);
      });
  }
})(InnerForm);

class CreateMap extends Component {
  state = {
    error: undefined
  };
  render() {
    const { error } = this.state;
    const { history } = this.props;
    const params = new URLSearchParams(window.location.search);
    let gsb = params.get('gsb') ? eval(params.get('gsb')) : false;
    let gsbSolutionId = params.get('gsbSolutionId');
    let gsbAgentType = params.get('gsbAgentType');
    let gsbFunctionalArea = params.get('gsbFunctionalArea');
    return (
      <div className="container">
        <div className="row">
          <div className="col-12" style={{marginBottom: 50}}>
            <SweetAlertError
              title="Server Error"
              error={error}
              onConfirm={() => this.setState({ error: undefined })}
            />
            <h3 className="display-5">Specify details of new map</h3>
            <hr />
          </div>
          <div className="col-12 col-sm-12 col-lg-8 col-md-8">
            <Form
              onServerError={error => this.setState({ error })}
              onSuccess={id => {
                if(gsb){
                  return history.push(`/map/${id}?gsb=true&gsbSolutionId=${gsbSolutionId}&gsbAgentType=${gsbAgentType}`)
                } else {
                  return history.push(`/map/${id}`)
                }
              }}
            />
          </div>
          <div className="col-12 col-sm-12 col-lg-4 col-md-4">
            <img src={guideImg} style={{width: "100%"}} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(CreateMap);
