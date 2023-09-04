export default (state = {}, action) => {
    switch (action.type) {
        case "REMOVE-SELECTED-TOTE-STORABLE": {
            var next_tote_storable_id = action.value.next_tote_storable_id
            delete state[next_tote_storable_id]
            return { ...state }
        }
        case "REMOVE-SELECTED-MULTIPLE-TOTE-STORABLE": {
            var next_tote_storable_ids = action.value;
            let tote_storables = {...state};
            next_tote_storable_ids.map(next_tote_storable_id=>{
                delete tote_storables[next_tote_storable_id];
            })
            
            return { ...tote_storables };
        }
        case "CREATE-MULTIPLE-TOTE-STORABLE":{
            let newEntitiesObj = {};
            let entities = action.value;
            for (let idx = 0; idx < entities.length; idx++) {
                let id = entities[idx]['next_tote_storable_id'];
                newEntitiesObj[id] = {
                ...entities[idx]
                };
            }
            return { ...state, ...newEntitiesObj };
        }
    }
    return state;
};
