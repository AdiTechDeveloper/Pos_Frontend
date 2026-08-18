import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeader = () => {
  const user_detail = localStorage.getItem("user_detail");
  const user = user_detail ? JSON.parse(user_detail) : null;
  const token = user?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AddAdvanceModal({ onClose, onSuccess }) {
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAdd1, setCustomerAdd1] = useState("");
  const [customerAdd2, setCustomerAdd2] = useState("");
  const [customerArea, setCustomerArea] = useState("");
  const [customerCity, setCustomerCity] = useState("");

  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const [amount, setAmount] = useState(null);
  const [method, setMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");

  const [mobileError, setMobileError] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parse = (v) => (parseFloat(v) ? parseFloat(v) : 0);
  const amountStyle = { fontSize: "45px", marginBottom: "10px" };

  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  const keypad = (k) => {
    setAmount((prev) => {
      prev = prev || "";
      if (k === "C") return "";
      if (k === "⌫") return prev.slice(0, -1);
      if (k === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + k;
    });
  };

  // ── Mobile lookup — same pattern as PaymentModal ──
  useEffect(() => {
    if (customerMobile.length === 10) {
      setLoadingCustomer(true);

      axios
        .get(`${BASE_URL}/api/customers/wallet-balance/${customerMobile}`, {
          headers: getAuthHeader(),
        })
        .then((res) => {
          if (res.data.customer) {
            const c = res.data.customer;
            setCustomerName(c.name || "");
            setCustomerAdd1(c.add1 || "");
            setCustomerAdd2(c.add2 || "");
            setCustomerArea(c.area || "");
            setCustomerCity(c.city || "");
            setCurrentBalance(res.data.balance || 0);
            setIsNewCustomer(false);
          } else {
            setCustomerName("");
            setCustomerAdd1("");
            setCustomerAdd2("");
            setCustomerArea("");
            setCustomerCity("");
            setCurrentBalance(0);
            setIsNewCustomer(true);
          }
        })
        .catch((err) => {
          console.error("Customer fetch error", err);
          setCurrentBalance(0);
          setIsNewCustomer(true);
        })
        .finally(() => {
          setLoadingCustomer(false);
        });
    } else {
      setCustomerName("");
      setCustomerAdd1("");
      setCustomerAdd2("");
      setCustomerArea("");
      setCustomerCity("");
      setCurrentBalance(0);
      setIsNewCustomer(false);
    }
  }, [customerMobile]);

  const handleMobileChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, "");
    value = value.replace(/\D/g, "");
    value = value.replace(/^0+/, "");
    value = value.slice(0, 10);

    setCustomerMobile(value);

    if (value.length === 0) {
      setMobileError("Mobile is required");
    } else if (value.length < 10) {
      setMobileError("Enter 10 digit mobile number");
    } else {
      setMobileError("");
    }
  };

  const handleNameChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCustomerName(value);

    if (!value) {
      setNameError("Name is required");
    } else {
      setNameError("");
    }
  };

  const isFormValid =
    customerMobile.length === 10 &&
    !mobileError &&
    customerName.trim().length > 0 &&
    !nameError &&
    parse(amount) > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      if (!customerName.trim()) {
        setNameError("Name is required");
      }
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/customers/advance`,
        {
          customer: {
            mobile: customerMobile,
            name: customerName,
            add1: customerAdd1,
            add2: customerAdd2,
            area: customerArea,
            city: customerCity,
          },
          amount: parse(amount),
          method,
          transaction_id: method === "online" ? transactionId : null,
        },
        { headers: getAuthHeader() },
      );

      toast.success(
        `₹${parse(amount).toFixed(2)} advance added. New balance: ₹${Number(
          res.data.balance,
        ).toFixed(2)}`,
      );

      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || "Failed to add advance");
      console.error("Add Advance Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="row bg-white rounded-3xl shadow-2xl w-full cart-max-width p-5">
        {/* LEFT SIDE — CUSTOMER + AMOUNT */}
        <div className="col-md-7 flex flex-col gap-4">
          <div className="col-span-1 flex flex-col gap-4 w-full">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Add Customer Advance
            </h2>

            {/* Customer Details */}
            <div className="space-y-4">
              <input
                type="text"
                className={`payment-cash p-4 text-xl w-half border rounded-xl shadow ${
                  mobileError ? "border-red-500" : ""
                }`}
                placeholder="Mobile *"
                value={customerMobile}
                onChange={handleMobileChange}
              />
              {mobileError && (
                <div className="text-red-500 text-sm">{mobileError}</div>
              )}

              {loadingCustomer && (
                <div className="text-blue-500 text-sm">
                  Checking customer...
                </div>
              )}

              {!loadingCustomer && customerMobile.length === 10 && (
                <div
                  className={`p-3 rounded-lg text-lg font-bold ${
                    isNewCustomer
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isNewCustomer
                    ? "🆕 New Customer — please fill name & details"
                    : `✓ Existing Customer — Current Balance: ₹${Number(
                        currentBalance,
                      ).toFixed(2)}`}
                </div>
              )}

              <input
                type="text"
                className={`payment-cash p-4 text-xl w-half border rounded-xl shadow ${
                  nameError ? "border-red-500" : ""
                }`}
                placeholder="Customer Name *"
                value={customerName}
                onChange={handleNameChange}
              />
              {nameError && (
                <div className="text-red-500 text-sm">{nameError}</div>
              )}

              <input
                type="text"
                className="payment-cash p-4 text-xl w-half border rounded-xl shadow"
                placeholder="Add 1"
                value={customerAdd1}
                onChange={(e) => setCustomerAdd1(e.target.value)}
              />
              <input
                type="text"
                className="payment-cash p-4 text-xl w-half border rounded-xl shadow"
                placeholder="Add 2"
                value={customerAdd2}
                onChange={(e) => setCustomerAdd2(e.target.value)}
              />
              <input
                type="text"
                className="payment-cash p-4 text-xl w-half border rounded-xl shadow"
                placeholder="Area"
                value={customerArea}
                onChange={(e) => setCustomerArea(e.target.value)}
              />
              <input
                type="text"
                className="payment-cash p-4 text-xl w-half border rounded-xl shadow"
                placeholder="City"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
              />
            </div>
          </div>

          {/* Amount + Method */}
          <div className="col-span-1">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Advance Amount
            </h2>

            <input
              type="number"
              className="payment-cash p-4 text-2xl text-center border rounded-xl shadow mb-6 mt-4"
              placeholder="Enter Amount"
              value={amount ?? ""}
              onChange={(e) =>
                setAmount(e.target.value === "" ? null : e.target.value)
              }
            />

            {/* Quick amount buttons */}
            <div className="flex gap-3 flex-wrap mb-6">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(String(qa))}
                  className="px-5 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xl hover:bg-blue-100"
                >
                  ₹{qa}
                </button>
              ))}
            </div>

            <div style={amountStyle}>
              <strong>Amount: </strong> ₹{parse(amount).toFixed(2)}
            </div>

            {!isNewCustomer && customerMobile.length === 10 && (
              <div style={{ ...amountStyle, color: "#15803d" }}>
                <strong>New Balance: </strong> ₹
                {(Number(currentBalance) + parse(amount)).toFixed(2)}
              </div>
            )}

            {/* Payment method */}
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-6 mb-3">
              Received Via
            </h2>
            <div className="grid grid-cols-2 gap-3.5 w-full">
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                  method === "cash"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="text-2xl font-bold">Cash</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("online")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                  method === "online"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="text-2xl font-bold">Online</div>
              </button>
            </div>

            {method === "online" && (
              <input
                type="text"
                className="payment-cash p-4 text-xl w-half border rounded-xl shadow mt-4"
                placeholder="Transaction ID (optional)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* RIGHT SIDE — KEYPAD */}
        <div className="col-md-5">
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map(
              (k) => (
                <button
                  key={k}
                  className="p-5 bg-gray-100 rounded-xl text-2xl font-bold hover:bg-gray-200 shadow"
                  onClick={() => keypad(k)}
                >
                  {k}
                </button>
              ),
            )}

            <button
              onClick={() => keypad("C")}
              className="col-span-3 p-5 bg-red-500 text-white rounded-xl text-xl shadow hover:bg-red-600"
              style={{ fontSize: "20px" }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* SUMMARY + ACTIONS */}
        <div className="col-span-3 flex justify-between items-center mt-6">
          <div></div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="bg-gray-300 rounded-xl font-semibold"
              style={{ width: "100%", fontSize: "16px", padding: "14px 30px" }}
            >
              Cancel
            </button>

            <button
              disabled={!isFormValid || submitting}
              onClick={handleSubmit}
              className={`rounded-xl text-white font-bold ${
                !isFormValid || submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              style={{ width: "100%", fontSize: "16px", padding: "14px 30px" }}
            >
              {submitting ? "Processing..." : "Add Advance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
