// Will use this component for both entry and exit barcodes since they are mostly the same
import React, { Component } from "react";
import ButtonForm from "./Util/ButtonForm";
import { Modal } from 'reactstrap';

class CreateHaiTemplate extends Component {
  state = {
        show: false,
        schema: {},
        show_error:false,
        error_text:"",
        warningModalShow:false
    };
  toggle = (template_name=null,length=null,breadth=null,height=null,tray_count=null
    ,port_type=null,template_id=null) => {
    let initialSchema = {
            template_display_name : {
                display_name: template_name,
                edit: false,
                error: ''
            },
            port_type: {
                port_type:port_type,
                edit:false,
                error:''
            },
            tray_count:{
                tray_count:tray_count,
                edit:false,
                error:""
            },
            agent:{
                agent_name:"HAI-TTP-A42D",
            },
            dimension:{
                length:length,
                breadth:breadth,
                height:height,
                edit:false,
                error:""
            }
        };
    this.setState({
            schema: initialSchema,
        });
    this.setState({ show: !this.state.show ,formData: {},show_error:false,error_text:""});
  }
  changeSchemaHandler = (field, value, floor_barcodes=null, conveyorInfo=null) => {
        var schema = { ...this.state.schema };
        if (field == "display_name") {
            schema.template_display_name.display_name = value;
            schema.template_display_name.error = '';
        }
        if (field == "tray_count") {
            schema.tray_count.tray_count = value;
            schema.tray_count.error = '';
        }
        if (field == "port_type") {
            schema.port_type.port_type = value;
            schema.port_type.error = '';
        }
        if (field == "length") {
            schema.dimension.length = value;
            schema.dimension.error = '';
        }
        if (field == "breadth") {
            schema.dimension.breadth = parseInt(value);
            schema.dimension.error = '';
        }
        if (field == "height") {
            schema.dimension.height = parseInt(value);
            schema.dimension.error = '';
        }
        
        this.setState({ schema: schema });
    };
  editRow = (field,haiTemplateData=null,template_id=null) => {
        var schema = { ...this.state.schema };
        if(field==="display_name"){
            if(schema.template_display_name.display_name !=""){
                var template_name_list = []
                for (const [key, value] of Object.entries(haiTemplateData)) {
                    if(template_id !== value["template_id"]){
                        template_name_list.push(value.template_display_name)
                    }
                }
                if(template_name_list.includes(schema.template_display_name.display_name)){
                    schema.template_display_name.error = 'Please choose a unique template name';
                }else{
                    schema.template_display_name.edit = !schema.template_display_name.edit;
                    schema.template_display_name.error = '';
                }
                
            }else{
                schema.template_display_name.error = 'This is a mendatory field';
            }
            
        }
        if(field==="tray_count"){
            if(schema.tray_count.tray_count !=""){
                if(schema.tray_count.tray_count<1){
                    schema.tray_count.error = 'Value must be greater than or equal to 1';
                    schema.tray_count.edit = schema.tray_count.edit;
                }
                else{
                    schema.tray_count.edit = !schema.tray_count.edit;
                    schema.tray_count.error = '';
                }
            }else{
                schema.tray_count.error = 'This is a mendatory field';
            }
            
        }
        if(field==="port_type"){
            if(schema.port_type.port_type !=""){
                schema.port_type.edit = !schema.port_type.edit;
                schema.port_type.error = '';
            }else{
                schema.port_type.error = 'This is a mendatory field';
            }
        }
        if(field==="dimension"){
            if(schema.dimension.length ==="" || schema.dimension.breadth ==="" || schema.dimension.height ===""){
                schema.dimension.error = 'Length,Breadth,Height are mandatory field';
            }else{
                if(schema.dimension.length<1){
                    schema.dimension.error = 'Value of length must be greater than or equal to 1';
                    schema.dimension.edit = schema.dimension.edit;
                }
                else if(schema.dimension.breadth <1){
                    schema.dimension.error = 'Value of breadth must be greater than or equal to 1';
                    schema.dimension.edit = schema.dimension.edit;
                }
                else if(schema.dimension.height <1){
                    schema.dimension.error = 'Value of height must be greater than or equal to 1';
                    schema.dimension.edit = schema.dimension.edit;
                }
                else{
                    schema.dimension.edit = !schema.dimension.edit;
                    schema.dimension.error = '';
                }
            }
            
        }
        
        this.setState({ schema: schema });
    };
    onSubmitHandler = (onSubmit, nextTemplateId,warningModalShow) => {
        var schema = { ...this.state.schema };
        var error = false;
        if(!error){
            for (let key in schema) {
                if(schema[key].edit === true) {
                    error = true;
                    schema[key].error = "You have unsaved changes. Please confirm them.";
                }
            };
        }
        
        this.setState({ schema: schema });
        if (!error) {
            this.setState({
                warningModalShow : true,
            })
            
        }
    };
    handleConveyorOKClick(onSubmit,nextTemplateId){
        const {dispatch} = this.props;
        var schema = { ...this.state.schema };
        let data = {
                "schema": schema,
                "template_id":nextTemplateId
            }
        this.setState({
          warningModalShow : false
        })
        onSubmit(data);
        this.toggle();
    }
    onRemoveHandler = (onSubmit) => {
        var schema = { ...this.state.schema };
        let formData = {
                "schema": schema,
            }
        this.toggle();
        onSubmit(formData,true);

    };

  render() {
    const { 
        onSubmit,
        nextTemplateId,
        template_name,
        port_type,
        tray_count,
        length,
        breadth,
        height,
        template_id,
        port_data_list,
        haiTemplateData,
        ...rest 
    } = this.props;
    const { show,schema,show_error,error_text,warningModalShow} = this.state;
    return (
      <div>  
      <ButtonForm
        show={this.state.show}
        toggle={() => this.toggle(template_name,length,breadth,height,tray_count,port_type,template_id)}
        buttonText={<i className="fas fa-edit"/>}
        small={true}
        extraClassName="hai-edit-button"
        modalClass="manage-conveyor-modal" 
        wrapInButtonGroup={false}
      >
       {Object.keys(this.state.schema).length!==0 &&
       <form>
         <div style={{padding:"0px 20px"}}>
                        <legend id="root__title">Ranger Port (HAI Port) Template</legend>
                        <hr />
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Template Display Name
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="text"
                                    defaultValue={this.state.schema.template_display_name.display_name}
                                    onChange={(e) => this.changeSchemaHandler("display_name", e.target.value)} 
                                    disabled={!this.state.schema.template_display_name.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => this.editRow("display_name",haiTemplateData,template_id)}
                                >
                                    {this.state.schema.template_display_name.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {this.state.schema.template_display_name.error!=='' && <span style={{color:"red",marginLeft:'15px', marginTop:"10px"}}>{this.state.schema.template_display_name.error}</span>}
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Ranger Port Type
                            </div>
                            <div className="col-6 col-lg-6 col-sm-6 col-md-6">
                                <select 
                                    className="form-control" 
                                    style={{  width: "100%" }}
                                    defaultValue={this.state.schema.port_type.port_type}
                                    disabled={!this.state.schema.port_type.edit ? true : false} 
                                    onChange={(e) => this.changeSchemaHandler("port_type", e.target.value)}
                                    >
                                    <option class="placeholder" selected disabled value="">Select</option>
                                    <option value="unloader">Unloader (Conveyor Entry)</option>
                                    <option value="loader">Loader (Conveyor Exit)</option>
                                    
                                </select>
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                {port_data_list.length ===0 ? 
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => this.editRow("port_type")}
                                    >
                                    {this.state.schema.port_type.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                    </button>:
                                    <span>
                                            <button
                                                className="btn hai-template-edit"
                                                type="button"
                                                onClick={() => this.editRow("port_type")}
                                                disabled
                                            >
                                                <i className="fas fa-edit"/>
                                                     <span class="tooltiptext">In order to the change the Ranger Port Type, 
                                                     you must first delete all Ranger Ports linked to this template.
                                                    </span>
                                            </button>
                                            

                                    </span>
                                }
                            </div>
                            {this.state.schema.port_type.error!=='' && <span style={{color:"red",marginLeft:'15px', marginTop:"10px"}}>{this.state.schema.port_type.error}</span>}
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
                                    min = "1"
                                    defaultValue={this.state.schema.tray_count.tray_count}
                                    onChange={(e) => this.changeSchemaHandler("tray_count", e.target.value)} 
                                    disabled={!this.state.schema.tray_count.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => this.editRow("tray_count")}
                                >
                                    {this.state.schema.tray_count.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {this.state.schema.tray_count.error!=='' && <span style={{color:"red",marginLeft:'15px', marginTop:"10px"}}>{this.state.schema.tray_count.error}</span>}
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
                                    defaultValue={this.state.schema.agent.agent_name}
                                    disabled={true}
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
                                          min="1"
                                          placeholder={"Enter..."} 
                                          defaultValue={this.state.schema.dimension.length}
                                          onChange={(e) => this.changeSchemaHandler("length", e.target.value)}
                                          disabled={!this.state.schema.dimension.edit ? true : false} 
                                        />
                                    </div>
                                    <div style={{width:"230px",margin:"5px 15px"}}>
                                        <input className="form-control" type="number"
                                          min="1"
                                          placeholder={"Enter..."} 
                                          defaultValue={this.state.schema.dimension.breadth}
                                          onChange={(e) => this.changeSchemaHandler("breadth", e.target.value)}
                                          disabled={!this.state.schema.dimension.edit ? true : false}  
                                        />  
                                    </div>
                                    <div style={{width:"230px",margin:"5px 15px"}}>
                                        <input className="form-control" type="number"
                                          min="1"
                                          placeholder={"Enter..."} 
                                          defaultValue={this.state.schema.dimension.height}
                                          onChange={(e) => this.changeSchemaHandler("height", e.target.value)} 
                                          disabled={!this.state.schema.dimension.edit ? true : false} 
                                        />
                                    </div>
                                    <div style={{marginLeft: "10px"}}>
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => this.editRow("dimension")}
                                    >
                                        {this.state.schema.dimension.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                    </button>
                                    </div>
                                    {this.state.schema.dimension.error!=='' && <span style={{color:"red",marginLeft:'15px', marginTop:"10px"}}>{this.state.schema.dimension.error}</span>}
                                </div>

                        </div>
        </div>
        <br/>
         <div style={{margin:"0px 10px"}}>
            <button type="button" style = {{width:"100px"}} onClick={() => {
              this.onSubmitHandler(onSubmit,template_id,warningModalShow);
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
            {port_data_list.length ===0 ? 
            <button
                type="button"
                className="btn btn-outline-danger"
                style={{ float: "right" }}
                onClick={() => {
                    this.onRemoveHandler(onSubmit);
                    this.toggle();
                }}
            >
                Delete Template
            </button>:
            <span>
                    <button
                        type="button"
                        className="btn btn-outline-danger hai-delete-button"
                        style={{ float: "right" }}
                        onClick={() => {
                            this.onRemoveHandler(onSubmit);
                            this.toggle();
                        }}
                        disabled
                    >
                        Delete Template
                    <span class="tooltiptext">In order to delete this Template, 
                            you must first delete all Ranger Ports linked to this template.</span>
                    </button>
                    

            </span>
        }
          </div>

       </form>
        }  
      </ButtonForm>
      <Modal isOpen={this.state.warningModalShow} toggle = {() => {this.setState({warningModalShow: !this.state.warningModalShow})}} className = "confirmation-modal">
                <span>All Ranger Port Associated with this Template ({template_name}) will have their properties updated.</span>
                <br/>
                <span> Are you sure you want to proceed?</span>
                <br></br>
                <div>
                  <button onClick={() => {this.handleConveyorOKClick(onSubmit,template_id)}} className="btn btn-outline-primary mr-1">
                    Confirm
                    </button>
                  <button className="btn btn-outline-danger" onClick={() => {
                    this.setState({
                      warningModalShow: false
                    })
                  }}
                  >Cancel
                  </button>
                </div>
        </Modal>  
        </div>
    );
  }
}

export default CreateHaiTemplate;
