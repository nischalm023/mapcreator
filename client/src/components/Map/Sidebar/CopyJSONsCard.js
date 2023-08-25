import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import {
  copyJSONToClipboard,
  copySampleRacksJsonToClipboard
} from "actions/actions";

const CopyJSONsCard = ({ dispatch }) => (
  <BaseCard
    key="copy-jsons-card"
    title={"Copy JSONs to clipboard"}
    isCollapsible={true}
  >
    {[
      ["map.json (multifloor)", ["map", false]],
      ["map.json (singlefloor)", ["map", true]],
      ["pps.json", ["pps", false]],
      ["charger.json", ["charger", false]],
      ["elevator.json", ["elevator", false]],
      ["ods_excluded.json", ["ods_excluded", false]],
      ["zone.json", ["zone", false]],
      ["sectors.json", ["sectorBarcodeMapping", true]],
      ["Sector_MxU_Preferences.json", ["sectorMxUPreferences", true]],
      ["conveyor.json", ["conveyor",true]],
      // for racks.json, using the copySampleRacksJsonToClipboard action instead of copyJSONToClipboard
      // since racks.json is fetched from server API instead of through client side map (this was done so
      // that racks.json is consumable directly using API also)
      ["racks.json (sample)", undefined]
    ].map(([text, args], idx) => (
      <div key={idx} className="row py-1">
        <span className="col-auto">{text}</span>
        <div className="col float-right" />
        <button
          type="button"
          className="btn btn-light far fa-copy"
          onClick={() =>
            args
              ? dispatch(copyJSONToClipboard(args[0], args[1]))
              : dispatch(copySampleRacksJsonToClipboard)
          }
        />
      </div>
    ))}
  </BaseCard>
);

export default connect()(CopyJSONsCard);
