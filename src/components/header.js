import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useStockExpiryAlerts from "../hooks/useStockExpiryAlerts";
import ExpiryAlertBadge from "./ExpiryAlertBadge";
import ExpiryAlertModal from "./ExpiryAlertModal";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Header = () => {
  const user_data = JSON.parse(localStorage.getItem("user_detail"));
  const [showMenu, setShowMenu] = useState(false);
  const history = useHistory();

  const { alerts, total: alertTotal, loading } = useStockExpiryAlerts();
  const [openExpiryModal, setOpenExpiryModal] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = async () => {
    try {
      const user_detail = localStorage.getItem("user_detail");
      const user = user_detail ? JSON.parse(user_detail) : null;

      await axios.post(
        `${BASE_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            Accept: "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    }

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
    });

    localStorage.clear();
    sessionStorage.clear();

    history.push("/");
  };

  return (
    <div className="header-dashboard">
      <div className="wrap">
        <div className="header-left">
          <Link to="/">
            <img
              className=""
              id="logo_header_mobile"
              alt=""
              src="images/logo/logo.jpg"
              data-light="images/logo/logo.jpg"
              data-dark="images/logo/logo-dark.png"
              data-width="154px"
              data-height="52px"
              data-retina="images/logo/logo@2x.png"
            />
          </Link>
          <div className="button-show-hide">
            <i className="icon-menu-left"></i>
          </div>
        </div>

        <div className="header-grid">
          <ExpiryAlertBadge
            total={alertTotal}
            onClick={() => setOpenExpiryModal(true)}
          />
          <ExpiryAlertModal
            open={openExpiryModal}
            onClose={() => setOpenExpiryModal(false)}
            alerts={alerts}
          />
          <div className="popup-wrap user type-header">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton3"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="header-user wg-user flex items-center justify-end gap-3 mr-10">
                  <span className="image">
                    <img src="images/avatar/user-1.png" alt="" />
                  </span>

                  <span className="flex flex-col items-end text-left">
                    <span className="body-title mb-1">
                      {user_data?.user?.name}
                    </span>
                    <span className="text-tiny">{user_data?.user?.role}</span>
                  </span>
                </span>
              </button>
              <ul
                className={
                  showMenu
                    ? "dropdown-menu-home dropdown-menu-end has-content"
                    : "dropdown-menu-bar dropdown-menu-end has-content"
                }
                aria-labelledby="dropdownMenuButton3"
              >
                <li>
                  <Link to="#" className="user-item" onClick={handleLogout}>
                    <div className="icon">
                      <i className="icon-power"></i>
                    </div>
                    <span className="body-title-2">Logout</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
