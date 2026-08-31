import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Layout from "../layout";

export default function SalesReport() {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const user_data = JSON.parse(localStorage.getItem("user_detail"));

  const defaultFilters = {
    date_range: "this_month",
    date_from: "",
    date_to: "",
    bill_status: "all",
    branch_id: "",
  };

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("invoices");
  const [filters, setFilters] = useState(defaultFilters);
  const [branches, setBranches] = useState([]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const fetchBranches = async () => {
    const token = user_data?.token;

    try {
      const response = await axios.get(`${BASE_URL}/api/branches`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setBranches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error.response || error);
    }
  };

  const fetchReport = async () => {
    const token = user_data?.token;

    try {
      const params = {
        date_range: filters.date_range,
        bill_status: filters.bill_status,
        branch_id: filters.branch_id || null,
      };

      if (filters.date_range === "custom") {
        params.date_from = filters.date_from;
        params.date_to = filters.date_to;
      }

      const res = await axios.get(`${BASE_URL}/api/reports/sales-report`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setReport(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [filters]);

  // ================= EXPORT FUNCTIONS =================

  // 1. Export Excel Function (With Payment Summary Included)
  const exportToExcel = () => {
    if (!report) return;

    let csvData = [];

    // Payment Methods Breakdown (Always included at top)
    csvData.push(["--- PAYMENT METHOD BREAKDOWN ---"]);
    csvData.push(["Payment Method", "Total Collected", "Share %"]);

    (report.payment_methods?.rows || []).forEach((pm) => {
      csvData.push([pm.method, pm.total_collected, `${pm.share_pct}%`]);
    });

    csvData.push([
      "Grand Total Collected",
      report.payment_methods?.grand_total || 0,
      "100%",
    ]);
    csvData.push([]); // Blank separator row
    csvData.push([`--- ${activeTab.toUpperCase()} DETAILED REPORT ---`]);

    // Active Tab Data Export
    let headers = [];
    let rows = [];

    if (activeTab === "invoices") {
      headers = [
        "Date",
        "Bill No",
        "Subtotal",
        "GST",
        "Total",
        "Paid",
        "Due",
        "Profit",
        "Status",
      ];
      rows = (report.invoices?.rows || []).map((row) => [
        new Date(row.created_at).toLocaleDateString(),
        String(row.bill_no),
        row.subtotal,
        row.total_gst,
        row.total_amount,
        row.paid_amount,
        row.due_amount,
        row.total_profit,
        row.payment_status,
      ]);
    } else if (activeTab === "products") {
      headers = ["Product Name", "Qty Sold", "Net Revenue", "Profit"];
      rows = (report.products?.rows || []).map((p) => [
        p.product_name,
        p.qty_sold,
        p.net_revenue,
        p.total_profit,
      ]);
    } else if (activeTab === "payments") {
      headers = ["Method", "Total Collected", "Share %"];
      rows = (report.payment_methods?.rows || []).map((p) => [
        p.method,
        p.total_collected,
        `${p.share_pct}%`,
      ]);
    } else if (activeTab === "overrides") {
      headers = [
        "Bill No",
        "Product Name",
        "Original Price",
        "Override Price",
        "Value Leakage",
      ];
      rows = (report.price_overrides?.rows || []).map((o) => [
        String(o.bill_no),
        o.product_name,
        o.original_price,
        o.override_price,
        o.value_leakage,
      ]);
    }

    csvData.push(headers);
    csvData = csvData.concat(rows);

    const worksheet = XLSX.utils.aoa_to_sheet(csvData);
    const billNoColumn = headers.indexOf("Bill No");

    // Keep long bill numbers as text so Excel does not display scientific notation.
    if (billNoColumn !== -1) {
      const firstDataRow = csvData.length - rows.length;
      rows.forEach((_, rowIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: firstDataRow + rowIndex,
          c: billNoColumn,
        });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = "s";
          worksheet[cellAddress].v = String(rows[rowIndex][billNoColumn]);
        }
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `Sales_Report_${activeTab}_${Date.now()}.xlsx`);
  };

  // 2. Export PDF Function (With Payment Summary Included)
  const exportToPDF = () => {
    if (!report) return;

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`Sales Report - ${activeTab.toUpperCase()}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 21);

    // Section 1: Payment Method Summary Breakdown Table
    doc.setFontSize(12);
    doc.text("Payment Method Breakdown", 14, 28);

    const paymentHeaders = [["Method", "Total Collected (Rs.)", "Share (%)"]];
    const paymentRows = (report.payment_methods?.rows || []).map((p) => [
      p.method,
      `Rs. ${p.total_collected}`,
      `${p.share_pct}%`,
    ]);

    // Add Grand Total row for Payments
    paymentRows.push([
      "Grand Total",
      `Rs. ${report.payment_methods?.grand_total || 0}`,
      "100%",
    ]);

    autoTable(doc, {
      head: paymentHeaders,
      body: paymentRows,
      startY: 32,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }, // Emerald header
      margin: { bottom: 10 },
    });

    // Section 2: Selected Tab Main Table
    const nextStartY = doc.lastAutoTable.finalY + 10;
    doc.text(`${activeTab.toUpperCase()} Details`, 14, nextStartY);

    let headers = [];
    let rows = [];

    if (activeTab === "invoices") {
      headers = [
        [
          "Date",
          "Bill No",
          "Subtotal",
          "GST",
          "Total",
          "Paid",
          "Due",
          "Profit",
          "Status",
        ],
      ];
      rows = (report.invoices?.rows || []).map((row) => [
        new Date(row.created_at).toLocaleDateString(),
        String(row.bill_no),
        `Rs. ${row.subtotal}`,
        `Rs. ${row.total_gst}`,
        `Rs. ${row.total_amount}`,
        `Rs. ${row.paid_amount}`,
        `Rs. ${row.due_amount}`,
        `Rs. ${row.total_profit}`,
        row.payment_status,
      ]);
    } else if (activeTab === "products") {
      headers = [["Product Name", "Qty Sold", "Net Revenue", "Profit"]];
      rows = (report.products?.rows || []).map((p) => [
        p.product_name,
        p.qty_sold,
        `Rs. ${p.net_revenue}`,
        `Rs. ${p.total_profit}`,
      ]);
    } else if (activeTab === "payments") {
      headers = [["Method", "Total Collected", "Share %"]];
      rows = (report.payment_methods?.rows || []).map((p) => [
        p.method,
        `Rs. ${p.total_collected}`,
        `${p.share_pct}%`,
      ]);
    } else if (activeTab === "overrides") {
      headers = [
        [
          "Bill No",
          "Product Name",
          "Original Price",
          "Override Price",
          "Value Leakage",
        ],
      ];
      rows = (report.price_overrides?.rows || []).map((o) => [
        o.bill_no,
        o.product_name,
        `Rs. ${o.original_price}`,
        `Rs. ${o.override_price}`,
        `Rs. ${o.value_leakage}`,
      ]);
    }

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: nextStartY + 4,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      didParseCell: function (data) {
        // Highlight Due amount in RED if greater than 0
        if (
          activeTab === "invoices" &&
          data.section === "body" &&
          data.column.index === 6
        ) {
          const rawVal = String(data.cell.raw).replace("Rs. ", "").trim();
          if (parseFloat(rawVal) > 0) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save(`Sales_Report_${activeTab}_${Date.now()}.pdf`);
  };

  if (loading)
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
          <div className="text-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <p className="text-3xl font-semibold text-gray-900">
              Loading sales report...
            </p>
            <p className="mt-2 text-2xl text-gray-500">
              Please wait while we fetch your latest sales metrics.
            </p>
          </div>
        </div>
      </Layout>
    );

  if (!report)
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
          <p className="text-2xl font-semibold">No data available.</p>
        </div>
      </Layout>
    );

  const k = report.kpis;

  return (
    <Layout>
      <div className="p-8 bg-white min-h-screen text-gray-900">
        {/* HEADER */}
        <h1 className="text-5xl font-extrabold mb-3 text-gray-900">
          Sales Report
        </h1>
        <p className="text-3xl text-gray-600 mb-6">
          Overview of sales, collections, profits, and price overrides.
        </p>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-2xl font-semibold text-gray-900">
                Date Range
              </label>
              <select
                className="block w-full mt-3 rounded-2xl border border-gray-300 px-4 py-4 text-2xl"
                value={filters.date_range}
                onChange={(e) =>
                  setFilters({ ...filters, date_range: e.target.value })
                }
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="this_month">This Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-2xl font-semibold text-gray-900">
                Bill Status
              </label>
              <select
                className="block w-full mt-3 rounded-2xl border border-gray-300 px-4 py-4 text-2xl"
                value={filters.bill_status}
                onChange={(e) =>
                  setFilters({ ...filters, bill_status: e.target.value })
                }
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="text-2xl font-semibold text-gray-900">
                Branch
              </label>
              <select
                className="block w-full mt-3 rounded-2xl border border-gray-300 px-4 py-4 text-2xl"
                value={filters.branch_id}
                onChange={(e) =>
                  setFilters({ ...filters, branch_id: e.target.value })
                }
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filters.date_range === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-2xl font-semibold text-gray-900">
                  From
                </label>
                <input
                  type="date"
                  className="block w-full mt-3 rounded-2xl border border-gray-300 px-4 py-4 text-2xl"
                  value={filters.date_from}
                  onChange={(e) =>
                    setFilters({ ...filters, date_from: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-2xl font-semibold text-gray-900">
                  To
                </label>
                <input
                  type="date"
                  className="block w-full mt-3 rounded-2xl border border-gray-300 px-4 py-4 text-2xl"
                  value={filters.date_to}
                  onChange={(e) =>
                    setFilters({ ...filters, date_to: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
            <div className="text-gray-600 text-2xl">
              Filters update automatically when changed.
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={resetFilters}
                className="bg-blue-600 px-8 py-4 rounded-2xl text-white text-2xl font-semibold hover:bg-blue-700 transition-all"
              >
                Reset
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-600 px-8 py-4 rounded-2xl text-white text-2xl font-semibold hover:bg-red-700 transition-all"
              >
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-emerald-600 px-8 py-4 rounded-2xl text-white text-2xl font-semibold hover:bg-emerald-700 transition-all"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mt-4 mb-10">
          <Card
            title="Gross Sales"
            value={k.gross_sales}
            variant="from-sky-100 to-blue-200"
          />
          <Card
            title="COGS"
            value={k.total_cogs}
            variant="from-violet-100 to-fuchsia-200"
          />
          <Card
            title="Profit"
            value={k.total_profit}
            extra={`Margin ${k.profit_margin_pct}%`}
            variant="from-emerald-100 to-lime-200"
          />
          <Card
            title="Collected"
            value={k.total_collected}
            variant="from-amber-100 to-orange-200"
          />
          <Card
            title="Outstanding"
            value={k.total_due}
            variant="from-rose-100 to-pink-200"
          />
        </div>

        {/* GST */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SmallCard label="CGST" value={k.tax_breakdown.cgst} />
          <SmallCard label="SGST" value={k.tax_breakdown.sgst} />
          <SmallCard label="IGST" value={k.tax_breakdown.igst} />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200">
          {["invoices", "products", "payments", "overrides"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-t-2xl font-semibold text-2xl transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "invoices" && <InvoiceTable data={report.invoices} />}
        {activeTab === "products" && <ProductTable data={report.products} />}
        {activeTab === "payments" && (
          <PaymentTable data={report.payment_methods} />
        )}
        {activeTab === "overrides" && (
          <OverrideTable data={report.price_overrides} />
        )}
      </div>
    </Layout>
  );
}

const Card = ({
  title,
  value,
  extra,
  variant = "from-sky-100 to-blue-200",
}) => (
  <div
    className={`bg-gradient-to-br ${variant} p-8 rounded-3xl shadow-xl border border-gray-200 hover:-translate-y-1 transform transition-all duration-300`}
  >
    <p className="text-2xl font-semibold text-gray-700 mb-3">{title}</p>
    <h2 className="text-4xl font-bold text-gray-900">₹{value}</h2>
    {extra && (
      <p className="text-2xl text-gray-700 font-medium mt-4">{extra}</p>
    )}
  </div>
);

const SmallCard = ({ label, value, color = "from-slate-50 to-slate-100" }) => (
  <div
    className={`bg-gradient-to-r ${color} px-6 py-4 rounded-3xl border border-gray-200 text-gray-900 shadow-sm flex-1`}
  >
    <p className="text-xl text-gray-600">{label}</p>
    <p className="text-3xl font-bold mt-2">₹{value}</p>
  </div>
);

const InvoiceTable = ({ data }) => (
  <div className="overflow-auto bg-white shadow-xl border border-gray-200">
    <table className="w-full text-lg">
      <thead className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-5 text-left text-2xl font-semibold text-gray-700">
            Date
          </th>
          <th className="px-6 py-5 text-left text-2xl font-semibold text-gray-700">
            Bill No
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Subtotal
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            GST
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Total
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Paid
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Due
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Profit
          </th>
          <th className="px-6 py-5 text-center text-2xl font-semibold text-gray-700">
            Status
          </th>
        </tr>
      </thead>

      <tbody>
        {data.rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td className="px-6 py-5 text-2xl text-gray-700">
              {new Date(row.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-5 text-2xl font-semibold text-gray-800">
              {row.bill_no}
            </td>
            <td className="px-6 py-5 text-right text-2xl text-gray-700">
              ₹{row.subtotal}
            </td>
            <td className="px-6 py-5 text-right text-2xl text-gray-700">
              ₹{row.total_gst}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-gray-900">
              ₹{row.total_amount}
            </td>
            <td className="px-6 py-5 text-right text-2xl text-gray-700">
              ₹{row.paid_amount}
            </td>
            <td
              className={`px-6 py-5 text-right text-2xl font-semibold ${row.due_amount > 0 ? "text-red-600" : "text-green-600"}`}
            >
              ₹{row.due_amount}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-green-600">
              ₹{row.total_profit}
            </td>
            <td className="px-8 py-6 text-center text-2xl font-semibold">
              <StatusBadge status={row.payment_status} />
            </td>
          </tr>
        ))}
      </tbody>

      <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 font-semibold text-gray-900">
        <tr>
          <td colSpan="2" className="px-6 py-5 text-3xl font-bold">
            Total
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold">
            ₹{(Number(data.totals.subtotal) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold">
            ₹{(Number(data.totals.total_gst) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold">
            ₹{(Number(data.totals.total_amount) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold">
            ₹{(Number(data.totals.paid_amount) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold">
            ₹{(Number(data.totals.due_amount) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5 text-right text-3xl font-bold text-green-600">
            ₹{(Number(data.totals.total_profit) || 0).toFixed(2)}
          </td>
          <td className="px-6 py-5"></td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const ProductTable = ({ data }) => (
  <div className="overflow-auto bg-white shadow-xl border border-gray-200">
    <table className="w-full text-lg">
      <thead className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-5 text-left text-2xl font-semibold text-gray-700">
            Name
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Qty
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Revenue
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Profit
          </th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((p) => (
          <tr
            key={p.product_id}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td className="px-6 py-5 text-2xl text-gray-800 font-semibold">
              {p.product_name}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
              {p.qty_sold}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
              ₹{p.net_revenue}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-green-600">
              ₹{p.total_profit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PaymentTable = ({ data }) => (
  <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
    <div className="space-y-5">
      {data.rows.map((p, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b border-gray-200 pb-5 hover:bg-gray-50 px-4 py-4 rounded-2xl transition-colors"
        >
          <span className="font-semibold text-3xl text-gray-800">
            {p.method}
          </span>
          <span className="text-3xl text-gray-700">
            <span className="font-bold text-yellow-600">
              ₹{p.total_collected}
            </span>
            <span className="text-gray-500 ml-4">({p.share_pct}%)</span>
          </span>
        </div>
      ))}
    </div>
    <div className="mt-7 pt-6 border-t-2 border-gray-300 font-bold text-3xl flex justify-between">
      <span className="text-gray-800">Total:</span>
      <span className="text-green-600">₹{data.grand_total}</span>
    </div>
  </div>
);

const OverrideTable = ({ data }) => (
  <div className="overflow-auto bg-white shadow-xl border border-gray-200">
    <table className="w-full text-lg">
      <thead className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-5 text-left text-2xl font-semibold text-gray-700">
            Bill No
          </th>
          <th className="px-6 py-5 text-left text-2xl font-semibold text-gray-700">
            Product
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Original
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Override
          </th>
          <th className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
            Leakage
          </th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((o, i) => (
          <tr
            key={i}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td className="px-6 py-5 text-2xl font-semibold text-gray-800">
              {o.bill_no}
            </td>
            <td className="px-6 py-5 text-2xl font-semibold text-gray-800">
              {o.product_name}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
              ₹{o.original_price}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-semibold text-gray-700">
              ₹{o.override_price}
            </td>
            <td className="px-6 py-5 text-right text-2xl font-bold text-red-600">
              ₹{o.value_leakage}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    paid: "bg-green-100 text-green-800 border border-green-300",
    partial: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    unpaid: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <span
      className={`px-6 py-4 rounded-full text-2xl font-semibold ${colors[status] || "bg-gray-200 text-gray-800 border border-gray-300"}`}
    >
      {status}
    </span>
  );
};
