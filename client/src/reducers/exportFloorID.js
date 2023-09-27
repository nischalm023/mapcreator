export default (state = true, action) => {
  switch (action.type) {
    case "CHANGE-EXPORT-FLOOR-ID": {
      return action.value;
    }
  }
  return state;
};
