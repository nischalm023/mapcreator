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
      bot_direction: { type: "string", title: "Tote Id", value: "" },
      storable_direction: { type: "string", title: "Tote Id", value: "" },
    },
    multiSchema: {
      0: {
        tote_id: { type: "string", title: "Tote Id", value: "" },
        tote_location: { type: "string", title: "Tote Location", value: "" },
        tote_type: { type: "string", title: "Tote Type", value: "Type_1" },
        tote_height: { type: "string", title: "Tote Height", value: "" },
        ndeep: { type: "string", title: "ndeep", value: "single" },
        edit: true
      }
    },
    lastKey: 0
  };
  toggle = (ioPointBarcode=null, ioPointId=null, agent=null, botDirection=null, storableDirections=null, nextToteStorableId=null, existingTotes={}) => {
    if (!this.state.show) {
      const existingTotesInIoPoint = Object.fromEntries(
        Object.entries(existingTotes).filter(([key, value]) => value.io_point_id === ioPointId)
      );
      let initialMultiSchema = {};
      let initialStorableDirection = '';
      if(botDirection==="north"||botDirection==="south"){
        initialStorableDirection = [{value: 'west', label: 'West'}]
      }
      else if(botDirection==="east"||botDirection==="west"){
        initialStorableDirection = [{value: 'north', label: 'North'}]
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
          edit: true
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
          bot_direction: { type: "string", title: "Tote Id", value: botDirection.charAt(0).toUpperCase() + botDirection.slice(1) },
          storable_direction: { type: "string", title: "Tote Id", value: initialStorableDirection},
        }
      });
    }
    this.setState({ show: !this.state.show, formData: {} });
  }
  onSubmitHandler = (onSubmit, barcode, ioPointId, nextToteStorableId, existingTotes) => {
    let finalSetOfTotes = {};
    for (let key in this.state.multiSchema) {
      let tote = this.state.multiSchema[key];
      finalSetOfTotes[tote.tote_id.value] = {
        "barcode": barcode,
        "io_point_id": ioPointId,
        "next_tote_storable_id": tote.tote_id.value,
        "agent": this.state.schema.agent,
        "bot_direction": this.state.schema.bot_direction,
        "io_point": this.state.schema.io_point,
        "storable_direction": this.state.schema.storable_direction,
        "ndeep": tote.ndeep,
        "tote_height": tote.tote_height,
        "tote_id": tote.tote_id,
        "tote_location": tote.tote_location,
        "tote_type": tote.tote_type
      }
    }
    var error = false;
    var message = "";
    if(!error){
      for (let key in this.state.multiSchema){
        if(this.state.schema.storable_direction.value.length===0){
          error = true;
          message = "Storable direction cannot be empty"; 
          break;
        }
        if(this.state.multiSchema[key].tote_height.value===''||this.state.multiSchema[key].tote_height.value<0){
          error = true;
          message = "Tote height cannot be empty"; 
          break;
        }
        if(this.state.multiSchema[key].tote_height.value>10000){
          error = true;
          message = "Tote height should be less than 10m"; 
          break;
        }
        if(this.state.multiSchema[key].ndeep.value===''){
          error = true;
          message = "Ndeep value cannot be empty"; 
          break;
        }
        if(this.state.multiSchema[key].edit===true){
          error = true;
          message = "You have unsaved changes. Please confirm them."; 
          break;
        }
      };
    }
    if (!error) {
      let data = {
        "schema": this.state.schema,
        "multiSchema": this.state.multiSchema
      }
      onSubmit(data, barcode, ioPointId, nextToteStorableId, finalSetOfTotes);
      this.toggle();
    } else {
      alert(message);
    }
  };
  addNewRow = (nextToteStorableId, existingTotes) => {
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
    multiSchema[nextId] = {
      tote_id: { type: "string", title: "Tote Id", value: nextId },
      tote_location: { type: "string", title: "Tote Location", value: 'TOT_'+String(nextId).padStart(7, '0') },
      tote_type: { type: "string", title: "Tote Type", value: "Type_1" },
      tote_height: { type: "string", title: "Tote Height", value: "" },
      ndeep: { type: "string", title: "ndeep", value: "single" },
      edit: true
    };
    this.setState({ multiSchema: multiSchema });
  }
  changeSchemaHandler = (field, value) => {
    var schema = { ...this.state.schema };
    if (field == "storable_direction") schema.storable_direction.value = value;
    this.setState({ schema: schema });
  };
  changeMultiSchemaHandler = (key, field, value) => {
    var multiSchema = { ...this.state.multiSchema };
    if (field == "tote_height") multiSchema[key].tote_height.value = value;
    if (field == "ndeep") multiSchema[key].ndeep.value = value;
    this.setState({ multiSchema: multiSchema });
  };
  deleteRow = (key) => {
    var multiSchema = { ...this.state.multiSchema };
    delete multiSchema[key];
    this.setState({ multiSchema: multiSchema });
  };
  // editClick = (e,key) => {
  //   var multiSchema = { ...this.state.multiSchema };
  //   console.log(">>>>>>> edit val:",e.target.value)
  //   multiSchema[key].edit = e.target.value==="OK" ? false : true;
  //   this.setState({ multiSchema: multiSchema });
  // };
  editClick = (key) => {
    var multiSchema = { ...this.state.multiSchema };
    multiSchema[key].edit = !multiSchema[key].edit;
    this.setState({ multiSchema: multiSchema });
  };
  reAssignKeys = (multiSchema) => {
    var multiSchemaObj = {};
    Object.keys(multiSchema).forEach((key, index) => {
      multiSchemaObj[index] = multiSchema[key];
    });
    this.setState({ multiSchema: multiSchemaObj });
  }
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
      storableDirections,
      existingTotes,
      ...rest
    } = this.props;

    const storableDirectionsOptions = [];
    if(storableDirections){
      for (let direction of storableDirections){
        const label = direction.charAt(0).toUpperCase() + direction.slice(1);
        storableDirectionsOptions.push({value: direction, label: label})
      }
    }
    var multiRows = [];
    var _this = this;
    if(_this.state.multiSchema){
      Object.keys(_this.state.multiSchema).forEach(function (key, index) {
        multiRows.push(<div key={"rack-" + index}>
          <div className="row">
            <div className="col-lg-10 col-md-10 col-sm-10 col-10">
              <div className="form-group field">
                <div className="row">
                  <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                    <input className="form-control" type="text" key={"tote_location" + index} 
                      value={_this.state.multiSchema[key].tote_location.value} 
                    />
                  </div>
                  <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                    <input className="form-control" type="text" key={"tote_type" + index}
                      value={_this.state.multiSchema[key].tote_type.value}
                    />
                  </div>
                  <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                    <input className="form-control" type="number" key={"tote_height" + index} 
                      min="1" max="10000"
                      placeholder={"Enter..."} 
                      onChange={(e) => _this.changeMultiSchemaHandler(key, "tote_height", e.target.value)} 
                      value={_this.state.multiSchema[key].tote_height.value} 
                      disabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                  <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                    <Select
                      value={_this.state.multiSchema[key].ndeep.value}
                      onChange={(selected) => _this.changeMultiSchemaHandler(key, "ndeep", selected)}
                      options={ndeepOptions}
                      isDisabled={!_this.state.multiSchema[key].edit}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="col-lg-1 col-md-1 col-sm-1 col-1">
              <span onClick={() => _this.deleteRow(key)} style={{
                justifyContent: "center",
                display: "flex",
              }}><i class="fa fa-times" aria-hidden="true"></i></span>
            </div> */}
            <div className="col-lg-1 col-md-1 col-sm-1 col-1">
              <button
                id={"tote-delete-btn-"+index}
                className="btn"
                type="button"
                onClick={() => _this.deleteRow(key)}
              >
                <i className="fa fa-times" />
              </button>
            </div>
            {/* <div className="col-lg-1 col-md-1 col-sm-1 col-1" style={{ cursor: 'pointer' }}>
              <i className="fa fa-times" onClick={() => _this.deleteRow(key)} style={{ cursor: 'pointer' }}/>
            </div> */}
            {/* <div className="col-lg-1 col-md-1 col-sm-1 col-1">
              <input type="button" value={_this.state.multiSchema[key].edit?"OK":"EDIT"} 
                onClick={(e) => _this.editClick(e,key)}></input>
            </div> */}
            <div className="col-lg-1 col-md-1 col-sm-1 col-1">
              <button
                id={"tote-edit-btn"+index}
                className="btn"
                type="button"
                onClick={() => _this.editClick(key)}
              >
                {_this.state.multiSchema[key].edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
              </button>
            </div>
            {/* <div className="col-lg-1 col-md-1 col-sm-1 col-1" style={{ cursor: 'pointer' }}>
              {_this.state.multiSchema[key].edit ? 
                <i className="fa fa-check" onClick={() => _this.editClick(key)} />
                :
                <i className="fa fa-pencil-square-o" onClick={() => _this.editClick(key)} />} 
            </div> */}
          </div>
        </div>);
      })
    }
    return (
      <ButtonForm {...rest} modalClass="tote-location-modal" show={this.state.show} toggle={()=>this.toggle(ioPointBarcode, ioPointId, agent, botDirection, storableDirections, nextToteStorableId, existingTotes)} >
        <form>
          <div>
            <legend id="root__title">{schema.title}</legend>
            <hr />
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      IO Point
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      Agent
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      Bot Direction
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      Storable Direction
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-11 col-md-11 col-sm-11 col-11">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      <input className="form-control" type="text" 
                        value={this.state.schema.io_point.value}  
                      />
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      <input className="form-control" type="text" 
                        value={this.state.schema.agent.value}  
                      />
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      <input className="form-control" type="text" 
                        value={this.state.schema.bot_direction.value} 
                      />
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      <Select
                        isMulti={true}
                        defaultValue={storableDirectionsOptions[0]}
                        value={_this.state.schema.storable_direction.value}
                        onChange={(selected) => _this.changeSchemaHandler("storable_direction", selected)}
                        options={storableDirectionsOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br/><br/>
            {Object.keys(this.state.multiSchema).length!==0 &&
            <div className="row">
              <div className="col-lg-10 col-md-10 col-sm-10 col-10">
                <div className="form-group field">
                  <div className="row">
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      Tote Location
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      Tote Type
                    </div>
                    <div className="col-4 col-lg-3 col-sm-3 col-md-3">
                      Tote Height(mm)
                    </div>
                    <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                      n-deep
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {multiRows}
            <button type="button" onClick={() => this.addNewRow(nextToteStorableId, existingTotes)} className="btn btn-outline-secondary mr-1">
              Add Tote Location
            </button>
            <br/><br/><br/>
          </div>
          <div>
            <button type="button" onClick={() => {
              this.onSubmitHandler(onSubmit, barcode, ioPointId, nextToteStorableId, existingTotes);
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
