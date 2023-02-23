import React from "react";
import GenericTooltip from "../Forms/Util/GenericTooltip";
import stitching_image from "sprites/ttp_rtp_stitching_direction.png";

export default () => {
  return (
    <GenericTooltip id="stitching-direction-view-tooltip" delayShow={100}>
      <div>
        Marker meanings:
        <table>
          <tbody>
            <tr>
              <td>
                <img style={imgStyle} src={stitching_image} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GenericTooltip>
  );
};

var imgStyle = {
  height: "30%"
};
