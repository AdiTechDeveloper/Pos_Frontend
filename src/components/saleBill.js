import React, { useEffect, useState, useRef, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"
import Layout from "./layout";
import ReceiptModal from "./ReceiptModal";

const getAuthHeader = () => {
  const user_detail = localStorage.getItem("user_detail");
  const user = user_detail ? JSON.parse(user_detail) : null;
  const token = user?.token;

  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : {};
};

const SaleBill = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [search, setSearch] = useState("");
  const [saleBills, setSaleBills] = useState([]);

  const [showReceipt, setShowReceipt] = useState(false);
  const [printData, setPrintData] = useState(null);
  const receiptRef = useRef();

  const [filteredData, setFilteredData] = useState(saleBills);
  const user_data = JSON.parse(localStorage.getItem("user_detail"));

  // 2. Export Functions
  const exportPDF = () => {
  const doc = new jsPDF();

  // If it still fails, use this approach:
  autoTable(doc,{
    head: [['Bill No', 'Subtotal', 'GST', 'Amount', 'Profit']],
    body: filteredData.map(row => [
      row.bill_no, 
      row.subtotal, 
      row.total_gst, 
      row.total_amount, 
      row.total_profit
    ]),
  });

  doc.save("sales_report.pdf");
};

  const formatExportData = (data) => {
    return data.map((row) => ({
      ...row,
      // 1. Force Bill No to Text by prepending a single quote
      bill_no: `'${row.bill_no}`,
      // 2. Format Currency to 2 decimal places
      subtotal: parseFloat(row.subtotal).toFixed(2),
      total_gst: parseFloat(row.total_gst).toFixed(2),
      total_amount: parseFloat(row.total_amount).toFixed(2),
      total_profit: parseFloat(row.total_profit).toFixed(2),
      // 3. Format Date into a readable string
      created_at: new Date(row.created_at).toLocaleString('en-IN')
    }));
  };

  // 1. Define csvHeaders HERE (inside the component)
  const csvHeaders = [
    { label: "Bill No", key: "bill_no" },
    { label: "Subtotal", key: "subtotal" },
    { label: "Total GST", key: "total_gst" },
    { label: "Total Amount", key: "total_amount" },
    { label: "Total Profit", key: "total_profit" },
    { label: "Date", key: "created_at" }
  ];

  // 1. Calculate Summary Stats
  const stats = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      totalBills: acc.totalBills + 1,
      // Ensure you are using Number() to prevent string concatenation issues
      totalProfit: acc.totalProfit + Number(curr.total_profit || 0),
      totalRevenue: acc.totalRevenue + Number(curr.total_amount || 0),
    }), { totalBills: 0, totalProfit: 0, totalRevenue: 0 });
  }, [filteredData])

  const columns = [
    {
      name: "Id",
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    // {
    //   name: "Branch Name",
    //   selector: (row) => row.branch.name,
    //   sortable: true,
    // },
     {
      name: "Action",
      button: true,
      
      cell: (row) => (
        <button
          onClick={() => handlePrint(row.id)}
          className="px-3 py-1 text-2xl bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print
        </button>
      ),
    },
    {
      name: "User Name",
      selector: (row) => row.user.name,
      sortable: true,
    },
    {
      name: "Bill No",
      selector: (row) => row.bill_no,
      sortable: true,
    },
    {
      name: "Subtotal",
      selector: (row) => row.subtotal,
      sortable: true,
    },
    {
      name: "Total Gst",
      selector: (row) => row.total_gst,
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => row?.total_amount,
      sortable: true,
    },
    {
      name: "Total Saved",
      selector: (row) => row.total_saved,
      sortable: true,
    },
    {
      name: "Total Cogs",
      selector: (row) => row.total_cogs,
      sortable: true,
    },
    {
      name: "Total Profit",
      selector: (row) => row.total_profit,
      sortable: true,
    },
    {
      name: "Cash Received",
      selector: (row) => row.cash_received,
      sortable: true,
    },
    {
      name: "Balance Return",
      selector: (row) => row.balance_return,
      sortable: true,
    },
    {
      name: "Payment Status",
      selector: (row) => row.payment_status,
      sortable: true,
    },
    {
      name: "Bill Status",
      selector: (row) => row.bill_status,
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row) => row.created_at,
      sortable: true,
    },
  ];

  const handlePrint = async (billId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/sales-bill/print-data`,
        { id: [billId] },
        { headers: getAuthHeader() }
      );

      if (res.data?.status && res.data?.data?.length > 0) {
        setPrintData({
          data: res.data.data,
        });
        setShowReceipt(true);
      } else {
        alert("No print data found");
      }
    } catch (error) {
      console.error("Print failed:", error);
      alert("Unable to print bill");
    }
  };

  const fetchSaleBill = async () => {
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


  useEffect(() => {
    fetchSaleBill();
  }, []);

  useEffect(() => {
    const searchText = search.toLowerCase();

    const result = saleBills.filter((item) => {
      const formattedDate = new Date(item.created_at).toLocaleDateString(
        "en-CA"
      );
      const searchable = `
      ${item.id}
      ${item.store?.name}
      ${item.branch?.name}
      ${item.user?.name}
      ${item.bill_no}
      ${item.subtotal}
      ${item.total_gst}
      ${item.total_amount}
      ${item.total_saved}
      ${item.total_cogs}
      ${item.total_profit}
      ${item.cash_received}
      ${item.balance_return}
      ${item.payment_status}
      ${item.bill_status}
       ${formattedDate}
    `.toLowerCase();

      return searchable.includes(searchText);
    });

    setFilteredData(result);
  }, [search, saleBills]);

  const printReceipt = () => {
    const printContent = receiptRef.current;

    const win = window.open("", "", "width=800,height=600");

    win.document.write(`
    <html>
      <head>
        <title>Receipt</title>
           <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page {
            size: auto;
            margin: 15mm 10mm 10mm 10mm; /* TOP RIGHT BOTTOM LEFT */
          }

          body {
            margin: 0;
            padding: 0;
            font-family: "Poppins", sans-serif;
          }

          .receipt-print {
            margin-top: 12mm; /* EXTRA TOP SPACE IF REQUIRED */
          }

          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-print">
          ${printContent.innerHTML}
        </div>
      </body>
    </html>
  `);

    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <Layout>
      <div className="main-content-inner">
        {/* <!-- main-content-wrap --> */}
        <div className="main-content-wrap">
          <div className="flex items-center flex-wrap justify-between gap20 mb-27">
            <h3>All Sale Bills</h3>
            <ul className="breadcrumbs flex items-center flex-wrap justify-start gap10">
              <li>
                <Link to="/">
                  <div className="text-tiny">Dashboard</div>
                </Link>
              </li>
              <li>
                <i className="icon-chevron-right"></i>
              </li>
              <li>
                <Link to="#">
                  <div className="text-tiny">Sale Bills</div>
                </Link>
              </li>
              <li>
                <i className="icon-chevron-right"></i>
              </li>
              <li>
                <div className="text-tiny">All Sale Bills</div>
              </li>
            </ul>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="wg-box bg-blue-50 p-4" style={{
                background: "#e9efa8",
                border: "1px solid #d4d770"}} >
              <h6>Total Bills</h6>
              <h3>{stats.totalBills}</h3>
            </div>
            <div className="wg-box p-4 mb-4" style={{
                background: "#fef2f2",
                border: "1px solid #fecaca"}}>
              <h6>Total Revenue</h6>
              {/* Change '₹' to your currency symbol or remove if not needed */}
              <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="wg-box p-4" style={{
                background: "#97e99b",
                border: "1px solid #99bb8e"}}>
              <h6>Total Profit</h6>
              <h3>₹{stats.totalProfit.toFixed(2)}</h3>
            </div>
          </div>
          {/* <!-- all-user --> */}
          <div className="wg-box">
            <div className="flex items-center justify-between gap10 flex-wrap mb-3">
              <div className="wg-filter flex-grow">
                <form
                  className="form-search"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <fieldset className="name">
                    <input
                      type="text"
                      placeholder="Search sales bills..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-required="true"
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
            <div className="flex gap-2 mb-3">
              {/* CSV Export Button */}
              <CSVLink
                data={formatExportData(filteredData)}
                headers={csvHeaders}
                filename={"sales_bills.csv"}
                className="px-3 py-3 bg-green-600 text-2xl text-white rounded hover:bg-green-700"
              >
                Export CSV
              </CSVLink>
              {/* PDF Export Button */}
              <button
                onClick={exportPDF}
                className="px-3 py-3 bg-red-600 text-2xl text-white rounded hover:bg-red-700"
              >
                Export PDF
              </button>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              pointerOnHover
              responsive
              customStyles={{
                headCells: {
                  style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                  },
                },
              }}
            />
            <div className="divider"></div>
          </div>
          {/* <!-- /all-user --> */}
        </div>
        {/* <!-- /main-content-wrap --> */}
      </div>

      {showReceipt && printData && (
        <ReceiptModal
          ref={receiptRef}
          isOpen={showReceipt}
          data={printData}
          onClose={() => setShowReceipt(false)}
          onPrint={printReceipt}
        />
      )}
    </Layout>
  );
};
export default SaleBill;
