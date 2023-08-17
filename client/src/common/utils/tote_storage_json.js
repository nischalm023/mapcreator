function orientationFunction(direction){
    let orientation
    if(direction === "NORTH"|| direction === "north"){
      orientation = 0;
    }
    else if(direction === "EAST"|| direction === "east"){
      orientation = 1;
    }
    else if(direction=== "SOUTH"|| direction === "south"){
      orientation = 2;
    }
    else{
      orientation = 3;
    }
    return orientation;
}
function getCoordinates(value,barcode){
    var coordinates =[]
    var coordinate_val = Object.keys(value.barcode)
    if(coordinate_val.length!==0){
        coordinates = `[${coordinate_val}]`
    }
    // for(let k in barcode ){
    //     if(barcode[k].barcode === value.io_point.value){
    //         coordinates = `[${barcode[k].coordinate}]`
    //         break;
    //     }
    // }
    return coordinates
}
const getIOPointData = (value,barcode)=>{
    var toteStorage_io_dict = {}
    var coordinate_data = getCoordinates(value,barcode)
    toteStorage_io_dict["coordinate"] = coordinate_data
    var orientation = orientationFunction(value.bot_direction.value.value)
    toteStorage_io_dict["bot_orientation"] = orientation
    return toteStorage_io_dict
}
const FormToteStorageJson = (value,barcode)=>{
    var toteStorage_dict = {}
    toteStorage_dict["location"] = value.tote_location.value
    var io_data = getIOPointData(value,barcode)
    toteStorage_dict["io_point"] = io_data
    toteStorage_dict["storage_direction"] = orientationFunction(value.storable_direction.value.value)
    if(value.ndeep.value.value === "single"){
        toteStorage_dict["ndeep"] = 0
    }
    if(value.ndeep.value.value === "double"){
        toteStorage_dict["ndeep"] = 1
    }
    toteStorage_dict["height"] = parseInt(value.tote_height.value)
    return toteStorage_dict
}
export default (normalizedMap) => {
    var toteStorage_data = normalizedMap.entities.toteStorables
    var barcode = normalizedMap.entities.barcode
    var toteStorage_json =[]
    for (const [key, value] of Object.entries(toteStorage_data)) {
        var tote_storage_dict_value = FormToteStorageJson(value,barcode)
        toteStorage_json.push(tote_storage_dict_value)    }
    return toteStorage_json;
};