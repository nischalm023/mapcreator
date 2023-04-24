import _ from "lodash";
import { normalizeMap } from "utils/normalizr";

export const createEntityReducer = (reducerKey, idField) => (
  state = {},
  action
) => {
  switch (action.type) {
    case `ADD-${reducerKey}`: {
      return {
        ...state,
        [action.value[idField]]: action.value
      };
    }
    case `ADD-MULTIPLE-${reducerKey}`: {
      // assumed id is already present in entities (used for barcode reducer)
      let newEntitiesObj = {};
      let entities = action.value;
      for (let idx = 0; idx < entities.length; idx++) {
        let id = entities[idx][idField];
        newEntitiesObj[id] = {
          ...entities[idx]
        };
      }
      return { ...state, ...newEntitiesObj };
    }
    case `UPDATE-${reducerKey}-BY-ID`:
      return {
        ...state,
        [action.value[idField]]: {
          ...state[action.value[idField]],
          ...action.value
        }
      };
    // assumed id is passed as value on
    case `DELETE-${reducerKey}-BY-ID`:
    case `DELETE-MULTIPLE-${reducerKey}-BY-ID`:
      return _.omit(state, action.value);
  }
  return state;
};

// ? redux data store
export const dummyState = {
  normalizedMap: normalizeMap({
    id: "1",
    name: "loading...",
    map: {
      id: "1",
      floors: [
        {
          floor_id: 1,
          map_values: []
        }
      ],
      conveyors: [],
      downloadConveyor:[],
      elevators: [],
      zones: [],
      sectors: [],
      sectorBarcodeMapping: [],
      sectorMxUPreferences: {},
      queueDatas: []
    }
  }),
  currentFloor: 1,
  selection: {
    mapTiles: {},
    distanceTiles: {},
    shiftKey: false,
    metaKey: false,
    queueMode: false,
    zoneViewMode: false,
    sectorViewMode: false,
    directionViewMode: false
  },
  selectedArea: null,
  viewport: {
    viewportInstance: null,
    minimapInstance: null,
    currentView: null
  },
  successMessage: null,
  errorMessage: null
};
