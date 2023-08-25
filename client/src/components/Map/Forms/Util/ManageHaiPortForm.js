// Will use this component for both entry and exit barcodes since they are mostly the same
import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import { Modal } from 'reactstrap';

const mappingDirections = {
    0: "North",
    1: "East",
    2: "South",
    3: "West"
}

class ManageHaiPort extends Component {
  state = {
        show: false,
        schema: {},
        show_error:false,
        error_text:"",
        warningModalShow:false
    };
  toggle = (floor_barcodes,port_info=null) => {
    if(port_info !== null){
        let initialSchema = {
            port_name : {
                port_name: port_info.port_id_value,
                edit: false,
                error: ''
            },
        };
    this.setState({
            schema: initialSchema,
        });
    }
    
    this.setState({ show: !this.state.show ,formData: {},show_error:false,error_text:""});
  }
    onSubmitHandler = (onSubmit,port_id,original_port_value) => {
        var schema = { ...this.state.schema };
        var error = ''
        var data={"port_id":port_id,
                "port_val":schema.port_name.port_name,
                "old_port_val":original_port_value
            }
        if(schema.port_name.edit === true) {
            error = true;
            schema.port_name.error = "You have unsaved changes. Please confirm them.";
                }
        this.setState({ schema: schema });
        if(!error){
            onSubmit(data);  
            this.toggle(); 
        }
        
    };
    
    editRow = (field,all_port_list) => {
        var schema = { ...this.state.schema };
        if(field==="port_name"){
            if(schema.port_name.edit && all_port_list.includes(schema.port_name.port_name)){
                schema.port_name.edit = schema.port_name.edit;
                schema.port_name.error = 'Please choose a unique ID';
            }else{
                schema.port_name.edit = !schema.port_name.edit;
                schema.port_name.error = '';
            }
            
        }
        
        this.setState({ schema: schema });
    };
    changeSchemaHandler = (field, value) => {
        var schema = { ...this.state.schema };
        if (field == "port_name") {
            schema.port_name.port_name = value;
            schema.port_name.error = '';
        }
        this.setState({ schema: schema });
    };
    onRemoveHandler = (onSubmit,port_info=null) => {
        let formData = {
            "port_info":port_info
        }
        onSubmit(formData,true);
    };
  render() {
    const {
        schema = { ...schema }, 
        onSubmit,
        floor_barcodes,
        port_info,
        buttonText,
        disabled,
        all_port_list,
        ...rest 
    } = this.props;
    const { show,show_error,error_text,warningModalShow} = this.state;
    if(floor_barcodes==undefined || Object.keys(floor_barcodes).length===0 || floor_barcodes == null || Object.keys(port_info).length==0){
        return(
            <div>
             <ButtonForm
                {...rest}
                modalClass="manage-update-conveyor-modal"
                buttonText="Manage Hai Port" 
                disabled={true}
              >
            </ButtonForm>  
            </div>

            );
    }
    return (
      <div>  
      <ButtonForm
        {...rest}
        show={this.state.show}
        toggle={() => this.toggle(floor_barcodes,port_info)}
        modalClass="manage-update-conveyor-modal"
        buttonText="Manage Hai Port" 
        disabled={disabled}
      >
       {Object.keys(this.state.schema).length!==0 &&
       <form>
         <div style={{padding:"0px 20px"}}>
                        <legend id="root__title">Manage Ranger Port (HAI Port)</legend>
                        <hr />
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Ranger Port ID
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={this.state.schema.port_name.port_name}
                                    onChange={(e) => this.changeSchemaHandler("port_name", e.target.value)} 
                                    disabled={!this.state.schema.port_name.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => this.editRow("port_name",all_port_list)}
                                >
                                    {this.state.schema.port_name.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {this.state.schema.port_name.error!=='' && <span style={{color:"red",marginLeft:'15px', marginTop:"10px"}}>{this.state.schema.port_name.error}</span>}
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Template ID
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={port_info["template_display_name"]}
                                    disabled
                                />
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Tray Count
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="number"
                                    defaultValue={port_info["tray_count"]}
                                    disabled
                                />
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Supported Agents
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={port_info["support_agent"]}
                                    disabled
                                />
                            </div>
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Ranger Port Type
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={port_info["port_type"]}
                                    disabled
                                />
                            </div>
                        </div>
                        <br/>
                        <div className="hai-port-box-buttons">
                               <div class="row">
                                    <div style={{marginLeft:"15px"}}>
                                        Length
                                    </div>
                                    <div style={{marginLeft:"212px"}}>
                                        Breadth    
                                    </div>
                                    <div style={{marginLeft:"205px"}}>
                                        Height
                                    </div>
                                </div>
                                <div class="row">
                                    <div style={{width:"230px",margin:"5px 15px 15px"}}>
                                        <input className="form-control" type="number"
                                          defaultValue={port_info["length"]}
                                          disabled
                                        />
                                    </div>
                                    <div style={{width:"230px",margin:"5px 15px"}}>
                                        <input className="form-control" type="number"
                                        defaultValue={port_info["breadth"]}
                                        disabled
                                        />
                                    </div>
                                    <div style={{width:"230px",margin:"5px 15px"}}>
                                        <input className="form-control" type="number"
                                        defaultValue={port_info["height"]}
                                        disabled
                                        />
                                    </div>
                                </div>

                        </div>
                        <hr />
        <div class="row">
            {port_info["port_type"]==="unloader"?<div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Conveyor Entry Height
            </div>:<div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Conveyor Exit Height
            </div>}
            
            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                <input
                    style={{ width: "100%" }}
                    className="form-control"
                    type="text"
                    defaultValue={port_info["entity_height"]}
                    disabled
                />
            </div>
        </div>
        <br/>
        <div class="row">
            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Bot Orientation
            </div>
            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                <input
                    style={{ width: "100%" }}
                    className="form-control"
                    type="text"
                    defaultValue={mappingDirections[port_info["direction"]]}
                    disabled
                />
            </div>
        </div>
        <br/>
        <div class="row">
            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Conveyor Intraction Point
            </div>
            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                <input
                    style={{ width: "100%" }}
                    className="form-control"
                    type="text"
                    defaultValue={floor_barcodes[port_info["entity_point"]]["barcode"]}
                    disabled
                />
            </div>
        </div>
        <br/>
        <div class="row">
            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Linked I/O Point
            </div>
            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                <input
                    style={{ width: "100%" }}
                    className="form-control"
                    type="text"
                    defaultValue={port_info["io_point"] === ""? port_info["io_point"]:floor_barcodes[port_info["io_point"]]["barcode"]}
                    disabled
                />
            </div>
        </div>
        <br/>
        <div class="row">
            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                Ranger Port Point
            </div>
            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                <input
                    style={{ width: "100%" }}
                    className="form-control"
                    type="text"
                    defaultValue={floor_barcodes[port_info["port_coordinate"]]["barcode"]}
                    disabled
                />
            </div>
        </div>
        <br/>
        </div>
        <br/>
        

         <div style={{margin:"0px 10px"}}>
            <button type="button" style = {{width:"100px"}} onClick={() => {
              this.onSubmitHandler(onSubmit,port_info.port_id,port_info.port_id_value);
            }}
              className="btn btn-outline-primary mr-1">
              Update
            </button>
            <button
              type="button"
              style = {{width:"100px"}}
              className="btn btn-outline-secondary"
              onClick={this.toggle}
            >
              Cancel
            </button>
            <button
                type="button"
                className="btn btn-outline-danger"
                style={{ float: "right" }}
                onClick={() => {
                    this.onRemoveHandler(onSubmit,port_info);
                    this.toggle();
                }}
            >
                Delete Ranger Port
            </button>
          </div>


       </form>
        }
      </ButtonForm>
    </div>
    );
  }
}

export default ManageHaiPort;
