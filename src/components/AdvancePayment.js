import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./layout";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";

const getMethodBadge = (method) => {
  if (method === "cash")
    return <span className="status-badge bg-success">Cash</span>;
  if (method === "online")
    return <span className="status-badge bg-info">Online</span>;
  return <span className="status-badge bg-secondary">{method || "-"}</span>;
};

const ExpandedComponent = ({ data }) => {
  const historyColumns = [
    {
      name: "Date & Time",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => (
        <span>{new Date(row.created_at).toLocaleString("en-IN")}</span>
      ),
    },
    {
      name: "Advance Amount",
      selector: (row) => Number(row.amount || 0),
      sortable: true,
      cell: (row) => (
        <span className="amount-text">
          ₹{Number(row.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      name: "Method",
      selector: (row) => row.method || "-",
      sortable: true,
      cell: (row) => getMethodBadge(row.method),
    },
    {
      name: "Transaction ID",
      selector: (row) => row.transaction_id || "-",
      sortable: true,
      cell: (row) => (
        <span className="transaction-id">{row.transaction_id || "-"}</span>
      ),
    },
    {
      name: "Received By",
      selector: (row) => row.received_by?.name || "-",
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row) => row.branch?.name || "-",
      sortable: true,
    },
  ];

  return (
    <div className="ap-expansion-box">
      <h5 className="ap-expansion-title">Payment History</h5>
      <DataTable
        columns={historyColumns}
        data={data.history || []}
        dense
        pagination={false}
        noHeader
        customStyles={{
          headCells: {
            style: {
              fontWeight: 700,
              fontSize: "12px",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "10px 14px",
            },
          },
          cells: {
            style: {
              padding: "10px 14px",
              fontSize: "14px",
              color: "#334155",
            },
          },
          rows: {
            style: {
              minHeight: "52px",
            },
          },
        }}
      />
    </div>
  );
};

const AdvancePayment = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const user_data = JSON.parse(localStorage.getItem("user_detail"));

  const [groupedData, setGroupedData] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/reports/advance-payments`, {
        headers: {
          Authorization: `Bearer ${user_data?.token}`,
        },
      });

      if (res.data.status) {
        groupCustomerData(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load advance payment report", err);
    }
  };

  const groupCustomerData = (payments) => {
    const groupedMap = {};

    payments.forEach((item) => {
      const customerId =
        item.customer?.id || item.customer?.mobile || "unknown";

      if (!groupedMap[customerId]) {
        groupedMap[customerId] = {
          customerInfo: item.customer,
          walletBalance: item.customer?.opening_balance || 0,
          history: [],
        };
      }
      groupedMap[customerId].history.push(item);
    });

    setGroupedData(Object.values(groupedMap));
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const groupedRows = groupedData.map((group) => ({
    id:
      group.customerInfo?.id ||
      group.customerInfo?.mobile ||
      group.history[0]?.id ||
      Math.random(),
    customerName: group.customerInfo?.name || "-",
    mobile: group.customerInfo?.mobile || "-",
    walletBalance: Number(group.walletBalance || 0),
    totalAdvance: group.history.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    ),
    latestDate: group.history[group.history.length - 1]?.created_at || null,
    paymentCount: group.history.length,
    lastMethod: group.history[group.history.length - 1]?.method || "-",
    history: group.history,
  }));

  const filteredGroups = groupedRows.filter((group) => {
    const text = search.toLowerCase().trim();
    const name = group.customerName?.toLowerCase() || "";
    const mobile = group.mobile?.toLowerCase() || "";
    const txIds = (group.history || [])
      .map((h) => h.transaction_id || "")
      .join(" ")
      .toLowerCase();

    return name.includes(text) || mobile.includes(text) || txIds.includes(text);
  });

  const columns = [
    {
      name: "Customer",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div className="customer-cell">
          <div className="customer-name">{row.customerName}</div>
          <div className="customer-mobile">{row.mobile}</div>
        </div>
      ),
    },
    {
      name: "Wallet Balance",
      selector: (row) => row.walletBalance,
      sortable: true,
      cell: (row) => (
        <span className="wallet-badge">
          ₹{Number(row.walletBalance).toFixed(2)}
        </span>
      ),
      center: true,
    },
    {
      name: "Last Payment",
      selector: (row) => row.latestDate || "-",
      sortable: true,
      cell: (row) => (
        <span>{row.latestDate ? formatDate(row.latestDate) : "-"}</span>
      ),
    },
    {
      name: "Total Advance",
      selector: (row) => row.totalAdvance,
      sortable: true,
      cell: (row) => (
        <span className="amount-text">
          ₹{Number(row.totalAdvance || 0).toFixed(2)}
        </span>
      ),
    },
    {
      name: "Transactions",
      selector: (row) => row.paymentCount,
      sortable: true,
      center: true,
    },
  ];

  return (
    <Layout>
      <div className="main-content-inner">
        <div className="main-content-wrap">
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

          <div className="wg-box">
            <div className="flex items-center justify-between gap10 flex-wrap mb-20">
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

            <div className="table-responsive">
              <DataTable
                columns={columns}
                data={filteredGroups}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
                expandableRows
                expandableRowsComponent={ExpandedComponent}
                expandableRowsHideExpander
                expandOnRowClicked
                customStyles={{
                  headCells: {
                    style: {
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#475569",
                      backgroundColor: "#f8fafc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "12px 14px",
                    },
                  },
                  cells: {
                    style: {
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#1e293b",
                    },
                  },
                  rows: {
                    style: {
                      minHeight: "60px",
                      cursor: "pointer",
                    },
                  },
                  pagination: {
                    style: {
                      border: "none",
                      padding: "12px 0 0",
                    },
                  },
                }}
                expandableIcon={{
                  collapsed: <span className="ap-expand-icon">▸</span>,
                  expanded: <span className="ap-expand-icon is-open">▾</span>,
                }}
              />
            </div>
          </div>
        </div>

        <style>{`
          .customer-cell {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .customer-name {
            font-weight: 700;
            color: #0f172a;
          }

          .customer-mobile {
            font-size: 12px;
            color: #64748b;
          }

          .wallet-badge {
            display: inline-block;
            background-color: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: 700;
          }

          .amount-text {
            font-weight: 700;
            color: #0f172a;
          }

          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            color: white;
          }

          .bg-success { background-color: #10b981; }
          .bg-info { background-color: #3b82f6; }
          .bg-secondary { background-color: #64748b; }

          .transaction-id {
            display: inline-block;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 5px 8px;
            font-size: 12px;
            color: #334155;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }

          .ap-expand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #eff6ff;
            color: #1d4ed8;
            font-size: 16px;
            font-weight: 700;
            line-height: 1;
            transition: all 0.2s ease;
          }

          .ap-expand-icon.is-open {
            background: #dbeafe;
          }

          .ap-expansion-box {
            padding: 14px 18px 18px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }

          .ap-expansion-title {
            margin: 0 0 12px;
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default AdvancePayment;
