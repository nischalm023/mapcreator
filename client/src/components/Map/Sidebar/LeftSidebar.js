import React, { Component } from "react";
import "./LeftSidebar.css";
import Chargers from "./Chargers";
import PPSes from "./PPSes";
import Elevators from "./Elevators";
import Summary from "./Summary";
import LayeredView from "./LayeredView";
import templateView from "./templateView";


var Menu = ({ menuItems,checked_version }) => (
  <div className="row">

    {menuItems.map(({ name, isActive, onClick }, idx) => (
      <div
        className={`col leftsidebar-icon ${isActive ? "active" : ""}`}
        key={idx}
        onClick={checked_version?null:onClick}
        >
        <i className={`fa ${name}`} />
      </div>
    ))}
  </div>
);

class LeftSidebar extends Component {
  state = {
    open: false,
    activeIdx: 0
  };
  render() {
    const { open, activeIdx } = this.state;
    const params = new URLSearchParams(window.location.search);
    let checked_version = params.get('checked_version') ? eval(params.get('checked_version')) : false;
    var menuItems = [
      ["fa-bars", Summary],
      ["fa-chevron-up", Elevators],
      ["fa-charging-station", Chargers],
      ["fa-archive", PPSes],
      ["fa-layer-group",LayeredView],
      ["fa-book",templateView]
    ];
    var DataToShow = menuItems[activeIdx][1];
    return (
      <nav id="leftsidebar" className={open ? "active" : ""}>
        <button
          id="leftsidebar-button"
          className="btn"
          onClick={() => this.setState({ open: !this.state.open })}
        >
          <i className="fa fa-lg fa-bars" />
        </button>
        <div className="container menu-container">
          <Menu
            checked_version={checked_version}
            menuItems={menuItems.map(([name], idx) => ({
              name,
              isActive: activeIdx === idx,
              onClick: () => this.setState({ activeIdx: idx })
            }))}
          />
          <div className="menu-data-container">
            {DataToShow ? <DataToShow /> : ""}
          </div>
        </div>
        <small id="version-text">
          {process.env.REACT_APP_VERSION || "unknown version"}
        </small>
      </nav>
    );
  }
}

export default LeftSidebar;
