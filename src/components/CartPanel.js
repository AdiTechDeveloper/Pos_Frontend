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

  // const getPriceWithGST = (item) => {
  //   const price = parseFloat(item.selling_price);
  //   const gst = parseFloat(item.gst_rate?.rate || 0);

  //   const gstAmount = (price * gst) / 100;
  //   // const finalPrice = price + gstAmount;
  //   const finalPrice = price;

  //   return { gstAmount, finalPrice };
  // };

  const getPriceWithGST = (item) => {
    const sellingPrice = parseFloat(item.selling_price) || 0;
    const gstRate = parseFloat(item.gst_percent) || 0;
    const isInclusive = Number(item.gst_inclusive) === 1;

    if (gstRate > 0 && isInclusive) {
      // INCLUSIVE: Selling price already includes tax
      const taxable = (sellingPrice * 100) / (100 + gstRate);
      const gstAmount = sellingPrice - taxable;
      return { taxable, gstAmount, finalPrice: sellingPrice };
    } else {
      // EXCLUSIVE: Add tax on top of selling price
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
  };

  const handlePayment = async (payments) => {
    try {
      const lines = cart.map((i) => ({
        product_id: i.product_id || i.id,
        inventory_id: i.inventory_id || i.inventoryId,
        qty: i.qty,
      }));

      console.log("Payload being sent:", { lines });

      const res = await createSalesBill(lines);
      const billId = res.data.data.id;

      await paySalesBill(billId, payments);

      const printRes = await axios.post(
        `${BASE_URL}/api/sales-bill/print-data`,
        {
          id: [billId],
        },
        {
          headers: getAuthHeader(),
        },
      );

      setPrintData(printRes.data);
      setShowReceipt(true);

      toast.success("Salesbill created successfully!");
      setCart([]);
      triggerRefresh();
      setShowPayment(false);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || "Error processing payment");
      console.error("Payment Error:", err);
    }
  };

  const handleLogout = () => {
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
    <>
      <div className="w-1/3 bg-gray-50 border-l shadow-2xl p-10 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-extrabold text-5xl">Cart</h2>
          {role != "cashier" && (
            <Link
              to="/dashboard"
              className="px-8 py-4 text-2xl rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
            >
              Dashboard
            </Link>
          )}
          {role == "cashier" && (
            <Link
              to="#"
              className="px-8 py-4 text-2xl rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
              onClick={handleLogout}
            >
              Logout
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
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
            cart.map((item) => (
              <div
                key={`${item.inventory_id}_${item.selling_price}`}
                className="bg-white p-6 rounded-3xl shadow-2xl flex justify-between items-center"
              >
                <div>
                  <p
                    className="font-bold text-xl mb-5"
                    style={{ fontSize: "17px", color: "black" }}
                  >
                    <strong>{item.name}</strong>
                  </p>

                  {(() => {
                    const { gstAmount, finalPrice } = getPriceWithGST(item);
                    return (
                      <>
                        <p className="text-gray-600">
                          Unit Price: ₹{Number(item.selling_price).toFixed(2)}
                          <span className="text-xs ml-1">
                            (
                            {Number(item.gst_inclusive) === 1
                              ? "Incl."
                              : "Excl."}{" "}
                            GST)
                          </span>
                        </p>
                        <p className="text-gray-500">
                          GST ({item.gst_percent}%): ₹
                          {(gstAmount * item.qty).toFixed(2)}
                        </p>
                        <p className="font-bold text-green-700">
                          Subtotal: ₹{(finalPrice * item.qty).toFixed(2)}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-6">
                  {/* Decrease */}
                  <button
                    onClick={() => decreaseQty(item)}
                    className="bg-gray-200 hover:bg-gray-300 rounded-full w-16 h-16 text-3xl flex items-center justify-center"
                  >
                    -
                  </button>

                  {/* Qty Input (NEW) */}
                  <input
                    type="text"
                    min="1"
                    value={item.qty}
                    onFocus={(e) => {
                      // Select all text so typing replaces it
                      e.target.select();
                    }}
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
                    className="w-20 text-center text-3xl font-bold border rounded-xl p-2"
                    style={{ appearance: "textfield" }}
                  />

                  {/* Increase */}
                  <button
                    onClick={() => increaseQty(item)}
                    className="bg-gray-200 hover:bg-gray-300 rounded-full w-16 h-16 text-3xl flex items-center justify-center"
                  >
                    +
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item)}
                    className="bg-red-100 hover:bg-red-200 rounded-full w-16 h-16 text-red-600 flex items-center justify-center text-3xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* <div className="cart-details">
          <button className="cart-btn">Cash</button>
          <button className="cart-btn">Online</button>
        </div> */}

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
        </div>
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
    </>
  );
}
