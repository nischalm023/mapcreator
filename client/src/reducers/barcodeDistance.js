export default (state = 750, action) => {
  switch (action.type) {
    case "CHANGE-BARCODE-DISTANCE": {
      return action.value;
    }
  }
  return state;
};
