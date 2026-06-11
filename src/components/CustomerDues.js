import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function CustomerDues() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getAuthHeader = () => {
    const user_detail = localStorage.getItem("user_detail");
    const user = user_detail ? JSON.parse(user_detail) : null;
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  const formatCurrency = (value) => {
    try {
      const num = Number(value) || 0;
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(num);
    } catch (e) {
      return `₹${value}`;
    }
  };

  const totalDueAmount = customers.reduce(
    (sum, item) => sum + Number(item?.total_due || 0),
    0,
  );

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/customer/due`, {
        headers: getAuthHeader(),
      });

      if (res?.data?.status) {
        setCustomers(res.data.data || []);
        setFiltered(res.data.data || []);
      } else {
        setCustomers([]);
        setFiltered([]);
      }
    } catch (err) {
      console.error("Error fetching dues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(customers);
      return;
    }

    const result = customers.filter((c) => {
      const name = c?.customer?.name || c?.customer_name || "";
      const mobile = c?.customer?.mobile || c?.customer_mobile || "";
      return `${name} ${mobile}`.toLowerCase().includes(q);
    });
    setFiltered(result);
  }, [search, customers]);

  const handlePayment = async () => {
    setErrorMsg("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Enter a valid amount");
      return;
    }

    const due = Number(selectedCustomer?.total_due || 0);
    if (numAmount > due) {
      setErrorMsg("Amount cannot exceed total due");
      return;
    }

    setPaymentLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/sales-bills/customer-pay-due`,
        {
          customer_id: selectedCustomer.customer_id,
          amount: numAmount,
          method: method,
        },
        {
          headers: {
            ...getAuthHeader(),
            "Idempotency-Key": Date.now().toString(),
          },
        },
      );

      toast.success("Payment successful");

      setShowModal(false);
      setAmount("");
      setMethod("cash");
      fetchDues();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (item) => {
    setSelectedCustomer(item);
    setAmount("");
    setMethod("cash");
    setErrorMsg("");
    setShowModal(true);
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white text-2xl font-semibold"
            aria-label="Go back"
          >
            Back
          </button>

          <h1 className="text-3xl font-bold">Customer Dues</h1>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or mobile"
        className="w-full p-3 border rounded-lg mb-4 mt-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search customers"
      />

      {loading && <div className="text-center p-5">Loading...</div>}

      {!loading && (
        <div className="bg-white shadow rounded-sm overflow-hidden mt-6">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-2xl font-semibold">
                  Customer
                </th>
                <th className="p-3 text-left text-2xl font-semibold">Mobile</th>
                <th className="p-3 text-left text-2xl font-semibold">
                  Total Due
                </th>
                <th className="p-3 text-center text-2xl font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-5 text-gray-500 text-2xl"
                  >
                    No dues found
                  </td>
                </tr>
              )}

              {filtered.map((item) => {
                const name = item?.customer?.name || item?.customer_name || "-";
                const mobile =
                  item?.customer?.mobile || item?.customer_mobile || "-";
                const due = item?.total_due ?? 0;

                return (
                  <tr key={item.customer_id} className="border-t">
                    <td className="p-3 font-semibold text-xl">{name}</td>

                    <td className="p-3 text-xl">{mobile}</td>

                    <td className="p-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xl">
                        {formatCurrency(due)}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => openPaymentModal(item)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-xl"
                        aria-label={`Collect due for ${name}`}
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col state-layer">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600 text-3xl">Pay Due:</span>
                <span className="font-semibold text-3xl">
                  {selectedCustomer.customer?.name ||
                    selectedCustomer.customer_name}
                </span>
              </h2>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-5 flex-1">
              {/* Total Due Card */}
              <div className="bg-blue-50/50 border border-blue-100/70 rounded-xl p-4 flex justify-between items-center">
                <span className="text-2xl font-medium text-blue-700 uppercase tracking-wider">
                  Total Amount Due
                </span>
                <strong className="text-3xl font-black text-blue-900">
                  {formatCurrency(selectedCustomer.total_due)}
                </strong>
              </div>

              {/* Input Field */}
              <div className="space-y-2">
                <label
                  htmlFor="payment-amount"
                  className="block text-2xl font-semibold text-slate-700"
                >
                  Payment Amount
                </label>
                <div className="relative">
                  <input
                    id="payment-amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full text-2xl p-3.5 border border-slate-200 rounded-xl shadow-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    max={selectedCustomer.total_due}
                    aria-label="Amount to pay"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="block text-2xl font-semibold text-slate-700">
                  Select Payment Method
                </label>
                <div className="flex gap-4 text-2xl mt-2">
                  {["cash", "online"].map((m) => {
                    const isActive = method === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`flex-1 p-3.5 rounded-xl border font-medium capitalize flex items-center justify-center gap-2 transition-all duration-200 ${
                          isActive
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-3xl font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayment}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-3xl font-semibold flex items-center gap-2 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-100"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
