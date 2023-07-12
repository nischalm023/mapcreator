import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import { getIoPoint } from "../../../../actions/conveyor";

const direction_mapping = {0:"North",1:"East",2:"South",3:"West"}
class BaseForm extends Component {
    state = {
        show: false,
        schema: {},
        show_error:false,
        error_text:""
    };
    
    toggle = (ConnectedconveyorTile=null) => {
        if(!ConnectedconveyorTile){
            this.setState({ show: !this.state.show, formData: {},show_error:false,error_text:"" });
            return;
        }
        let connected_point_info = [];
        if(ConnectedconveyorTile !==undefined && Object.keys(ConnectedconveyorTile).length>0){
                for (const [key, value] of Object.entries(ConnectedconveyorTile)){
                   connected_point_info.push({
                    source_id:ConnectedconveyorTile[key]["conveyor_id_source"],
                    destination_id:ConnectedconveyorTile[key]["conveyor_id_destination"],
                    tote_direction:ConnectedconveyorTile[key]["direction"],
                    source_tile_id:ConnectedconveyorTile[key]["source_conveyor_tile"],
                    destination_tile_id:ConnectedconveyorTile[key]["destination_conveyor_tile"],
                    nextConnectedConveyorId:ConnectedconveyorTile[key]["connected_conveyor_id"],
                    edit: false,
                    error: ''
                }) 
            }
        }
        
        let initialSchema = {
            connected_point_info: connected_point_info,
        };
        this.setState({
            schema: initialSchema,
        });
        this.setState({ show: !this.state.show, formData: {},show_error:false,error_text:"" });
    }

    changeMultiSchemaHandler = (key, field, value) => {
        var schema = { ...this.state.schema };
        if (field == "change_link_point") {
            if(schema.connected_point_info[key].source_tile_id !== value){
                var destination = schema.connected_point_info[key].source_tile_id
                var direction = (schema.connected_point_info[key].tote_direction + 2) % 4
                var source_id = schema.connected_point_info[key].destination_id
                var destination_id = schema.connected_point_info[key].source_id
            }else{
                var destination = schema.connected_point_info[key].destination_tile_id
                var direction = schema.connected_point_info[key].tote_direction
                var source_id = schema.connected_point_info[key].source_id
                var destination_id = schema.connected_point_info[key].destination_id
            }
            schema.connected_point_info[key].source_tile_id = value;
            schema.connected_point_info[key].destination_tile_id = destination;
            schema.connected_point_info[key].tote_direction = direction
            schema.connected_point_info[key].source_id = source_id
            schema.connected_point_info[key].destination_id = destination_id
            schema.connected_point_info[key].error = '';
        }
        this.setState({ schema: schema });
    };
    editConnectedPointRow = (key) => {
        var schema = { ...this.state.schema };
        schema.connected_point_info[key].edit = !schema.connected_point_info[key].edit ;
        schema.connected_point_info[key].error = '';
        this.setState({ schema: schema });
    };
    deleteConnectedPointRow = (key) => {
        var schema = { ...this.state.schema };
        schema.connected_point_info.splice(key, 1)
        this.setState({ schema: schema });
    };
    onSubmitHandler = (onSubmit) => {
        var schema = { ...this.state.schema };
        var error = false;
        if(!error){
            for (let key in schema) {
                if(key==="connected_point_info"){
                    for(let obj of schema[key]){
                        if(obj.edit === true){
                            error = true;
                            obj.error = "You have unsaved changes. Please confirm them.";
                        }
                    }
                }
            };
        }
        this.setState({ schema: schema });
        if (!error) {
            let data = {
                "schema": schema,
            }
            onSubmit(data);
            this.toggle();
        }
    };
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
            schema = { ...schema },
            onSubmit,
            ConnectedconveyorTile,
            floor_barcodes,
            ...rest
        } = this.props;
        var multiConnectedPointRows = [];
        var _this = this;
        if(Object.keys(_this.state.schema).length!==0){
            Object.keys(_this.state.schema.connected_point_info).forEach(function (key, index) {
                multiConnectedPointRows.push(
                    <div>
                        <div key={"connected-point-" + index} class="row" style={{marginBottom:"5px"}}>
                            <div style={{margin:"0px 20px",width:"175px"}}>
                                <input 
                                    className="form-control" 
                                    type="text"
                                    value={`${_this.state.schema.connected_point_info[key].source_id} -> ${_this.state.schema.connected_point_info[key].destination_id}`}
                                    disabled 
                                />
                            </div>
                            <div style={{ width: "150px",margin: "0px 10px" }}>
                                <select
                                    className="form-control"
                                    name="source_barcode"
                                    disabled={!_this.state.schema.connected_point_info[key].edit ? true : false}
                                    defaultValue={floor_barcodes[_this.state.schema.connected_point_info[key].source_tile_id]["barcode"]}
                                    value={floor_barcodes[_this.state.schema.connected_point_info[key].source_tile_id]["barcode"]}
                                    onChange={(e) => _this.changeMultiSchemaHandler(key, "change_link_point", e.target.value)}
                                >
                                    <option value={_this.state.schema.connected_point_info[key].source_tile_id}>{floor_barcodes[_this.state.schema.connected_point_info[key].source_tile_id]["barcode"]}</option>
                                    <option value={_this.state.schema.connected_point_info[key].destination_tile_id}>{floor_barcodes[_this.state.schema.connected_point_info[key].destination_tile_id]["barcode"]}</option>
                                </select>
                            </div>
                            <div style={{ width: "150px",margin:"0px 18px"}}>
                                <input
                                    className="form-control"
                                    type="text"
                                    defaultValue={floor_barcodes[_this.state.schema.connected_point_info[key].destination_tile_id]["barcode"]}
                                    value={floor_barcodes[_this.state.schema.connected_point_info[key].destination_tile_id]["barcode"]}
                                    name="destination_barcode"
                                    disabled
                                />
                            </div>
                            <div style={{ width: "150px",margin: "0px 15px" }}>
                                <input
                                    className="form-control"
                                    type="text" 
                                    defaultValue={direction_mapping[_this.state.schema.connected_point_info[key].tote_direction]}
                                    value={direction_mapping[_this.state.schema.connected_point_info[key].tote_direction]}
                                    name="quantity"
                                    disabled
                                />
                            </div>
                            <div style={{margin:"0px 5px"}}>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => _this.editConnectedPointRow(key)}
                                >
                                    {_this.state.schema.connected_point_info[key].edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => _this.deleteConnectedPointRow(key)}
                                >
                                    <i className="fa fa-times" />
                                </button>
                            </div>
                        </div>
                        
                        {_this.state.schema.connected_point_info[key].error!=='' && 
                            
                            <div
                                style={{color:"red" ,padding:"0px 0px 10px"}}>
                                    {_this.state.schema.connected_point_info[key].error}
                            </div>
                        }
                        <div id={"step_id_span_"+index}></div>
                    </div>
                );
            })
        }
        
        return (
            <ButtonForm {...rest} modalClass="manage-conveyor-modal" show={this.state.show} toggle={() => this.toggle(ConnectedconveyorTile)} >
               {Object.keys(this.state.schema).length!==0 &&
               <form>
                    <div style={{padding:"0px 20px"}}>
                        <legend id="root__title">{schema.title}</legend>
                        <hr />
                        {_this.state.schema.connected_point_info.length !== 0 && 
                            <div class="row" style={{paddingBottom:"5px"}}>
                                <div style={{margin:"0px 20px"}}>
                                    Connected Conveyor ID
                                </div>
                                <div style={{margin:"0px 16px"}}> 
                                    Origin Barcode
                                </div>
                                <div style={{margin:"0px 55px"}}>
                                    Destination Barcode
                                </div>
                                <div style={{margin:"0px 32px"}}>
                                    Tote Direction
                                </div>
                            </div>
                        }
                        {multiConnectedPointRows}
                        {this.state.show_error &&
                            <div style={{color:"red", marginLeft:"10px", marginTop:"10px"}}>{this.state.error_text} <br/></div>
                        }
                    
                    <div style={{padding:"15px"}}>
                        <button type="button" 
                            style={{marginLeft:"-10px"}}
                            onClick={() => {
                                this.onSubmitHandler(onSubmit);
                            }}
                            className="btn btn-outline-primary mr-1">
                            Submit
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={()=>{
                                this.toggle(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            style={{ float: "right",margin:"0px -10px" }}
                            onClick={() => {
                                this.onRemoveHandler(onSubmit);
                                this.toggle();
                            }}
                        >
                            Remove All Connected Conveyors
                        </button>
                    </div>
                    </div>
                </form>
                
                }
            </ButtonForm>
        );
    }
}

export default BaseForm;
