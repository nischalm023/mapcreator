import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

const alertStyle = {
  position:"absolute",
  width : "800px"
};
var SweetAlertSuccess = ({ message, onConfirm, title = "Success" }) => (
  <SweetAlert
    show={message != null}
    success
    style = {alertStyle}
    title={title}
    onConfirm={onConfirm}
  >
    {/* <pre>
      <code>{message == null ? "" : `${message}`}</code>
    </pre> */}
    {message != null && (
      <pre>
        <code dangerouslySetInnerHTML={{ __html: message }}></code>
      </pre>
    )}
  </SweetAlert>
);

export default SweetAlertSuccess;
