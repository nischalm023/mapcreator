import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// import bootstrap?
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import SavedMaps from "./containers/SavedMaps";
import Home from "./containers/Home";
import Guidelines from "./containers/Guidelines";
import Map from "./containers/Map";
import ImportMap from "./containers/ImportMap";
import CreateMap from "./containers/CreateMap";
import ImportAutocadMap from "./containers/ImportAutocadMap";
import ImportTtpMap from "./containers/ImportTtpMap";

class App extends Component {
  render() {
    return (
      <Router basename={process.env.REACT_APP_BASENAME || ""}>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/version" component={SavedMaps} />
          <Route path="/guidelines" component={Guidelines} />
          <Route path="/map/:id" component={Map} />
          <Route path="/existing" component={ImportMap} />
          <Route path="/new" component={CreateMap} />
          <Route path="/autocad_import" component={ImportAutocadMap} />
          <Route path="/stitch_ttp_rtp_map" component={ImportTtpMap} />

        </div>
      </Router>
    );
  }
}

export default App;
