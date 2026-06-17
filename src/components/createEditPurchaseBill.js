import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { useRef } from "react";
import * as Yup from "yup";
import Layout from "./layout";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";

/* ─── Inline styles for the lost-bill toggle ─── */
const toggleStyles = `
  .lost-bill-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px 12px;
    // background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    width: fit-content;
  }
  .lost-bill-wrapper .toggle-label-text {
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
  }
  .lost-bill-wrapper.active {
    // background: #fff8e1;
    // border-color: #f59e0b;
  }
  .lost-bill-wrapper.active .toggle-label-text {
    // color: #b45309;
    color : red; 
    font-weight: 500;
  }

  /* Toggle switch */
  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
  }
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  .toggle-track {
    position: absolute;
    inset: 0;
    background  : green;
    //  background: #d1d5db;
    border-radius: 11px;
    cursor: pointer;
    transition: background 0.25s;
  }
  .toggle-track::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.25s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .toggle-switch input:checked + .toggle-track {
    // background: #f59e0b;
    background  : red;
  }
  .toggle-switch input:checked + .toggle-track::before {
    transform: translateX(18px);
  }

  /* Lost bill input styling */
  .lost-bill-input {
    // background: #fff8e1 !important;
    // border: 1.5px solid #f59e0b !important;
    color: #92400e !important;
    font-weight: 500 !important;
    letter-spacing: 0.3px;
  }
  .lost-bill-hint {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #92400e;
    margin-top: 5px;
    padding: 5px 10px;
    // background: #fef3c7;
    border-radius: 6px;
    // border-left: 3px solid #f59e0b;
  }
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
    const supplier = { id: Date.now(), name: newSupplier.trim() };
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
      {/* Inject toggle CSS */}
      <style>{toggleStyles}</style>

      <div className="main-content-inner">
        <div className="main-content-wrap">
          <h3 className="mb-20">
            {isEdit ? "Edit Purchase Bill" : "Create Purchase Bill"}
          </h3>

          <div className="wg-box" style={{ width: "100%" }}>
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
                  {/* ── Branch & Supplier ── */}
                  <div className="container">
                    <div className="row mb-20">
                      <div className="mb-20 col-md-6">
                        <label className="mb-8 purchase-label">Branch</label>
                        <Field as="select" name="branch_id" className="mb-6">
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

                      <div className="mb-20 col-md-6">
                        <label className="mb-8 purchase-label">Supplier</label>
                        <Field name="supplier_id" as="select" className="mb-6">
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
                    </div>
                  </div>

                  {/* ── Bill No & Bill Date ── */}
                  <div className="row mb-20">
                    {/* ── Bill No with lost toggle ── */}
                    {/* ── Bill No with lost toggle ── */}
                    <div className="mb-20 col-md-6">
                      <label className="mb-8 purchase-label">Bill No</label>

                      {/* Toggle + Input in one row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {/* Toggle pill */}
                        <div
                          className={`lost-bill-wrapper${isBillLost ? " active" : ""}`}
                          style={{ marginBottom: 0, flexShrink: 0 }}
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

                        {/* Bill No input */}
                        <div style={{ flex: 1 }}>
                          <Field
                            type="text"
                            name="bill_no"
                            className={`mb-6${isBillLost ? " lost-bill-input" : ""}`}
                            placeholder={
                              isBillLost
                                ? "Auto-generated reference"
                                : "Enter bill no"
                            }
                            disabled={isBillLost}
                            style={{ marginBottom: 0 }}
                          />
                          <ErrorMessage
                            name="bill_no"
                            className="error-text"
                            component="div"
                          />
                        </div>
                      </div>

                      {/* Hint below the row */}
                      {isBillLost && (
                        <div
                          className="lost-bill-hint"
                          style={{ marginTop: "8px" }}
                        >
                          <span>
                            You can update the real bill no. later from the
                            bills list once supplier sends a copy.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-20 col-md-6">
                      <label
                        className="mb-8 purchase-label"
                        style={{ fontSize: "15px" }}
                      >
                        Bill Date
                      </label>
                      <Field type="date" name="bill_date" className="mb-6" />
                      <ErrorMessage
                        name="bill_date"
                        className="error-text"
                        component="div"
                      />
                    </div>
                  </div>

                  {/* ── Line Items ── */}
                  <FieldArray name="lines">
                    {({ push, remove }) => (
                      <>
                        {/* Barcode input */}
                        <input
                          id="barcode-input"
                          className="mb-10"
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
                          placeholder="Scan barcode"
                        />

                        {values?.lines?.map((line, index) => (
                          <div
                            key={index}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "2.5fr 1fr 1fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 1.2fr 1.5fr 2fr 0.4fr",
                              gap: "8px",
                              alignItems: "end",
                              padding: "10px",
                              border: "1px solid",
                              borderRadius: "8px",
                              marginBottom: "10px",
                              background: line.is_opening
                                ? "#ecfdf5"
                                : "#fafafa",
                              borderColor: line.is_opening
                                ? "#10b981"
                                : "#e5e7eb",
                            }}
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
                              onClick={() => remove(index)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                fontSize: "16px",
                                cursor: "pointer",
                              }}
                              title="Remove line"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="mt-12"
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
                          + Add Product
                        </button>
                      </>
                    )}
                  </FieldArray>

                  <div className="row mb-20">
                    {/* Tax Type Toggle Button Group */}
                    <div className="mb-20 col-md-4 mt-6">
                      <label
                        className="mb-8 purchase-label fw-bold text-dark"
                        style={{ fontSize: "14px", letterSpacing: "0.3px" }}
                      >
                        Tax Billing Type
                      </label>
                      <div
                        className="d-flex p-4 rounded-3"
                        style={{
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        {/* Tax Exclusive Button: Changes to a premium Indigo/Blue when active */}
                        <button
                          type="button"
                          className="btn w-100 py-2 transition-all font-weight-bold d-flex align-items-center justify-content-center"
                          style={{
                            borderRadius: "6px",
                            fontSize: "14px",
                            border: "none",
                            transition: "all 0.2s ease",
                            backgroundColor:
                              values.tax_type === "exclusive"
                                ? "#3b82f6"
                                : "transparent",
                            color:
                              values.tax_type === "exclusive"
                                ? "#ffffff"
                                : "#64748b",
                            boxShadow:
                              values.tax_type === "exclusive"
                                ? "0 2px 4px rgba(59, 131, 246, 0.3)"
                                : "none",
                          }}
                          onClick={() => setFieldValue("tax_type", "exclusive")}
                        >
                          <i
                            className="fa fa-plus-circle"
                            style={{ marginRight: "6px" }}
                          ></i>
                          Tax Exclusive (+)
                        </button>

                        {/* Tax Inclusive Button: Changes to a clean Teal/Green when active */}
                        <button
                          type="button"
                          className="btn w-100 py-2 transition-all font-weight-bold d-flex align-items-center justify-content-center"
                          style={{
                            borderRadius: "6px",
                            fontSize: "14px",
                            border: "none",
                            transition: "all 0.2s ease",
                            backgroundColor:
                              values.tax_type === "inclusive"
                                ? "#10b981"
                                : "transparent",
                            color:
                              values.tax_type === "inclusive"
                                ? "#ffffff"
                                : "#64748b",
                            boxShadow:
                              values.tax_type === "inclusive"
                                ? "0 2px 4px rgba(16, 185, 129, 0.3)"
                                : "none",
                          }}
                          onClick={() => setFieldValue("tax_type", "inclusive")}
                        >
                          <i
                            className="fa fa-arrow-circle-down"
                            style={{ marginRight: "6px" }}
                          ></i>
                          Tax Inclusive (In)
                        </button>
                      </div>
                    </div>

                    {/* Settlement Amount Input */}
                    <div className="mb-20 col-md-4 mt-6">
                      <label className="mb-8 purchase-label">
                        Settlement Amount (Final Adjusted Paid)
                      </label>
                      <Field
                        type="number"
                        name="settlement_amount"
                        className="form-control"
                        placeholder="e.g., 722"
                      />
                      <ErrorMessage
                        name="settlement_amount"
                        className="error-text"
                        component="div"
                      />
                    </div>

                    {/* Bill Notes Textarea */}
                    <div className="mb-20 col-md-4 mt-6">
                      <label
                        className="mb-8 purchase-label fw-bold text-dark"
                        style={{ fontSize: "14px" }}
                      >
                        Bill Remarks / Ledger Notes
                      </label>
                      <div className="position-relative">
                        <Field
                          as="textarea"
                          name="notes"
                          rows="1"
                          className="form-control"
                          placeholder="Enter settlement remarks or adjustment details..."
                          style={{
                            minHeight: "42px",
                            maxHeight: "100px",
                            borderRadius: "6px",
                            borderColor: "#e2e8f0",
                            fontSize: "14px",
                            padding: "10px 14px",
                            lineHeight: "1.5",
                            resize: "vertical",
                          }}
                        />
                      </div>
                      <ErrorMessage
                        name="notes"
                        component="div"
                        className="text-danger mt-4 font-weight-medium"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>

                  <div className="row mb-20">
                    <div className="col-md-12">
                      <div
                        style={{
                          padding: "16px 24px",
                          border: "1px solid #d1fae5", // soft success green border accent
                          borderRadius: "12px",
                          background: "#f0fdf4", // pristine modern dashboard green background
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                          gap: "16px",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              background: "#bbf7d0",
                              color: "#166534",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="fa fa-calculator"
                              style={{ fontSize: "14px" }}
                            ></i>
                          </div>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#166534",
                              fontSize: "15px",
                              marginLeft: "8px",
                            }}
                          >
                            Calculated Bill Invoice Total
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <small
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#166534",
                            }}
                          >
                            ₹
                          </small>
                          <span
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 800,
                              color: "#14532d",
                              letterSpacing: "-0.5px",
                            }}
                          >
                            {formatAmount(
                              calculateTotalAmount(
                                values.lines,
                                values.tax_type,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit">
                    {isEdit ? "Update Bill" : "Save Bill"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* ── Add Supplier Modal ── */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5>Add New Supplier</h5>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className={`form-control model-form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Supplier Name"
                    value={newSupplier}
                    onChange={(e) => {
                      setNewSupplier(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary save-btn"
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
              className="modal-overlay"
              onClick={() => setShowProductModal(false)}
            >
              <div
                className="modal-card"
                style={{ width: "800px", maxHeight: "90vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h5>Create Product</h5>
                </div>
                <div className="modal-body">
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
