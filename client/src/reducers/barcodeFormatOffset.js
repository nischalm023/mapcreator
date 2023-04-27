export default (state = "[10000,10000]", action) => {
  console.log("see here after barcode add")
  switch (action.type) {
    case "BARCODE-OFFSET-VALUE": {
      return action.value;
    }
  }
  return state;
};
