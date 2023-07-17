import express from "express";
import getLoadedAjv from "client/src/common/utils/get-loaded-ajv";
import { Map } from "server/models/index";
import wrap from "express-async-handler";
import getRacksJson from "server/scripts/make-racks-json";
import sequelize, { Op } from "sequelize";
import { requestValidation } from "./verifier-apis";
import { UPLOAD_MAP_TO_GSB_API, SUBMIT_BTN_API_HIT_TO_GSB, DOWNLOAD_AUTOCAD_FILE_TO_GSB_API, EXPORT_DATA_TO_GSB_API } from "./gsb-apis";
import moment from "moment";
// import axios from "axios";
// HACK: adding cors to fetch data from storybook. should remove this later.
import cors from "cors";
const multer = require('multer');
const app = express();
const FormData = require('form-data'); // added this line
global.fetch = require("node-fetch");
const upload = multer();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.get("/api/test", (req, res) => res.json("test api response"));

app.get("/api/backtracking",
  wrap(async(request,response) => {
  const attributes = ["id"];
  var maps = await Map.findAll({
        attributes,
      })
  var mapsJson = maps.map(map => map.toJSON());
  for (var i = 0; i < mapsJson.length; i++) {
    var map =  await Map.findByPk(mapsJson[i]["id"]);
      var map_data = map.toJSON()
      if(map_data["map"] && map_data["map"].hasOwnProperty("floors")){
        var floor_list = map_data["map"]["floors"]
        for (var j = 0; j < floor_list.length; j++) {
          var map_values = floor_list[j]["map_values"]
          for (var k = 0; k < map_values.length; k++) {
            if(!map_values[k].hasOwnProperty("default_barocde")){
              if(/^(\d+\.\d+)$/.test(map_values[k]["barcode"])){
                map_values[k]["default_barcode"]= map_values[k]["barcode"]
              }
            }
          }
        }
    await map.update({ map: map_data["map"]});    
    }
  }
  console.log("done")
  })
);

app.get("/api/backtracking_conveyor",
  wrap(async(request,response) => {
  const attributes = ["id"];
  var maps = await Map.findAll({
        attributes,
      })
  var mapsJson = maps.map(map => map.toJSON());
  for (var i = 0; i < mapsJson.length; i++) {
    var map =  await Map.findByPk(mapsJson[i]["id"]);
      var map_data = map.toJSON()
       if(map_data["map"] && map_data["map"].hasOwnProperty("conveyors")){
          var conveyors = map_data["map"]["conveyors"]
          if(conveyors.length>0 && conveyors[0]!==null){
            for (var k = 0; k < conveyors.length; k++) {
               if(!conveyors[k].hasOwnProperty("conveyor_step_id") && conveyors[k].hasOwnProperty("selected_tile")){
                var conveyor_step_id={}
                for (var i = 0; i < conveyors[k]["selected_tile"].length; i++) {
                  conveyor_step_id[conveyors[k]["selected_tile"][i].toString()]=(i+1).toString()
                }
                conveyors[k]["conveyor_step_id"] = conveyor_step_id
                console.log("conveyor_step_id========",conveyor_step_id,map_data["id"])
               }
            }
          }
    await map.update({ map: map_data["map"]});    
    }
  }
  console.log("done")
  })
);




// should only return the id of the map
app.post(
  "/api/createMap",
  wrap(async (req, res) => {
    // expect internal representation json here.
    // should be correct but validating anyway
    var validate = getLoadedAjv().getSchema("map");
    const { map, name, gsb, uid, source, solution_id, agent_id, fa_id } = req.body;
    console.log("Create API hit made via. GSB application", gsb);
    if (!validate(map)) {
      throw new Error(JSON.stringify(validate.errors));
    }
    if (!name) {
      throw new Error("name is required");
    }
    // store the map created in db
    if(gsb){
      var isGsb = true
    }else{
      var isGsb = false
    }
    var created = await Map.create({ map:map, name:name,BaseMap:map,isGsb:isGsb});
    if (gsb) {
      String.prototype.format = function () {
        var i = 0, args = arguments;
        return this.replace(/{}/g, function () {
          return typeof args[i] != 'undefined' ? args[i++] : '';
        });
      };

      let api = SUBMIT_BTN_API_HIT_TO_GSB.format(solution_id, fa_id, agent_id);
      console.log("GSB Submit API", api);
      // notifying GSB that Submit button has been clicked on Map Creator
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "map_tool_id": created.id,
          "uid": uid, 
          "title": name, 
          "source": source
        })}
      );
      if (response.status !== 200){
        throw new Error("GSB call upon click of Submit button failed");
      }
    }
    // send only id
    res.json(created.id);
  })
);

app.get(
  "/api/map/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    var map = await Map.findByPk(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    let mapJson = map.toJSON();
    res.json(mapJson);
  })
);

// only fetch id, name, createdOn, updatedOn
app.get(
  "/api/maps",
  wrap(async (req, res) => {
    var str = req.query.str;
    const attributes = ["id", "name", "createdAt", "updatedAt", "sanity", "validationRequested"];
    const order = [["updatedAt", "DESC"]];
    let maps;
    if (str) {
      maps = await Map.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${str}%`
              }
            },
            sequelize.where(
              sequelize.cast(sequelize.col("Map.id"), "varchar"),
              { [Op.iLike]: `%${str}%` }
            )
          ]
        },
        attributes,
        order
      });
    } else {
      maps = await Map.findAll({
        attributes,
        order,
        where: {
          isGsb: false
        } 
      });
    }
    var mapsJson = maps.map(map => map.toJSON());
    res.json(mapsJson);
  })
);

// update map
app.post(
  "/api/map/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    const { map: reqMap } = req.body;
    var map = await Map.findByPk(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    // TODO: run validation here?
    var validate = getLoadedAjv().getSchema("map");
    if (!validate(reqMap)) {
      throw new Error(JSON.stringify(validate.errors));
    }
    // updating the new map edits in DB
    await map.update({ map: reqMap, validationRequested: false, sanity: false});
    // send back the new map?
    var newMap = await Map.findByPk(id);
    res.json(newMap.toJSON());
  })
);

// delete map
app.post("/api/deleteMap/:id", (req, res) => {
  const { id } = req.params;
  return Map.destroy({
    where: {
      id
    }
  }).then(numDeleted => {
    if (numDeleted !== 1)
      res
        .status(500)
        .send(`was able to delete ${numDeleted} rows instead of 1`);
    else res.send("ok");
  });
});

app.get(
  "/api/racksJson/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
    var map = await Map.findByPk(id);
    if (!map) throw new Error(`could not find map for id ${id}`);
    var racksJson = await getRacksJson(id);
    res.json(racksJson);
  })
);

app.post('/api/uploadMapDetailsToGsb', upload.array('files'), async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
  };
  let formData = new FormData();
  let data = req.body;
  let api = UPLOAD_MAP_TO_GSB_API.format(data.gsb_solution_id, data.functional_area_id, data.gsb_agent_id);
  let gsbKeyList = ["map_tool_id","gsb_solution_id","gsb_agent_id","functional_area_id","uid"];
  gsbKeyList.forEach((gsbKey) => {
    formData.append(gsbKey, data[gsbKey]);
    delete data[gsbKey]
  });

  formData.append("map_summary_details", JSON.stringify(data));
  var fileIndex = 0;
  req.files.forEach((file) => {
    formData.append(`files[${fileIndex}]file`, file.buffer, file.originalname);
    formData.append(`files[${fileIndex}]file_type`, file.originalname.replace(".json",""));
    fileIndex++;
  });
  
  try {    
    console.log("GSB Save and Close API", api);
    const response = await fetch(api, {
      method: 'POST',
      body: formData
    });
    if (response.status === 200) {
      return res.json({ message: 'Successfully uploaded map details and files to GSB' });
    } else {
      return res.status(500).json({ message: 'Failed to send'})
    }
  }
  catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Failed to send data and files to remote server' });
    }
  });

app.post('/api/cloneMap', async (req, res) => {
  try {
    let data = req.body;
    let mapId = data.map_id
    // get the requested map from DB
    var map = await Map.findByPk(mapId);
    if (!map){
      return res.status(500).json({ message: `Could not find map for id ${mapId}`})
    } 
    // ? create a clone for map having id -> `mapId`
    let mapJson = map.toJSON();
    var created = await Map.create({ map:mapJson.map, name:`${mapJson.name}_clone`, BaseMap:mapJson.map,isGsb:true});
    return res.json({"cloned_map_id": created.id});
  }
  catch (err) {
      return res.status(500).json({ message: 'Failed to clone map' });
    }
  });

// Request validation of a Map
app.post(
  "/api/requestValidation",
  wrap(async (req, res) => {
    const { map_creator_id, email } = req.body;
    var map = await Map.findByPk(map_creator_id);

    if (!email) {
      throw new Error("Email ID is required");
    }
    // call verifier API for validation
    requestValidation(req.body)
    .then(response => {
        if (response.status === 200 || response.status === 202) {
          {
          return response.text();
          }
        } 
        return "Internal server error";
    })
    .then(async (ver_res) => {
      await map.update({ validationRequested: true ,sanity: true });
      res.send(ver_res);
    })
    .catch((error) => {
      console.log(error);
    });
  })
);

// verifier request after validation
app.post(
  "/api/updateSanityStatus",
  wrap(async (req, res) => {
    const { map_id, map_updated_time, sanity_status } = req.body;
    var map = await Map.findByPk(map_id);
    var format = "YYYY-MM-DD HH:mm:ssZ";
    var current_updated_time = moment(map.updatedAt).utc().format(format);

    if (map_updated_time !== current_updated_time) {
      res.send("Map has been changed");
    } else {
      await map.update({ sanity: sanity_status, validationRequested: false});
      res.send("ok");
    }
  })
);

// error handler should be last middleware?
// removing next from here breaks tests??
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

app.post('/api/exportDataToGsb', upload.array('files'), async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
  };
  let formData = new FormData();
  let data = req.body;
  var map = await Map.findByPk(data.map_tool_id);
  let api = EXPORT_DATA_TO_GSB_API.format(data.gsb_solution_id, data.functional_area_id, data.gsb_agent_id);
  let solutionVersionId = data.gsb_solution_version;
  let gsbKeyList = ["map_tool_id","gsb_solution_id","gsb_agent_id","functional_area_id", "gsb_solution_version",
  "requested_user","title"];
  gsbKeyList.forEach((gsbKey) => {
    formData.append(gsbKey, data[gsbKey]);
    delete data[gsbKey]
  });
  formData.append("map_summary_details", JSON.stringify(data));
  var fileIndex = 0;
  req.files.forEach((file) => {
    formData.append(`files[${fileIndex}]file`, file.buffer, file.originalname);
    formData.append(`files[${fileIndex}]file_type`, file.originalname.replace(".json",""));
    fileIndex++;
  });
  try {    
    const response = await fetch(api, {
      method: 'POST',
      body: formData,
      headers: { "Solution-Version": solutionVersionId },
    });
    if (response.status === 200) {
      await map.update({isGsb: true});
      return res.json({ message: 'Successfully exported map details to GSB' });
    } else {
      return res.status(500).json({ message: 'Failed to send'})
    }
  }
  catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Failed to export map data to remote server' });
    }
  
});

app.post('/api/getAutocadFileFromGsb', async (req, res) => {
  let formData = new FormData();
  String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
  };
  let data = req.body;
  let api = DOWNLOAD_AUTOCAD_FILE_TO_GSB_API.format(data.gsb_solution_id, data.gsb_functional_area_id, data.gsb_agent_id)+"?uid="+data.gsb_uid;
  try{
  const response = await fetch(api,{
          method: "GET"             
          }).then((res) => res.json())
          .then((url_response) => {
            res.send({ status:"200", message: 'Successfully get files from GSB',data:url_response })    
          })
   return res.json(response); 
    }catch (err) {
      return res.status(500).json({ 'status': 500, message: 'Failed to fetch url' });
    }
                   
});

export default app;
