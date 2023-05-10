export default (state = {}, action) => {
    switch (action.type) {
        case "REMOVE-SELECTED-TOTE-STORABLE": {
            var next_tote_storable_id = action.value.next_tote_storable_id
            delete state[next_tote_storable_id]
            return { ...state }
        }
    }
    return state;
};
