import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function PaymentModal({ total, onClose, onConfirm, cart_data }) {
  const [cashGiven, setCashGiven] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerDue, setCustomerDue] = useState(0);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

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

  // const handleConfirm = () => {
  //   let payments = [];
  //   let customer = null;
  //   const apiPaymentType = paymentType;

  //   if (customerName && customerMobile && paymentType === "credit") {
  //     customer = {
  //       name: customerName,
  //       mobile: customerMobile,
  //     };
  //   }

  //   if (paymentType === "online") {
  //     payments.push({
  //       method: "online",
  //       amount: total,
  //       transaction_id: "",
  //       cash_received: 0,
  //       balance_return: 0,
  //     });
  //   }

  //   if (paymentType === "cash") {
  //     payments.push({
  //       method: "cash",
  //       amount: cashApplied,
  //       cash_received: parse(cashGiven),
  //       balance_return: balanceReturn,
  //     });
  //   }

  //   // SPLIT PAYMENT
  //   if (paymentType === "split") {
  //     if (cashApplied > 0) {
  //       payments.push({
  //         method: "cash",
  //         amount: cashApplied,
  //         cash_received: parse(cashGiven),
  //         balance_return: balanceReturn,
  //       });
  //     }

  //     if (remaining > 0) {
  //       payments.push({
  //         method: "online",
  //         amount: remaining,
  //         transaction_id: "",
  //       });
  //     }
  //   }

  //   onConfirm({ payments, payment_type: apiPaymentType, customer });
  // };

  const handleConfirm = () => {
    let payments = [];
    let customer = null;

    const apiPaymentType = paymentType;

    if (paymentType === "credit") {
      if (!customerName || !customerMobile) {
        alert("Customer name & mobile are required for Pay Later");
        return;
      }

      customer = {
        name: customerName,
        mobile: customerMobile,
      };

      payments = [];
    }

    if (paymentType === "cash") {
      if (!cashGiven || parse(cashGiven) < total) {
        alert("Insufficient cash amount");
        return;
      }

      payments.push({
        method: "cash",
        amount: total,
        cash_received: parse(cashGiven),
        balance_return: Math.max(parse(cashGiven) - total, 0),
      });
    }

    if (paymentType === "online") {
      payments.push({
        method: "online",
        amount: total,
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

      axios
        .get(`${BASE_URL}/api/customer-due/${customerMobile}`, {
          headers: getAuthHeader(),
        })
        .then((res) => {
          if (res.data.customer) {
            setCustomerName(res.data.customer.name || "");
            setCustomerDue(res.data.total_due || 0);
          } else {
            setCustomerName("");
            setCustomerDue(0);
          }
        })
        .catch((err) => {
          console.error("Customer fetch error", err);
          setCustomerDue(0);
        })
        .finally(() => {
          setLoadingCustomer(false);
        });
    } else {
      setCustomerName("");
      setCustomerDue(0);
    }
  }, [customerMobile]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="row bg-white rounded-3xl shadow-2xl w-full cart-max-width p-5">
        {/* LEFT SIDE – METHOD LIST */}
        <div className="col-md-7  flex flex-col gap-4">
          <div className="col-span-1 flex flex-col gap-4">
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontSize: "2.5rem" }}
            >
              Payment Options
            </h2>
            <button
              onClick={() => handleMethod("cash")}
              className={`p-5 rounded-2xl text-left transition-all border ${
                paymentType === "cash"
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              style={{ width: "90%" }}
            >
              <div
                className="text-xl font-semibold text-center mb-5"
                style={{ fontSize: "25px" }}
              >
                Cash
              </div>
              <div className="text-sm opacity-70 text-center">
                Take cash from customer
              </div>
            </button>

            <button
              onClick={() => handleMethod("online")}
              className={`p-5 rounded-2xl text-center transition-all border ${
                paymentType === "online"
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              style={{ marginBottom: "20px", width: "90%" }}
            >
              <div
                className="text-xl font-semibold text-center mb-5"
                style={{ fontSize: "25px" }}
              >
                Online
              </div>
              <div className="text-sm opacity-70 text-center">
                Pay with online method
              </div>
            </button>

            <button
              onClick={() => handleMethod("split")}
              className={`p-5 rounded-2xl text-center transition-all border ${
                paymentType === "split"
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              style={{ width: "90%" }}
            >
              <div
                className="text-xl font-semibold text-center mb-5"
                style={{ fontSize: "25px" }}
              >
                Split Payment
              </div>
              <div className="text-sm opacity-70 text-center">
                Cash + Online
              </div>
            </button>

            <button
              onClick={() => handleMethod("credit")}
              className={`p-5 rounded-2xl text-center transition-all border ${
                paymentType === "credit"
                  ? "bg-blue-600 text-white shadow-xl scale-105"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              style={{ width: "90%" }}
            >
              <div
                className="text-xl font-semibold text-center mb-5"
                style={{ fontSize: "25px" }}
              >
                Pay Later
              </div>
              <div className="text-sm opacity-70 text-center">
                Create credit bill
              </div>
            </button>
          </div>

          {/* MIDDLE AREA */}
          <div className="col-span-1 space-y-6">
            {(paymentType === "cash" || paymentType === "split") && (
              <>
                <h2
                  className="text-xl font-bold mb-20"
                  style={{ fontSize: "2.4rem" }}
                >
                  Enter Amount
                </h2>

                <div>
                  {/* <input
                    type="number"
                    className="payment-cash p-5 text-3xl text-center border rounded-xl shadow mb-20"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    placeholder="Cash Received"
                  /> */}
                  <input
                    type="number"
                    className="payment-cash p-5 text-3xl text-center border rounded-xl shadow mb-20"
                    placeholder="Cash Received"
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
              {paymentType === "online" || paymentType === "split"
                ? total.toFixed(2)
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

            {paymentType === "credit" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold" style={{ fontSize: "2rem" }}>
                  Customer Details
                </h2>
                <input
                  type="text"
                  className="payment-cash p-4 text-xl w-full border rounded-xl shadow"
                  placeholder="Customer Mobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                />
                <input
                  type="text"
                  className="payment-cash p-4 text-xl w-full border rounded-xl shadow"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            )}

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
          </div>
        </div>

        {/* KEYPAD (only cash mode) */}
        <>
          <div className="col-md-5">
            <div className="grid grid-cols-3 gap-3">
              {["cash", "split"].includes(paymentType) && (
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
                      className="p-5 bg-gray-100 rounded-xl text-2xl font-bold hover:bg-gray-200 shadow"
                      onClick={() => keypad(k)}
                    >
                      {k}
                    </button>
                  ))}

                  <button
                    onClick={() => keypad("C")}
                    className="col-span-3 p-5 bg-red-500 text-white rounded-xl text-xl shadow hover:bg-red-600"
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
                (paymentType === "cash" && remaining > 0) ||
                (paymentType === "split" && cashApplied <= 0) ||
                (paymentType === "credit" && (!customerName || !customerMobile))
              }
              onClick={handleConfirm}
              className={`rounded-xl text-white font-bold ${
                paymentType === "cash" && remaining > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
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
