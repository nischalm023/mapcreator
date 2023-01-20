var env = process.env.NODE_ENV || "development";
var config = require(__dirname + "/../config/config.js")[env];
const BASENAME = config.gsb_url;

// TODO update the GSB API, currently we are using a mock API for GSB
const requestMapUploadToGsb = data =>
    // fetch('http://autocad:3000/testp', {
    fetch('http://mockapi.free.beeceptor.com/postapi', {
        method: "POST",
        body: JSON.stringify(data)
});

export {
    requestMapUploadToGsb
};