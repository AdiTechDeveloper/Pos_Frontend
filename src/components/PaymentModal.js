import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function PaymentModal({ total, onClose, onConfirm, cart_data }) {
  const [cashGiven, setCashGiven] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAdd1, setCustomerAdd1] = useState("");
  const [customerAdd2, setCustomerAdd2] = useState("");
  const [customerArea, setCustomerArea] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerDue, setCustomerDue] = useState(0);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [nameError, setNameError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  const parse = (v) => (parseFloat(v) ? parseFloat(v) : 0);
  const cashApplied = Math.min(parse(cashGiven), total);
  const remaining = total - cashApplied;
  const balanceReturn = Math.max(parse(cashGiven) - total, 0);
  const amountStyle = { fontSize: "45px", marginBottom: "10px" };

  const keypad = (k) => {
    setCashGiven((prev) => {
      prev = prev || "";
      if (k === "C") return "";
      if (k === "⌫") return prev.slice(0, -1);
      if (k === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + k;
    });
  };

  const handleConfirm = () => {
    let payments = [];
    let customer = null;

    const apiPaymentType = paymentType;

    if (!customerMobile) {
      alert("Mobile is required for Pay Later");
      return;
    }

    // Mobile validation
    if (customerMobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    customer = {
      name: customerName,
      mobile: customerMobile,
      add1: customerAdd1,
      add2: customerAdd2,
      area: customerArea,
      city: customerCity,
    };

    payments = [];

    if (paymentType === "cash") {
      if (!cashGiven || parse(cashGiven) <= 0) {
        alert("Enter cash amount received");
        return;
      }

      const cashAmt = Math.min(parse(cashGiven), total);
      const dueAmt = Math.max(total - cashAmt, 0);

      if (dueAmt > 0 && !customerMobile) {
        alert("Mobile number required for partial payment (due amount)");
        return;
      }

      payments.push({
        method: "cash",
        amount: cashAmt,
        cash_received: parse(cashGiven),
        balance_return: Math.max(parse(cashGiven) - total, 0),
      });
    }

    if (paymentType === "online") {
      if (!cashGiven || parse(cashGiven) <= 0) {
        alert("Enter online amount received");
        return;
      }

      const onlineAmt = Math.min(parse(cashGiven), total);
      const dueAmt = Math.max(total - onlineAmt, 0);

      if (dueAmt > 0 && !customerMobile) {
        alert("Mobile number required for partial payment (due amount)");
        return;
      }

      payments.push({
        method: "online",
        amount: onlineAmt,
        transaction_id: "",
      });
    }

    if (paymentType === "split") {
      if (!cashGiven || parse(cashGiven) <= 0) {
        alert("Enter valid cash amount for split payment");
        return;
      }

      const cashAmt = Math.min(parse(cashGiven), total);
      const onlineAmt = total - cashAmt;

      payments.push({
        method: "cash",
        amount: cashAmt,
        cash_received: parse(cashGiven),
        balance_return: Math.max(parse(cashGiven) - cashAmt, 0),
      });

      if (onlineAmt > 0) {
        payments.push({
          method: "online",
          amount: onlineAmt,
          transaction_id: "",
        });
      }
    }

    if (paymentType === "wallet") {
      const walletApplied = Math.min(walletBalance, total);
      const remainingAfterWallet = total - walletApplied;

      payments.push({
        method: "wallet",
        amount: walletApplied,
      });

      if (remainingAfterWallet > 0) {
        if (!cashGiven || parse(cashGiven) < remainingAfterWallet) {
          alert(
            `Wallet covers ₹${walletApplied.toFixed(2)}. Enter remaining ₹${remainingAfterWallet.toFixed(2)} in cash.`,
          );
          return;
        }
        payments.push({
          method: "cash",
          amount: remainingAfterWallet,
          cash_received: parse(cashGiven),
          balance_return: Math.max(parse(cashGiven) - remainingAfterWallet, 0),
        });
      }
    }

    onConfirm({
      payments,
      payment_type: apiPaymentType,
      customer,
    });
  };

  const handleMethod = (type) => {
    setPaymentType(type);
  };

  const getAuthHeader = () => {
    const user_detail = localStorage.getItem("user_detail");
    const user = user_detail ? JSON.parse(user_detail) : null;
    const token = user?.token;

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (customerMobile.length === 10) {
      setLoadingCustomer(true);

      Promise.all([
        axios.get(`${BASE_URL}/api/customer-due/${customerMobile}`, {
          headers: getAuthHeader(),
        }),
        axios.get(
          `${BASE_URL}/api/customers/wallet-balance/${customerMobile}`,
          { headers: getAuthHeader() },
        ),
      ])
        .then(([dueRes, walletRes]) => {
          const c = dueRes.data.customer;
          if (c) {
            setCustomerName(c.name || "");
            setCustomerAdd1(c.add1 || "");
            setCustomerAdd2(c.add2 || "");
            setCustomerArea(c.area || "");
            setCustomerCity(c.city || "");
            setCustomerDue(dueRes.data.total_due || 0);
          } else {
            setCustomerDue(0);
          }
          setWalletBalance(walletRes.data.balance || 0);
        })
        .catch((err) => {
          console.error("Customer fetch error", err);
          setCustomerDue(0);
          setWalletBalance(0);
        })
        .finally(() => setLoadingCustomer(false));
    } else {
      setCustomerDue(0);
      setWalletBalance(0);
    }
  }, [customerMobile]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="row bg-white rounded-3xl shadow-2xl w-full cart-max-width p-5">
        {/* LEFT SIDE – METHOD LIST */}
        <div className="col-md-7  flex flex-col gap-4">
          <div className="col-span-1 flex flex-col gap-4 w-full">
            {/* Section Header */}
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Payment Options
            </h2>

            {/* 2x2 Responsive Grid */}
            <div className="grid grid-cols-2 gap-3.5 w-full">
              {/* Cash Button */}
              <button
                type="button"
                onClick={() => handleMethod("cash")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 ${
                  paymentType === "cash"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {/* Cash Icon */}
                <div>
                  <div className="text-2xl font-bold leading-tight">Cash</div>
                  <div
                    className={`text-xl mt-0.5 leading-normal ${paymentType === "cash" ? "text-blue-100" : "text-slate-400"}`}
                  >
                    Take cash from customer
                  </div>
                </div>
              </button>

              {/* Online Button */}
              <button
                type="button"
                onClick={() => handleMethod("online")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 ${
                  paymentType === "online"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {/* Online Icon */}
                <div>
                  <div className="text-2xl font-bold leading-tight">Online</div>
                  <div
                    className={`text-xl mt-0.5 leading-normal ${paymentType === "online" ? "text-blue-100" : "text-slate-400"}`}
                  >
                    Pay with online method
                  </div>
                </div>
              </button>

              {/* Split Button */}
              <button
                type="button"
                onClick={() => handleMethod("split")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 ${
                  paymentType === "split"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {/* Split Icon */}
                <div>
                  <div className="text-2xl font-bold leading-tight">
                    Split Payment
                  </div>
                  <div
                    className={`text-xl mt-0.5 leading-normal ${paymentType === "split" ? "text-blue-100" : "text-slate-400"}`}
                  >
                    Cash + Online
                  </div>
                </div>
              </button>

              {/* Pay Later (Credit) Button */}
              <button
                type="button"
                onClick={() => handleMethod("credit")}
                className={`p-4 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 ${
                  paymentType === "credit"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.02]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {/* Credit Icon */}
                <div>
                  <div className="text-2xl font-bold leading-tight">
                    Pay Later
                  </div>
                  <div
                    className={`text-xl mt-0.5 leading-normal ${paymentType === "credit" ? "text-blue-100" : "text-slate-400"}`}
                  >
                    Create credit bill
                  </div>
                </div>
              </button>

              {/* Wallet Button — sirf tab dikhega jab balance ho */}
              {walletBalance > 0 && (
                <button
                  type="button"
                  onClick={() => handleMethod("wallet")}
                  className={`p-4 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 ${
                    paymentType === "wallet"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="text-2xl font-bold leading-tight">
                      Wallet
                    </div>
                    <div
                      className={`text-xl mt-0.5 leading-normal ${paymentType === "wallet" ? "text-purple-100" : "text-slate-400"}`}
                    >
                      Available: ₹{Number(walletBalance).toFixed(2)}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* MIDDLE AREA */}
          <div className="col-span-1">
            {(paymentType === "cash" ||
              paymentType === "split" ||
              paymentType === "online" ||
              (paymentType === "wallet" && walletBalance < total)) && (
              <>
                <div className="flex flex-row items-center gap-4">
                  <h2 className="text-4xl p-3 font-extrabold text-slate-800 tracking-tight mb-5">
                    {paymentType === "wallet"
                      ? "Remaining Amount (Cash)"
                      : `Enter Amount ${paymentType === "online" ? "(Online Received)" : ""}`}
                  </h2>

                  <input
                    type="number"
                    className="payment-cash p-4 text-2xl text-center border rounded-xl shadow mb-20"
                    placeholder={
                      paymentType === "wallet"
                        ? "Remaining Cash"
                        : paymentType === "online"
                          ? "Online Amount Received"
                          : "Cash Received"
                    }
                    value={cashGiven ?? ""}
                    onChange={(e) =>
                      setCashGiven(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                </div>
              </>
            )}

            <div style={amountStyle}>
              <strong>Paid: </strong> ₹
              {paymentType === "online" ||
              paymentType === "split" ||
              paymentType === "cash"
                ? parse(cashGiven).toFixed(2)
                : cashApplied.toFixed(2)}
            </div>

            {paymentType === "split" && (
              <>
                <div style={amountStyle}>
                  <strong>Cash: </strong> ₹{cashApplied.toFixed(2)}
                </div>
                <div style={amountStyle}>
                  <strong>Online: </strong> ₹{(total - cashApplied).toFixed(2)}
                </div>
              </>
            )}

            {paymentType === "wallet" && (
              <>
                <div style={amountStyle}>
                  <strong>From Wallet: </strong> ₹
                  {Math.min(walletBalance, total).toFixed(2)}
                </div>
                {total > walletBalance && (
                  <div style={{ ...amountStyle, color: "#dc2626" }}>
                    <strong>Remaining (Cash needed): </strong> ₹
                    {(total - walletBalance).toFixed(2)}
                  </div>
                )}
              </>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ fontSize: "2rem" }}>
                Customer Details
              </h2>
              <input
                type="text"
                className={`payment-cash p-4 text-xl w-half border rounded-xl shadow ${
                  mobileError ? "border-red-500" : ""
                }`}
                placeholder="Mobile"
                value={customerMobile}
                onChange={(e) => {
                  let value = e.target.value;

                  // remove spaces
                  value = value.replace(/\s+/g, "");

                  // remove non digits
                  value = value.replace(/\D/g, "");

                  // remove leading 0
                  value = value.replace(/^0+/, "");

                  // limit to 10
                  value = value.slice(0, 10);

                  setCustomerMobile(value);

                  // validation
                  if (value.length === 0) {
                    setMobileError("Mobile is required");
                  } else if (value.length < 10) {
                    setMobileError("Enter 10 digit mobile number");
                  } else {
                    setMobileError("");
                  }
                }}
              />
              {mobileError && (
                <div className="text-red-500 text-sm">{mobileError}</div>
              )}
              <input
                type="text"
                className={`payment-cash p-4 text-xl w-half border rounded-xl shadow ${
                  nameError ? "border-red-500" : ""
                }`}
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => {
                  let value = e.target.value;

                  // allow only letters + space
                  value = value.replace(/[^a-zA-Z\s]/g, "");

                  setCustomerName(value);

                  // validation
                  if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                    setNameError("Only letters allowed");
                  } else {
                    setNameError("");
                  }
                }}
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

            {loadingCustomer && (
              <div className="text-blue-500 text-sm mt-2">
                Checking customer...
              </div>
            )}

            {customerDue > 0 && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-2 font-bold text-3xl">
                Pending Due: ₹{customerDue}
              </div>
            )}

            {paymentType === "cash" && balanceReturn > 0 && (
              <div style={{ ...amountStyle, marginBottom: "20px" }}>
                <strong>Change: </strong> ₹{balanceReturn.toFixed(2)}
              </div>
            )}

            {(paymentType === "cash" || paymentType === "online") &&
              remaining > 0 && (
                <div style={{ ...amountStyle, color: "#dc2626" }}>
                  <strong>Due (Pay Later): </strong> ₹{remaining.toFixed(2)}
                </div>
              )}
          </div>
        </div>

        {/* KEYPAD (only cash mode) */}
        <>
          <div className="col-md-5">
            <div className="grid grid-cols-3 gap-3">
              {(["cash", "split", "online"].includes(paymentType) ||
                (paymentType === "wallet" && walletBalance < total)) && (
                <>
                  {[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    ".",
                    "0",
                    "⌫",
                  ].map((k) => (
                    <button
                      key={k}
                      className="p-3 rounded-2xl text-2xl font-bold hover:bg-gray-200 shadow"
                      onClick={() => keypad(k)}
                    >
                      {k}
                    </button>
                  ))}

                  <button
                    onClick={() => keypad("C")}
                    className="p-4 bg-red-500 text-white rounded-2xl text-xl shadow hover:bg-red-600"
                    style={{ fontSize: "20px" }}
                  >
                    Clear
                  </button>
                </>
              )}

              {/* <button
                onClick={() => setShowReceipt(true)}
                className="col-span-3 p-5 text-white rounded-xl text-xl shadow"
                style={{
                  background: "#3F51B5",
                  fontSize: "20px",
                  marginTop: paymentType === "online" ? "40px" : "0px",
                }}
              >
                Print Receipt
              </button> */}
            </div>
          </div>
        </>

        {/* SUMMARY + ACTION BUTTONS */}
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
              disabled={
                ((remaining > 0 || paymentType === "credit") &&
                  customerMobile.length !== 10) ||
                mobileError ||
                ((paymentType === "cash" || paymentType === "online") &&
                  (!cashGiven || parse(cashGiven) <= 0)) ||
                (paymentType === "split" && cashApplied <= 0) ||
                (paymentType === "wallet" &&
                  walletBalance < total &&
                  (!cashGiven || parse(cashGiven) < total - walletBalance))
              }
              onClick={handleConfirm}
              className={`rounded-xl text-white font-bold transition-colors ${
                ((remaining > 0 || paymentType === "credit") &&
                  customerMobile.length !== 10) ||
                mobileError ||
                ((paymentType === "cash" || paymentType === "online") &&
                  (!cashGiven || parse(cashGiven) <= 0)) ||
                (paymentType === "split" && cashApplied <= 0) ||
                (paymentType === "wallet" &&
                  walletBalance < total &&
                  (!cashGiven || parse(cashGiven) < total - walletBalance))
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 cursor-pointer"
              }`}
              style={{ width: "100%", fontSize: "16px", padding: "14px 30px" }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
