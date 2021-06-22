import util from "../utility/utils";
import { useEffect } from "react";

export default function Demo(props) {
  const StartDemo = async () => {
    let response = await util.FETCH_DATA(`demo`, "No Notification");
    if (response.status === 200) {
      sessionStorage.setItem("sprintCompassToken", response.data.access_token);
      sessionStorage.setItem("sprintCompassUser", response.data.user);
      sessionStorage.setItem("sprintCompassUserName", response.data.name);
      sessionStorage.setItem("sprintCompassUserRole", response.data.userRole);
      sessionStorage.setItem("organization", response.data.organization);
      window.open("/projects", "_self");
    }
  };

  useEffect(() => {
    StartDemo();
  });
  return <></>;
}
