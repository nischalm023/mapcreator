export default (state = "default_format", action) => {
  switch (action.type) {
    case "CHANGE-BARCODE-FORMAT-MODE": {
      return action.value;
    }
  }
  return state;
};
