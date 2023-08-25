export default (state = {}, action) => {
  switch (action.type) {
    case "CREATE-HAI-TEMPLATE": {
      const { template_id, template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone } = action.value;
        return {
          ...state,
          [template_id]: { ...state[template_id], template_id,template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone }
        };
    }
    case "CLONE-HAI-TEMPLATE": {
      const { template_id, template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone } = action.value;
        return {
          ...state,
          [template_id]: { ...state[template_id], template_id,template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone }
        };
    }
    case "MANAGE-HAI-TEMPLATE": {
      const { template_id, template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone } = action.value;
        return {
          ...state,
          [template_id]: { template_id,template_display_name, port_type,tray_count,support_agent,length,breadth,height,clone }
        };
    }
    case "REMOVE-HAI-TEMPLATE": {
      var template_id = action.value
      if(state && Object.keys(state).length!==0){
        delete state[template_id]
      return {...state}
      }
      
    } 

}

  return state;
};
