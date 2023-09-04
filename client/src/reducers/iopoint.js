export default (state = {}, action) => {
    switch (action.type) {
        case "REMOVE-SELECTED-IO-POINT": {
            var io_point_id = action.value.io_point_id
            delete state[io_point_id]
            return { ...state }
        }
        case "CREATE-MULTIPLE-IO-POINT":{
            let newEntitiesObj = {};
            let entities = action.value;
            for (let idx = 0; idx < entities.length; idx++) {
                let id = entities[idx]['io_point_id'];
                newEntitiesObj[id] = {
                ...entities[idx]
                };
            }
            return { ...state, ...newEntitiesObj };
        }
    }
    return state;
};
