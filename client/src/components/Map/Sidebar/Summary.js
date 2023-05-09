import React from "react";
import { connect } from "react-redux";
import NonCollapsibleBaseCard from "./NonCollapsibleBaseCard";
import BaseCard from "./BaseCard";
import {
  getParticularEntity,
  getStorableCoordinatesCount,
  getZoneToColorMap,
  getSectorToColorMap,
  getBarcodes
} from "utils/selectors";
import _ from "lodash";
import CopyJSONsCard from "./CopyJSONsCard";
import LegendsCard from "./LegendsCard";

const Summary = ({
  chargerDict,
  ppsDict,
  elevatorDict,
  storables,
  zoneToColorMap,
  sectorToColorMap,
  barcodes
}) => {
  const chargers = Object.entries(chargerDict).map(([, val]) => val);
  const ppses = Object.entries(ppsDict).map(([, val]) => val);
  const elevators = Object.entries(elevatorDict).map(([, val]) => val);
  const title = "Summary";
  const params = new URLSearchParams(window.location.search);
  let checked_version = params.get('checked_version') ? eval(params.get('checked_version')) : false;
  const entityMap = [
    {
      name: "Chargers",
      count: chargers.length,
      isCollapsible: true,
      entity: chargers
    },
    { name: "Ppses", count: ppses.length, isCollapsible: true, entity: ppses },
    {
      name: "Elevators",
      count: elevators.length,
      isCollapsible: true,
      entity: elevators
    }
  ];

  const nonCollapsibleEntityMap = [
    { name: "Storables", count: storables, isCollapsible: false, entity: {} },
    { name: "Total Barcodes", count: Object.keys(barcodes).length, isCollapsible: false, entity: {} }
  ];

  const typEntityMap = entityMap.map(e => {
    e.typeInfo = getTypeInformationUsingEntity(e.entity, e.name);
    return e;
  });

  const typeJsx = typeObject => {
    const newArray = Object.entries(typeObject).map((t, idx) => {
      return (
        <p key={idx} style={{ marginBottom: "1%" }}>
          {" "}
          {t[0]} : {t[1]}{" "}
        </p>
      );
    });
    return newArray;
  };

  const entityJsx = typEntityMap.map((entry, idx) => {
    return (
      <BaseCard
        key={idx}
        title={entry.name + " : " + entry.count}
        isCollapsible={entry.isCollapsible}
      >
        {typeJsx(entry.typeInfo)}
      </BaseCard>
    );
  });

  const zoneJsx = (
    <BaseCard
      key="zone"
      title={`Zones: ${Object.keys(zoneToColorMap).length}`}
      isCollapsible={true}
    >
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {Object.entries(zoneToColorMap).map(([zone, color]) => (
          <li key={zone}>
            <div style={{ width: "100%", overflow: "hidden" }}>
              <div
                style={{
                  float: "left",
                  height: "20px",
                  width: "20px",
                  backgroundColor: color,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  marginRight: "10px"
                }}
              />
              <span>{zone}</span>
            </div>
          </li>
        ))}
      </ul>
    </BaseCard>
  );

  const sectorJsx = (
    <BaseCard
      key="sector"
      title={`Sectors: ${Object.keys(sectorToColorMap).length}`}
      isCollapsible={true}
    >
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {Object.entries(sectorToColorMap).map(([sector, color]) => (
          <li key={sector}>
            <div style={{ width: "100%", overflow: "hidden" }}>
              <div
                style={{
                  float: "left",
                  height: "20px",
                  width: "20px",
                  backgroundColor: color,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  marginRight: "10px"
                }}
              />
              <span>{sector}</span>
            </div>
          </li>
        ))}
      </ul>
    </BaseCard>
  );

  return (
    <div className="pt-3">
      <h4 className="menu-title">{title}</h4>
      {
        <NonCollapsibleBaseCard title={title}>
          {entityJsx}
          {zoneJsx}
          {sectorJsx}
          {nonCollapsibleEntityMap.map((e, idx) => {
            return (
              <p key={idx} style={{ marginLeft: "15%" }}>
                {" "}
                {e.name} : {e.count}{" "}
              </p>
            );
          })}
        </NonCollapsibleBaseCard>
      }
      <LegendsCard />
      {checked_version?"":<CopyJSONsCard />}
    </div>
  );
};

export const getTypeInformationUsingEntity = (entity, name) => {
  var grouped;
  if (name != "Chargers") {
    grouped = _.mapValues(_.groupBy(entity, "type"), elist => {
      return elist.length;
    });
  } else {
    grouped = _.mapValues(_.groupBy(entity, "charger_type"), elist => {
      return elist.length;
    });
  }
  return grouped;
};

export default connect(state => ({
  chargerDict: getParticularEntity(state, { entityName: "charger" }),
  ppsDict: getParticularEntity(state, { entityName: "pps" }),
  elevatorDict: getParticularEntity(state, { entityName: "elevator" }),
  storables: getStorableCoordinatesCount(state),
  barcodes: getBarcodes(state),
  zoneToColorMap: getZoneToColorMap(state),
  sectorToColorMap: getSectorToColorMap(state)
}))(Summary);
