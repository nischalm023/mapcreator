import React, { Component } from "react";
import ButtonForm from "./ButtonForm";
import { getIoPoint } from "../../../../actions/conveyor";


const exitEntryDirections = {
    0: "North",
    1: "East",
    2: "South",
    3: "West"
}
class BaseForm extends Component {
    state = {
        show: false,
        schema: {},
        originalConveyorId: '',
        entry_bot_direction_options: {North: 0, East: 1, South: 2, West: 3},
        exit_bot_direction_options: {North: 0, East: 1, South: 2, West: 3}
    };
    toggle = (conveyorInfo=null,floor_barcodes=null) => {
        console.log(">>>>>>> toggled!!")
        if(!conveyorInfo){
            this.setState({ show: !this.state.show, formData: {} });
            return;
        }
        let active_point_info = [];
        if(conveyorInfo.conveyor_active){
            for (const obj of conveyorInfo.conveyor_active){
                active_point_info.push({
                    active_point_pps: obj.pps_id,
                    active_point_coordinate: floor_barcodes[obj.conveyor_active_point[0]]["barcode"],
                    edit: false,
                    error: ''
                })
            }
        }
        let initialSchema = {
            conveyor_id_info : {
                conveyor_id: conveyorInfo.conveyor_id,
                edit: false,
                error: ''
            },
            conveyor_entry_height_info : {
                conveyor_entry_height: conveyorInfo.conveyor_entry_height?conveyorInfo.conveyor_entry_height:'',
                edit: false,
                error: ''
            },
            conveyor_exit_height_info : {
                conveyor_exit_height: conveyorInfo.conveyor_exit_height?conveyorInfo.conveyor_exit_height:'',
                edit: false,
                error: ''
            },
            active_point_info: active_point_info
        };
        if(conveyorInfo.conveyor_end){
            initialSchema["end_point_info"] = {
                end_point_coordinate: floor_barcodes[conveyorInfo.conveyor_end[0]]["barcode"],
                error: ''
            }
        }
        if(conveyorInfo.conveyor_exit && conveyorInfo.bot_orientation_exit !== "" 
                && conveyorInfo.exit_point_direction !== "" && conveyorInfo.conveyor_io_exit!==""){
            initialSchema["exit_point_info"] = {
                exit_point_coordinate: floor_barcodes[conveyorInfo.conveyor_exit[0]]["barcode"],
                exit_bot_orientation_direction: conveyorInfo.bot_orientation_exit,
                exit_direction: exitEntryDirections[conveyorInfo.exit_point_direction],
                exit_io_point_coordinate: floor_barcodes[JSON.parse(conveyorInfo.conveyor_io_exit).join(',')]["barcode"],
                edit: false,
                error: ''
            }
            let possibleBotDirections = []
            let all_directions = {North: 0, East: 1, South: 2, West: 3}
            if(parseInt(conveyorInfo.exit_point_direction) === 0 || parseInt(conveyorInfo.exit_point_direction) === 2){
                possibleBotDirections.push({value: all_directions["East"], label: "East"})
                possibleBotDirections.push({value: all_directions["West"], label: "West"})
            }
            if(parseInt(conveyorInfo.exit_point_direction) === 1 || parseInt(conveyorInfo.exit_point_direction) === 3){
                possibleBotDirections.push({value: all_directions["North"], label: "North"})
                possibleBotDirections.push({value: all_directions["South"], label: "South"})
            }
            this.setState({
                exit_bot_direction_options: possibleBotDirections,
            });
        }
        if(conveyorInfo.conveyor_entry && conveyorInfo.bot_orientation_entry !== "" 
                && conveyorInfo.entry_point_direction !== "" && conveyorInfo.conveyor_io_entry!==""){
            initialSchema["entry_point_info"] = {
                entry_point_coordinate: floor_barcodes[conveyorInfo.conveyor_entry[0]]["barcode"],
                entry_bot_orientation_direction: conveyorInfo.bot_orientation_entry,
                entry_direction: exitEntryDirections[conveyorInfo.entry_point_direction],
                entry_io_point_coordinate: floor_barcodes[JSON.parse(conveyorInfo.conveyor_io_entry).join(',')]["barcode"],
                edit: false,
                error: ''
            }
            let possibleBotDirections = []
            let all_directions = {North: 0, East: 1, South: 2, West: 3}
            if(parseInt(conveyorInfo.entry_point_direction) === 0 || parseInt(conveyorInfo.entry_point_direction) === 2){
                possibleBotDirections.push({value: all_directions["East"], label: "East"})
                possibleBotDirections.push({value: all_directions["West"], label: "West"})
            }
            if(parseInt(conveyorInfo.entry_point_direction) === 1 || parseInt(conveyorInfo.entry_point_direction) === 3){
                possibleBotDirections.push({value: all_directions["North"], label: "North"})
                possibleBotDirections.push({value: all_directions["South"], label: "South"})
            }
            this.setState({
                entry_bot_direction_options: possibleBotDirections,
            });
        }
        this.setState({
            schema: initialSchema,
            originalConveyorId: conveyorInfo.conveyor_id
        });
        this.setState({ show: !this.state.show, formData: {} });
    }
    changeSchemaHandler = (field, value, floor_barcodes=null, conveyorInfo=null) => {
        var schema = { ...this.state.schema };
        if (field == "conveyor_id_info") {
            schema.conveyor_id_info.conveyor_id = value;
            schema.conveyor_id_info.error = '';
        }
        if (field == "conveyor_entry_height_info") {
            schema.conveyor_entry_height_info.conveyor_entry_height = value;
            schema.conveyor_entry_height_info.error = '';
        }
        if (field == "conveyor_exit_height_info") {
            schema.conveyor_exit_height_info.conveyor_exit_height = value;
            schema.conveyor_exit_height_info.error = '';
        }
        let direction_mapping = {"North":0,"East":1,"South":2,"West":3}
        if (field == "exit_bot_orientation_direction") {
            schema.exit_point_info.exit_bot_orientation_direction = value;
            schema.exit_point_info.error = '';
        }
        if (field == "entry_bot_orientation_direction") {
            schema.entry_point_info.entry_bot_orientation_direction = value;
            schema.entry_point_info.error = '';
        }
        if (field == "exit_direction") {
            schema.exit_point_info.exit_direction = value
            schema.exit_point_info.error = '';
            var id = this.state.originalConveyorId
            var conveyorTile = {}
            conveyorTile[id] = conveyorInfo
            var exitCordinate = [conveyorInfo.conveyor_exit.toString()]
            var get_exit_io_point = floor_barcodes[(JSON.parse(conveyorInfo.conveyor_io_exit)).toString()]["barcode"]
            schema.exit_point_info.exit_io_point_coordinate = get_exit_io_point
            let possibleBotDirections = []
            let all_directions = {North: 0, East: 1, South: 2, West: 3}
            if(parseInt(value) === 0 || parseInt(value) === 2){
                possibleBotDirections.push({value: all_directions["East"], label: "East"})
                possibleBotDirections.push({value: all_directions["West"], label: "West"})
            }
            if(parseInt(value) === 1 || parseInt(value) === 3){
                possibleBotDirections.push({value: all_directions["North"], label: "North"})
                possibleBotDirections.push({value: all_directions["South"], label: "South"})
            }
            this.setState({
                exit_bot_direction_options: possibleBotDirections,
            });
        }
        if (field == "entry_direction") {
            schema.entry_point_info.error = '';
            schema.entry_point_info.entry_direction = value
            var id = this.state.originalConveyorId
            var conveyorTile = {}
            conveyorTile[id] = conveyorInfo
            var entryCordinate = [conveyorInfo.conveyor_entry.toString()]
            var get_entry_io_point = floor_barcodes[(JSON.parse(conveyorInfo.conveyor_io_entry)).toString()]["barcode"]
            schema.entry_point_info.entry_io_point_coordinate = get_entry_io_point
            let possibleBotDirections = []
            let all_directions = {North: 0, East: 1, South: 2, West: 3}
            if(parseInt(value) === 0 || parseInt(value) === 2){
                possibleBotDirections.push({value: all_directions["East"], label: "East"})
                possibleBotDirections.push({value: all_directions["West"], label: "West"})
            }
            if(parseInt(value) === 1 || parseInt(value) === 3){
                possibleBotDirections.push({value: all_directions["North"], label: "North"})
                possibleBotDirections.push({value: all_directions["South"], label: "South"})
            }
            this.setState({
                entry_bot_direction_options: possibleBotDirections,
            });
            }
        this.setState({ schema: schema });
    };
    changeMultiSchemaHandler = (key, field, value) => {
        var schema = { ...this.state.schema };
        if (field == "active_point_pps") {
            schema.active_point_info[key].active_point_pps = value;
            schema.active_point_info[key].error = '';
        }
        this.setState({ schema: schema });
    };
    editActivePointRow = (key) => {
        var schema = { ...this.state.schema };
        schema.active_point_info[key].edit = !schema.active_point_info[key].edit ;
        schema.active_point_info[key].error = '';
        this.setState({ schema: schema });
    };
    deleteActivePointRow = (key) => {
        var schema = { ...this.state.schema };
        schema.active_point_info.splice(key, 1)
        this.setState({ schema: schema });
    };
    editRow = (field) => {
        var schema = { ...this.state.schema };
        if(field==="conveyor_id_info"){
            schema.conveyor_id_info.edit = !schema.conveyor_id_info.edit;
            schema.conveyor_id_info.error = '';
        }
        if(field==="conveyor_entry_height_info"){
            schema.conveyor_entry_height_info.edit = !schema.conveyor_entry_height_info.edit;
            schema.conveyor_entry_height_info.error = '';
        }
        if(field==="conveyor_exit_height_info"){
            schema.conveyor_exit_height_info.edit = !schema.conveyor_exit_height_info.edit;
            schema.conveyor_exit_height_info.error = '';
        }
        if(field==="exit_point_info"){
            schema.exit_point_info.edit = !schema.exit_point_info.edit;
            schema.exit_point_info.error = '';
        }
        if(field==="entry_point_info"){
            schema.entry_point_info.edit = !schema.entry_point_info.edit;
            schema.entry_point_info.error = '';
        }
        this.setState({ schema: schema });
    };
    deleteRow = (field) => {
        var schema = { ...this.state.schema };
        if(field==="end_point_info") delete schema.end_point_info;
        if(field==="exit_point_info") delete schema.exit_point_info;
        if(field==="entry_point_info") delete schema.entry_point_info;
        this.setState({ schema: schema });
    };

    onSubmitHandler = (onSubmit, allConveyorIds) => {
        console.log(">>>>>>> submit clicked!!")
        var schema = { ...this.state.schema };
        var error = false;
        if(schema.conveyor_id_info.conveyor_id===''){
            error = true;
            schema.conveyor_id_info.error = "Conveyor Id cannot be empty.";
        }
        if(schema.conveyor_entry_height_info.conveyor_entry_height===''){
            error = true;
            schema.conveyor_entry_height_info.error= "Conveyor entry height cannot be empty.";
        }
        if(parseInt(schema.conveyor_entry_height_info.conveyor_entry_height)<=0){
            error = true;
            schema.conveyor_entry_height_info.error= "Conveyor entry height cannot be zero or negative.";
        }
        if(schema.conveyor_exit_height_info.conveyor_exit_height===''){
            error = true;
            schema.conveyor_exit_height_info.error = "Conveyor exit height cannot be empty.";
        }
        if(parseInt(schema.conveyor_exit_height_info.conveyor_exit_height)<=0){
            error = true;
            schema.conveyor_exit_height_info.error = "Conveyor exit height cannot be zero or negative.";
        }
        if(!error){
            // validate if entered conveyor id is unique
            if (this.state.originalConveyorId !== parseInt(schema.conveyor_id_info.conveyor_id) && allConveyorIds.includes(parseInt(schema.conveyor_id_info.conveyor_id))) {
                error = true;
                schema.conveyor_id_info.error = `Conveyor ID ${schema.conveyor_id_info.conveyor_id} already exists.`;
            }
        }
        if(!error){
            for (let key in schema) {
                if(key==="active_point_info"){
                    for(let obj of schema[key]){
                        if(obj.edit === true){
                            error = true;
                            obj.error = "You have unsaved changes. Please confirm them.";
                        }
                    }
                }
                else if(schema[key].edit === true) {
                    error = true;
                    schema[key].error = "You have unsaved changes. Please confirm them.";
                }
            };
        }
        this.setState({ schema: schema });
        if (!error) {
            let data = {
                "schema": schema,
                "originalConveyorId": this.state.originalConveyorId
            }
            onSubmit(data);
            this.toggle();
        }
    };
    onRemoveHandler = (onSubmit) => {
        let formData = {
            "conveyor_id":this.state.originalConveyorId
        }
        onSubmit(formData,true);
    };


    render() {
        const {
            schema = { ...schema },
            onSubmit,
            conveyorInfo,
            allConveyorIds,
            pps_ids,
            // entry_bot_direction_options,
            // exit_bot_direction_options,
            entry_direction_options,
            exit_direction_options,
            floor_barcodes,
            ...rest
        } = this.props;
        // var entryBotOrientationOptions = []
        // var exitBotOrientationOptions = []
        // for(let key in entry_bot_direction_options){
        //     entryBotOrientationOptions.push({value: entry_bot_direction_options[key], label: key})
        // }
        // for(let key in exit_bot_direction_options){
        //     exitBotOrientationOptions.push({value: exit_bot_direction_options[key], label: key})
        // }
        var entryDirectionOptions = []
        var exitDirectionOptions = []
        for(let key in entry_direction_options){
            entryDirectionOptions.push({value: entry_direction_options[key], label: key})
        }
        for(let key in exit_direction_options){
            exitDirectionOptions.push({value: exit_direction_options[key], label: key})
        }
        var multiActivePointRows = [];
        var _this = this;
        if(Object.keys(_this.state.schema).length!==0){
            Object.keys(_this.state.schema.active_point_info).forEach(function (key, index) {
                multiActivePointRows.push(<div key={"active-point-" + index} class="row" style={{marginBottom:"5px"}}>
                    <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                        <select
                            className="form-control"
                            style={{ width: "100%" }}
                            name="active_point_pps"
                            id="active_point_pps"
                            disabled={!_this.state.schema.active_point_info[key].edit ? true : false}
                            defaultValue={pps_ids[0]}
                            value={_this.state.schema.active_point_info[key].active_point_pps}
                            onChange={(e) => _this.changeMultiSchemaHandler(key, "active_point_pps", e.target.value)}
                        >
                            {pps_ids.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                        <input
                            style={{ width: "100%" }}
                            className="form-control"
                            type="text"
                            disabled
                            value={_this.state.schema.active_point_info[key].active_point_coordinate.toString()}
                        />
                    </div>
                    <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                        <button
                            className="btn"
                            type="button"
                            onClick={() => _this.editActivePointRow(key)}
                        >
                            {_this.state.schema.active_point_info[key].edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                        </button>
                        <button
                            className="btn"
                            type="button"
                            onClick={() => _this.deleteActivePointRow(key)}
                        >
                            <i className="fa fa-times" />
                        </button>
                    </div>
                    {_this.state.schema.active_point_info[key].error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.active_point_info[key].error}</span>}
                </div>);
            })
        }

        return (
            <ButtonForm {...rest} modalClass="manage-conveyor-modal" show={this.state.show} toggle={() => this.toggle(conveyorInfo,floor_barcodes)} >
                {Object.keys(this.state.schema).length!==0 &&
                <form>
                    <div>
                        <legend id="root__title">{schema.title}</legend>
                        <hr />
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor ID : 
                            </div>
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="number"
                                    value={this.state.schema.conveyor_id_info.conveyor_id}
                                    onChange={(e) => this.changeSchemaHandler("conveyor_id_info", e.target.value)} 
                                    disabled={!this.state.schema.conveyor_id_info.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => _this.editRow("conveyor_id_info")}
                                >
                                    {_this.state.schema.conveyor_id_info.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {_this.state.schema.conveyor_id_info.error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.conveyor_id_info.error}</span>}
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor Entry Height : 
                            </div>
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="number"
                                    value={this.state.schema.conveyor_entry_height_info.conveyor_entry_height}
                                    onChange={(e) => this.changeSchemaHandler("conveyor_entry_height_info", e.target.value)}
                                    disabled={!this.state.schema.conveyor_entry_height_info.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => _this.editRow("conveyor_entry_height_info")}
                                >
                                    {_this.state.schema.conveyor_entry_height_info.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {_this.state.schema.conveyor_entry_height_info.error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.conveyor_entry_height_info.error}</span>}
                        </div>
                        <br/>
                        <div class="row">
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                Conveyor Exit Height : 
                            </div>
                            <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                <input
                                    style={{ width: "100%" }}
                                    className="form-control"
                                    type="number"
                                    value={this.state.schema.conveyor_exit_height_info.conveyor_exit_height}
                                    onChange={(e) => this.changeSchemaHandler("conveyor_exit_height_info", e.target.value)}
                                    disabled={!this.state.schema.conveyor_exit_height_info.edit ? true : false}
                                />
                            </div>
                            <div className="col-1 col-lg-1 col-sm-1 col-md-1">
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => _this.editRow("conveyor_exit_height_info")}
                                >
                                    {_this.state.schema.conveyor_exit_height_info.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                </button>
                            </div>
                            {_this.state.schema.conveyor_exit_height_info.error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.conveyor_exit_height_info.error}</span>}
                        </div>
                        <br/>
                        {_this.state.schema.end_point_info &&
                            <div class="row">
                                <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                    End Point Barcode : 
                                </div>
                                <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                    <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="text"
                                        value={this.state.schema.end_point_info.end_point_coordinate}
                                        disabled
                                    />
                                </div>
                                <div className="col-lg-1 col-md-1 col-sm-1 col-1">
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => _this.deleteRow("end_point_info")}
                                    >
                                        <i className="fa fa-times" />
                                    </button>
                                </div>
                            </div>
                        }
                        <br/>
                        {_this.state.schema.active_point_info.length !== 0 &&
                            <div class="row">
                                <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                    Active Point PPS
                                </div>
                                <div className="col-5 col-lg-5 col-sm-5 col-md-5">
                                    Active Point Barcode
                                </div>
                            </div>
                        }
                        {multiActivePointRows}
                        <br/>
                        {(_this.state.schema.exit_point_info && Object.keys(_this.state.schema.exit_point_info).length !== 0) &&
                            <div class="row">
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    Exit Point Barcode
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    Bot Orientation Direction
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    Exit Direction
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    IO Point Barcode
                                </div>
                            </div>
                        }
                        {(_this.state.schema.exit_point_info && Object.keys(_this.state.schema.exit_point_info).length !== 0) &&
                            <div class="row">
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="text"
                                        disabled
                                        value={this.state.schema.exit_point_info.exit_point_coordinate.toString()}
                                    />
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    {/* <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="exit_bot_orientation_direction" 
                                        id="exit_bot_orientation_direction"
                                        disabled={(Object.keys(this.state.schema.exit_point_info).length!==0 && !this.state.schema.exit_point_info.edit)
                                                    ? true : false}
                                        defaultValue={exitBotOrientationOptions.length !==0 && exitBotOrientationOptions[0].value} 
                                        value={_this.state.schema.exit_point_info.exit_bot_orientation_direction}
                                        onChange={(e) => this.changeSchemaHandler("exit_bot_orientation_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {exitBotOrientationOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select> */}
                                    <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="exit_bot_orientation_direction" 
                                        id="exit_bot_orientation_direction"
                                        disabled={(Object.keys(this.state.schema.exit_point_info).length!==0 && !this.state.schema.exit_point_info.edit)
                                                    ? true : false}
                                        defaultValue={this.state.exit_bot_direction_options.length !==0 && this.state.exit_bot_direction_options[0].value} 
                                        value={_this.state.schema.exit_point_info.exit_bot_orientation_direction}
                                        onChange={(e) => this.changeSchemaHandler("exit_bot_orientation_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {this.state.exit_bot_direction_options.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    {/* <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="string"
                                        disabled
                                        value={this.state.schema.exit_point_info.exit_direction}
                                    /> */}
                                    <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="exit_direction" 
                                        id="exit_direction"
                                        disabled={(Object.keys(this.state.schema.exit_point_info).length!==0 && !this.state.schema.exit_point_info.edit)
                                                    ? true : false}
                                        defaultValue={exitDirectionOptions.length !==0 && exitDirectionOptions[0].value} 
                                        value={_this.state.schema.exit_point_info.exit_direction}
                                        onChange={(e) => this.changeSchemaHandler("exit_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {exitDirectionOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="text"
                                        disabled
                                        value={this.state.schema.exit_point_info.exit_io_point_coordinate}
                                    />
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => _this.editRow("exit_point_info")}
                                    >
                                        {_this.state.schema.exit_point_info.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                    </button>
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => _this.deleteRow("exit_point_info")}
                                    >
                                        <i className="fa fa-times" />
                                    </button>
                                </div>
                                {_this.state.schema.exit_point_info.error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.exit_point_info.error}</span>}
                            </div>
                        }
                        <br/>
                        {(_this.state.schema.entry_point_info && Object.keys(_this.state.schema.entry_point_info).length !== 0) &&
                            <div class="row">
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    Entry Point Barcode
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    Bot Orientation Direction
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    Entry Direction
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    IO Point Barcode
                                </div>
                            </div>
                        }
                        {(_this.state.schema.entry_point_info && Object.keys(_this.state.schema.entry_point_info).length !== 0) &&
                            <div class="row">
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="text"
                                        disabled
                                        value={this.state.schema.entry_point_info.entry_point_coordinate.toString()}
                                    />
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    {/* <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="entry_bot_orientation_direction" 
                                        id="entry_bot_orientation_direction"
                                        disabled={!this.state.schema.entry_point_info.edit ? true : false}
                                        defaultValue={entryBotOrientationOptions.length!==0 && entryBotOrientationOptions[0]}
                                        value={_this.state.schema.entry_point_info.entry_bot_orientation_direction}
                                        onChange={(e) => this.changeSchemaHandler("entry_bot_orientation_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {entryBotOrientationOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select> */}
                                    <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="entry_bot_orientation_direction" 
                                        id="entry_bot_orientation_direction"
                                        disabled={!this.state.schema.entry_point_info.edit ? true : false}
                                        defaultValue={this.state.entry_bot_direction_options.length!==0 && this.state.entry_bot_direction_options[0]}
                                        value={_this.state.schema.entry_point_info.entry_bot_orientation_direction}
                                        onChange={(e) => this.changeSchemaHandler("entry_bot_orientation_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {this.state.entry_bot_direction_options.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-3 col-lg-3 col-sm-3 col-md-3">
                                    {/* <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="string"
                                        disabled
                                        value={this.state.schema.entry_point_info.entry_direction}
                                    /> */}
                                    <select 
                                        className="form-control" 
                                        style={{ width: "100%" }} 
                                        name="entry_direction" 
                                        id="entry_direction"
                                        disabled={(Object.keys(this.state.schema.entry_point_info).length!==0 && !this.state.schema.entry_point_info.edit)
                                                    ? true : false}
                                        defaultValue={entryDirectionOptions.length !==0 && entryDirectionOptions[0].value} 
                                        value={_this.state.schema.entry_point_info.entry_direction}
                                        onChange={(e) => this.changeSchemaHandler("entry_direction", e.target.value,floor_barcodes,conveyorInfo)}
                                        >
                                        {entryDirectionOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <input
                                        style={{ width: "100%" }}
                                        className="form-control"
                                        type="text"
                                        disabled
                                        value={this.state.schema.entry_point_info.entry_io_point_coordinate}
                                    />
                                </div>
                                <div className="col-2 col-lg-2 col-sm-2 col-md-2">
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => _this.editRow("entry_point_info")}
                                    >
                                        {_this.state.schema.entry_point_info.edit?<i className="fa fa-check"/>:<i className="fas fa-edit"/>} 
                                    </button>
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => _this.deleteRow("entry_point_info")}
                                    >
                                        <i className="fa fa-times" />
                                    </button>
                                </div>
                                {_this.state.schema.entry_point_info.error!=='' && <span style={{color:"red",marginLeft:'20px'}}>{_this.state.schema.entry_point_info.error}</span>}
                            </div>
                        }
                        <br/>
                    </div>
                    <div>
                        <button type="button" 
                            onClick={() => {
                                this.onSubmitHandler(onSubmit, allConveyorIds);
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
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            style={{ float: "right" }}
                            onClick={() => {
                                this.onRemoveHandler(onSubmit);
                                this.toggle();
                            }}
                        >
                            Remove Conveyor System
                        </button>
                    </div>
                </form>
                }
            </ButtonForm>
        );
    }
}

export default BaseForm;
