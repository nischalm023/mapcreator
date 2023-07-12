// technically components should not be connected to app state but it's ok for our case.
import React,{ Component }  from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import SweetAlertError from "components/SweetAlertError";
import { connect } from "react-redux";
import { getBarcodes } from "../../../utils/selectors";
import { manageMultipleNeighbourData } from "actions/manageMultipleNeighbourBarcode";
import ButtonForm from "./Util/ButtonForm";

class manageStorableNeighbour extends Component {
    state = {
        error: undefined,
        show: false,
        north:"",
        south:"",
        east:"",
        west:"",
    };
    toggle = () => {
        this.setState({ 
          show: !this.state.show,
          error: undefined,
          north:"",
          south:"",
          east:"",
          west:"", 
        });
    }
    handleSubmit = (event,dispatch) => {
        event.preventDefault();
        if(this.state.north!==""){
          var north = this.state.north.split(",").map((val) => parseInt(val))
        }else{
          var north=this.state.north
        }
        if(this.state.south!==""){
          var south = this.state.south.split(",").map((val) => parseInt(val))
        }
        else{
          var south=this.state.south
        }
        if(this.state.west!==""){
          var west = this.state.west.split(",").map((val) => parseInt(val))
        }
        else{
          var west=this.state.west
        }
        if(this.state.east!==""){
          var east = this.state.east.split(",").map((val) => parseInt(val))
        }
        else{
          var east=this.state.east
        }
        const formData = {
            North:north,
            South:south,
            East:east,
            West:west
        };
        this.toggle()
        dispatch(manageMultipleNeighbourData(formData));
    };

    render() {
        const { error, show, north,south,east,west} = this.state;
        const { disabled ,dispatch,selected_tile,barcode} = this.props;
        var multiStepPointRows = [];
        Object.keys(selected_tile).forEach(function (key, index) {
              multiStepPointRows.push(<div key={"active-point-" + index} class="row" style={{marginBottom:"5px" , width:"520px"}}>
                  <div className="col-1 col-lg-10 col-sm-10 col-md-10">
                      <input className="form-control" type="tex" id={"quantity_"+index} disabled value={barcode[key]["barcode"]}/>
                  </div>
              </div>);
            })
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
                    buttonText="Multi Barcode Neighbour Edit"
                >
                    <form onSubmit={(e)=>this.handleSubmit(e,dispatch)}>
                        <legend>Multi Barcode Neighbour Edit</legend>
                        <div className="form-group">
                          <div className="neighbour-border">
                            <div class="row" style={{width:"560px"}}>
                                  <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                      Selected Barcode(s)
                                  </div>
                              </div>
                            <div className={(Object.keys(selected_tile).length > 2)  ? "scrollable-neighbour" : "scrollable-full-height"}>
                              {multiStepPointRows}
                            </div>
                          </div>
                          <br/>
                          <label className="col-5 col-lg-5 col-sm-5 col-md-5" for="direction">North*</label>
                            <select style={{width:"94%",margin:"0px 13px 12px"}} onChange={(e)=>this.setState({ north: e.target.value })} className="form-control" id="direction" name="pick-direction">
                              <option class="placeholder" selected disabled value="">Please choose form below options</option>
                              <option value="1,1,1">Bot Movement with Rack Allowed</option>
                              <option value="1,1,0">Bot Movement Allowed</option>
                              <option value="1,0,0">Adjacent Barcode Present</option>
                            </select>
                          <label className="col-5 col-lg-5 col-sm-5 col-md-5" for="direction">South*</label>
                            <select style={{width:"94%",margin:"0px 13px 12px"}} onChange={(e)=>this.setState({ south: e.target.value })} className="form-control" id="direction" name="pick-direction">
                              <option class="placeholder" selected disabled value="">Please choose form below options</option>
                              <option value="1,1,1">Bot Movement with Rack Allowed</option>
                              <option value="1,1,0">Bot Movement Allowed</option>
                              <option value="1,0,0">Adjacent Barcode Present</option>
                            </select>
                          <label className="col-5 col-lg-5 col-sm-5 col-md-5" for="direction">West*</label>
                            <select style={{width:"94%",margin:"0px 13px 12px"}} onChange={(e)=>this.setState({ west: e.target.value })} className="form-control" id="direction" name="pick-direction">
                             <option class="placeholder" selected disabled value="">Please choose form below options</option>
                             <option value="1,1,1">Bot Movement with Rack Allowed</option>
                              <option value="1,1,0">Bot Movement Allowed</option>
                              <option value="1,0,0">Adjacent Barcode Present</option>
                            </select>
                          <label className="col-5 col-lg-5 col-sm-5 col-md-5" for="direction">East*</label>
                            <select style={{width:"94%",margin:"0px 13px 20px"}} onChange={(e)=>this.setState({ east: e.target.value })} className="form-control" id="direction" name="pick-direction">
                              <option class="placeholder" selected disabled value="">Please choose form below options</option>
                              <option value="1,1,1">Bot Movement with Rack Allowed</option>
                              <option value="1,1,0">Bot Movement Allowed</option>
                              <option value="1,0,0">Adjacent Barcode Present</option>
                            </select>
                          <input type="submit" className="btn btn-outline-primary mr-1" value="Submit"></input>
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
            </div>
        );
    }
}

export default connect(
  state => ({
    barcode:getBarcodes(state),
    selected_tile:state.selection.mapTiles,
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
)(manageStorableNeighbour);
