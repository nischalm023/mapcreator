import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
const pendo = window.pendo;

class Home extends Component {
  componentDidMount() {
    pendo.initialize({account: {id: "MAPCREATOR-HOME"}});
  }
  render() {
    return (
      <div className="container">
        <div className="row justify-content-between">
          <div className="col">
            <h3 className="display-5">Mapcreator</h3>
          </div>
          <div className="col pt-auto">
            {process.env.REACT_APP_VERSION ? (
              <h4 style={{ textAlign: "right", marginBottom: 0 }}>
                {process.env.REACT_APP_VERSION}
              </h4>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="list-group">
          <LinkContainer to="/new">
            <a className="list-group-item list-group-item-action">Create new map</a>
          </LinkContainer>
          <LinkContainer to="/existing">
            <a className="list-group-item list-group-item-action">
              Import an existing map
            </a>
          </LinkContainer>
          <LinkContainer to="/autocad_import">
            <a className="list-group-item list-group-item-action">
              Import autocad map
            </a>
          </LinkContainer>
          <LinkContainer to="/stitch_ttp_rtp_map">
            <a className="list-group-item list-group-item-action">
              Create/Import TTP+RTP map
            </a>
          </LinkContainer>
          <LinkContainer to="/version">
            <a className="list-group-item list-group-item-action">Saved maps</a>
          </LinkContainer>
          <LinkContainer to="/guidelines">
            <a className="list-group-item list-group-item-action">
              View Guidelines
            </a>
          </LinkContainer>
        </div>
      </div>
    );
  }
}

export default Home;
