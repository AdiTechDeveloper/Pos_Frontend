import React, { useState, useRef } from "react";
import { createSalesBill, paySalesBill } from "../utils/api";
import PaymentModal from "./PaymentModal";
import { toast } from "react-toastify";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import ReceiptModal from "./ReceiptModal";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeader = () => {
  const user_detail = localStorage.getItem("user_detail");
  const user = user_detail ? JSON.parse(user_detail) : null;
  const token = user?.token;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : {};
};

export default function CartPanel({ cart, setCart, triggerRefresh }) {
  const history = useHistory();
  const [showPayment, setShowPayment] = useState(false);
  localStorage.setItem("cart_detail", JSON.stringify(cart));
  const user_data = JSON.parse(localStorage.getItem("user_detail"));
  const role = user_data?.user?.role;

  const receiptRef = useRef();
  const [showReceipt, setShowReceipt] = useState(false);
  const [printData, setPrintData] = useState(null);

  const [priceOverrides, setPriceOverrides] = useState({});

  const canOverridePrice = role === "admin" || role === "manager";

  const getPriceWithGST = (item) => {
    const sellingPrice = parseFloat(item.selling_price) || 0;
    const gstRate = parseFloat(item.gst_percent) || 0;
    const isInclusive = Number(item.gst_inclusive) === 1;

    if (gstRate > 0 && isInclusive) {
      const taxable = (sellingPrice * 100) / (100 + gstRate);
      const gstAmount = sellingPrice - taxable;
      return { taxable, gstAmount, finalPrice: sellingPrice };
    } else {
      const gstAmount = (sellingPrice * gstRate) / 100;
      return {
        taxable: sellingPrice,
        gstAmount,
        finalPrice: sellingPrice + gstAmount,
      };
    }
  };

  const total = cart.reduce((acc, item) => {
    const { finalPrice } = getPriceWithGST(item);
    return acc + finalPrice * item.qty;
  }, 0);

  localStorage.setItem("cart_total", total);

  const increaseQty = (item) => {
    setCart(
      cart.map((i) =>
        i.cart_key === item.cart_key ? { ...i, qty: i.qty + 1 } : i,
      ),
    );
  };

  const decreaseQty = (item) => {
    setCart(
      cart.map((i) =>
        i.cart_key === item.cart_key
          ? { ...i, qty: Math.max(i.qty - 1, 1) }
          : i,
      ),
    );
  };

  const removeItem = (item) => {
    setCart(cart.filter((i) => i.cart_key !== item.cart_key));
    setPriceOverrides((prev) => {
      const updated = { ...prev };
      delete updated[item.cart_key];
      return updated;
    });
  };

  // ── Price Override Handlers ──

  const startPriceEdit = (item) => {
    setPriceOverrides((prev) => ({
      ...prev,
      [item.cart_key]: {
        editing: true,
        tempValue: String(item.selling_price),
      },
    }));
  };

  const cancelPriceEdit = (item) => {
    setPriceOverrides((prev) => ({
      ...prev,
      [item.cart_key]: { editing: false, tempValue: "" },
    }));
  };

  const confirmPriceOverride = (item) => {
    const override = priceOverrides[item.cart_key];
    if (!override) return;

    const newPrice = parseFloat(override.tempValue);

    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const originalPrice = parseFloat(item.original_price || item.selling_price);

    if (newPrice > originalPrice) {
      toast.error("Override price cannot be more than original price");
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.cart_key === item.cart_key
          ? {
              ...i,
              selling_price: newPrice,
              original_price: i.original_price || i.selling_price, 
              is_price_overridden: true,
            }
          : i,
      ),
    );

    setPriceOverrides((prev) => ({
      ...prev,
      [item.cart_key]: { editing: false, tempValue: "" },
    }));

    toast.success(
      `Price updated: ₹${originalPrice.toFixed(2)} → ₹${newPrice.toFixed(2)}`,
    );
  };

  const resetPrice = (item) => {
    if (!item.original_price) return;
    setCart((prev) =>
      prev.map((i) =>
        i.cart_key === item.cart_key
          ? {
              ...i,
              selling_price: i.original_price,
              is_price_overridden: false,
            }
          : i,
      ),
    );
    toast.info("Price reset to original");
  };

  const handlePayment = async (payloadOrPayments) => {
    try {
      const lines = cart.map((i) => ({
        product_id: i.product_id || i.id,
        inventory_id: i.inventory_id || i.inventoryId,
        qty: i.qty,
        selling_price: i.selling_price, // overridden price sent here
        original_price: i.original_price || i.selling_price,
        is_price_overridden: i.is_price_overridden || false,
      }));

      let payments = [];
      let payment_type = null;
      let customer = null;

      if (Array.isArray(payloadOrPayments)) {
        payments = payloadOrPayments;
      } else if (payloadOrPayments && payloadOrPayments.payments) {
        payments = payloadOrPayments.payments;
        payment_type = payloadOrPayments.payment_type || null;
        customer = payloadOrPayments.customer || null;
      }

      const createPayload = { lines };
      if (payment_type) createPayload.payment_type = payment_type;
      if (customer) createPayload.customer = customer;

      console.log("Payload being sent:", createPayload);

      const res = await createSalesBill(createPayload);
      const billId = res.data.data.id;

      if (payments && payments.length > 0) {
        await paySalesBill(billId, payments);
      }

      const printRes = await axios.post(
        `${BASE_URL}/api/sales-bill/print-data`,
        { id: [billId] },
        { headers: getAuthHeader() },
      );

      setPrintData(printRes.data);
      setShowReceipt(true);

      toast.success("Sales bill created successfully!");
      setCart([]);
      setPriceOverrides({});
      triggerRefresh();
      setShowPayment(false);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || "Error processing payment");
      console.error("Payment Error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const user_detail = localStorage.getItem("user_detail");
      const user = user_detail ? JSON.parse(user_detail) : null;

      await axios.post(
        `${BASE_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            Accept: "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    }

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
    });

    localStorage.clear();
    sessionStorage.clear();

    history.push("/cashier_login");
  };

  const printReceipt = () => {
    const printContent = receiptRef.current;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            @page { size: auto; margin: 15mm 10mm 10mm 10mm; }
            body { margin: 0; padding: 0; font-family: "Poppins", sans-serif; }
            .receipt-print { margin-top: 12mm; }
            hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="receipt-print">${printContent.innerHTML}</div>
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
    <>
      <div className="w-1/3 bg-gray-50 border-l shadow-2xl p-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-extrabold text-5xl">Cart</h2>
          {role !== "cashier" ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 text-2xl rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="#"
              className="px-8 py-4 text-2xl rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
              onClick={handleLogout}
            >
              Logout
            </Link>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <p className="text-5xl font-extrabold text-gray-400">
                Empty Cart
              </p>
              <p className="text-2xl text-gray-500 mt-8">
                Add products to begin billing
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const { gstAmount, finalPrice } = getPriceWithGST(item);
              const override = priceOverrides[item.cart_key];
              const isEditing = override?.editing;
              const isOverridden =
                item.is_price_overridden && item.original_price;

              return (
                <div
                  key={`${item.inventory_id}_${item.selling_price}`}
                  className="bg-white p-3 rounded-xl shadow border border-gray-100"
                  style={{
                    border: isOverridden
                      ? "2px solid #f59e0b"
                      : "2px solid transparent",
                  }}
                >
                  {/* Top row: name + override badge */}
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="font-bold"
                      style={{ fontSize: "17px", color: "black" }}
                    >
                      {item.name}
                    </p>
                    {isOverridden && (
                      <span
                        style={{
                          fontSize: "11px",
                          background: "#fef3c7",
                          color: "#b45309",
                          border: "1px solid #fcd34d",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontWeight: 600,
                        }}
                      >
                        ⚠ Price Overridden
                      </span>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full w-12 h-12 text-3xl flex items-center justify-center"
                      >
                        -
                      </button>

                      <input
                        type="text"
                        min="1"
                        value={item.qty}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val === "") {
                            setCart((prev) =>
                              prev.map((i) =>
                                i.inventory_id === item.inventory_id
                                  ? { ...i, qty: "" }
                                  : i,
                              ),
                            );
                            return;
                          }
                          const newQty = Math.max(1, Number(val));
                          setCart((prev) =>
                            prev.map((i) =>
                              i.inventory_id === item.inventory_id
                                ? { ...i, qty: newQty }
                                : i,
                            ),
                          );
                        }}
                        className="w-12 text-center text-3xl font-bold border rounded-xl p-2"
                        style={{ appearance: "textfield" }}
                      />

                      <button
                        onClick={() => increaseQty(item)}
                        className="bg-gray-200 hover:bg-gray-300 rounded-full w-12 h-12 text-3xl text-bold flex items-center justify-center"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeItem(item)}
                        className="bg-red-100 hover:bg-red-200 rounded-full w-12 h-12 text-red-600 flex items-center justify-center text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Unit price — editable */}

                        <span
                          className="text-gray-600"
                          style={{ fontSize: "14px" }}
                        >
                          Unit Price:
                        </span>

                        {/* Original price crossed out if overridden */}
                        {isOverridden && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#9ca3af",
                              fontSize: "14px",
                            }}
                          >
                            ₹{Number(item.original_price).toFixed(2)}
                          </span>
                        )}

                        {/* Editable price input or display */}
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={override.tempValue}
                              autoFocus
                              onChange={(e) =>
                                setPriceOverrides((prev) => ({
                                  ...prev,
                                  [item.cart_key]: {
                                    ...prev[item.cart_key],
                                    tempValue: e.target.value,
                                  },
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  confirmPriceOverride(item);
                                if (e.key === "Escape") cancelPriceEdit(item);
                              }}
                              style={{
                                width: "100px",
                                border: "2px solid #f59e0b",
                                borderRadius: "8px",
                                padding: "4px 8px",
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#92400e",
                                outline: "none",
                              }}
                            />
                            {/* Confirm */}
                            <button
                              onClick={() => confirmPriceOverride(item)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontSize: "14px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              ✓
                            </button>
                            {/* Cancel */}
                            <button
                              onClick={() => cancelPriceEdit(item)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontSize: "14px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color: isOverridden ? "#b45309" : "#111",
                            }}
                          >
                            ₹{Number(item.selling_price).toFixed(2)}
                            <span
                              className="text-xs ml-1"
                              style={{ fontWeight: 400, color: "#6b7280" }}
                            >
                              (
                              {Number(item.gst_inclusive) === 1
                                ? "Incl."
                                : "Excl."}{" "}
                              GST)
                            </span>
                          </span>
                        )}

                        {/* Edit / Reset button — only for admin/manager */}
                        {canOverridePrice && !isEditing && (
                          <>
                            <button
                              onClick={() => startPriceEdit(item)}
                              title="Override price"
                              style={{
                                background: "none",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "2px 8px",
                                fontSize: "13px",
                                cursor: "pointer",
                                color: "#6b7280",
                              }}
                            >
                              ✏️ Edit
                            </button>
                            {isOverridden && (
                              <button
                                onClick={() => resetPrice(item)}
                                title="Reset to original price"
                                style={{
                                  background: "none",
                                  border: "1px solid #fcd34d",
                                  borderRadius: "6px",
                                  padding: "2px 8px",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  color: "#b45309",
                                }}
                              >
                                ↺ Reset
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <p
                        className="text-gray-500 mt-1"
                        style={{ fontSize: "13px" }}
                      >
                        GST ({item.gst_percent}%): ₹
                        {(gstAmount * item.qty).toFixed(2)}
                      </p>
                      <p className="font-bold text-green-700 mt-1">
                        Subtotal: ₹{(finalPrice * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {/* Total + Checkout */}
          <div className="pt-8 border-t mt-8">
            <div className="flex justify-between text-4xl font-extrabold mb-8">
              <span>Total (Incl. GST)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className={`w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-6 rounded-3xl text-4xl font-extrabold shadow-2xl ${
                cart.length === 0 ? "cursor-not-allowed" : ""
              }`}
            >
              Checkout
            </button>

            <button
              onClick={() => history.push("/customer-dues")}
              className={`w-full bg-gradient-to-r bg-blue-600 hover:bg-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-6 rounded-3xl text-4xl font-extrabold shadow-2xl mt-6`}
            >
              Customer Dues
            </button>
          </div>

          {showPayment && (
            <PaymentModal
              total={total}
              onClose={() => setShowPayment(false)}
              onConfirm={handlePayment}
              cart_data={cart}
            />
          )}

          {showReceipt && printData && (
            <ReceiptModal
              ref={receiptRef}
              isOpen={showReceipt}
              onClose={() => setShowReceipt(false)}
              onPrint={printReceipt}
              data={printData}
              cart_detail={printData.items}
              cart_total={printData.total}
            />
          )}
        </div>
      </div>
    </>
  );
}
