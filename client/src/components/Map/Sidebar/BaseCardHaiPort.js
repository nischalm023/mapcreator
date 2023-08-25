import React, { Component } from "react";
import "./BaseCard.css";

class BaseCardHaiPort extends Component {
  state = {
    open: false
  };
  render() {
    const { children, title,isCollapsible = true ,templatePortData, templatePortbutton} = this.props;
    return (
      <div className={templatePortData?"template-port-data":"card px-2 py-3 mt-1"}>
        <div className="card-header p-0">
          <h5 className="mb-0">
            
            {
              isCollapsible ? <button
                onClick={() => this.setState({ open: !this.state.open })}
                className={templatePortbutton && this.state.open?"orange-button btn btn-secondary w-100":"btn btn-secondary w-100"}
                style={ templatePortbutton ? { textAlign:'left'} : {}}
              >
                {templatePortbutton && this.state.open && 
                  <span><i class="fa fa-angle-down" aria-hidden="true"></i>&nbsp;</span>
                }
                {templatePortData && !this.state.open && <span><i class="fa fa-angle-right" aria-hidden="true"></i>&nbsp;</span>}
                {title}
              </button> : <p className = "btn btn-default disabled">  {title} </p>

            }
          </h5>
        </div>
        {
          isCollapsible && 
                (
                  <div className={`collapsible-content ${this.state.open ? "open hai-data" : ""}`}>
                    <div className="card-body content-innter">{children}</div>
                  </div>
                )
        }
      </div>
    );
  }
}

export default BaseCardHaiPort;
