const createConnectedInput = (connectedConveyorTile) => {
    var connected_list = []
    for (const [key, value] of Object.entries(connectedConveyorTile)) {
        connected_list.push([value["conveyor_id_source"].toString(),value["conveyor_id_destination"].toString()])
    }
    return connected_list
}

const mergeConveyorData = (mapped_list,conveyorTile) => {
    var conveyor_id = Object.keys(conveyorTile)
    var output_flat_list = [...new Set(mapped_list.flat())]
    var not_connected_id = conveyor_id.filter(x => !output_flat_list.includes(x))
    var not_connected_id_list = []
      for (var i = 0; i < not_connected_id.length; i++) {
          var convert = not_connected_id[i].split(",").map((val) => val)
          not_connected_id_list.push(convert)
      }
    var merge_output = [...mapped_list, ...not_connected_id_list]
    return merge_output
}

const createValidationList = (merge_output,conveyorTile) => {
    var validation_list = []
    for (var i = 0; i < merge_output.length; i++){
        var validate_dict = {"conveyor_id":merge_output[i]}
        for (var j = 0; j < merge_output[i].length; j++){
            if(conveyorTile[merge_output[i][j]].hasOwnProperty("conveyor_exit") && !validate_dict.hasOwnProperty("exit_present")){
                validate_dict["exit_present"] = true
            }
            if(conveyorTile[merge_output[i][j]].hasOwnProperty("conveyor_entry") && !validate_dict.hasOwnProperty("entry_present")){
                validate_dict["entry_present"] = true
            }
            if(conveyorTile[merge_output[i][j]]["conveyor_active"].length !== 0 && !validate_dict.hasOwnProperty("active_present")){
                 validate_dict["active_present"] = true
            }
        }
        validation_list.push(validate_dict)
    }
    return validation_list
}

const createMappedList = (connected_list) => {
    var total_dict = {}
    let mapped_list = []
    mapped_list = []
    let all_link_point =[...new Set(connected_list.flat())]
    var init_key = all_link_point[0]
    total_dict[init_key] = 0
    var t_pos = 0
    for (var i = 0; i < all_link_point.length; i++) {
        if(Object.keys(total_dict).includes(all_link_point[i])){
            var f_pos = total_dict[all_link_point[i]]
        }else{
            var f_pos = t_pos+1
        }
        for (var j = 0; j < connected_list.length; j++) {
            if(connected_list[j].includes(all_link_point[i]) && mapped_list.length>0){
                if(Object.keys(total_dict).includes(connected_list[j][0])){
                    var f_pos = total_dict[connected_list[j][0]]
                    if(!mapped_list[f_pos].includes(connected_list[j][0])){
                        mapped_list[f_pos].push(connected_list[j][0])
                    }
                    if(!mapped_list[f_pos].includes(connected_list[j][1])){
                        mapped_list[f_pos].push(connected_list[j][1])
                    }
                }
                else if(Object.keys(total_dict).includes(connected_list[j][1])){
                    var f_pos = total_dict[connected_list[j][1]]
                    if(!mapped_list[f_pos].includes(connected_list[j][0])){
                        mapped_list[f_pos].push(connected_list[j][0])
                    }
                    if(!mapped_list[f_pos].includes(connected_list[j][1])){
                        mapped_list[f_pos].push(connected_list[j][1])
                    }
                }else{
                    mapped_list.push([connected_list[j][0],connected_list[j][1]])
                    t_pos = t_pos+1
                }
                total_dict[connected_list[j][0]] = f_pos
                total_dict[connected_list[j][1]] = f_pos
            }else if(connected_list[j].includes(all_link_point[i]) && mapped_list.length===0){
                mapped_list.push([connected_list[j][0],connected_list[j][1]])
                total_dict[connected_list[j][0]] = f_pos
                total_dict[connected_list[j][1]] = f_pos
            }
        }
    }
    return mapped_list
}

const getErrorMessage = (create_validation_list) => {
    let errorMessage = '';
    for (var i = 0; i < create_validation_list.length; i++) {
        if(!create_validation_list[i].hasOwnProperty("active_present") && !create_validation_list[i].hasOwnProperty("entry_present") && !create_validation_list[i].hasOwnProperty("exit_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                 errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have active, entry and exit points defined.`
             }else{
                  errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have active, entry and exit points defined.`
             }
        }
        else if(!create_validation_list[i].hasOwnProperty("active_present") && !create_validation_list[i].hasOwnProperty("exit_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                 errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have active and exit points defined.`
             }else{
                  errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have active and exit points defined.`
             }
        }
        else if(!create_validation_list[i].hasOwnProperty("active_present") && !create_validation_list[i].hasOwnProperty("entry_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                  errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have active and entry points defined.`
             }else{
                 errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have active and entry points defined.`
             }
        }
        else if(!create_validation_list[i].hasOwnProperty("entry_present") && !create_validation_list[i].hasOwnProperty("exit_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                  errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have entry and exit points defined.`
             }else{
                  errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have entry and exit points defined.`
             }
        }
        else if(!create_validation_list[i].hasOwnProperty("active_present")){
            if(create_validation_list[i]["conveyor_id"].length>1){
                errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have active points defined.`
            }else{
               errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have active points defined.` 
            }
            
        }
        else if(!create_validation_list[i].hasOwnProperty("exit_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                 errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have exit point defined.`
             }else{
                 errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have exit point defined.`
             }
        }
        else if(!create_validation_list[i].hasOwnProperty("entry_present")){
             if(create_validation_list[i]["conveyor_id"].length>1){
                  errorMessage = errorMessage + `\nConnected conveyor system ( ID :${create_validation_list[i]["conveyor_id"].join()} ) does not have entry point defined.`
             }else{
                 errorMessage = errorMessage + `\nConveyor ID ${create_validation_list[i]["conveyor_id"].join()} does not have entry point defined.`
             }
        }
    }
    return errorMessage
}

export const validateConveyorEntity = (connectedConveyorTile,conveyorTile) => {
    if(Object.keys(connectedConveyorTile).length !==0){
        var connected_list = createConnectedInput(connectedConveyorTile)
        var mapped_list = createMappedList(connected_list)
    }else{
        var mapped_list = []
    }
    // this will merge both connected and non connected into one
    var merge_list = mergeConveyorData(mapped_list,conveyorTile)
    var create_validation_list = createValidationList(merge_list,conveyorTile)
    var get_error_message = getErrorMessage(create_validation_list)
    return get_error_message
}

