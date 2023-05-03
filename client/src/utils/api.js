const BASENAME = process.env.REACT_APP_BASENAME || "";
const BASENAME_AUTOCAD = process.env.REACT_APP_BASENAME_AUTOCAD || "";
// const BASENAME = "https://mapcreator.labs.greyorange.com" || "";

const getMap = (mapId) => fetch(`${BASENAME}/api/map/${mapId}`);

const updateMap = (mapId, map) =>
  fetch(`${BASENAME}/api/map/${mapId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      map,
    }),
  });
const createMap = (denormalizedMap, name, gsb, uid, source, solution_id, agent_id, fa_id) =>
  fetch(`${BASENAME}/api/createMap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      map: denormalizedMap,
      name,
      gsb: gsb,
      uid: uid,
      source: source,
      solution_id: solution_id,
      agent_id: agent_id,
      fa_id: fa_id,
    }),
  });

const runHaiMapConversionScriptToMap = (autocad) => {
      let form = new FormData();
      form.append("arrFile", autocad)
      return  fetch(`${window.location.protocol}//${window.location.hostname}:5001/data`, {
          method: 'POST',
          body: form
          }).then((response) => response.json()).then(data => {return data;});
    };

const stitchingTtpRtpMapApi = (stitch_data) => {
    return  fetch(`${window.location.protocol}//${window.location.hostname}:5001/stitch`, {
        method: 'POST',
        body: stitch_data
        }).then((response) => response.json()).then(data => {return data;});
  };

const deleteMap = (mapId) =>
  fetch(`${BASENAME}/api/deleteMap/${mapId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

const requestValidation = (payload) =>
  fetch(`${BASENAME}/api/requestValidation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const requestMapUploadToGsb = (data) =>
  fetch(`${BASENAME}/api/uploadMapDetailsToGsb`, {
    method: "POST",
    body: data,
  });

const getMaps = (query) => fetch(`${BASENAME}/api/maps?str=${query}`);
const getAllMaps = () => fetch(`${BASENAME}/api/maps`);

const getSampleRacksJson = (mapId) =>
  fetch(`${BASENAME}/api/racksJson/${mapId}`);

const requestAutocadFileFromGsb = (data) =>
fetch(`${BASENAME}/api/getAutocadFileFromGsb`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export {
  getMap,
  updateMap,
  createMap,
  deleteMap,
  requestValidation,
  requestMapUploadToGsb,
  getMaps,
  getAllMaps,
  getSampleRacksJson,
  runHaiMapConversionScriptToMap,
  stitchingTtpRtpMapApi,
  requestAutocadFileFromGsb
};
