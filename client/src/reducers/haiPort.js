export default (state = {}, action) => {
  switch (action.type) {
   case "CREATE-HAI-PORT": {
      const { template_id, direction,entity_height,entity_point,io_coodinate, port_coordinate,io_barcode,port_barcode,port_id_value,port_id,conveyor_id} = action.value;
        return {
          ...state,
          [port_id]: { ...state[port_id],port_id,entity_height,template_id, io_coodinate, port_coordinate,io_barcode,port_barcode,port_id_value,conveyor_id,entity_point,direction}
        };
    }
    case "UPDATE-HAI-PORT-ID": {
      const port_id = action.value.data.port_id;
      const port_id_value = action.value.data.port_id_value;
        return {
          ...state,
          [port_id]: { ...state[port_id],port_id_value:port_id_value}
        };
    }
    case "DELETE-HAI-PORT-DATA": {
      var port_id_list = action.value.port_id_list
      if(state && Object.keys(state).length!==0){
      var k = 0;
      while (k < port_id_list.length) {
      if (state[port_id_list[k]]) {
          delete state[port_id_list[k]]
        }
        k++;
      }  
      return {...state}
      }
    }   
}

  return state;
};
