import React, { Component } from "react";
import { requestMapUploadToGsb } from "actions/actions";
import { connect } from "react-redux";
import { getMapId, getNormalizedMap } from "utils/selectors";
import { withRouter } from "react-router-dom";
import "./uploadMaptoGsb.css";

class UploadMapDetailsToGsb extends Component {
    render() {
        const { dispatch, solutionId, agentId, functionalAreaId, uid, mapId } = this.props;
        return (
            <button
                className="btn btn-outline-secondary mr-1 uploadToGsb"
                type="button"
                onClick={() =>
                    dispatch(requestMapUploadToGsb(solutionId, agentId, functionalAreaId, uid))
                }
                disabled={localStorage.getItem(`map_${mapId}_sol_${solutionId}`, false)}
            >
                Save and Close
            </button>
        );
    }
}

// add both redux and react-router decorators
export default withRouter(
    connect(state => ({
        mapId: getMapId(state),
        nMap: getNormalizedMap(state)
    }))(UploadMapDetailsToGsb)
);
