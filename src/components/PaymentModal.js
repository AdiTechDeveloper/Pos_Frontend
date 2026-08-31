import { useState } from "react";
import {
  ChevronLeft,
  X,
  Lock,
  ChevronDown,
  QrCode,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  Clock,
  Wallet,
} from "lucide-react";

// NOTE: handleMethod, keypad, parse, handleConfirm yahan sirf demo/preview
// ke liye stub kiye gaye hain (taaki design standalone chal sake).
// Apni file mein inko apne existing implementations se replace kar dena —
// sirf JSX/markup + className styling copy karni hai, logic already apke paas hai.

export default function PaymentModal({
  total = 100,
  walletBalance = 0,
  customerDue = 0,
  loadingCustomer = false,
  onClose = () => {},
}) {
  const [paymentType, setPaymentType] = useState("cash");
  const [cashGiven, setCashGiven] = useState(50);
  const [customerMobile, setCustomerMobile] = useState("9876543210");
  const [mobileError, setMobileError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [customerAdd1, setCustomerAdd1] = useState("");
  const [customerAdd2, setCustomerAdd2] = useState("");
  const [customerArea, setCustomerArea] = useState("");
  const [customerCity, setCustomerCity] = useState("");

  const parse = (val) => (val === null || val === "" ? 0 : Number(val));

  const cashApplied =
    paymentType === "split" ? Math.min(parse(cashGiven), total) : parse(cashGiven);

  const remaining =
    paymentType === "cash" || paymentType === "online"
      ? Math.max(total - parse(cashGiven), 0)
      : 0;

  const balanceReturn =
    paymentType === "cash" ? Math.max(parse(cashGiven) - total, 0) : 0;

  const amountStyle = {
    fontSize: "1.35rem",
    fontWeight: 700,
    marginBottom: "6px",
  };

  const handleMethod = (type) => {
    setPaymentType(type);
    setCashGiven(null);
  };

  const keypad = (k) => {
    if (k === "C") {
      setCashGiven(null);
      return;
    }
    if (k === "⌫") {
      setCashGiven((prev) => {
        const str = (prev ?? "").toString().slice(0, -1);
        return str === "" ? null : Number(str);
      });
      return;
    }
    setCashGiven((prev) => {
      const str = (prev ?? "").toString() + k;
      return Number(str);
    });
  };

  const handleConfirm = () => {
    // apka existing submit/confirm-payment logic yahin call hoga
    onClose();
  };

  const quickAmounts = [50, 100, 200, 500];

  const paidAmount =
    paymentType === "online" || paymentType === "split" || paymentType === "cash"
      ? total
      : cashApplied;

  const percentPaid =
    total > 0 ? Math.min(Math.round((parse(cashGiven) / total) * 100), 100) : 0;

  const isConfirmDisabled =
    ((remaining > 0 || paymentType === "credit") && customerMobile.length !== 10) ||
    !!mobileError ||
    ((paymentType === "cash" || paymentType === "online") &&
      (!cashGiven || parse(cashGiven) <= 0)) ||
    (paymentType === "split" && cashApplied <= 0) ||
    (paymentType === "wallet" &&
      walletBalance < total &&
      (!cashGiven || parse(cashGiven) < total - walletBalance));

  const paymentMethods = [
    { key: "cash", label: "Cash", sub: "Collect at counter", icon: Banknote },
    { key: "online", label: "Online", sub: "UPI, card or wallet", icon: Smartphone },
    { key: "split", label: "Split payment", sub: "Use two methods", icon: SplitSquareHorizontal },
    { key: "credit", label: "Pay later", sub: "Create customer credit", icon: Clock },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl  w-7xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">Complete payment</h2>
                <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  ORDER #1048
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">
                Review the amount and choose a payment method
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT SIDE – METHOD LIST */}
          <div className="p-7 md:border-r border-slate-200 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold tracking-wide text-slate-500">
                    PAYMENT METHOD
                  </div>
                  <div className="text-base text-slate-700 font-medium mt-1">
                    How would the customer like to pay?
                  </div>
                </div>
                <Lock size={18} className="text-slate-400 mt-5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(({ key, label, sub, icon: Icon }) => {
                  const selected = paymentType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleMethod(key)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="white"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                          selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="font-bold text-slate-900 text-base">{label}</div>
                      <div className="text-sm text-slate-500 font-medium mt-0.5">{sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Wallet Button — sirf tab dikhega jab balance ho */}
              {walletBalance > 0 && (
                <button
                  type="button"
                  onClick={() => handleMethod("wallet")}
                  className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentType === "wallet"
                      ? "border-purple-600 bg-purple-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      paymentType === "wallet" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Wallet size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base">Wallet</div>
                    <div className="text-sm text-slate-500 font-medium mt-0.5">
                      Available: ₹{Number(walletBalance).toFixed(2)}
                    </div>
                  </div>
                </button>
              )}
            </div>

            <hr className="border-slate-200" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold tracking-wide text-slate-500">
                    CUSTOMER DETAILS
                  </div>
                  <div className="text-base text-slate-700 font-medium mt-1">Optional for this transaction</div>
                </div>
                <button type="button" className="text-sm font-bold text-blue-700 flex items-center gap-1">
                  Saved customers <ChevronDown size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-500">MOBILE NUMBER</label>
                  <input
                    type="text"
                    className={`mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 rounded-xl ${
                      mobileError ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="+91 98765 43210"
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
                  {mobileError && <div className="text-red-600 text-sm font-semibold mt-1">{mobileError}</div>}
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-500">CUSTOMER NAME</label>
                  <input
                    type="text"
                    className={`mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 rounded-xl ${
                      nameError ? "border-red-500" : "border-slate-200"
                    }`}
                    placeholder="Enter full name"
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
                  {nameError && <div className="text-red-600 text-sm font-semibold mt-1">{nameError}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-500">ADDRESS LINE 1</label>
                  <input
                    type="text"
                    className="mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 border-slate-200 rounded-xl"
                    placeholder="House / street"
                    value={customerAdd1}
                    onChange={(e) => setCustomerAdd1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-500">ADDRESS LINE 2</label>
                  <input
                    type="text"
                    className="mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 border-slate-200 rounded-xl"
                    placeholder="Landmark (optional)"
                    value={customerAdd2}
                    onChange={(e) => setCustomerAdd2(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-500">AREA</label>
                  <input
                    type="text"
                    className="mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 border-slate-200 rounded-xl"
                    placeholder="Area"
                    value={customerArea}
                    onChange={(e) => setCustomerArea(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-500">CITY</label>
                  <input
                    type="text"
                    className="mt-1 w-full p-3 text-base font-semibold text-slate-900 border-2 border-slate-200 rounded-xl"
                    placeholder="City"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                  />
                </div>
              </div>

              {loadingCustomer && <div className="text-blue-600 text-sm font-semibold">Checking customer...</div>}

              {customerDue > 0 && (
                <div className="bg-red-100 text-red-700 p-3 rounded-xl font-extrabold text-base">
                  Pending Due: ₹{customerDue}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE – AMOUNT + KEYPAD */}
          <div className="p-7 bg-slate-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-wide text-slate-500">
                  AMOUNT TO COLLECT
                </div>
                <div className="text-5xl font-extrabold text-slate-900 mt-1">
                  ₹{total.toFixed(2)}
                </div>
              </div>
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeDasharray={`${percentPaid * 0.974} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-blue-700">
                  {percentPaid}%
                </span>
              </div>
            </div>

            {(paymentType === "cash" ||
              paymentType === "split" ||
              paymentType === "online" ||
              (paymentType === "wallet" && walletBalance < total)) && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500 font-bold">
                  <span>
                    {paymentType === "wallet"
                      ? "Cash received"
                      : paymentType === "online"
                      ? "Online amount received"
                      : "Cash received"}
                  </span>
                  <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                    Balance remaining
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    className="text-5xl font-extrabold text-blue-700 outline-none w-full bg-transparent"
                    placeholder="0.00"
                    value={cashGiven ?? ""}
                    onChange={(e) =>
                      setCashGiven(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                  <span className="text-sm text-slate-400 font-bold">INR</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentPaid}%` }} />
                </div>
              </div>
            )}

            <div style={amountStyle} className="text-slate-900">
              Paid: ₹{paidAmount.toFixed(2)}
            </div>

            {paymentType === "split" && (
              <>
                <div style={amountStyle} className="text-slate-900">
                  Cash: ₹{cashApplied.toFixed(2)}
                </div>
                <div style={amountStyle} className="text-slate-900">
                  Online: ₹{(total - cashApplied).toFixed(2)}
                </div>
              </>
            )}

            {paymentType === "wallet" && (
              <>
                <div style={amountStyle} className="text-slate-900">
                  From Wallet: ₹{Math.min(walletBalance, total).toFixed(2)}
                </div>
                {total > walletBalance && (
                  <div style={{ ...amountStyle, color: "#dc2626" }}>
                    Remaining (Cash needed): ₹{(total - walletBalance).toFixed(2)}
                  </div>
                )}
              </>
            )}

            {paymentType === "cash" && balanceReturn > 0 && (
              <div style={amountStyle} className="text-slate-900">
                Change: ₹{balanceReturn.toFixed(2)}
              </div>
            )}

            {(paymentType === "cash" || paymentType === "online") && remaining > 0 && (
              <div style={{ ...amountStyle, color: "#dc2626" }}>
                Due (Pay Later): ₹{remaining.toFixed(2)}
              </div>
            )}

            {(["cash", "split", "online"].includes(paymentType) ||
              (paymentType === "wallet" && walletBalance < total)) && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashGiven(amt)}
                      className={`p-3 rounded-xl text-base font-extrabold border-2 ${
                        cashGiven === amt
                          ? "border-blue-600 text-blue-700 bg-blue-50"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => keypad(k)}
                      className="py-4 rounded-xl text-3xl font-extrabold text-slate-900 border-2 border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => keypad("C")}
                  className="p-3 rounded-xl text-base font-extrabold text-slate-700 bg-slate-200 hover:bg-slate-300"
                >
                  CLEAR AMOUNT
                </button>
              </>
            )}

            {(paymentType === "cash" || paymentType === "online") && (
              <div className="flex items-center justify-between bg-blue-100 text-blue-800 rounded-xl px-4 py-3 text-lg font-extrabold">
                <span>Still due</span>
                <span>₹{remaining.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY + ACTION BUTTONS */}
        <div className="flex justify-between items-center px-7 py-5 border-t border-slate-200">
          <button type="button" className="text-base font-semibold text-slate-500 hover:text-slate-700">
            {/* — Hold order */}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-3.5 rounded-xl text-base font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              className={`px-7 py-3.5 rounded-xl text-base font-bold text-white flex items-center gap-2 transition-colors ${
                isConfirmDisabled
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              <QrCode size={18} />
              Confirm payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}