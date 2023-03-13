import _ from "lodash";
import { randomColor } from "randomcolor";
import { getDirectionIncludingDisconnected } from "../reducers/barcode/util";

export const getCanvasSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight - 120,
});

export var handleErrors = (response) => {
  if (!response.ok) {
    return response.text().then((text) => Promise.reject(text));
  }
  return response;
};

export function stringify_number(input_number) {
  if (input_number < 10) {
    return "00".concat(input_number.toString());
  } else if (input_number < 100) {
    return "0".concat(input_number.toString());
  } else {
    return input_number.toString();
  }
}

export function stringify_number_ttp(input_number) {
  if (input_number < 10) {
    return "000".concat(input_number.toString());
  } else if (input_number < 100) {
    return "00".concat(input_number.toString());
  }else if (input_number < 1000) {
    return "0".concat(input_number.toString());
  } else {
    return input_number.toString();
  }
}

// consverty TTP format into default format
export const ConvertTTPFormatBarcodeIntoDefaultFormat = (key,value) =>{
    var coord_list = key.split(",").map((val) => parseInt(val))
    var row = coord_list[0]
    var column = coord_list[1]
    var barcode = encode_barcode(row,column)
  return barcode
};


// calculation for ttp barcode format
export const calculateGMBarcode = (world_cordinate,offset_value) =>{
    if(world_cordinate[1]==10812){
      console.log("here")
    }
    var GM_cordinate_x = Math.abs(world_cordinate[0] - offset_value[0])
    var GM_cordinate_y = Math.abs(world_cordinate[1] - offset_value[1])
    var GM_barcode_x = GM_cordinate_x%10000
    var GM_barcode_y = GM_cordinate_y%10000
    var GM_code_x = Math.floor(GM_cordinate_x/10000)
    var GM_code_y = Math.floor(GM_cordinate_y/10000)
    var GM_code_value =  GM_code_x * 10 + GM_code_y
    // if GM_code_value is 0 then append 0 in begining to match two digit format
    if(GM_code_value == '0'){
      GM_code_value = "0".concat(GM_code_value)
    }
    // if GM_code_value is one digit and GM_CODE_x is 0 and GM-code_y is greater than one
    // append 0 in the begining
    if((GM_code_x * 10 == 0) && (GM_code_y>0)){
      GM_code_value = "0".concat(GM_code_value)
    }
    var GM_barcode = GM_code_value+' '+stringify_number_ttp(GM_barcode_x)+' '+stringify_number_ttp(GM_barcode_y)
    return GM_barcode
}

// get offset value
// offset value is the right most edge cordinate

export const getOffsetValue = (barcodeDict) =>{
    var coordinate_list = []
    for (var barcode in barcodeDict) {
      var barcodeInfo = barcodeDict[barcode];
      var convert = JSON.parse(barcodeInfo["world_coordinate"])
      coordinate_list.push(convert)
    }
    const lowest_y = coordinate_list.reduce((a, b) => a[1] < b[1] ? a : b);
    const lowest_x = coordinate_list.reduce((a, b) => a[0] > b[0] ? a : b);
    var offset_value = [lowest_x[0],lowest_y[1]]
    return offset_value
}

export function encode_barcode(row, column) {
  var row_string = stringify_number(row);
  var column_string = stringify_number(column);
  return row_string.concat(".").concat(column_string);
}

// ordered array (top, right, left, down) of neighbour tiles
export const getNeighbourTiles = (tileId) => {
  var tileCoordinate = coordinateKeyToTupleOfIntegers(tileId);
  var neighbours = [];
  for (var delta of [[0, -1], [-1, 0], [0, 1], [1, 0]]) {
    var neighbour = [
      tileCoordinate[0] + delta[0],
      tileCoordinate[1] + delta[1],
    ];
    neighbours.push(tupleOfIntegersToCoordinateKey(neighbour));
  }
  return neighbours;
};

// can add filters to include [1,0,0] elements etc. using nbFilters array
// eg. if nbFilters = [[1,0,0], [0,0,0]], both of these kinds of neighbours will be excluded
// if nbFilters = [[0,0,0]], only non existing neighbours will be excluded, but [1,0,0] types will returned
export const getNeighbouringBarcodesWithNbFilter = (
  coordinateKey,
  barcodesDict,
  nbFilters
) => {
  // barcodesDict is state.normalizedMap.entities.barcode

  var curBarcode = barcodesDict[coordinateKey];
  if (!curBarcode) {
    return null;
  }
  // if adjacency is present, use that instead.
  if (curBarcode.adjacency) {
    return curBarcode.adjacency.map((val) => {
      if (!val) return val;
      return barcodesDict[tupleOfIntegersToCoordinateKey(val)];
    });
  }
  var neighbourTileKeys = getNeighbourTiles(coordinateKey);
  return neighbourTileKeys.map((tileKey, idx) =>
    nbFilters.some((nbFilter) =>
      _.isEqual(nbFilter, curBarcode.neighbours[idx])
    )
      ? null
      : barcodesDict[tileKey]
  );
};
// considers [1,0,0] also
export const getNeighbouringBarcodesIncludingDisconnected = (
  coordinateKey,
  barcodesDict
) => {
  // barcodesDict is state.normalizedMap.entities.barcode
  var curBarcode = barcodesDict[coordinateKey];
  if (!curBarcode) return null;
  var neighbourTileKeys = getNeighbourTiles(coordinateKey);
  let nbBarcodes = [null, null, null, null];
  // if adjacency is present, use that.
  if (curBarcode.adjacency) {
    nbBarcodes = curBarcode.adjacency.map((val) => {
      if (!val) return val;
      return barcodesDict[tupleOfIntegersToCoordinateKey(val)];
    });
  }
  // if nbBarcodes is null somewhere, then try to check if neighbour is [1,0,0]. If so, use tile key for that.
  [0, 1, 2, 3].forEach((idx) => {
    if (nbBarcodes[idx] == null && curBarcode.neighbours[idx][0] == 1) {
      // assume its the tile key barcode
      nbBarcodes[idx] = barcodesDict[neighbourTileKeys[idx]];
    }
  });
  return nbBarcodes;
};
// only considers barcodes that are actually connected. i.e. [0,0,0] neighbours are assumed null
export const getNeighbouringBarcodes = (coordinateKey, barcodesDict) => {
  return getNeighbouringBarcodesWithNbFilter(coordinateKey, barcodesDict, [
    [0, 0, 0],
    [1, 0, 0],
  ]);
};

export const getNeighbouringCoordinateKeys = (coordinateKey, barcodesDict) => {
  return getNeighbouringBarcodesWithNbFilter(coordinateKey, barcodesDict, [
    [0, 0, 0],
    [1, 0, 0],
  ]).map((elm) => (elm == null ? null : elm.coordinate));
};

export const getNeighbouringCoordinateKeysIncludingDisconnected = (
  coordinateKey,
  barcodesDict
) => {
  return getNeighbouringBarcodesWithNbFilter(coordinateKey, barcodesDict, [
    [0, 0, 0],
  ]).map((elm) => (elm == null ? null : elm.coordinate));
};

export const getNeighboursThatAllowAccess = (coordinateKey, barcodesDict) => {
  var neighbours = getNeighbouringBarcodesIncludingDisconnected(
    coordinateKey,
    barcodesDict
  );
  var neighboursThatAllowAccess = [];
  for (let neighbour of neighbours) {
    if (neighbour != null) {
      const coordinate_to_neighbour_direction = getDirectionIncludingDisconnected(
        coordinateKey,
        neighbour.coordinate,
        barcodesDict
      );
      const opp_coordinate_to_neighbour_direction =
        (coordinate_to_neighbour_direction + 2) % 4;
      const neighbour_ns = neighbour.neighbours;
      const neighbour_to_coordinate_ns =
        neighbour_ns[opp_coordinate_to_neighbour_direction];
      const neighbourToCoordinateBotMovement = neighbour_to_coordinate_ns[1];
      const neighbourToCoordinateRackMovement = neighbour_to_coordinate_ns[2];
      if (
        neighbourToCoordinateBotMovement == 1 ||
        neighbourToCoordinateRackMovement == 1
      ) {
        neighboursThatAllowAccess.push(neighbour);
      } else {
        neighboursThatAllowAccess.push(null);
      }
    } else {
      neighboursThatAllowAccess.push(neighbour);
    }
  }
  return neighboursThatAllowAccess;
};

export const getNeighboursThatAllowAccessWithLiftState = (
  coordinateKey,
  barcodesDict,
  liftState
) => {
  var neighbours = getNeighbouringBarcodesIncludingDisconnected(
    coordinateKey,
    barcodesDict
  );
  var neighboursThatAllowAccess = [];
  for (let neighbour of neighbours) {
    if (neighbour != null) {
      const coordinate_to_neighbour_direction = getDirectionIncludingDisconnected(
        coordinateKey,
        neighbour.coordinate,
        barcodesDict
      );
      const opp_coordinate_to_neighbour_direction =
        (coordinate_to_neighbour_direction + 2) % 4;
      const neighbour_ns = neighbour.neighbours;
      const neighbour_to_coordinate_ns =
        neighbour_ns[opp_coordinate_to_neighbour_direction];
      const neighbourToCoordinateLiftStateMovement =
        neighbour_to_coordinate_ns[liftState + 1];
      if (neighbourToCoordinateLiftStateMovement == 1) {
        neighboursThatAllowAccess.push(neighbour);
      } else {
        neighboursThatAllowAccess.push(null);
      }
    } else {
      neighboursThatAllowAccess.push(neighbour);
    }
  }
  return neighboursThatAllowAccess;
};

export const getNeighbourBarcodeIncludingDisconnectedInDirection = (
  coordinateKey,
  barcodesDict,
  direction
) => {
  const neighbouringBarcodes = getNeighbouringBarcodesIncludingDisconnected(
    coordinateKey,
    barcodesDict
  );
  return neighbouringBarcodes[direction];
};

export var checkValidDirection = (emptyDirTileIdListObj) => {
  var emptyDirTileIdDirObj = {};
  var emptyDirTileIdList = [];
  var directions = {};
  Object.keys(emptyDirTileIdListObj).forEach(function(key, index) {
    if (index == 0) {
      emptyDirTileIdListObj[key].forEach(function(val) {
        directions[val[0]] = val[0];
        emptyDirTileIdDirObj[val[0]] = [];
        emptyDirTileIdDirObj[val[0]].push(val);
      });
    } else {
      emptyDirTileIdListObj[key].forEach(function(val) {
        if (directions[val[0]] != undefined) {
          emptyDirTileIdDirObj[val[0]].push(val);
        }
      });
    }
  });
  Object.keys(directions).forEach(function(val) {
    if (
      emptyDirTileIdDirObj[val].length ==
      Object.keys(emptyDirTileIdListObj).length
    ) {
      emptyDirTileIdList.push(emptyDirTileIdDirObj[val]);
    }
  });
  return emptyDirTileIdList.length > 0 ? emptyDirTileIdList : [];
};

export var isValidCoordinateKey = (coordinateKey) =>
  /^\d*,\d*$/.test(coordinateKey);

export var implicitBarcodeToCoordinateTuple = (barcode) => {
  const coordinateKey = implicitBarcodeToCoordinate(barcode);
  return coordinateKeyToTupleOfIntegers(coordinateKey);
};

export var coordinateKeyToTupleOfIntegers = (coordinateKey) => {
  // '12,3' => [12, 3]
  if (!isValidCoordinateKey(coordinateKey)) {
    throw new Error(`${coordinateKey} does not match coordinateKey pattern.`);
  }
  return coordinateKey.split(",").map((val) => parseInt(val));
};

// implicit conversion. used for eg. getting new barcode's barcode
export var implicitCoordinateKeyToBarcode = (coordinateKey) => {
  var [x, y] = coordinateKeyToTupleOfIntegers(coordinateKey);
  return encode_barcode(y, x);
};

export var tupleOfIntegersToCoordinateKey = (tuple) => {
  return `${tuple[0]},${tuple[1]}`;
};
// gets unique ids for number of entities
//  existingEntities is map!
export const getIdsForEntities = (numEntities = 0, existingEntities = {}) => {
  var startId = Object.keys(existingEntities).length + 1;
  // https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
  return [...Array(numEntities).keys()].map((idx) => idx + startId);
};

export var createFloorFromCoordinateData = ({
  row_start,
  row_end,
  column_start,
  column_end,
  msu_dimensions,
  barcode_distances,
  floor_id,
}) => {
  // be careful to satisfy json schema
  // iterate and fill up map_values
  var map_values = [];
  var size = parseInt(barcode_distances / 2);
  for (var row = row_start; row <= row_end; row++) {
    for (var column = column_start; column <= column_end; column++) {
      var barcode = encode_barcode(row, column);
      var unit = {
        store_status: 0,
        zone: "defzone",
        sector: "undefined",
        barcode,
        botid: "null",
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        coordinate: `${column},${row}`,
        blocked: false,
        size_info: [size, size, size, size],
        msu_dimensions: msu_dimensions
      };
      if (row == row_start) {
        unit.neighbours[0] = [0, 0, 0];
      }
      if (row == row_end) {
        unit.neighbours[2] = [0, 0, 0];
      }
      if (column == column_start) {
        unit.neighbours[1] = [0, 0, 0];
      }
      if (column == column_end) {
        unit.neighbours[3] = [0, 0, 0];
      }
      map_values.push(unit);
    }
  }
  return {
    floor_id,
    chargers: [],
    ppses: [],
    odsExcludeds: [],
    dockPoints: [],
    fireEmergencies: [],
    map_values,
  };
};

export var createMapFromCoordinateData = (
  row_start,
  row_end,
  column_start,
  column_end,
  msu_dimensions,
  barcode_distances
) => {
  return {
    elevators: [],
    // add default zone defzone
    zones: [
      {
        zone_id: "defzone",
        blocked: false,
        paused: false,
      },
    ],
    sectors: [],
    sectorBarcodeMapping: [{}],
    sectorMxUPreferences: {},
    queueDatas: [],
    downloadConveyor:[],
    conveyors:[],
    barcodeDistance:parseInt(barcode_distances / 2),
    floors: [
      createFloorFromCoordinateData({
        row_start,
        row_end,
        column_start,
        column_end,
        msu_dimensions,
        barcode_distances,
        floor_id: 1,
      }),
    ],
  };
};

export const intersectRect = (r1, r2) =>
  !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );

export const addNeighbourToBarcode = (barcode, direction, nbCoordinate) => {
  const withoutAdjacency = {
    ...barcode,
    // https://medium.com/@giltayar/immutably-setting-a-value-in-a-js-array-or-how-an-array-is-also-an-object-55337f4d6702
    neighbours: Object.assign([...barcode.neighbours], {
      [direction]: [1, 1, 1],
    }),
  };
  if (barcode.adjacency) {
    return {
      ...withoutAdjacency,
      adjacency: Object.assign([...barcode.adjacency], {
        [direction]: coordinateKeyToTupleOfIntegers(nbCoordinate),
      }),
    };
  }
  return withoutAdjacency;
};

export const deleteNeighbourFromBarcode = (
  barcode,
  direction,
  doesNeighbourExist = false
) => {
  const withoutAdjacency = {
    ...barcode,
    neighbours: Object.assign([...barcode.neighbours], {
      [direction]: [doesNeighbourExist ? 1 : 0, 0, 0],
    }),
  };
  if (barcode.adjacency) {
    return {
      ...withoutAdjacency,
      adjacency: Object.assign([...barcode.adjacency], {
        [direction]: null,
      }),
    };
  }
  return withoutAdjacency;
};

// Func used to convert barcode to coordinate.
// "500.143" => "143,500"
export const implicitBarcodeToCoordinate = (barcode) => {
  var [X, Y] = barcode.split(".");
  return parseInt(Y) + "," + parseInt(X);
};

// uses random color library to generate random colors and maps each zone to color
export const zoneToColorMapper = (zones) => {
  const colors = randomColor({
    count: Object.keys(zones).length,
  });
  const zoneIds = Object.keys(zones);
  const zoneToColoroMap = {};
  for (var i = 0; i < colors.length; i++) {
    zoneToColoroMap[zoneIds[i]] = colors[i];
  }
  return zoneToColoroMap;
};

// uses random color library to generate random colors and maps each sector to color
export const sectorToColorMapper = (sectors) => {
  const colors = randomColor({
    count: Object.keys(sectors).length,
  });
  const sectorIds = Object.keys(sectors);
  const sectorToColoroMap = {};
  for (var i = 0; i < colors.length; i++) {
    sectorToColoroMap[sectorIds[i]] = colors[i];
  }
  return sectorToColoroMap;
};
