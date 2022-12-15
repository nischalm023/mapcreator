import React, { Component } from "react";
import importMap from "common/utils/import-map";
import JSONFileInput from "components/JSONFileInput";
import { handleErrors } from "utils/util";
import { withRouter } from "react-router-dom";
import SweetAlertError from "components/SweetAlertError";
import { createMap , RunScript } from "utils/api";
import _ from "lodash";

class ImportMap extends Component {
  state = {
    name: "",
    error: undefined,
  };

  handleChange = (evt) => {
      this.setState({["autocad"]: evt.target.files[0]});
  };

  onRead = (stateKey) => (json) => {
    console.log(" in on read", json,stateKey)
    // should do validation here or not? probably not, just do it once submit is pressed
    this.setState({ [stateKey]: json });
    console.log(" in on read", this.state)

  };

  onError = (error) => this.setState({ error });

  onClear = (stateKey) => () => {
    this.setState({ [stateKey]: undefined });
  };

  runHaiMapConversionScriptToMap = (autocad) => {
      console.log(">>>>>",autocad)
      let form = new FormData();
      form.append("arrFile", autocad)
      return  fetch('http://localhost:5000/data', {
          method: 'POST',
          body: form
          })
          .then((response) => response.json())
          .then(data => {
                return data;
            }).catch((error) => {
              this.setState({'error':error })
          });
    };

  createMap = (imported) => {
    const { name } = this.state;
    const { history } = this.props;
    createMap(imported, name)
      .then(handleErrors)
      .then((res) => res.json())

      .then((id) => history.push(`/map/${id}`))
      .catch((error) => this.setState({ error }));
  }

  onSubmit = (e) => {
    e.preventDefault();
    // validate the import by converting everything into the map using import function
    let imported;
    try {
      if(this.state["autocad"]){
            var response = this.runHaiMapConversionScriptToMap(this.state["autocad"]).then(
            response=>{
                  imported = importMap(_.omit(response, ["name", "error"]));
                  this.createMap(imported)
            });
      }
    } catch (error) {
      console.log(error.message);
      this.setState({ error: error.message });
      return;
    }
    
  };

  render() {
    // console.log(" State ",this.state);
    const { error } = this.state;
    return (
      <div className="container">
        {/* sweetalert here*/}
        <SweetAlertError
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <h3 className="display-5 pb-4">Specify files to import from</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group row">
            <label htmlFor="name" className="col-form-label col-sm-3">
              Name
            </label>
            <div className="col-sm-9">
              <input
                type="text"
                id="name"
                className="form-control"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group row justify-content-between">
            <label for="fileSelect" className="col-form-label col-sm-3">autocad.csv</label>
              <div className="col-sm-9">
                <input
                 type={"file"} 
                 onChange={this.handleChange}
                 accept={".csv"} />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-10">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(ImportMap);
