import _ from "lodash";

const manageOldPpsData = (pps_detail,active_point) => {
    if(pps_detail.pps_points !== undefined && pps_detail.eligible_system !== undefined && pps_detail.pps_points.length==2 && pps_detail.eligible_system.length==2){
        pps_detail["pps_points"] = []
        return pps_detail
    }else{
      for (var j = 0; j < pps_detail["pps_points"].length; j++) {
            if(pps_detail["pps_points"][j]["coordinate"] == active_point){
              pps_detail["pps_points"].splice(j, 1);
              return pps_detail
            }
      }
    }
        
}

const manageNewPpsData = (pps_detail,active_point) => {
  if(pps_detail.pps_points !== undefined && pps_detail.eligible_system !== undefined &&pps_detail.pps_points.length==0 && pps_detail.eligible_system.length==2){
      var pps_point_list = []
      for (var i = 0; i < pps_detail.eligible_system.length; i++) {
            var pps_point_dict = {}
            pps_point_dict["position_id"] = i+1,
            pps_point_dict["coordinate"] = pps_detail.eligible_system[i]=="ttp"?`[${active_point}]`:`[${pps_detail.coordinate}]`,
            pps_point_dict["type"] = pps_detail.eligible_system[i]
            pps_point_list.push(pps_point_dict)
        }
        pps_detail["pps_points"] = pps_point_list
        return pps_detail
    }else{
      var pps_point_dict = {}
      pps_point_dict["position_id"] = pps_detail.pps_points.length+1,
      pps_point_dict["coordinate"] = `[${active_point}]`,
      pps_point_dict["type"] = "ttp"
      pps_detail.pps_points.push(pps_point_dict)
      return pps_detail
    }
}

export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      var current_queue_barcodes = action.value.current_queue_barcodes;
      if(action.value.multi_queue_mode) {
        return {
          ...state,
          [action.value.pps_id]: {
            ...state[action.value.pps_id],
            queue_barcodes: [...action.value.tiles, ...current_queue_barcodes]
          }
        };
      } else {
        return {
          ...state,
          [action.value.pps_id]: {
            ...state[action.value.pps_id],
            queue_barcodes: action.value.tiles
          }
        };
      }

    case "DELETE-TTP-PPS-POINT": {
      var pps_list = action.value
      let newState = _.cloneDeep(state);
      for (var i = 0; i < pps_list.length; i++) {
        var pps_id = pps_list[i]["pps_id"]
        var pps_points = newState[pps_id]["pps_points"]
        if(pps_points.length == 2 && newState[pps_id]["eligible_system"].length == 2){
          newState[pps_id]["pps_points"] = []
        }else{
          for (var j = 0; j < newState[pps_id]["pps_points"].length; j++) {
              if(newState[pps_id]["pps_points"][j]["coordinate"] == pps_list[i]["conveyor_active_point"][0]){
                newState[pps_id]["pps_points"].splice(j, 1);
              }
          }
        }
      }
      return newState
    }

    case "EDIT-TTP-PPS-POINT": {
      var edit_pps_detail_list = action.value
      let newState = _.cloneDeep(state);
      for (var i = 0; i < edit_pps_detail_list.length; i++) {
        var active_point = edit_pps_detail_list[i]["active_point"]
        var old_pps_id = edit_pps_detail_list[i]["old_pps_id"]
        var new_pps_id = edit_pps_detail_list[i]["new_pps_id"]
        var old_pps_detail = newState[old_pps_id]
        var new_pps_detail = newState[new_pps_id]
        newState[old_pps_id] =  manageOldPpsData(old_pps_detail,active_point)
        newState[new_pps_id] = manageNewPpsData(new_pps_detail,active_point)
      }
      return newState
    }
      
    case "ADD-TTP-PPS-POINT": {
      var {pps_id,pps_coordinate,conveyor_active_point} = action.value.conveyor_pps_point
      var eligible_system = state[pps_id]["eligible_system"]
      var pps_points = state[pps_id]["pps_points"]
      
      if(pps_points.length===0 && eligible_system.length==2){
          for (var i = 0; i < eligible_system.length; i++) {
              var pps_point_dict = {}
              pps_point_dict["position_id"] = i+1,
              pps_point_dict["coordinate"] = eligible_system[i]=="ttp"?`[${conveyor_active_point[0]}]`:`[${pps_coordinate}]`,
              pps_point_dict["type"] = eligible_system[i]
              pps_points.push(pps_point_dict)
          }
      }else{
          var pps_point_dict = {}
          pps_point_dict["position_id"] = pps_points.length+1,
          pps_point_dict["coordinate"] = `[${conveyor_active_point[0]}]`,
          pps_point_dict["type"] = "ttp"
          pps_points.push(pps_point_dict)
      }
      return {
        ...state,
        [pps_id]: {
          ...state[pps_id],
          pps_points: pps_points
        }
            
      };
    }
    case "DELETE-PPS-QUEUE": {
      return {
        ...state,
        [action.value.pps_id]: {
          ...state[action.value.pps_id],
          queue_barcodes: []
        }
            
      };
    }
  }
  return { ...state };
};