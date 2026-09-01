import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import Layout from "./layout";
import { Link } from "react-router-dom";


const AdvancePayment = () => {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const user_data = JSON.parse(localStorage.getItem("user_detail"));

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const perPage = 10;

    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "14px",
            },
        },
        rows: {
            style: {
                fontSize: "15px",
                minHeight: "56px",
            },
        },
        cells: {
            style: {
                fontSize: "15px",
            },
        },
    };

    // Fetch Advance Payment Report
    const fetchData = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/api/reports/advance-payments`,
                {
                    headers: {
                        Authorization: `Bearer ${user_data.token}`,
                    },
                }
            );

            if (res.data.status) {
                setData(res.data.data || []);
                setFilteredData(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load advance payment report", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Search
    useEffect(() => {
        const text = search.toLowerCase().trim();

        const result = data.filter((item) => {
            const searchString = `
        ${item.customer?.name || ""}
        ${item.customer?.mobile || ""}
        ${item.amount || ""}
        ${item.method || ""}
        ${item.transaction_id || ""}
        ${item.received_by?.name || ""}
        ${item.branch?.name || ""}
      `.toLowerCase();

            return searchString.includes(text);
        });

        setFilteredData(result);
        setCurrentPage(1);
    }, [search, data]);

    // Format date
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Payment method badge
    const getMethodBadge = (method) => {
        if (method === "cash") {
            return (
                <span className="status-badge bg-success">
                    Cash
                </span>
            );
        }

        if (method === "online") {
            return (
                <span className="status-badge bg-info">
                    Online
                </span>
            );
        }

        return (
            <span className="status-badge bg-secondary">
                {method || "-"}
            </span>
        );
    };

    const columns = [
        {
            name: "ID",
            cell: (row, index) =>
                (currentPage - 1) * perPage + index + 1,
            width: "70px",
            center: true,
        },

        {
            name: "Customer",
            selector: (row) => row.customer?.name || "-",
            sortable: true,
            minWidth: "180px",
        },

        {
            name: "Mobile",
            selector: (row) => row.customer?.mobile || "-",
            sortable: true,
            minWidth: "140px",
        },

        {
            name: "Advance Amount",
            selector: (row) => row.amount,
            sortable: true,
            width: "160px",
            right: true,
            wrap: true,
            cell: (row) => (
                <strong>
                    ₹{Number(row.amount || 0).toFixed(2)}
                </strong>
            ),
        },

        {
            name: "Payment Method",
            selector: (row) => row.method,
            sortable: true,
            width: "150px",
            center: true,
            cell: (row) => getMethodBadge(row.method),
        },

        {
            name: "Transaction ID",
            selector: (row) => row.transaction_id || "-",
            sortable: true,
            minWidth: "180px",
        },

        {
            name: "Received By",
            selector: (row) => row.received_by?.name || "-",
            sortable: true,
            minWidth: "150px",
        },

        {
            name: "Branch",
            selector: (row) => row.branch?.name || "-",
            sortable: true,
            minWidth: "140px",
        },

        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            minWidth: "180px",
            cell: (row) => formatDate(row.created_at),
        },
    ];

    return (
        <Layout>
            <div className="main-content-inner">
                <div className="main-content-wrap">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-27">
                        <h3>Advance Payment Report</h3>

                        <ul className="breadcrumbs flex items-center gap10">
                            <li>
                                <Link to="/">Dashboard</Link>
                            </li>

                            <li>
                                <i className="icon-chevron-right"></i>
                            </li>

                            <li>Reports</li>

                            <li>
                                <i className="icon-chevron-right"></i>
                            </li>

                            <li>Advance Payments</li>
                        </ul>
                    </div>

                    {/* Main Box */}
                    <div className="wg-box">

                        {/* Search */}
                        <div className="flex items-center justify-between gap10 flex-wrap">
                            <div className="wg-filter flex-grow">

                                <form
                                    className="form-search"
                                    onSubmit={(e) => e.preventDefault()}
                                >
                                    <fieldset className="name">
                                        <input
                                            type="text"
                                            placeholder="Search customer, mobile, transaction..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </fieldset>

                                    <div className="button-submit">
                                        <button type="submit">
                                            <i className="icon-search"></i>
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>

                        {/* Data Table */}
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={perPage}
                            onChangePage={(page) => setCurrentPage(page)}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            customStyles={customStyles}
                        />

                        <div className="divider"></div>

                    </div>
                </div>

                <style>{`
          .status-badge {
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            display: inline-block;
          }

          .bg-success {
            background: #10b981;
          }

          .bg-info {
            background: #3b82f6;
          }

          .bg-secondary {
            background: #6b7280;
          }
        `}</style>

            </div>
        </Layout>
    );
};

export default AdvancePayment;