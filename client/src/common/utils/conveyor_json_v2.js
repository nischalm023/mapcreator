// exports mapcreator's represention of map (map.json schema) to conveyor 
// json files (conveyor.json)

function createStepId(conveyor_data,barcode) {
    var conveyor_step_list = []
    for (const [key, value] of Object.entries(conveyor_data)) {
        var conveyor_step_dict={}
        conveyor_step_dict["location_id"]=value
        conveyor_step_dict["location_type"]=barcode[key]["grid_attribute"]
        var coordinate = key.split(",").map((val) => parseInt(val))
        conveyor_step_dict["coordinate"]=`[${coordinate[0]},${coordinate[1]}]`
        conveyor_step_dict["world_coordinate"]=barcode[key]["world_coordinate"]
        conveyor_step_list.push(conveyor_step_dict)
    }
    return conveyor_step_list
}

function createEntryDetails(conveyor_data,barocde) {
    var conveyor_entry_list = []
    if(conveyor_data.hasOwnProperty("conveyor_entry")){
        var conveyor_entry_details = conveyor_data["conveyor_entry"]
        for (var i = 0; i < conveyor_entry_details.length; i++) {
            var entry = conveyor_entry_details[i]["conveyor_entry"].toString()
            var conveyor_entry_dict = {
                          "location_id" : conveyor_data["conveyor_step_id"][entry], 
                          "io_point" : conveyor_entry_details[i]["conveyor_io_entry"],
                          "height" : conveyor_entry_details[i]["conveyor_entry_height"],
                          "direction" : conveyor_entry_details[i]["entry_point_direction"],
                          "bot_orientation" : conveyor_entry_details[i]["bot_orientation_entry"]
                        }
        conveyor_entry_list.push(conveyor_entry_dict)
        }
        
    }
    return conveyor_entry_list
}

function createExitDetails(conveyor_data,barocde) {
    var conveyor_exit_list = []
    if(conveyor_data.hasOwnProperty("conveyor_exit")){
        var conveyor_exit_details = conveyor_data["conveyor_exit"]
        for (var i = 0; i < conveyor_exit_details.length; i++) {
            var exit = conveyor_exit_details[i]["conveyor_exit"].toString()
            var conveyor_exit_dict = {
                              "location_id" : conveyor_data["conveyor_step_id"][exit], 
                              "io_point" : conveyor_exit_details[i]["conveyor_io_exit"],
                              "height" : conveyor_exit_details[i]["conveyor_exit_height"],
                              "direction" : conveyor_exit_details[i]["exit_point_direction"],
                              "bot_orientation" : conveyor_exit_details[i]["bot_orientation_exit"]
                            }
            conveyor_exit_list.push(conveyor_exit_dict)
        }
        
    }
    return conveyor_exit_list
}

export default (normalizedMap) => {
    var conveyorTile = normalizedMap.entities.conveyorTile
    var connected_tile = normalizedMap.entities.ConnectedconveyorTile
    var barcode = normalizedMap.entities.barcode
    var mapping_dict = {}
    var conveyor_list = Object.keys(conveyorTile)
    for (const [key, value] of Object.entries(connected_tile)) {
        if(!Object.keys(mapping_dict).includes(value["conveyor_id_source"].toString())){
            var mapping_list = []
            mapping_list.push(value["conveyor_id_destination"].toString())
            mapping_dict[value["conveyor_id_source"]] = mapping_list
        }else{
            mapping_list = mapping_dict[value["conveyor_id_source"]]
            mapping_list.push(value["conveyor_id_destination"].toString())
            mapping_dict[value["conveyor_id_source"]] = mapping_list
        }
    }
    // for non connected conveyor : push in mapped dict
    var conveyor_element_found = conveyor_list.filter(x => !Object.keys(mapping_dict).includes(x))
    for (var i = 0; i < conveyor_element_found.length; i++) {
        mapping_dict[conveyor_element_found[i]]=[]
    }
    var conveyor_data_list = []
    for (const [key, value] of Object.entries(mapping_dict)) {
    var conveyor_data_dict = {}
        conveyor_data_dict["conveyor_id"] = parseInt(key)
        if(conveyorTile[key]["conveyor_display_name"] == 'NA' || !conveyorTile[key].hasOwnProperty("conveyor_display_name")){
            var display_name_value = 'Conveyor_'+key
        }else{
            var display_name_value = conveyorTile[key]["conveyor_display_name"]
        }
        conveyor_data_dict["display_name"] = display_name_value
        conveyor_data_dict["connected_conveyors"] = [...new Set(value.map(Number))];
        var step_details = createStepId(conveyorTile[key]["conveyor_step_id"],barcode)
        var entry_details = createEntryDetails(conveyorTile[key],barcode)
        var exit_details = createExitDetails(conveyorTile[key],barcode)
        conveyor_data_dict["entry_points"]=entry_details
        conveyor_data_dict["conveyor_steps"]=step_details
        conveyor_data_dict["exit_points"]=exit_details
        conveyor_data_list.push(conveyor_data_dict)
    }
    var version_2 = {"version" : "2.0.0","conveyor_data":conveyor_data_list}
    return version_2
};
