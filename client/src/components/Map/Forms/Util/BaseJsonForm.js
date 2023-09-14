import React, { Component } from "react";
import Form from "react-jsonschema-form";
import ButtonForm from "./ButtonForm";

class BaseForm extends Component {
  state = {
    show: false,
    formData: {},
  };
  toggle = () => this.setState({ show: !this.state.show, formData: {} });
  render() {
    const {
      schema,
      onSubmit,
      onRemove,
      onError = () => {},
      validate = null,
      uiSchema = undefined,
      initialData = {},
      barcodes = null,
      nextIOPointId = '',
      dispatch = dispatch,
      transformErrors = undefined,
      ...rest
    } = this.props;
    const { formData } = this.state;
    const fullFormData = { ...initialData, ...formData };
    return (
      <ButtonForm {...rest} show={this.state.show} toggle={this.toggle} >
        <Form
          schema={schema}
          transformErrors={transformErrors}
          uiSchema={uiSchema}
          onSubmit={formData => {
            barcodes ? onSubmit(formData, barcodes, nextIOPointId, dispatch) : onSubmit(formData) ;
            this.toggle();
          }}
          onChange={({ formData }) => this.setState({ formData })}
          formData={fullFormData}
          onError={onError}
          validate={validate}
        >
          <div>
            <button 
              type="submit" 
              className="btn btn-outline-primary mr-1"
            >
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={this.toggle}
            >
              Cancel
            </button>
            {barcodes && <button
              type="button"
              className="btn btn-outline-danger"
              style={{ float: "right" }}
              onClick={() => {
                onRemove(formData, barcodes, nextIOPointId, dispatch);
                this.toggle();
              }}
            >
              Remove IO Points
            </button>}
          </div>
        </Form>
      </ButtonForm>
    );
  }
}

export default BaseForm;
