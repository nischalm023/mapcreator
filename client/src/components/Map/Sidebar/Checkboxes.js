import React from "react";
import ReactTooltip from "react-tooltip";
import DirectionViewTooltip from "./DirectionViewTooltip";

const QueueCheckbox = ({ val, onChange ,disabled}) => (
  <label
    style={{
      textAlign: "-webkit-center",
      margin: "3% 5% 3% 5%",
      color: "orange"
    }}
  >
    Queue mode:
    <input
      style={{ marginLeft: "10px" }}
      disabled={disabled}
      name="queuemode"
      type="checkbox"
      checked={val}
      onChange={onChange}
    />
  </label>
);

const MultiQueueCheckbox = ({ val, onChange ,disabled }) => (
  <label
    style={{
      textAlign: "-webkit-center",
      margin: "3% 5% 3% 5%",
      color: "orange"
    }}
  >
    Multi Queue mode:
    <input
      style={{ marginLeft: "10px" }}
      name="multiqueuemode"
      disabled={disabled}
      type="checkbox"
      checked={val}
      onChange={onChange}
    />
  </label>
);

const ZoneViewCheckbox = ({ val, onChange ,disabled}) => (
  <div>
    <ReactTooltip effect="solid" delayShow={100} />
    <label
      style={{
        textAlign: "-webkit-center",
        margin: "0% 5% 3% 5%",
        color: "orange"
      }}
    >
      Zone View:
      <input
        style={{ marginLeft: "10px" }}
        name="zoneview"
        disabled={disabled}
        type="checkbox"
        checked={val}
        onChange={onChange}
      />
      <i
        className="fa fa-question-circle"
        style={{ marginLeft: "10px", color: "darkgrey" }}
        data-tip="See summary tab in left sidebar for zone color legend."
      />
    </label>
  </div>
);

const SectorViewCheckbox = ({ val, onChange ,disabled}) => (
  <div>
    <ReactTooltip effect="solid" delayShow={100} />
    <label
      style={{
        textAlign: "-webkit-center",
        margin: "0% 5% 3% 5%",
        color: "orange"
      }}
    >
      Sector View:
      <input
        style={{ marginLeft: "10px" }}
        name="sectorview"
        disabled={disabled}
        type="checkbox"
        checked={val}
        onChange={onChange}
      />
      <i
        className="fa fa-question-circle"
        style={{ marginLeft: "10px", color: "darkgrey" }}
        data-tip="See summary tab in left sidebar for sector color legend."
      />
    </label>
  </div>
);

const DirectionViewCheckbox = ({ val, onChange, disabled }) => (
  <div>
    <DirectionViewTooltip />
    <label
      style={{
        textAlign: "-webkit-center",
        margin: "0% 5% 3% 5%",
        color: "orange"
      }}
    >
      Directionality View:
      <input
        style={{ marginLeft: "10px" }}
        name="directionalityview"
        disabled={disabled}
        type="checkbox"
        checked={val}
        onChange={onChange}
      />
      <i
        className="fa fa-question-circle"
        style={{ marginLeft: "10px", color: "darkgrey" }}
        data-tip
        data-for="direction-view-tooltip"
      />
    </label>
  </div>
);

const TTPCheckbox = ({ val, onChange }) => (
  <label
    style={{
      textAlign: "-webkit-center",
      margin: "3% 5% 3% 5%",
      color: "orange"
    }}
  >
    TTP mode:
    <input
      style={{ marginLeft: "10px" }}
      name="queuemode"
      type="checkbox"
      checked={val}
      onChange={onChange}
    />
  </label>
);


export { MultiQueueCheckbox, QueueCheckbox, ZoneViewCheckbox, SectorViewCheckbox, DirectionViewCheckbox , TTPCheckbox};
