import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "reducers/reducer";
import {
  entityMiddleware,
  floorMiddleware,
  errorPopupMiddleware
} from "actions/middlewares";
import { dummyState } from "reducers/util";

// using mapObj as source of truth in store. tiles etc. will be derived from it.
const logger = createLogger({
  // options
  // diff: true,
  // do not log drag, meta key, shift key messages
  predicate: (_getState, { type }) =>
    !/(DRAG-MOVE|DRAG-START|DRAG-END|SHIFT-KEY-DOWN|SHIFT-KEY-UP|META-KEY-DOWN|META-KEY-UP)/.test(
      type
    )
});

let middleware = [
  thunk,
  entityMiddleware,
  floorMiddleware,
  errorPopupMiddleware
];
middleware = [...middleware, logger];
// if (
//   process.env.NODE_ENV == "development" ||
//   process.env.REACT_APP_KEEP_REDUX_LOGGER
// )
//   middleware = [...middleware, logger];

export default createStore(
  reducer,
  dummyState,
  // only do logging in development
  applyMiddleware(...middleware)
);

// this one is mainly for testing
export const configureStore = initState =>
  createStore(reducer, initState, applyMiddleware(...middleware));
