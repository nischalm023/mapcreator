import React from "react";
import debounce from "lodash.debounce";
import { getMaps } from "utils/api";

const fetchMaps = (query, onResults) =>
  getMaps(query).then(res => onResults(res));

const debouncedFetchMaps = debounce(fetchMaps, 200, {
  leading: false,
  trailing: true
});

export default ({ onResults,listView }) => (
  <input
    type="text"
    className={listView? "saved-map-disabled-row form-control my-3" : "form-control my-3"}
    placeholder="Search"
    onChange={e => debouncedFetchMaps(e.target.value, onResults)}
  />
);
