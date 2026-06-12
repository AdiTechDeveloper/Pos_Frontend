import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "./layout";
import axios from "axios";
import ProfitLossWidget from "./ProfitLossWidget";
import TopSellingProducts from "./topSellingProducts";
import LowStockAlert from "./lowStockAlert";

const Home = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [supplierBill, setSupplierBill] = useState([]);
  const [products, setProducts] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [gstRates, setGstRates] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [saleBills, setSaleBills] = useState([]);
  const [purchaseReturnBill, setPurchaseReturnBill] = useState([]);
  const [customerDues, setCustomerDues] = useState([]);

  const user_data = JSON.parse(localStorage.getItem("user_detail"));
  const role = user_data?.user?.role;

  const fetchStore = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/stores`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      // console.log("store_data",response.data);
      setStores(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categories`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchBrand = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/brands`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setBrands(response.data.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };
  const fetchBrach = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/branches`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setBranchs(response.data.data);
    } catch (error) {
      console.error("Error fetching branchs:", error);
    }
  };
  const fetchSupplierBill = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/suppliers`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setSupplierBill(response.data.suppliers);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/staff`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setStaffs(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchGstRate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/gst-rates`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setGstRates(response.data.gstRates);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchPurchaseBills = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/purchase-bill`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setPurchaseBills(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchSaleBills = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sales-bills`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setSaleBills(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchPurchaseReturnBills = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/purchase-return`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setPurchaseReturnBill(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchCustomerDue = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customer/due`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setCustomerDues(response.data.data);
    } catch (error) {
      console.error("Error fetching customer dues:", error);
    }
  };
  useEffect(() => {
    fetchStore();
    fetchCategory();
    fetchBrand();
    fetchSupplierBill();
    fetchProduct();
    fetchBrach();
    fetchStaff();
    fetchGstRate();
    fetchPurchaseBills();
    fetchSaleBills();
    fetchPurchaseReturnBills();
    fetchCustomerDue();
  }, []);

  return (
    <>
      <Layout>
        <div className="main-content-inner">
          {/* <!-- main-content-wrap --> */}
          <div className="main-content-wrap">
            <div className="tf-section-4 mb-30">
              {/* <!-- chart-default --> */}
              {role === "superadmin" && (
                <>
                  <div className="wg-chart-default">
                    <Link
                      to="/store"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#22C55E"
                              />
                            </svg>
                            <i className="icon-layers"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">Total Store</div>
                            <h4>{stores.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-1"></div>
                    </div>
                  </div>
                </>
              )}
              {role === "manager" && (
                <>
                  {/* <div className="wg-chart-default">
                    <Link
                      to="/category"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#22C55E"
                              />
                            </svg>
                            <i className="icon-layers"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Categories
                            </div>
                            <h4>{categories.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-1"></div>
                    </div>
                  </div> */}

                  {/* <div className="wg-chart-default">
                    <Link
                      to="/brand"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#FF5200"
                              />
                            </svg>
                            <i className="icon-book"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">Total Brands</div>
                            <h4>{brands.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-2"></div>
                    </div>
                  </div> */}

                  {/* <div className="wg-chart-default">
                    <Link
                      to="/suppliers"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#CBD5E1"
                              />
                            </svg>
                            <i className="icon-bookmark"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Suppliers
                            </div>
                            <h4>{supplierBill.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-3"></div>
                    </div>
                  </div> */}

                  {/* <div className="wg-chart-default">
                    <Link
                      to="/gst-rates"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#070606b4"
                              />
                            </svg>
                            <i className="icon-folder"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Gst Rates
                            </div>
                            <h4>{gstRates.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-3"></div>
                    </div>
                  </div> */}

                  <div className="wg-chart-default">
                    <Link
                      to="/product"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#2377FC"
                              />
                            </svg>
                            <i className="icon-cast"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">Total Products</div>
                            <h4>{products.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>
                  <div className="wg-chart-default">
                    <Link
                      to="/purchase-bill"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#fc2359ff"
                              />
                            </svg>
                            <i className="icon-bookmark"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Purchase Bills
                            </div>
                            <h4>{purchaseBills.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>

                  <div className="wg-chart-default">
                    <Link
                      to="/sale-bill"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#23fc6bff"
                              />
                            </svg>
                            <i className="icon-box"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Sale Bills
                            </div>
                            <h4>{saleBills.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>
                  
                  {/* <div className="wg-chart-default">
                    <Link
                      to="/purchase-return-bill"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#5d23fcff"
                              />
                            </svg>
                            <i className="icon-users"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Purchase Return Bills
                            </div>
                            <h4>{purchaseReturnBill.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div> */}

                  <div className="wg-chart-default">
                    <Link
                      to="/customer-dues"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#22C55E"
                              />
                            </svg>
                            <i className="icon-edit"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Customer Dues
                            </div>
                            <h4>{customerDues.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>
                </>
              )}
              {role === "admin" && (
                <>
                  <div className="wg-chart-default">
                    <Link
                      to="/branch"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#FF5200"
                              />
                            </svg>
                            <i className="icon-shopping-bag"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">Total Branches</div>
                            <h4>{branchs.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>
                  <div className="wg-chart-default">
                    <Link
                      to="/customer-dues"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#22C55E"
                              />
                            </svg>
                            <i className="icon-edit"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">Total Staff</div>
                            <h4>{staffs.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>

                  <div className="wg-chart-default">
                    <Link
                      to="/customer-dues"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap14">
                          <div className="image type-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="52"
                              viewBox="0 0 48 52"
                              fill="none"
                            >
                              <path
                                d="M19.1094 2.12943C22.2034 0.343099 26.0154 0.343099 29.1094 2.12943L42.4921 9.85592C45.5861 11.6423 47.4921 14.9435 47.4921 18.5162V33.9692C47.4921 37.5418 45.5861 40.8431 42.4921 42.6294L29.1094 50.3559C26.0154 52.1423 22.2034 52.1423 19.1094 50.3559L5.72669 42.6294C2.63268 40.8431 0.726688 37.5418 0.726688 33.9692V18.5162C0.726688 14.9435 2.63268 11.6423 5.72669 9.85592L19.1094 2.12943Z"
                                fill="#22C55E"
                              />
                            </svg>
                            <i className="icon-edit"></i>
                          </div>
                          <div>
                            <div className="body-text mb-2">
                              Total Customer Dues
                            </div>
                            <h4>{customerDues.length}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="wrap-chart">
                      <div id="line-chart-4"></div>
                    </div>
                  </div>
                </>
              )}
              {/* <!-- /chart-default --> */}
            </div>
          </div>
          {["admin", "manager"].includes(role) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT SIDE */}
              <div className="flex flex-col gap-6">
                <ProfitLossWidget role={role} user={user_data} />

                <LowStockAlert
                  role={role}
                  user={user_data}
                  filters={{ branch_id: "ALL" }}
                />
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-6 selling-product">
                <TopSellingProducts
                  role={role}
                  user={user_data}
                  filters={{ branch_id: "ALL" }}
                />
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};
export default Home;
