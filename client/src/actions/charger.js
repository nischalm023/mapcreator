import {
  getNeighbourTiles,
  getNeighbouringBarcodes,
  getNeighbouringBarcodesIncludingDisconnected,
  implicitCoordinateKeyToBarcode,
  coordinateKeyToTupleOfIntegers
} from "utils/util";
import {
  coordinateKeyToBarcodeSelector,
  getIdsForNewEntities,
  getNewSpecialCoordinates,
  tileToWorldCoordinate
} from "utils/selectors";
import {
  getNeighbourBarcodeWorldCoord
} from "./add-transit-barcode";
import { addEntitiesToFloor, clearTiles, calculate_corner_world_cordinate } from "./actions";
import { CHARGER_DISTANCE } from "../constants";
import _ from "lodash";

// exported for testing
export const createNewCharger = (
  { charger_direction, charger_type },
  tileId,
  specialTileId,
  state
) => ({
  coordinate: tileId,
  charger_location: coordinateKeyToBarcodeSelector(state, { tileId }),
  charger_direction: charger_direction,
  entry_point_location: implicitCoordinateKeyToBarcode(specialTileId),
  entry_point_direction: charger_direction,
  reinit_point_location: implicitCoordinateKeyToBarcode(specialTileId),
  reinit_point_direction: charger_direction,
  status: "disconnected",
  mode: "manual",
  charger_type: charger_type
});

// TODO: test and fixes as explained below
// should also split this into smaller functions
// actual charger barcode, entry point special, barcode in direction of charger direction, and all other neighbours of charger barcode as well
export const createAllChargerBarcodes = (
  state,
  { charger_direction },
  tileId,
  specialTileId,
  barcodesDict
) => {
  // check if it's possible to create charger. i.e. if a barcode exists in charger_direction
  if (
    !barcodesDict[tileId].neighbours[charger_direction] ||
    !barcodesDict[tileId].neighbours[charger_direction][0]
  )
    throw new Error(
      `No neighbour for ${tileId} in direction ${charger_direction}`
    );
  var entryTileId = getNeighbouringBarcodes(tileId,barcodesDict)[charger_direction].coordinate
  // special barcode
  // TODO: can ask user to add this, using transit barcode button
  var specialBarcode = {
    store_status: 0,
    zone: "defzone",
    sector: "undefined",
    barcode: implicitCoordinateKeyToBarcode(specialTileId),
    botid: "null",
    neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    coordinate: specialTileId,
    blocked: false,
    size_info: [750, 750, 750, 750],
    adjacency: [null, null, null, null],
    special: true,
  };
  var chargerBarcode = _.cloneDeep(barcodesDict[tileId]);
  specialBarcode.neighbours[charger_direction] = [1, 1, 0];
  specialBarcode.neighbours[(charger_direction + 2) % 4] = [1, 1, 0];
  specialBarcode.adjacency[charger_direction] = coordinateKeyToTupleOfIntegers(
    entryTileId
  );
  specialBarcode.adjacency[
    (charger_direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(tileId);
  // Size Info:
  for (var dir = 0; dir < 4; dir++) {
    if (dir == charger_direction || dir == (charger_direction + 2) % 4) {
      specialBarcode.size_info[dir] = CHARGER_DISTANCE;
    } else {
      // Use charger barcode size info for perpendicular directions
      specialBarcode.size_info[dir] = chargerBarcode.size_info[dir];
    }
  }
  // charger barcode
  // TODO: some other neighbour changes to .neighbours; is this even required though since adjacency will now be used for this?
  // remove edges from charger barcode to all other barcodes except special barcode
  // this is so that butler only leaves the way it has come, eg. for side dock
  chargerBarcode.neighbours[charger_direction][2] = 0;
  chargerBarcode.neighbours.forEach((_nb, idx) => {
    if (idx != charger_direction) {
      chargerBarcode.neighbours[idx][1] = 0;
      chargerBarcode.neighbours[idx][2] = 0;
    }
  });
  // we still need neighbour in adjacency even if neighbour structure is [1,0,0]
  chargerBarcode.adjacency = getNeighbouringBarcodesIncludingDisconnected(
    tileId,
    barcodesDict
  ).map(x => (x ? coordinateKeyToTupleOfIntegers(x.coordinate) : null));
  chargerBarcode.adjacency[charger_direction] = coordinateKeyToTupleOfIntegers(
    specialTileId
  );
  const refBarcodeWorldCoord = tileToWorldCoordinate(state, { tileId });
  const transitBarcodeWorldCoord = getNeighbourBarcodeWorldCoord(
    refBarcodeWorldCoord,
    CHARGER_DISTANCE*2,
    charger_direction
  );
  specialBarcode["world_coordinate"] = `[${transitBarcodeWorldCoord["x"]},${transitBarcodeWorldCoord["y"]}]`
  specialBarcode["world_coordinate_reference_neighbour"]= tileId
  specialBarcode["corner_world_cooordinate"] = calculate_corner_world_cordinate(specialBarcode["size_info"],[transitBarcodeWorldCoord["x"],transitBarcodeWorldCoord["y"]])
  var originalChargerBarcodeSizeInfoInChargerDirection =
    chargerBarcode.size_info[charger_direction];
  chargerBarcode.size_info[charger_direction] = CHARGER_DISTANCE;

  // entry barcode
  var entryBarcode = _.cloneDeep(barcodesDict[entryTileId]);
  entryBarcode.neighbours[(charger_direction + 2) % 4][2] = 0;
  entryBarcode.adjacency = getNeighbouringBarcodes(
    entryTileId,
    barcodesDict
  ).map(x => (x ? coordinateKeyToTupleOfIntegers(x.coordinate) : null));
  entryBarcode.adjacency[
    (charger_direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(specialTileId);
  entryBarcode.size_info[(charger_direction + 2) % 4] =
    entryBarcode.size_info[(charger_direction + 2) % 4] +
    originalChargerBarcodeSizeInfoInChargerDirection -
    3 * CHARGER_DISTANCE;

  // other neighbour barcodes of charger barcode
  var chargerNeighboursExceptEntry = getNeighbouringBarcodes(
    tileId,
    barcodesDict
  )
    .map((nb, idx) => {
      if (!nb || nb.coordinate == entryTileId) return null;
      var nbClone = _.cloneDeep(nb);
      nbClone.neighbours[(idx + 2) % 4][1] = 0;
      nbClone.neighbours[(idx + 2) % 4][2] = 0;
      return nbClone;
    })
    .filter(e => e != null);
  return [
    ...chargerNeighboursExceptEntry,
    chargerBarcode,
    specialBarcode,
    entryBarcode
  ];
};

export const addChargers = formData => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
    currentFloor
  } = state;
  const barcodesDict = state.normalizedMap.entities["barcode"] || {};
  var newBarcodes = [];
  var newChargers = [];
  var specialTileIds = getNewSpecialCoordinates(state, {
    n: Object.keys(mapTiles).length
  });
  Object.keys(mapTiles).forEach((tileId, idx) => {
    var specialTileId = specialTileIds[idx];
    newBarcodes = newBarcodes.concat(
      createAllChargerBarcodes(state,formData, tileId, specialTileId, barcodesDict)
    );
    newChargers.push(createNewCharger(formData, tileId, specialTileId, state));
  });
  // get ids for chargers
  var ids = getIdsForNewEntities(state, {
    entityName: "charger",
    newEntities: newChargers
  });
  var newChargersWithIds = _.zip(ids, newChargers).map(
    ([charger_id, charger]) => ({
      ...charger,
      charger_id
    })
  );
  // add chargers
  dispatch({
    type: "ADD-MULTIPLE-CHARGER",
    value: newChargersWithIds
  });
  // add barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: newBarcodes
  });
  // add entities to floor (charger)
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "chargers",
      entities: newChargersWithIds,
      idField: "charger_id"
    })
  );
  // add entities to floor (barcode)
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "map_values",
      entities: newBarcodes,
      idField: "coordinate"
    })
  );
  return dispatch(clearTiles);
};

export const removeCharger = ({ charger_id }) => (dispatch, getState) => {
  var chargerDetails = _.find(getState().normalizedMap.entities.charger, {
    charger_id: charger_id
  });
  dispatch({
    type: "DELETE-CHARGER-DATA",
    value: { chargerDetails }
  });
  dispatch({
    type: "DELETE-CHARGER-BY-ID",
    value: charger_id
  });
};
