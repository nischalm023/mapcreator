import React, { Component } from "react";
import { connect } from "react-redux";
import { FormikedInput } from "components/InlineTextInput";
import ButtonForm from "./Util/ButtonForm";
import { addConveyorId } from "actions/conveyor";
import { withFormik, Field } from "formik";
import { object } from "yup";
import SelectConveyorSystem from "components/Map/Forms/SelectConveyorSystem";
import { yupNonNegIntSchema } from "utils/forms";


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
        name="conveyor_height"
        component={FormikedInput}
        label="Conveyor Height"
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
    conveyor_height: "",
  }),
  validationSchema: () => {
    return object().shape({
      conveyor_height: yupNonNegIntSchema,
    });
  },
  
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, dispatch } = props;
    dispatch(addConveyorId(formValues));
    onSuccess();
  }
})(InnerForm);

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
    const { nextConveyorId, dispatch,disabled } = this.props;
    return (
      <div>
        <ButtonForm
          show={show}
          disabled={handle_submit}
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
        <div className="row py-1">
            <div className="col">
              {handle_submit===true?<SelectConveyorSystem/>:null}
            </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  nextConveyorId:
    Math.max(...(state.normalizedMap.entities.map.dummy.conveyors || []), 0) + 1,
}))(ConveyorCheckboxMode);
