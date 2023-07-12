export default (state = {}, action) => {
  switch (action.type) {
    case "LINK-CONNECT-CONVEYOR-SYSTEM": {
      const { 
        connected_conveyor_id, 
        conveyor_id_destination,
        conveyor_id_source,
        direction,
        destination_conveyor_tile,
        source_conveyor_tile } = action.value;
      return {
        ...state,
        [connected_conveyor_id]: { ...state[connected_conveyor_id],
                                  connected_conveyor_id,
                                  destination_conveyor_tile, 
                                  source_conveyor_tile,
                                  direction,
                                  conveyor_id_source,
                                  conveyor_id_destination
                                  }
      };
  }
    case "EDIT-CONNECT-CONVEYOR-SYSTEM": {
      let newState = action.value
      return { ...newState };
  }  
}

  return state;
};
