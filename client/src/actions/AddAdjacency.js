import { ADJACENCYDISTANCE } from "../constants";

const sortYCord = (x,objSorted) => {
    var y_Values = objSorted.reduce((y_Values, objSorted) => {
    if (objSorted.x==x) {
        y_Values.push(objSorted.y);
    }
    return y_Values;
    }, []).sort((a, b) => a - b)
    return y_Values
}

const sortXCord = (y,objSorted) => {
    var x_Values = objSorted.reduce((x_Values, objSorted) => {
    if (objSorted.y==y) {
        x_Values.push(objSorted.x);
    }
    return x_Values;
    }, []).sort((a, b) => b - a)
    return x_Values
}

const getCoordFromWorldCord = (WorldCoordinateToTileIdMapping,world_cord) =>{
    var world_cold_string = world_cord[0]+","+world_cord[1]
    return WorldCoordinateToTileIdMapping[world_cold_string].split(",").map((val) => parseInt(val))

}

const getNorthAdjacencyAndNeighbour = (y_list,x,y,WorldCoordinateToTileIdMapping) => {
    var north_index = y_list.indexOf(y)
    if(y_list[0] == y){
        return [null,[0,0,0]]
    }
    if(Math.abs(Math.abs(y_list[north_index]) - Math.abs(y_list[north_index-1]))>ADJACENCYDISTANCE){
        return [null,[0,0,0]]
    }else{
        var north_adjacent_coord = getCoordFromWorldCord(WorldCoordinateToTileIdMapping,[x,y_list[north_index-1]])
        return [north_adjacent_coord,[1,1,1]]
    }
}

const getSouthAdjacencyAndNeighbour = (y_list,x,y,WorldCoordinateToTileIdMapping) => {
    var south_index = y_list.indexOf(y)
    if(y_list[y_list.length-1] == y){
        return [null,[0,0,0]]
    }
    if(Math.abs(Math.abs(y_list[south_index+1]) - Math.abs(y_list[south_index]))>ADJACENCYDISTANCE){
        return [null,[0,0,0]]
    }else{
        var south_adjacent_coord = getCoordFromWorldCord(WorldCoordinateToTileIdMapping,[x,y_list[south_index+1]])
        return [south_adjacent_coord,[1,1,1]]
    }
    
}

const getEastAdjacencyAndNeighbour = (x_list,y,x,WorldCoordinateToTileIdMapping) => {
    var east_index = x_list.indexOf(x)
    if(x_list[0] == x){
        return [null,[0,0,0]]
    }
    if(Math.abs(Math.abs(x_list[east_index-1]) - Math.abs(x_list[east_index]))>ADJACENCYDISTANCE){
        return [null,[0,0,0]]
    }else{
        var east_adjacent_coord = getCoordFromWorldCord(WorldCoordinateToTileIdMapping,[x_list[east_index-1],y])
        return [east_adjacent_coord,[1,1,1]]
    }
    
}

const getWestAdjacencyAndNeighbour = (x_list,y,x,WorldCoordinateToTileIdMapping) => {
    var west_index = x_list.indexOf(x)
    if(x_list[x_list.length-1] == x){
        return [null,[0,0,0]]
    }
    if(Math.abs(Math.abs(x_list[west_index+1]) - Math.abs(x_list[west_index]))>ADJACENCYDISTANCE){
        return [null,[0,0,0]]
    }else{
        var west_adjacent_coord = getCoordFromWorldCord(WorldCoordinateToTileIdMapping,[x_list[west_index+1],y])
        return [west_adjacent_coord,[1,1,1]]
    }
    
}

const createAdjacentAndNeighbour = (x_list,y_list,x,y,WorldCoordinateToTileIdMapping) => {
    var adjacent_neighbour_dict = {}
    var mappping_coord_with_adjacent_neighbour_dict = {}
    var north_adjacency = getNorthAdjacencyAndNeighbour(y_list,x,y,WorldCoordinateToTileIdMapping)
    var south_adjacency = getSouthAdjacencyAndNeighbour(y_list,x,y,WorldCoordinateToTileIdMapping)
    var east_adjacency = getEastAdjacencyAndNeighbour(x_list,y,x,WorldCoordinateToTileIdMapping)
    var west_adjacency = getWestAdjacencyAndNeighbour(x_list,y,x,WorldCoordinateToTileIdMapping)
    adjacent_neighbour_dict["adjacency"]=[north_adjacency[0],east_adjacency[0],south_adjacency[0],west_adjacency[0]]
    adjacent_neighbour_dict["neighbours"]=[north_adjacency[1],east_adjacency[1],south_adjacency[1],west_adjacency[1]]
    return adjacent_neighbour_dict
}

export const mappedNeighbour = (new_neighbour,old_neighbour) => {
    var new_neighbour_list = []
    
    for (var i = 0; i < old_neighbour.length; i++) {

        if (JSON.stringify(old_neighbour[i]) == JSON.stringify([1,1,0]) || JSON.stringify(old_neighbour[i]) == JSON.stringify([1,0,0])){
            if(JSON.stringify(new_neighbour[i]) === JSON.stringify([0,0,0])){
                new_neighbour_list.splice(i, 0, new_neighbour[i]);
            }else{
                new_neighbour_list.splice(i, 0, old_neighbour[i])
            }

        }else{
            new_neighbour_list.splice(i, 0, new_neighbour[i])
        }
        
}
return new_neighbour_list
}

export const getLinearWorldCordXY = (x,y,coord,objSorted,WorldCoordinateToTileIdMapping) => {
  var x_list = sortXCord(y,objSorted)
  var y_list = sortYCord(x,objSorted)
  var mappping_coord_with_adjacent_neighbour_dict = createAdjacentAndNeighbour(x_list,y_list,x,y,WorldCoordinateToTileIdMapping)
  return mappping_coord_with_adjacent_neighbour_dict
  // mappedAdjacencyNeighbour(mappping_coord_with_adjacent_neighbour_dict,coord)
};
