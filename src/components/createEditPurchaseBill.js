import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { useRef } from "react";
import * as Yup from "yup";
import Layout from "./layout";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";


const ledgerStyles = `
  :root {
    --pb-navy: #6B5B45;
    --pb-navy-soft: #8A7860;
    --pb-ivory: #FBF9F5;
    --pb-paper: #FFFFFF;
    --pb-gold: #C89B4A;
    --pb-gold-soft: #F3E6C8;
    --pb-text: #3D3527;
    --pb-muted: #8A8170;
    --pb-border: #ECE6D8;
    --pb-border-strong: #E2D9C4;
    --pb-green: #3E9C76;
    --pb-green-bg: #EEFAF3;
    --pb-red: #D1655A;
    --pb-red-bg: #FDEEEC;
  }

  .pb-page {
    background: var(--pb-ivory);
    padding: 28px 28px 80px;
    border-radius: 16px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--pb-text);
  }

  .pb-header-strip {
    // background: linear-gradient(135deg, #FFFDF8 0%, var(--pb-gold-soft) 100%);
    border: 1px solid var(--pb-border-strong);
    border-radius: 14px;
    padding: 22px 28px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 14px rgba(200, 155, 74, 0.08);
  }
  .pb-header-strip h3 {
    color: var(--pb-text);
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
  .pb-header-eyebrow {
    color: var(--pb-gold);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin: 0 0 4px;
  }

  .pb-card {
    background: var(--pb-paper);
    border: 1px solid var(--pb-border);
    border-radius: 14px;
    padding: 22px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(15, 27, 46, 0.04);
  }

  .pb-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--pb-gold);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pb-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--pb-border-strong);
  }

  .pb-field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--pb-muted);
    margin-bottom: 6px;
    letter-spacing: 0.2px;
  }

  /* Unified premium input styling */
  .pb-page input[type="text"],
  .pb-page input[type="number"],
  .pb-page input[type="date"],
  .pb-page select,
  .pb-page textarea {
    width: 100%;
    height: 42px;
    border: 1.5px solid var(--pb-border-strong);
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--pb-text);
    background: var(--pb-paper);
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
  }
  .pb-page textarea { height: auto; padding: 10px 12px; }
  .pb-page input:focus,
  .pb-page select:focus,
  .pb-page textarea:focus {
    outline: none;
    border-color: var(--pb-gold);
    box-shadow: 0 0 0 3px rgba(184, 137, 63, 0.15);
  }
  .pb-page input::placeholder { color: #A8A29B; }
  .pb-page input:disabled { background: #F3F1EC; color: var(--pb-muted); }

  .error-text {
    color: var(--pb-red);
    font-size: 12px;
    font-weight: 500;
    margin-top: 5px;
  }

  /* ── Lost bill toggle ── */
  .lost-bill-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border: 1.5px solid var(--pb-border-strong);
    border-radius: 9px;
    width: fit-content;
    background: var(--pb-ivory);
    flex-shrink: 0;
  }
  .lost-bill-wrapper .toggle-label-text {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--pb-muted);
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .lost-bill-wrapper.active {
    background: var(--pb-red-bg);
    border-color: #E8B6B1;
  }
  .lost-bill-wrapper.active .toggle-label-text {
    color: var(--pb-red);
  }

  .toggle-switch { position: relative; width: 38px; height: 21px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-track {
    position: absolute; inset: 0;
    background: green;
    border-radius: 11px;
    cursor: pointer;
    transition: background 0.25s;
  }
  .toggle-track::before {
    content: '';
    position: absolute;
    width: 15px; height: 15px;
    left: 3px; top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.25s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
  .toggle-switch input:checked + .toggle-track { background: var(--pb-red); }
  .toggle-switch input:checked + .toggle-track::before { transform: translateX(17px); }

  .lost-bill-input { color: var(--pb-red) !important; font-weight: 600 !important; }
  .lost-bill-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--pb-red);
    margin-top: 8px;
    padding: 7px 12px;
    background: var(--pb-red-bg);
    border-radius: 7px;
    border-left: 3px solid var(--pb-red);
  }

  /* ── Barcode scanner input ── */
  .pb-barcode-input {
    border: 1.5px dashed var(--pb-gold) !important;
    background: #FFFBF2 !important;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    margin-bottom: 16px !important;
  }

 #small-popup{
    font-size:17px !important;
    width :103% !important;
    background : #fff !important;
    padding:9px 12px !important;
    border  : 1px solid black;
  }

  .input-name{
  margin-bottom : 3px;
  font-size : 15px;
  font-weight :600;
  margin-top : 10px;
  }

  /* ── Line item ledger rows ── */
  .pb-lines-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
  }
  .pb-line-row {
    display: grid;
    grid-template-columns: 220px 70px 70px 110px 110px 110px 90px 100px 90px 140px 160px 36px;
    gap: 10px;
    align-items: end;
    padding: 14px 16px 14px 18px;
    border: 1px solid var(--pb-border);
    border-left: 3px solid var(--pb-gold);
    border-radius: 9px;
    margin-bottom: 10px;
    background: var(--pb-paper);
    position: relative;
    transition: box-shadow 0.15s;
    min-width: 1320px;
  }
  .pb-line-row:hover { box-shadow: 0 2px 8px rgba(15, 27, 46, 0.06); }
  .pb-line-row.is-opening {
    border-left-color: var(--pb-green);
    background: var(--pb-green-bg);
  }

  .field-col { display: flex; flex-direction: column; }
  .field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--pb-muted);
    margin-bottom: 4px;
  }
  .field-error { color: var(--pb-red); font-size: 10.5px; margin-top: 2px; }

  .pb-remove-btn {
    background: none;
    border: none;
    color: var(--pb-red);
    font-size: 16px;
    cursor: pointer;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .pb-remove-btn:hover { background: var(--pb-red-bg); }

  .pb-add-product-btn {
    margin-top: 8px;
    background: var(--pb-paper);
    border: 1.5px dashed var(--pb-border-strong);
    color: var(--pb-navy);
    font-weight: 600;
    font-size: 13px;
    padding: 12px;
    border-radius: 9px;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .pb-add-product-btn:hover {
    border-color: var(--pb-gold);
    color: var(--pb-gold);
    background: #FFFBF2;
  }

  /* ── Tax type pill toggle ── */
  .pb-tax-toggle {
    display: flex;
    padding: 4px;
    border-radius: 9px;
    border: 1.5px solid var(--pb-border-strong);
    background: var(--pb-ivory);
    gap: 4px;
  }
  .pb-tax-btn {
    flex: 1;
    border: none;
    border-radius: 7px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.18s ease;
    background: transparent;
    color: var(--pb-muted);
  }
  .pb-tax-btn.active-exclusive { background: var(--pb-gold); color: #fff; box-shadow: 0 2px 6px rgba(200,155,74,0.3); }
  .pb-tax-btn.active-inclusive { background: var(--pb-green); color: #fff; box-shadow: 0 2px 6px rgba(62,156,118,0.3); }

  /* ── Total summary bar ── */
  .pb-total-bar {
    padding: 18px 26px;
    border-radius: 12px;
    background: linear-gradient(135deg, #FFFDF8 0%, var(--pb-gold-soft) 100%);
    border: 1px solid var(--pb-border-strong);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 14px rgba(200, 155, 74, 0.1);
  }
  .pb-total-label {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pb-total-icon {
    width: 34px; height: 34px;
    background: var(--pb-gold);
    color: #fff;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .pb-total-label span {
    font-weight: 700;
    color: var(--pb-navy);
    font-size: 13px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .pb-total-amount {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .pb-total-amount small {
    font-size: 16px;
    font-weight: 700;
    color: var(--pb-gold);
  }
  .pb-total-amount span {
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--pb-text);
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
  }

  .pb-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 4px;
  }
  .pb-bottom-row .pb-total-bar { flex: 1; max-width: 480px; margin-left: auto; }
  .pb-bottom-row .pb-submit-btn { margin-top: 0; width: auto; padding: 15px 32px; flex-shrink: 0; }
    margin-top: 22px;
    width: 100%;
    background: var(--pb-gold);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 15px;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(200, 155, 74, 0.28);
  }
  .pb-submit-btn:hover { filter: brightness(1.06); }
  .pb-submit-btn:active { transform: translateY(1px); }

  /* ── Modals ── */
  .pb-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 27, 46, 0.55);
    backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  }
  .pb-modal-card {
    background: var(--pb-paper);
    border-radius: 14px;
    width: 420px;
    box-shadow: 0 25px 60px rgba(15,27,46,0.3);
    overflow: hidden;
  }
  .pb-modal-header {
    background: var(--pb-gold);
    padding: 16px 22px;
  }
  .pb-modal-header h5 { color: #fff; margin: 0; font-size: 16px; font-weight: 700; }
  .pb-modal-body { padding: 20px 22px; }
  .pb-modal-footer {
    padding: 14px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--pb-border);
  }
  .pb-btn-cancel {
    background: var(--pb-paper);
    border: 1.5px solid var(--pb-border-strong);
    color: var(--pb-text);
    border-radius: 8px;
    padding: 9px 18px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
  }
    .pb-btn-save {
    background: var(--pb-paper);
    border: 1.5px solid var(--pb-border-strong);
    color: var(--pb-text);
    border-radius: 8px;
    padding: 9px 18px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
  }
  .pb-submit-btn {
    background: var(--pb-gold);
    border: none;
    color: #ffffff;
    border-radius: 8px;
    padding: 9px 18px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
  }
  .pb-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CreateEditPurchaseBill = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const history = useHistory();
  const [branches, setBranches] = useState([]);
  const [suppliers, setSupplierBill] = useState([]);
  const [products, setProducts] = useState([]);
  const [gstRates, setGstRates] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [barcode, setBarcode] = useState("");

  // Lost bill toggle
  const [isBillLost, setIsBillLost] = useState(false);

  const formikRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [newSupplier, setNewSupplier] = useState("");
  const [supplierState, setSupplierState] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [error, setError] = useState("");

  const user_data = JSON.parse(localStorage.getItem("user_detail"));
  const store_purchase_bill = localStorage.getItem("purchase_bills_create");
  const incomingBill = store_purchase_bill
    ? JSON.parse(store_purchase_bill)
    : null;

  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState({
    branch_id: "",
    supplier_id: "",
    bill_no: "",
    bill_date: "",
    tax_type: "exclusive",
    settlement_amount: "",
    notes: "",
    is_lost: 0,
    lines: [
      {
        product_id: "",
        qty: "",
        free_qty: "",
        purchase_rate: "",
        mrp: "",
        selling_price: "",
        discount_type: "",
        discount: "",
        hsn_code: "",
        gst_rate_id: "",
        batch_no: "",
        expiry_date: "",
        is_opening: false,
      },
    ],
  });

  const setBillInitialValues = (bill) => {
    setSupplierId(bill.supplier_id?.toString() || "");
    if (bill.is_lost === 1) setIsBillLost(true);

    setInitialValues({
      branch_id: bill.branch_id?.toString() || "",
      supplier_id: bill.supplier_id?.toString() || "",
      bill_no: bill.bill_no || "",
      bill_date: bill.bill_date || "",
      tax_type: bill.tax_type || "exclusive",
      settlement_amount:
        bill.settlement_amount != null ? bill.settlement_amount : "",
      notes: bill.notes || "",
      is_lost: bill.is_lost ?? 0,
      lines: bill.lines?.length
        ? bill.lines.map((line) => ({
            product_id: line.product_id?.toString() || "",
            qty: line.qty || "",
            free_qty: line.free_qty || "",
            purchase_rate: line.purchase_rate || "",
            mrp: line.mrp ?? line.inventory?.mrp ?? "",
            selling_price:
              line.selling_price ?? line.inventory?.selling_price ?? "",
            discount_type: line.discount_type || "",
            discount: line.discount || "",
            hsn_code: line.hsn_code || "",
            gst_rate_id: line.gst_rate_id?.toString() || "",
            batch_no: line.batch_no || "",
            expiry_date: line.expiry_date || "",
            is_opening: line.is_opening || false,
          }))
        : initialValues.lines,
    });
  };

  const fetchPurchaseBillById = async () => {
    if (!id) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/purchase-bill/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      const billData =
        response.data.purchase_bill ||
        response.data.bill ||
        response.data.data ||
        response.data;
      if (billData) {
        setBillInitialValues(billData);
      }
    } catch (error) {
      console.error("Error fetching purchase bill:", error);
    }
  };

  useEffect(() => {
    if (incomingBill) {
      setBillInitialValues(incomingBill);
    } else if (isEdit) {
      fetchPurchaseBillById();
    }
  }, [incomingBill, isEdit, id]);

  const fetchBranch = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/manager/branches`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setBranches(response.data.branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  useEffect(() => {
    fetchBranch();
  }, []);

  const fetchSupplierBill = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/suppliers`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setSupplierBill(response.data.suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };
  useEffect(() => {
    fetchSupplierBill();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user_data.token}`,
        },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchGstRates = async () => {
    const response = await axios.get(`${BASE_URL}/api/gst-rates`, {
      headers: { Authorization: `Bearer ${user_data.token}` },
    });
    setGstRates(response.data.gstRates);
  };

  const getGstRate = (gstRateId) => {
    const matched = gstRates.find(
      (rate) => rate.id?.toString() === gstRateId?.toString(),
    );
    return matched ? Number(matched.rate || 0) : 0;
  };

  const calculateLineTotal = (line, taxType) => {
    const qty = Number(line.qty) || 0;
    const purchaseRate = Number(line.purchase_rate) || 0;
    const discount = Number(line.discount || 0);
    const discountType = line.discount_type;
    const gstRate = getGstRate(line.gst_rate_id);

    if (!qty || !purchaseRate) {
      return 0;
    }

    const grossValue =
      taxType === "inclusive"
        ? qty * (purchaseRate / (1 + gstRate / 100))
        : qty * purchaseRate;

    const discountAmount =
      discountType === "percent" ? grossValue * (discount / 100) : discount;

    const taxable = Math.max(0, grossValue - discountAmount);
    const totalTax = (taxable * gstRate) / 100;

    return taxable + totalTax;
  };

  const formatAmount = (amount) =>
    Number(amount || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const calculateTotalAmount = (lines, taxType) =>
    (lines || []).reduce(
      (sum, line) => sum + calculateLineTotal(line, taxType),
      0,
    );

  useEffect(() => {
    fetchProduct();
    fetchGstRates();
  }, []);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Validation Schema ──
  const validationSchema = Yup.object().shape({
    branch_id: Yup.string().required("Branch is required"),
    supplier_id: Yup.string().required("Supplier is required"),
    bill_no: Yup.string().required("Bill No is required"),
    bill_date: Yup.date().required("Bill date is required"),
    tax_type: Yup.string().oneOf(["inclusive", "exclusive"]).required(),
    settlement_amount: Yup.number().nullable().min(0, "Cannot be negative"),
    notes: Yup.string().nullable(),
    lines: Yup.array()
      .min(1, "At least one product is required")
      .of(
        Yup.object().shape({
          product_id: Yup.string().required("Product is required"),
          qty: Yup.number()
            .typeError("Quantity must be a number")
            .required("Qty required")
            .min(0.0001, "Qty must be greater than 0"),
          free_qty: Yup.number()
            .nullable()
            .typeError("Free Qty must be a number")
            .min(0, "Free Qty cannot be negative"),
          purchase_rate: Yup.number()
            .typeError("Purchase rate must be a number")
            .required("Purchase rate required")
            .min(0, "Rate cannot be negative"),
          mrp: Yup.number()
            .typeError("MRP must be a number")
            .required("MRP required")
            .min(0, "MRP cannot be negative"),
          selling_price: Yup.number()
            .typeError("Selling price must be a number")
            .required("Selling price required")
            .min(0, "Selling price cannot be negative"),
          discount_type: Yup.string()
            .nullable()
            .oneOf(
              ["percent", "fixed", ""],
              "Discount type must be percent or fixed",
            ),
          discount: Yup.number()
            .nullable()
            .typeError("Discount must be a number")
            .min(0, "Discount cannot be negative"),
          gst_rate_id: Yup.string().required("GST rate required"),
          expiry_date: Yup.date()
            .nullable()
            .transform((value, originalValue) =>
              originalValue === "" ? null : value,
            ),
          is_opening: Yup.boolean().default(false),
        }),
      ),
  });

  const handleSubmit = async (values, actions) => {
    try {
      const payload = {
        branch_id: Number(values.branch_id),
        supplier_id: Number(values.supplier_id),
        bill_no: values.bill_no,
        bill_date: values.bill_date,
        tax_type: values.tax_type,
        settlement_amount:
          values.settlement_amount !== "" && values.settlement_amount != null
            ? Number(values.settlement_amount)
            : null,
        notes: values.notes?.trim() || null,
        is_lost: isBillLost ? 1 : 0,
        lines: values.lines.map((line) => ({
          product_id: Number(line.product_id),
          qty: Number(line.qty),
          free_qty: Number(line.free_qty || 0),
          purchase_rate: Number(line.purchase_rate),
          mrp: Number(line.mrp),
          selling_price: Number(line.selling_price),
          discount_type: line.discount_type || null,
          discount: line.discount ? Number(line.discount) : 0,
          gst_rate_id: Number(line.gst_rate_id),
          batch_no: line.batch_no || null,
          expiry_date: line.expiry_date || null,
          hsn_code: line.hsn_code || null,
          is_opening: line.is_opening ? 1 : 0,
        })),
      };

      let response;
      if (isEdit) {
        response = await axios.put(
          `${BASE_URL}/api/purchase-bill/${id}`,
          payload,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${user_data.token}`,
            },
          },
        );
        toast.success("Purchase bill updated successfully!");
      } else {
        response = await axios.post(`${BASE_URL}/api/purchase-bill`, payload, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user_data.token}`,
          },
        });
        actions.resetForm();
        toast.success("Purchase bill saved successfully!");
      }
      history.push("/purchase-bill");
    } catch (error) {
      console.log(error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to save purchase bill. Please check the form.",
      );
    } finally {
      actions.setSubmitting(false);
    }
  };

  const saveSupplier = async (e) => {
    e.preventDefault();
    if (newSupplier.trim().length < 3) {
      setError("Supplier name must be at least 3 characters.");
      return;
    }
    setError("");
    const supplier = { id: Date.now(), name: newSupplier.trim() , state: supplierState };
    await axios({
      method: "post",
      url: `${BASE_URL}/api/suppliers`,
      data: supplier,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${user_data.token}`,
      },
    });
    toast.success("Suppliers Created!");
    setSupplierId(supplier.id);
    setNewSupplier("");
    setSupplierState(""); // Reset state after saving
    setShowModal(false);
    fetchSupplierBill();
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (newProduct.trim().length < 3) {
      setError("Product name must be at least 3 characters.");
      return;
    }
    setError("");
    try {
      const response = await axios.post(
        `${BASE_URL}/api/products`,
        { name: newProduct.trim() },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user_data.token}`,
          },
        },
      );
      const createdProduct = response.data.product || response.data;
      toast.success("Product Created!");
      setProducts((prev) => [...prev, createdProduct]);
      if (activeRowIndex !== null && formikRef.current) {
        formikRef.current.setFieldValue(
          `lines.${activeRowIndex}.product_id`,
          createdProduct.id,
        );
      }
      setNewProduct("");
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBarcodeScan = async (barcode, values, push, setFieldValue) => {
    if (!barcode) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/sales/scan`,
        { barcode },
        { headers: { Authorization: `Bearer ${user_data.token}` } },
      );
      if (!response.data.status) {
        toast.error(response.data.message || "Product not found");
        return;
      }
      const product = response.data.product;
      const inventory =
        response.data.batches?.find((b) => b.batch_barcode === barcode) || {};
      const existingIndex = values.lines.findIndex(
        (l) => l.product_id == product.id && l.batch_no === inventory.batch_no,
      );
      if (existingIndex !== -1) {
        setFieldValue(
          `lines.${existingIndex}.qty`,
          Number(values.lines[existingIndex].qty || 0) + 1,
        );
        setBarcode("");
        return;
      }
      const emptyIndex = values.lines.findIndex((l) => !l.product_id);
      const lineData = {
        product_id: product.id.toString(),
        qty: 1,
        free_qty: 0,
        purchase_rate: inventory.purchase_rate ?? inventory.cost_price ?? 0,
        mrp: inventory.mrp,
        selling_price: inventory.selling_price,
        hsn_code: product.hsn_code,
        gst_rate_id: product.gst_rate.id,
        batch_no: inventory.batch_no || "",
        expiry_date: inventory.expiry_date || "",
      };
      if (emptyIndex !== -1) {
        Object.entries(lineData).forEach(([key, value]) => {
          setFieldValue(`lines.${emptyIndex}.${key}`, value);
        });
      } else {
        push(lineData);
      }
      setBarcode("");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error("Product not found");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      setBarcode("");
    }
  };

  // Auto-generate lost bill reference number — always unique (uses HHMMSS)
  const generateLostRef = () => {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, ""); // 20260604
    const time = now.toTimeString().slice(0, 8).replace(/:/g, ""); // 143052
    return `LOST-${ymd}-${time}`; // e.g. LOST-20260604-143052
  };

  return (
    <Layout>
      {/* Inject ledger design system CSS */}
      <style>{ledgerStyles}</style>

      <div className="main-content-inner">
        <div className="main-content-wrap">
          <div className="pb-page">
            {/* Header strip */}
            <div className="pb-header-strip">
              <div>
                <p className="pb-header-eyebrow">Purchases &amp; Stock Inward</p>
                <h3>{isEdit ? "Edit Purchase Bill" : "Create Purchase Bill"}</h3>
              </div>
            </div>

            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={validationSchema}
              onSubmit={(values, actions) => handleSubmit(values, actions)}
            >
              {({ values, setFieldValue }) => (
                <Form
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.id !== "barcode-input") {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* ── Branch, Supplier & Bill Date ── */}
                  <div className="pb-card">
                    <p className="pb-section-label">Bill Details</p>
                    <div className="row mb-0">
                      <div className="mb-20 col-md-4">
                        <label className="pb-field-label">Branch</label>
                        <Field as="select" name="branch_id">
                          <option value="">Select Branch</option>
                          {branches?.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="branch_id"
                          className="error-text"
                          component="div"
                        />
                      </div>

                      <div className="mb-20 col-md-4">
                        <label className="pb-field-label">Supplier</label>
                        <Field name="supplier_id" as="select">
                          {({ field }) => (
                            <select
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const value = e.target.value;
                                if (value === "add_new") setShowModal(true);
                                setSupplierId(value);
                              }}
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                              {!newSupplier && (
                                <option value="add_new">
                                  + Add New Supplier
                                </option>

                              )}
                            </select>
                          )}
                        </Field>
                        <ErrorMessage
                          name="supplier_id"
                          className="error-text"
                          component="div"
                        />
                      </div>

                      <div className="mb-20 col-md-4">
                        <label className="pb-field-label">Bill Date</label>
                        <Field type="date" name="bill_date" />
                        <ErrorMessage
                          name="bill_date"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </div>

                    {/* ── Bill No with lost toggle ── */}
                    <div className="row mb-0">
                      <div className="mb-0 col-md-6">
                        <label className="pb-field-label">Bill No</label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            className={`lost-bill-wrapper${isBillLost ? " active" : ""}`}
                          >
                            <label
                              className="toggle-switch"
                              htmlFor="lost-toggle"
                            >
                              <input
                                type="checkbox"
                                id="lost-toggle"
                                checked={isBillLost}
                                onChange={(e) => {
                                  const lost = e.target.checked;
                                  setIsBillLost(lost);
                                  setFieldValue(
                                    "bill_no",
                                    lost ? generateLostRef() : "",
                                  );
                                }}
                              />
                              <span className="toggle-track"></span>
                            </label>
                            <label
                              htmlFor="lost-toggle"
                              className="toggle-label-text"
                            >
                              {isBillLost ? "⚠ Lost" : "Bill available"}
                            </label>
                          </div>

                          <div style={{ flex: 1 }}>
                            <Field
                              type="text"
                              name="bill_no"
                              className={isBillLost ? "lost-bill-input" : ""}
                              placeholder={
                                isBillLost
                                  ? "Auto-generated reference"
                                  : "Enter bill no"
                              }
                              disabled={isBillLost}
                            />
                            <ErrorMessage
                              name="bill_no"
                              className="error-text"
                              component="div"
                            />
                          </div>
                        </div>

                        {isBillLost && (
                          <div className="lost-bill-hint">
                            <span>
                              You can update the real bill no. later from the
                              bills list once supplier sends a copy.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Line Items ── */}
                  <div className="pb-card">
                    <p className="pb-section-label">Line Items</p>

                    <FieldArray name="lines">
                      {({ push, remove }) => (
                        <>
                          <input
                            id="barcode-input"
                            className="pb-barcode-input"
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleBarcodeScan(
                                  barcode,
                                  values,
                                  push,
                                  setFieldValue,
                                );
                              }
                            }}
                            placeholder="⌁ Scan barcode to auto-fill a line"
                          />

                          <div className="pb-lines-scroll">
                            {values?.lines?.map((line, index) => (
                              <div
                                key={index}
                                className={`pb-line-row${line.is_opening ? " is-opening" : ""}`}
                              >
                              {/* Product */}
                              <div className="field-col">
                                <small className="field-label">Product</small>
                                <Field name={`lines.${index}.product_id`}>
                                  {({ field, form }) => (
                                    <select
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "add_new") {
                                          setShowProductModal(true);
                                          setActiveRowIndex(index);
                                          return;
                                        }
                                        form.setFieldValue(field.name, value);
                                      }}
                                    >
                                      <option value="">Select</option>
                                      {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.name}
                                        </option>
                                      ))}
                                      <option value="add_new">
                                        + Add New Product
                                      </option>
                                    </select>
                                  )}
                                </Field>
                                <ErrorMessage
                                  name={`lines.${index}.product_id`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Qty */}
                              <div className="field-col">
                                <small className="field-label">Qty</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.qty`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.qty`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Free */}
                              <div className="field-col">
                                <small className="field-label">Free</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.free_qty`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.free_qty`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Rate */}
                              <div className="field-col">
                                <small className="field-label">Rate</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.purchase_rate`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.purchase_rate`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* MRP */}
                              <div className="field-col">
                                <small className="field-label">MRP</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.mrp`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.mrp`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Selling Price */}
                              <div className="field-col">
                                <small className="field-label">SP</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.selling_price`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.selling_price`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Discount Type */}
                              <div className="field-col">
                                <small className="field-label">Disc Type</small>
                                <Field
                                  as="select"
                                  name={`lines.${index}.discount_type`}
                                >
                                  <option value="">–</option>
                                  <option value="percent">%</option>
                                  <option value="fixed">₹</option>
                                </Field>
                                <ErrorMessage
                                  name={`lines.${index}.discount_type`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Discount */}
                              <div className="field-col">
                                <small className="field-label">Discount</small>
                                <Field
                                  type="number"
                                  name={`lines.${index}.discount`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.discount`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* GST */}
                              <div className="field-col">
                                <small className="field-label">GST %</small>
                                <Field
                                  as="select"
                                  name={`lines.${index}.gst_rate_id`}
                                >
                                  <option value="">–</option>
                                  {gstRates.map((g) => (
                                    <option key={g.id} value={g.id}>
                                      {g.rate}%
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name={`lines.${index}.gst_rate_id`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Expiry */}
                              <div className="field-col">
                                <small className="field-label">Expiry</small>
                                <Field
                                  type="date"
                                  name={`lines.${index}.expiry_date`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.expiry_date`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* HSN */}
                              <div className="field-col">
                                <small className="field-label">HSN</small>
                                <Field
                                  type="text"
                                  name={`lines.${index}.hsn_code`}
                                />
                                <ErrorMessage
                                  name={`lines.${index}.hsn_code`}
                                  component="div"
                                  className="field-error"
                                />
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                className="pb-remove-btn"
                                onClick={() => remove(index)}
                                title="Remove line"
                              >
                                ✕
                              </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            className="pb-add-product-btn"
                            onClick={() => {
                              const newIndex = values.lines.length;
                              push({
                                product_id: "",
                                qty: "",
                                free_qty: "",
                                purchase_rate: "",
                                mrp: "",
                                selling_price: "",
                                discount_type: "",
                                discount: "",
                                hsn_code: "",
                                gst_rate_id: "",
                                batch_no: "",
                                expiry_date: "",
                                is_opening: false,
                              });
                              setTimeout(() => {
                                document
                                  .querySelector(
                                    `input[name="lines.${newIndex}.qty"]`,
                                  )
                                  ?.focus();
                              }, 50);
                            }}
                          >
                            + Add Product Line
                          </button>
                        </>
                      )}
                    </FieldArray>
                  </div>

                  {/* ── Tax type, settlement, notes ── */}
                  <div className="pb-card">
                    <p className="pb-section-label">Billing &amp; Settlement</p>
                    <div className="row mb-0">
                      <div className="mb-20 col-md-4">
                        <label className="pb-field-label">
                          Tax Billing Type
                        </label>
                        <div className="pb-tax-toggle">
                          <button
                            type="button"
                            className={`pb-tax-btn${values.tax_type === "exclusive" ? " active-exclusive" : ""}`}
                            onClick={() => setFieldValue("tax_type", "exclusive")}
                          >
                            <i className="fa fa-plus-circle"></i>
                            Exclusive (+)
                          </button>
                          <button
                            type="button"
                            className={`pb-tax-btn${values.tax_type === "inclusive" ? " active-inclusive" : ""}`}
                            onClick={() => setFieldValue("tax_type", "inclusive")}
                          >
                            <i className="fa fa-arrow-circle-down"></i>
                            Inclusive (In)
                          </button>
                        </div>
                      </div>

                      <div className="mb-20 col-md-4">
                        <label className="pb-field-label">
                          Settlement Amount (Final Adjusted Paid)
                        </label>
                        <Field
                          type="number"
                          name="settlement_amount"
                          placeholder="e.g., 722"
                        />
                        <ErrorMessage
                          name="settlement_amount"
                          className="error-text"
                          component="div"
                        />
                      </div>

                      <div className="mb-0 col-md-4">
                        <label className="pb-field-label">
                          Bill Remarks / Ledger Notes
                        </label>
                        <Field
                          as="textarea"
                          name="notes"
                          rows="1"
                          placeholder="Enter settlement remarks or adjustment details..."
                        />
                        <ErrorMessage
                          name="notes"
                          component="div"
                          className="error-text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pb-bottom-row">
                    <button type="submit" className="pb-submit-btn">
                      {isEdit ? "Update Bill" : "Save Bill"}
                    </button>

                    <div className="pb-total-bar">
                      <div className="pb-total-label">
                        <div className="pb-total-icon">
                          <i className="fa fa-calculator"></i>
                        </div>
                        <span>Calculated Bill Invoice Total</span>
                      </div>
                      <div className="pb-total-amount">
                        <small>₹</small>
                        <span>
                          {formatAmount(
                            calculateTotalAmount(values.lines, values.tax_type),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* ── Add Supplier Modal ── */}
          {showModal && (
            <div className="pb-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="pb-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="pb-modal-header">
                  <h5>Add New Supplier</h5>
                </div>
                <div className="pb-modal-body">
                  <p className="input-name">Add Supplier Name</p>
                  <input id="small-popup"
                    type="text"
                    className={error ? "is-invalid" : ""}
                    placeholder="Supplier Name"
                    value={newSupplier}
                    onChange={(e) => {
                      setNewSupplier(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  {error && <div className="error-text">{error}</div>}
                  
                  <p className="input-name">Select State</p>
                  <select className="state" onChange={(e) => setSupplierState(e.target.value)} name="state" id="state">
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">
                          Arunachal Pradesh
                        </option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">
                          Himachal Pradesh
                        </option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>

                        {/* Union Territories (optional) */}
                        <option value="Andaman and Nicobar Islands">
                          Andaman and Nicobar Islands
                        </option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">
                          Dadra and Nagar Haveli and Daman and Diu
                        </option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">
                          Jammu and Kashmir
                        </option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                  </select>
                                    
                                   
                </div>
                <div className="pb-modal-footer">
                  <button
                    className="pb-btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="pb-btn-save"
                    disabled={!newSupplier.trim()}
                    onClick={(e) => saveSupplier(e)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Add Product Modal ── */}
          {showProductModal && (
            <div
              className="pb-modal-overlay"
              onClick={() => setShowProductModal(false)}
            >
              <div
                className="pb-modal-card"
                style={{ width: "800px", maxHeight: "90vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pb-modal-header">
                  <h5>Create Product</h5>
                </div>
                <div className="pb-modal-body">
                  <ProductForm
                    onSuccess={(product) => {
                      setProducts((prev) => [...prev, product]);
                      if (formikRef.current && activeRowIndex !== null) {
                        formikRef.current.setFieldValue(
                          `lines.${activeRowIndex}.product_id`,
                          product.id,
                        );
                      }
                      setShowProductModal(false);
                    }}
                    onCancel={() => setShowProductModal(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreateEditPurchaseBill;