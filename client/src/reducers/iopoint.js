export default (state = {}, action) => {
    switch (action.type) {
        case "REMOVE-SELECTED-IO-POINT": {
            var io_point_id = action.value.io_point_id
            delete state[io_point_id]
            return { ...state }
        }
    }
    return state;
};
