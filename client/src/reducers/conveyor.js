export default (state = {}, action) => {
  switch (action.type) {
    case "SELECT-CONVEYOR-SYSTEM": {
      const { conveyor_id, selected_tile } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id], selected_tile }
      };
    }
    case "SELECTED-CONVEYOR-ENTRY-POINT": {
      const {conveyor_id,conveyor_entry, conveyor_io_entry,entry_point_direction,bot_orientation_entry,conveyor_entry_height } = action.value;
      if(state && state.hasOwnProperty(conveyor_id) && Object.keys(state).length!==0){
        var conveyor_entry_dict =
          {
            "conveyor_entry":conveyor_entry,
            "conveyor_io_entry":conveyor_io_entry,
            "entry_point_direction":entry_point_direction,
            "bot_orientation_entry":bot_orientation_entry,
            "conveyor_entry_height":conveyor_entry_height
          }
        
        if(state[conveyor_id].hasOwnProperty("conveyor_entry")){
          var conveyor_entry = state[conveyor_id].conveyor_entry
          conveyor_entry.push(conveyor_entry_dict)
        }else{
          var conveyor_entry = []
          conveyor_entry.push(conveyor_entry_dict)
        }
        return {
          ...state,
          [conveyor_id]: { ...state[conveyor_id], conveyor_entry:conveyor_entry }
        };
      }
    }
    case "SELECTED-CONVEYOR-EXIT-POINT": {
      const { conveyor_id, conveyor_exit, conveyor_io_exit ,exit_point_direction,bot_orientation_exit,conveyor_exit_height} = action.value;
      if(state && state.hasOwnProperty(conveyor_id) && Object.keys(state).length!==0){
        var conveyor_exit_dict =
          {
            "conveyor_exit":conveyor_exit,
            "conveyor_io_exit":conveyor_io_exit,
            "exit_point_direction":exit_point_direction,
            "bot_orientation_exit":bot_orientation_exit,
            "conveyor_exit_height":conveyor_exit_height
          }
          if(state[conveyor_id].hasOwnProperty("conveyor_exit")){
            var conveyor_exit = state[conveyor_id].conveyor_exit
            conveyor_exit.push(conveyor_exit_dict)
          }else{
            var conveyor_exit = []
            conveyor_exit.push(conveyor_exit_dict)
          }
        return {
          ...state,
          [conveyor_id]: { ...state[conveyor_id], conveyor_exit:conveyor_exit}
        };
      }
    }
    case "SELECTED-CONVEYOR-END-POINT": {
      const conveyor_id= action.value.conveyor_id;
      const conveyor_end = action.value.conveyor_end;
      if(state && Object.keys(state).length!==0){
        return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id],conveyor_end }
        };
      }
      
    }
    case "SELECTED-CONVEYOR-ACTIVE-POINT": {
      const conveyor_id = action.value.conveyor_id;
      const conveyor_pps_point = action.value.conveyor_pps_point
      const active_point = action.value.active_point
      if(state && state.hasOwnProperty(conveyor_id) && Object.keys(state).length!==0 && state[conveyor_id].conveyor_active){
        var conveyor_active_list = state[conveyor_id].conveyor_active
        var check_active_list = []
        if(conveyor_active_list.length > 0){
          for (var i = 0; i < conveyor_active_list.length; i++) {
            check_active_list.push(conveyor_active_list[i].conveyor_active_point[0])
            }
          if(check_active_list.includes(conveyor_pps_point.conveyor_active_point[0])){
            return null
          }
        }
        conveyor_active_list.push(conveyor_pps_point)
        var check = {
        ...state,
        [conveyor_id]: { ...state[conveyor_id], conveyor_active:conveyor_active_list}
        };
        return check
      }
    }

    case "REMOVE-SELECTED-CONVEYOR-ID": {
      var conveyor_id = action.value.conveyor_id
      if(state && Object.keys(state).length!==0){
        delete state[conveyor_id]
      return {...state}
      }
      
    }    
  } 
  return state;
};
