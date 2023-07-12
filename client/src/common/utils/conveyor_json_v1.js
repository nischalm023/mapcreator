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

function ConveyorStepData(id,type,cooradinate,barcode) {
    var conveyor_step_dict={}
    conveyor_step_dict["id"]=id
    conveyor_step_dict["type"]=type
    conveyor_step_dict["coordinate"]=JSON.stringify(cooradinate)
    var tile = cooradinate.toString()
    conveyor_step_dict["world_coordinate"]=barcode[tile]["world_coordinate"]
    return conveyor_step_dict
}

const getStepConveyorData = (value, barcode) =>{
    var conveyor_step = []
    for (var i = 0; i < value["selected_tile"].length; i++) {
        if(checkPoint(value["conveyor_entry"], value["selected_tile"][i])){
            if(value.hasOwnProperty("conveyor_step_id")){
                var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
            }else{
                var step_id = (i+1).toString()
            }
            var step_data = ConveyorStepData(step_id,"conveyor_entry",value["selected_tile"][i],barcode)
        }
        else if(checkPoint(value["conveyor_exit"], value["selected_tile"][i])){
            if(value.hasOwnProperty("conveyor_step_id")){
                var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
            }else{
                var step_id = (i+1).toString()
            }
            var step_data = ConveyorStepData(step_id,"conveyor_exit",value["selected_tile"][i],barcode)
        }
        else if(activeCheckPoint(value["conveyor_active"], value["selected_tile"][i])){
            if(value.hasOwnProperty("conveyor_step_id")){
                var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
            }else{
                var step_id = (i+1).toString()
            }
            var step_data = ConveyorStepData(step_id,"conveyor_pps_point",value["selected_tile"][i],barcode)
        }
        else if(checkPoint(value["conveyor_end"], value["selected_tile"][i])){
            if(value.hasOwnProperty("conveyor_step_id")){
                var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
            }else{
                var step_id = (i+1).toString()
            }
            var step_data = ConveyorStepData(step_id,"conveyor_end",value["selected_tile"][i],barcode)
        }
        else{
            if(value.hasOwnProperty("conveyor_step_id")){
                var step_id = value["conveyor_step_id"][value["selected_tile"][i].toString()]
            }else{
                var step_id = (i+1).toString()
            }
            var step_data = ConveyorStepData(step_id,"conveyor_track",value["selected_tile"][i],barcode)
        }
       conveyor_step.push(step_data) 
    }
    return conveyor_step
}

const FormConveyorJson = (value, barcode) =>{
    var conveyor_dict = {}
    conveyor_dict["conveyor_id"] = value["conveyor_id"]
    conveyor_dict["map_entry_location"] = value["conveyor_io_entry"]
    conveyor_dict["map_exit_location"] = value["conveyor_io_exit"]
    conveyor_dict["conveyor_entry_location"] = "CONVEYOR_IN_"+value["conveyor_id"]
    conveyor_dict["conveyor_exit_location"] = "CONVEYOR_OUT_"+value["conveyor_id"]
    conveyor_dict["conveyor_entry_direction"] = value["entry_point_direction"]
    conveyor_dict["conveyor_exit_direction"] = value["exit_point_direction"]
    conveyor_dict["bot_orientation_entry"] = value["bot_orientation_entry"]
    conveyor_dict["bot_orientation_exit"] = value["bot_orientation_exit"]
    conveyor_dict["conveyor_height_entry"] = value["conveyor_entry_height"]
    conveyor_dict["conveyor_height_exit"] = value["conveyor_exit_height"]
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
