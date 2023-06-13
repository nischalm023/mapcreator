import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import Select from "react-select";


let ndeepOptions = [
  {value: "single", label: "Single"},
  {value: "double", label: "Double"}
]
class BaseForm extends Component {
  state = {
    show: false,
    formData: {},
    schema: {
      io_point: { type: "string", title: "Tote Id", value: "" },
      agent: { type: "string", title: "Tote Id", value: "" },
    },
    multiSchema: {
      0: {
        tote_id: { type: "string", title: "Tote Id", value: "" },
        tote_location: { type: "string", title: "Tote Location", value: "" },
        tote_type: { type: "string", title: "Tote Type", value: "Type_1" },
        tote_height: { type: "string", title: "Tote Height", value: "" },
        ndeep: { type: "string", title: "ndeep", value: "single" },
        bot_direction_options: [],
        bot_direction: { type: "string", title: "Tote Id", value: "" },
        storable_direction_options: [],
        storable_direction: { type: "string", title: "Tote Id", value: "" },
        edit: true,
        error: ''
      }
    },
    lastKey: 0
  };
  toggle = (ioPointBarcode=null, ioPointId=null, agent=null, botDirection=null, nextToteStorableId=null, existingTotes={}) => {
    if (!this.state.show) {
      const existingTotesInIoPoint = Object.fromEntries(
        Object.entries(existingTotes).filter(([key, value]) => value.io_point_id === ioPointId)
      );
      let initialMultiSchema = {};
      let initialStorableDirection = '';
      let initialBotDirection = { value: botDirection[0], label: botDirection[0][0].toUpperCase() + botDirection[0].slice(1) }
      let storableDirections = [];
      if (initialBotDirection.value == "north" || initialBotDirection.value == "south") {
        storableDirections = ["west", "east"];
      }
      else if (initialBotDirection.value == "west" || initialBotDirection.value == "east") {
        storableDirections = ["north", "south"];
      }
      let i = 0;
      for(let key in existingTotesInIoPoint){
        let tote = existingTotesInIoPoint[key];
        initialStorableDirection = tote.storable_direction.value;
        initialMultiSchema[i] = {
          tote_id: { type: "string", title: "Tote Id", value: tote.tote_id.value },
          tote_location: { type: "string", title: "Tote Location", value: 'TOT_' + String(tote.tote_id.value).padStart(7, '0') },
          tote_type: { type: "string", title: "Tote Type", value: "Type_1" },
          tote_height: { type: "string", title: "Tote Height", value: tote.tote_height.value },
          ndeep: { type: "string", title: "ndeep", value: tote.ndeep.value },
          bot_direction_options: botDirection,
          bot_direction: { type: "string", title: "Tote Id", value: tote.bot_direction.value},
          storable_direction_options: storableDirections,
          storable_direction: { type: "string", title: "Tote Id", value: initialStorableDirection},
          edit: false,
          error: ''
        }
        i++;
      }
      this.setState({
        multiSchema: initialMultiSchema
      });
      this.setState({
        schema: {
          io_point: { type: "string", title: "Tote Id", value: ioPointBarcode },
          agent: { type: "string", title: "Tote Id", value: "HAI-TTP-A42D" },
        }
      });
    }
    this.setState({ show: !this.state.show, formData: {} });
  }
  onSubmitHandler = (onSubmit, barcode, ioPointId, nextToteStorableId) => {
    let finalSetOfTotes = {};
    for (let key in this.state.multiSchema) {
      let tote = this.state.multiSchema[key];
      finalSetOfTotes[tote.tote_id.value] = {
        "barcode": barcode,
        "io_point_id": ioPointId,
        "next_tote_storable_id": tote.tote_id.value,
        "agent": this.state.schema.agent,
        "bot_direction": tote.bot_direction,
        "io_point": this.state.schema.io_point,
        "storable_direction": tote.storable_direction,
        "ndeep": tote.ndeep,
        "tote_height": tote.tote_height,
        "tote_id": tote.tote_id,
        "tote_location": tote.tote_location,
        "tote_type": tote.tote_type
      }
    }
    var error = false;
    if(!error){
      let multiSchema = this.state.multiSchema;
      if(!error){
        for (let key in this.state.multiSchema){
          if(this.state.multiSchema[key].edit===true){
            error = true;
            multiSchema[key].error = "You have unsaved changes. Please confirm them."; 
          }
        };
      }
      this.setState({
        multiSchema: multiSchema
      });
    }
    if (!error) {
      let data = {
        "schema": this.state.schema,
        "multiSchema": this.state.multiSchema
      }
      onSubmit(data, barcode, ioPointId, nextToteStorableId, finalSetOfTotes);
      this.toggle();
    } 
  };
  addNewRow = (nextToteStorableId, botDirection) => {
    var multiSchema = { ...this.state.multiSchema };
    let nextId = 0;
    if(Object.keys(multiSchema).length!==0){
      for(let key in multiSchema){
        nextId = Math.max(nextId, multiSchema[key].tote_id.value);
      }
      nextId = nextId + 1;
    }
    else{
      nextId = nextToteStorableId;
    }
    for (let key in multiSchema) {
      let tote = multiSchema[key];
      nextToteStorableId = Math.max(tote.tote_id.value, nextToteStorableId);
    }
    nextToteStorableId = nextToteStorableId + 1;
    let initialBotDirection = { value: botDirection[0], label: botDirection[0][0].toUpperCase() + botDirection[0].slice(1)}
    let storableDirections = [];
    if (initialBotDirection.value == "north" || initialBotDirection.value == "south") {
      storableDirections = ["west", "east"];
    }
    else if (initialBotDirection.value == "west" || initialBotDirection.value == "east") {
      storableDirections = ["north", "south"];
    }
    multiSchema[nextId] = {
      tote_id: { type: "string", title: "Tote Id", value: nextId },
      tote_location: { type: "string", title: "Tote Location", value: 'TOT_'+String(nextId).padStart(7, '0') },
      tote_type: { type: "string", title: "Tote Type", value: "Type_1" },
      tote_height: { type: "string", title: "Tote Height", value: "" },
      ndeep: { type: "string", title: "ndeep", value: {value: 'single', label: 'Single'}},
      bot_direction_options: botDirection,
      bot_direction: { type: "string", title: "Tote Id", value: {value: botDirection[0], label: botDirection[0][0].toUpperCase() + botDirection[0].slice(1)}},
      storable_direction_options: storableDirections,
      storable_direction: { type: "string", title: "Tote Id", value: {value: storableDirections[0], label: storableDirections[0][0].toUpperCase() + storableDirections[0].slice(1)}},
      edit: true,
      error: ''
    };
    this.setState({ multiSchema: multiSchema });
  }
  changeMultiSchemaHandler = (key, field, value) => {
    var multiSchema = { ...this.state.multiSchema };
    if (field == "tote_height") {
      multiSchema[key].tote_height.value = value;
      if(value>0 && value<=10000){
        multiSchema[key].error = ''
      }
    }
    if (field == "ndeep") {
      multiSchema[key].ndeep.value = value;
      multiSchema[key].error = ''
    }
    if (field == "bot_direction") {
      multiSchema[key].bot_direction.value = value;
      let storableDirections = [];
      if (multiSchema[key].bot_direction.value.value == "north" || multiSchema[key].bot_direction.value.value == "south") {
        storableDirections = ["west", "east"];
      }
      else if (multiSchema[key].bot_direction.value.value == "west" || multiSchema[key].bot_direction.value.value  == "east") {
        storableDirections = ["north", "south"];
      }
      multiSchema[key].storable_direction.value = '';
      multiSchema[key].storable_direction_options = storableDirections;
      multiSchema[key].error = ''
    }
    if (field == "storable_direction") {
      multiSchema[key].storable_direction.value = value;
      multiSchema[key].error = ''
    }
    this.setState({ multiSchema: multiSchema });
  };
  deleteRow = (key) => {
    var multiSchema = { ...this.state.multiSchema };
    delete multiSchema[key];
    this.setState({ multiSchema: multiSchema });
  };
  isCombinationUniqueInMultischema = (multischema , newObj) => {
    for (let key in multischema) {
      const obj = multischema[key];
      if (
        obj.tote_height.value === newObj.tote_height.value &&
        obj.ndeep.value.value === newObj.ndeep.value.value &&
        obj.bot_direction.value.value === newObj.bot_direction.value.value &&
        obj.storable_direction.value.value === newObj.storable_direction.value.value
      ) {
        return { unique: false, key: key };
      }
    }
    return { unique: true };
  }
  editClick = (key) => {
    var multiSchema = { ...this.state.multiSchema };
    // if edit mode on, check validations before confirming 
    if (multiSchema[key].edit) {
      var error = false;
      if (multiSchema[key].tote_height.value === '' || multiSchema[key].tote_height.value <= 0 || multiSchema[key].tote_height.value > 10000) {
        error = true;
        multiSchema[key].error = "Tote height cannot be empty and should be less than 10 meters";
      }
      if (!error && multiSchema[key].bot_direction === '') {
        error = true;
        multiSchema[key].error = "Bot direction cannot be empty";
      }
      if (!error && multiSchema[key].storable_direction.value === '') {
        error = true;
        multiSchema[key].error = "Storable direction cannot be empty";
      }
      if (!error) {
        let confirmedMultischema = Object.fromEntries(
          Object.entries(multiSchema).filter(([key, value]) => value.edit === false)
        );
        let is_unique = this.isCombinationUniqueInMultischema(confirmedMultischema, multiSchema[key])
        if(!is_unique.unique){
          error = true;
          multiSchema[key].error = "Each tote location should have at least one unique attribute";
          multiSchema[is_unique.key].error = "Each tote location should have at least one unique attribute";
        }
      }
      this.setState({
        multiSchema: multiSchema
      });
      if(error) return;
    }
    multiSchema[key].edit = !multiSchema[key].edit;
    multiSchema[key].error = '';
    this.setState({ multiSchema: multiSchema });
  };

  render() {
    const {
      schema = { ...schema },
      onSubmit,
      barcode,
      nextToteStorableId,
      ioPointBarcode,
      ioPointId,
      agent,
      botDirection,
      existingTotes,
      ...rest
    } = this.props;

    var multiRows = [];
    var _this = this;
    if(_this.state.multiSchema){
      Object.keys(_this.state.multiSchema).forEach(function (key, index) {
        const botDirectionsOptions = [];
        for (let direction of _this.state.multiSchema[key].bot_direction_options) {
          const label = direction.charAt(0).toUpperCase() + direction.slice(1);
          botDirectionsOptions.push({ value: direction, label: label })
        }
        const storableDirectionsOptions = [];
        for (let direction of _this.state.multiSchema[key].storable_direction_options) {
          const label = direction.charAt(0).toUpperCase() + direction.slice(1);
          storableDirectionsOptions.push({ value: direction, label: label })
        }
        multiRows.push(<div key={"rack-" + index}>
          <div className="row">
            <div className="col-lg-11 col-md-11 col-sm-11 col-11">
              <div className="form-group field">
                <div className="row">
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <input className="form-control" type="text" key={"tote_location" + index} 
                      value={_this.state.multiSchema[key].tote_location.value} 
                    />
                  </div>
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <input className="form-control" type="text" key={"tote_type" + index}
                      value={_this.state.multiSchema[key].tote_type.value}
                    />
                  </div>
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <input className="form-control" type="number" key={"tote_height" + index} 
                      min="1" max="10000"
                      placeholder={"Enter..."} 
                      onChange={(e) => _this.changeMultiSchemaHandler(key, "tote_height", e.target.value)} 
                      value={_this.state.multiSchema[key].tote_height.value} 
                      disabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <Select
                      defaultValue={ndeepOptions[0]}
                      value={_this.state.multiSchema[key].ndeep.value}
                      onChange={(selected) => _this.changeMultiSchemaHandler(key, "ndeep", selected)}
                      options={ndeepOptions}
                      isDisabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <Select
                      defaultValue={botDirectionsOptions[0]}
                      value={_this.state.multiSchema[key].bot_direction.value}
                      onChange={(selected) => _this.changeMultiSchemaHandler(key, "bot_direction", selected)}
                      options={botDirectionsOptions}
                      isDisabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                  <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                    <Select
                      defaultValue={storableDirectionsOptions[0]}
                      value={_this.state.multiSchema[key].storable_direction.value}
                      onChange={(selected) => _this.changeMultiSchemaHandler(key, "storable_direction", selected)}
                      options={storableDirectionsOptions}
                      isDisabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                  {_this.state.multiSchema[key].error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.multiSchema[key].error}</span>}
                </div>
              </div>
            </div>
            <div className="col-lg-1 col-md-1 col-sm-1 col-1" style={{padding:'0px'}}>
              <button
                id={"tote-delete-btn-"+index}
                className="btn"
                style={{padding:'10px'}}
                type="button"
                onClick={() => _this.deleteRow(key)}
              >
                <i className="fa fa-times" />
              </button>
              <button
                id={"tote-edit-btn"+index}
                className="btn"
                style={{padding:'10px'}}
                type="button"
                onClick={() => _this.editClick(key)}
              >
                {_this.state.multiSchema[key].edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
              </button>
            </div>
          </div>
        </div>);
      })
    }
    return (
      <ButtonForm {...rest} modalClass="tote-location-modal" show={this.state.show} toggle={()=>this.toggle(ioPointBarcode, ioPointId, agent, botDirection, nextToteStorableId, existingTotes)} >
        <form>
          <div>
            <legend id="root__title">{schema.title}</legend>
            <hr />
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      IO Point
                    </div>
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      Agent
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      <input className="form-control" type="text" 
                        value={this.state.schema.io_point.value}  
                      />
                    </div>
                    <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                      <input className="form-control" type="text" 
                        value={this.state.schema.agent.value}  
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br/><br/>
            {Object.keys(this.state.multiSchema).length!==0 &&
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      Tote Location
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      Tote Type
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      Tote Height(mm)
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      n-deep
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      Bot Direction
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                      Storable Direction
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {multiRows}
            <button type="button" onClick={() => this.addNewRow(nextToteStorableId, botDirection)} className="btn btn-outline-secondary mr-1">
              Add Tote Location
            </button>
            <br/><br/><br/>
          </div>
          <div>
            <button type="button" onClick={() => {
              this.onSubmitHandler(onSubmit, barcode, ioPointId, nextToteStorableId);
            }}
              className="btn btn-outline-primary mr-1">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={this.toggle}
            >
              Cancel
            </button>
          </div>
        </form>
      </ButtonForm>
    );
  }
}

export default BaseForm;
