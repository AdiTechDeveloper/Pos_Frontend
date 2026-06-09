import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Navbar = () => {
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const user_detail = JSON.parse(localStorage.getItem("user_detail"));

  const role = user_detail?.user?.role;
  const store_id = user_detail?.user?.store_id;

  const [store, setStore] = useState(null);

  const fetchStore = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/stores/${store_id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_detail.token}`,
        },
      });
      setStore(response.data.data);
    } catch (error) {
      console.error("Error fetching store details:", error);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [store_id]);

  const logoUrl = store?.logo ? `${BASE_URL}/storage/${store.logo}` : null;

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
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
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        <i className="icon-menu-left"></i>
      </button>

      {/* Sidebar */}
      <div className={`section-menu-left ${isOpen ? "open" : ""}`}>
        <div className="box-logo">
          <Link to="/dashboard" id="site-logo-inner" onClick={closeSidebar}>
            {logoUrl && (
              <img
                id="logo_header"
                alt="Store Logo"
                src={logoUrl}
                style={{
                  height: "52px",
                  marginLeft: "20px",
                  objectFit: "contain",
                }}
              />
            )}
            {/* close */}
          </Link>

          {/* Close button (mobile) */}
          <div
            className="button-show-hide"
            onClick={() => setIsOpen(false)}
            style={{ display: "none" }}
          >
            <i className="icon-menu-left"></i>
          </div>
        </div>

        <div className="section-menu-left-wrap">
          <div className="center">
            {/* MAIN HOME */}
            <div className="center-item">
              <div className="center-heading">Main Home</div>
              <ul className="menu-list">
                <li className="menu-item">
                  <Link
                    to="/dashboard"
                    className="menu-item-button"
                    onClick={closeSidebar}
                  >
                    <div className="icon">
                      <i className="icon-grid"></i>
                    </div>
                    <div className="text">Dashboard</div>
                  </Link>
                </li>
              </ul>
            </div>

            {/* ALL PAGE */}
            <div className="center-item">
              <div className="center-heading">All Page</div>
              <ul className="menu-list">
                {role === "superadmin" && (
                  <li className="menu-item">
                    <Link
                      to="/store"
                      className="menu-item-button"
                      onClick={closeSidebar}
                    >
                      <div className="icon">
                        <i className="icon-briefcase"></i>
                      </div>
                      <div className="text">Stores</div>
                    </Link>
                  </li>
                )}

                {role === "admin" && (
                  <>
                    <li className="menu-item">
                      <Link
                        to="/branch"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-clipboard"></i>
                        </div>
                        <div className="text">Branches</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/staff"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-edit"></i>
                        </div>
                        <div className="text">Staff</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/product"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-cast"></i>
                        </div>
                        <div className="text">Products</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/purchase-bill"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-bookmark"></i>
                        </div>
                        <div className="text">Purchase Bill</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/sale-bill"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-box"></i>
                        </div>
                        <div className="text">Sale Bill</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/sales-analytics"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Sales Analytics</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/gst-output-sales"
                        to="/reports/price_override"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Price Override Report</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/gst-analytics"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">GST Output (Sales)</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/stock-summary"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Stock Summury</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/purchase-summary"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Purchase Summury</div>
                      </Link>
                    </li>
                  </>
                )}

                {role === "manager" && (
                  <>
                    <li className="menu-item">
                      <Link
                        to="/category"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Categories</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/brand"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-book"></i>
                        </div>
                        <div className="text">Brands</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/suppliers"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-users"></i>
                        </div>
                        <div className="text">Supplier</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/gst-rates"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-folder"></i>
                        </div>
                        <div className="text">GST Rates</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/product"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-cast"></i>
                        </div>
                        <div className="text">Products</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/purchase-bill"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-bookmark"></i>
                        </div>
                        <div className="text">Purchase Bill</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/purchase-return-bill"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-bookmark"></i>
                        </div>
                        <div className="text">Purchase Return Bill</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/sale-bill"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-box"></i>
                        </div>
                        <div className="text">Sale Bill</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/stock-summary"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Stock Summury</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/purchase-summary"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Purchase Summury</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/sales-analytics"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Sales Analytics</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/price_overridden"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">Price Overridden Report</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/gst-output-sales"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">GST Output (Sales)</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/GSTR3B"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">GSTR-3B Report</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/reports/GSTR1-Summary"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-layers"></i>
                        </div>
                        <div className="text">GSTR1 Summary</div>
                      </Link>
                    </li>

                    <li className="menu-item">
                      <Link
                        to="/pos"
                        className="menu-item-button"
                        onClick={closeSidebar}
                      >
                        <div className="icon">
                          <i className="icon-shopping-cart"></i>
                        </div>
                        <div className="text">POS</div>
                      </Link>
                    </li>
                    {isOpen && (
                      <li className="menu-item">
                        <Link
                          to="#"
                          className="menu-item-button"
                          onClick={handleLogout}
                        >
                          <div className="icon">
                            <i className="icon-box"></i>
                          </div>
                          <div className="text">Logout</div>
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Navbar;
