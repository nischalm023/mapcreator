import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import { getIoPoint } from "../../../../actions/conveyor";

class BaseForm extends Component {
    state = {
        show: false,
        conveyor_display_name:"",
        step_dict:{},
        show_error:false,
        error_text:""
    };
    toggle = () => {
       this.setState({ show: !this.state.show,show_error:false,error_text:"",step_dict:{}});
    }

    
    handleSubmit = (event,onSubmit,conveyor_id) => {
       event.preventDefault();
       var data = {
                    conveyor_id: conveyor_id,
                    conveyor_display_name: this.state.conveyor_display_name,
                    conveyor_step_id:this.state.step_dict
                }
       var error = false;
       if(!error){
            var keys = Object.keys(this.state.step_dict);
            var dupe = false;
            var duplicate_list=[]
            for(var i=0;i<keys.length;i++){
             for(var j=i+1;j<keys.length;j++){
               if(this.state.step_dict[keys[i]] === this.state.step_dict[keys[j]]){
                 error = true;
                 duplicate_list.push(this.state.step_dict[keys[i]])
               }
             }
            }
            if(duplicate_list.length>0){
                var duplicate_step_id = [...new Set(duplicate_list)]
                var error_ = duplicate_step_id.join(",") 
                this.setState({show_error:true})
                this.setState({error_text:`Individual Step IDs should be unique. Duplicate Step IDs - (${error_}).`})
                }
            
       }
       if(!error){
            this.toggle();
            onSubmit(data);
       }
       
    };
    onChangeStepId = (key,val,step_dict) =>{
        this.state.step_dict[key] = val
        this.setState({show_error:false,error_text:""})
        this.setState(step_dict) 
    }
    render() {
        const {
            schema = { ...schema },
            onSubmit,
            nextConveyorId,
            selected_tile,
            buttonText,
            floor_barcodes,
            disabled,
            ...rest
        } = this.props;
        const { show,conveyor_display_name,step_dict} = this.state;
        let _this=this
        var multiStepPointRows = [];
        selected_tile.forEach(function (key, index) {
                multiStepPointRows.push(<div key={"active-point-" + index} class="row" style={{marginBottom:"5px" , width:"560px"}}>
                    <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                        <input className="form-control" type="tex" id={"quantity_"+index} disabled value={floor_barcodes[key]["barcode"]}/>
                    </div>
                    <div>
                        <input
                            id={"step_id_"+index}
                            style={{width:"220px"}}
                            onChange={(e)=>_this.onChangeStepId(key,e.target.value,step_dict)}
                            className="form-control"
                            type="text" 
                            name="quantity"
                            required
                        />
                    </div>
                </div>);
            })
        return (
            <div>
            <ButtonForm 
                buttonText={buttonText}
                show={show}
                toggle={()=>this.toggle()}
                disabled={disabled}
                modalClass="select-conveyor-modal"
            >
            <form onSubmit={(e)=>this.handleSubmit(e,onSubmit,nextConveyorId)}>
                <legend>Add Conveyor Details</legend>
                <div className="form-group" style={{padding:"0px 20px"}}>
                    <div class="row">
                        <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor ID 
                        </div>
                        <div className="col-7 col-lg-7 col-sm-7 col-md-7">
                            <input id="conveyor_id" className="form-control" type="text" value={nextConveyorId} disabled/>
                        </div>
                    </div>
                  <br/>
                  <div class="row">
                        <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor Display Name 
                        </div>
                        <div className="col-7 col-lg-7 col-sm-7 col-md-7">
                            <input id="conveyor_entry_height" 
                                onChange={(e)=>this.setState({conveyor_display_name: e.target.value})}
                                className="form-control" 
                                type="text" 
                                min="1" 
                                required
                            />
                        </div>
                    </div>
                  <br/>
                  </div>
                  <div className="conveyor-select-buttons">
                      <div class="row" style={{width:"560px"}}>
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Barcode
                            </div>
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Step ID
                            </div>
                        </div>
                      <div className="scrollable">
                       {multiStepPointRows}
                      </div>
                  </div>
                  <br/>
                  {this.state.show_error &&
                    <div style={{color:"red", marginLeft:"10px", marginTop:"-10px", marginBottom:"10px"}}>{this.state.error_text} <br/></div>
                    }
                    
                  <input type="submit" className="btn btn-outline-primary mr-1" style={{"marginLeft":"10px" }} value="Submit"></input>
                  <button

                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={this.toggle}
                  >
                      Cancel
                  </button>
            </form>
        </ButtonForm>
      </div>
    );
    }
}

export default BaseForm;
