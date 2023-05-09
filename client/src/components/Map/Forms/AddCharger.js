import React, { Component } from "react";
import { connect } from "react-redux";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import ButtonForm from "./Util/ButtonForm";
import SweetAlertError from "components/SweetAlertError";
import { withFormik, Field } from "formik";
import { object, ref } from "yup";
import { chargerAgentName, chargerDirectionName, chargerTypeName} from "utils/forms";
import { addChargers } from "actions/charger";
import * as constants from "../../../constants";


// form html
// not using BaseForm as more advanced validation needed

const handleFormValue = (formValues) => {
    formValues.charger_direction = parseInt(formValues.charger_direction)
    if(formValues.agent_type == constants.AGENTTYPE[2]){
        formValues.charger_type = constants.TtpChargerType
      }
    if(formValues.agent_type == constants.AGENTTYPE[3]){
      formValues.charger_type = constants.QuicktronChargerType
    }
    return formValues
  };

const InnerForm = ({ handleSubmit, isSubmitting, values }) => {
  const checkChargerType = (agent_type) => {
    return agent_type == constants.AGENTTYPE[2] ? constants.TtpChargerTypeName : constants.QuicktronChargerTypeName;
  };

  
  return (
    <form onSubmit={handleSubmit}>
      <h3> Add Charger </h3>
      <Field
        name="agent_type"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={chargerAgentName}
          />
        )}
        label="Agent Type"
      />
      {values.agent_type == constants.AGENTTYPE[1] && <Field
        name="charger_type"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={chargerTypeName}
          />
        )}
        label="Charger Type"
      />}
      {values.agent_type != constants.AGENTTYPE[1] && 
        <Field
          name="charger_type"
          component={props => <FormikedInput {...props} readOnly={true} />}
          label="Charger Type"
          value={checkChargerType(values.agent_type)}
      />}
      <Field
        name="charger_direction"
        component={props => (
          <FormikedSelectInput
            {...props}
            valuesAndLabels={chargerDirectionName}
          />
        )}
        label="Charger Direction"
      />
      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

// form validation etc.
const Form = withFormik({
  mapPropsToValues: (props: props) => {
    const { onSuccess, ttpMode } = props;
    if(ttpMode === true){
      return({
        agent_type: constants.AGENTTYPE[2],
        charger_direction: constants.CHARGERDIRECTION[1],
        charger_type: constants.TtpChargerTypeName
      })
    }else{
      return({
        agent_type: constants.AGENTTYPE[1],
        charger_direction: constants.CHARGERDIRECTION[1],
        charger_type: constants.CHARGERTYPE[1]
      })
    }
  },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, dispatch } = props;
    formValues = handleFormValue(formValues)
    dispatch(addChargers(formValues));
    onSuccess();
  }
})(InnerForm);

class AddCharger extends Component {
  state = {
    error: undefined,
    show: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { error, show } = this.state;
    const { dispatch,disabled,ttpMode } = this.props;
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
          buttonText="Assign Charger"
        >
          <Form
            onSuccess={() => this.toggle()}
            dispatch={dispatch}
            ttpMode={ttpMode}

          />
        </ButtonForm>
      </div>
    );
  }
}

export default connect(
  state => ({
    // TODO: disabling adding multiple chargers; adding neighbouring chargers together messes up
    // adjacency, should be fixed...
    disabled: Object.keys(state.selection.mapTiles).length !== 1,
    ttpMode:state.selection.TTPMode
  })
)(AddCharger);
