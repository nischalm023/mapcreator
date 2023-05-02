import React, { Component } from "react";
import FormModal from "./FormModal";
import BulletPointsTooltip from "./BulletPointsTooltip";

class ButtonForm extends Component {
  render() {
    var {
      disabled = false,
      buttonText = "Submit",
      tooltipData = {
        id: "default-tooltip-id"
      },
      toggle,
      handleMouseEnter,
      handleMouseLeave,
      small = false,
      btnClass = "btn-secondary",
      show,
      wrapInButtonGroup = true,
      title = undefined,
      bcolor = "orange",
    } = this.props;
    
    return (
      // adding class and role since nested button groups give a cleaner look for some reason
      // making it configurable since single button in a btn-group looks wierd
      <div
        className={wrapInButtonGroup ? "btn-group" : undefined}
        role="group"
        style={{ display: "inline-block" }}
      > 
        <button
          key={0}
          type="button"
          className={`btn ${btnClass} ${
            small ? "btn-sm" : ""
          } tooltip-wrapper btn-group`}
          style={{ textAlign:"-webkit-center", color:bcolor }}
          disabled={disabled}
          onClick={() => toggle()}
          data-tip
          data-for={tooltipData.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {buttonText}
        </button>
        <BulletPointsTooltip {...tooltipData} />
        <div key={1} className="modal fade" tabIndex="-1" role="dialog">
          <FormModal show={show} toggle={toggle} title={title}>
            <div>{this.props.children}</div>
          </FormModal>
        </div>
      </div>
    );
  }
}

export default ButtonForm;
