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
      const { conveyor_id, conveyor_entry, conveyor_io_entry } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id], conveyor_entry, conveyor_io_entry }
      };
    }
    case "SELECTED-CONVEYOR-EXIT-POINT": {
      const { conveyor_id, conveyor_exit, conveyor_io_exit } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id], conveyor_exit, conveyor_io_exit }
      };
    }
    case "SELECTED-CONVEYOR-END-POINT": {
      const { conveyor_id, conveyor_end } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id],conveyor_end }
      };
    }
    case "CONVEYOR-DEFAULT-END-POINT": {
      const { conveyor_id, conveyor_end } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id],conveyor_end }
      };
    }
    case "SELECTED-CONVEYOR-ACTIVE-POINT": {
      const { conveyor_id, conveyor_active } = action.value;
      return {
        ...state,
        [conveyor_id]: { ...state[conveyor_id],conveyor_active }
      };
    }
    case "REMOVE-SELECTED-CONVEYOR-ID": {
      var conveyor_id = action.value.conveyor_id
      delete state[conveyor_id]
      return {...state}
    }    
  } 
  return state;
};
