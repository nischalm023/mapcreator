// exports mapcreator's represention of map (map.json schema) to conveyor 
// json files (conveyor.json)

function checkPoint(entity_array, selected_array) {
  return entity_array.some(e => JSON.stringify(e) == JSON.stringify(selected_array))
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
            var step_data = ConveyorStepData(i+1,"conveyor_entry",value["selected_tile"][i],barcode)
        }
        else if(checkPoint(value["conveyor_exit"], value["selected_tile"][i])){
            var step_data = ConveyorStepData(i+1,"conveyor_exit",value["selected_tile"][i],barcode)
        }
        else if(checkPoint(value["conveyor_active"], value["selected_tile"][i])){
            var step_data = ConveyorStepData(i+1,"conveyor_pps_point",value["selected_tile"][i],barcode)
        }
        else{
            var step_data = ConveyorStepData(i+1,"conveyor_track",value["selected_tile"][i],barcode)
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
    conveyor_dict["conveyor_height"] = value["conveyor_height"]
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
    if((value["selected_tile"].length===0) || (value["conveyor_exit"].length===0) || (value["conveyor_entry"].length===0) || (value["conveyor_active"].length===0)){
        continue
    }
    var converted_dict_value = FormConveyorJson(value, barcode)
    conveyor_json.push(converted_dict_value)
 }
  return conveyor_json;
};
