export default (state = "v2", action) => {
  switch (action.type) {
    case "CHANGE-CONVEYOR-VERSION": {
      return action.value;
    }
  }
  return state;
};
