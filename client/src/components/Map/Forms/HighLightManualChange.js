import React, { Component } from "react";
import { connect } from "react-redux";
import { getMapId } from "utils/selectors";
import { saveAs } from "file-saver/FileSaver";

class HighLightManualChange extends Component {
  render() {
    const { mapId } = this.props;
    return (
      <button
        className="btn btn-outline-secondary mr-1"
        type="button"
      >
        Highlight Manual Edit
      </button>
    );
  }
}

// add both redux and react-router decorators
export default connect(state => ({
  mapId: getMapId(state)
}))(HighLightManualChange);
