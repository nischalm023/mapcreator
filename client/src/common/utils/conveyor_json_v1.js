// exports mapcreator's represention of map (map.json schema) to conveyor 
// json files (conveyor.json)

function checkPoint(entity_array, selected_array) {
  if(entity_array){
  return entity_array.some(e => JSON.stringify(e) == JSON.stringify(selected_array))
  }  
}

function activeCheckPoint(entity_array, selected_array) {
    var conveyor_active_list = []
    for (var i = 0; i < entity_array.length; i++) {
     conveyor_active_list.push(entity_array[i]["conveyor_active_point"][0].split(",").map((val) => parseInt(val)))
    }
    return conveyor_active_list.some(e => JSON.stringify(e) == JSON.stringify(selected_array))
}

function ConveyorStepData(id,cooradinate,barcode) {
    var conveyor_step_dict={}
    conveyor_step_dict["id"]=id
    conveyor_step_dict["type"]=barcode[cooradinate]["grid_attribute"]
    conveyor_step_dict["coordinate"]=JSON.stringify(cooradinate)
    var tile = cooradinate.toString()
    conveyor_step_dict["world_coordinate"]=barcode[tile]["world_coordinate"]
    return conveyor_step_dict
}

const getStepConveyorData = (value, barcode) =>{
    var conveyor_step = []
    for (var i = 0; i < value["selected_tile"].length; i++) {
        if(value.hasOwnProperty("conveyor_step_id")){
            var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
        }else{
            var step_id = (i+1).toString()
        }
    var step_data = ConveyorStepData(step_id,value["selected_tile"][i],barcode)
    conveyor_step.push(step_data)   
}
    return conveyor_step
}

const FormConveyorJson = (value, barcode) =>{
    var conveyor_dict = {}
    conveyor_dict["conveyor_id"] = value["conveyor_id"]
    if(!value.hasOwnProperty("conveyor_entry")){
        conveyor_dict["map_entry_location"] = null
        conveyor_dict["conveyor_entry_direction"] = null
        conveyor_dict["bot_orientation_entry"] = null
        conveyor_dict["conveyor_height_entry"] = null
    }else{
        var conveyor_entry = value["conveyor_entry"][0]
        conveyor_dict["map_entry_location"] = conveyor_entry.conveyor_io_entry
        conveyor_dict["conveyor_entry_direction"] = conveyor_entry.entry_point_direction
        conveyor_dict["bot_orientation_entry"] = conveyor_entry.bot_orientation_entry
        conveyor_dict["conveyor_height_entry"] = conveyor_entry.conveyor_entry_height
    }
    if(!value.hasOwnProperty("conveyor_exit")){
        conveyor_dict["map_exit_location"] = null
        conveyor_dict["conveyor_exit_direction"] = null
        conveyor_dict["bot_orientation_exit"] = null
        conveyor_dict["conveyor_height_exit"] = null
    }else{
        var conveyor_exit = value["conveyor_exit"][0]
        conveyor_dict["map_exit_location"] = conveyor_exit.conveyor_io_exit
        conveyor_dict["conveyor_exit_direction"] = conveyor_exit.exit_point_direction
        conveyor_dict["bot_orientation_exit"] = conveyor_exit.bot_orientation_exit
        conveyor_dict["conveyor_height_exit"] = conveyor_exit.conveyor_exit_height
    }
    conveyor_dict["conveyor_entry_location"] = "CONVEYOR_IN_"+value["conveyor_id"]
    conveyor_dict["conveyor_exit_location"] = "CONVEYOR_OUT_"+value["conveyor_id"]
    conveyor_dict["adjacency"] = [null,null,null,null]
    var conveyor_steps = getStepConveyorData(value, barcode)
    conveyor_dict["steps"]=conveyor_steps
    return conveyor_dict
}

export default (normalizedMap) => {
  var conveyor_data = normalizedMap.entities.conveyorTile
  var barcode = normalizedMap.entities.barcode
  var conveyor_json = []
  for (const [key, value] of Object.entries(conveyor_data)) {
    var converted_dict_value = FormConveyorJson(value, barcode)
    conveyor_json.push(converted_dict_value)
 }
  return conveyor_json;
};
