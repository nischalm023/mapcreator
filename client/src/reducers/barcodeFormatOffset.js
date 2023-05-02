export default (state = "[10000,10000]", action) => {
  switch (action.type) {
    case "BARCODE-OFFSET-VALUE": {
      return action.value;
    }
  }
  return state;
};
