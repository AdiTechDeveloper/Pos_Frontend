import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Layout from "./layout";
import { toast } from "react-toastify";

const CreateEditPurchaseBill = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams(); // if id exists -> Edit Mode
  const history = useHistory();
  const [branches, setBranches] = useState([]);
  const [suppliers, setSupplierBill] = useState([]);
  const [products, setProducts] = useState([]);
  const [gstRates, setGstRates] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [barcode, setBarcode] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
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
      },
    ],
  });
  useEffect(() => {
    if (incomingBill) {
      setSupplierId(incomingBill.supplier_id?.toString() || "");
      setInitialValues({
        branch_id: incomingBill.branch_id?.toString() || "",
        supplier_id: incomingBill.supplier_id?.toString() || "",
        bill_no: incomingBill.bill_no || "",
        bill_date: incomingBill.bill_date || "",

        lines: incomingBill.lines?.length
          ? incomingBill.lines.map((line) => ({
              product_id: line.product_id?.toString() || "",
              qty: line.qty || "",
              free_qty: line.free_qty || "",
              purchase_rate: line.purchase_rate || "",
              mrp: line.mrp || "",
              selling_price: line.selling_price || "",
              discount_type: line.discount_type || "",
              discount: line.discount || "",
              hsn_code: line.hsn_code || "",
              gst_rate_id: line.gst_rate_id?.toString() || "",
              batch_no: line.batch_no || "",
              expiry_date: line.expiry_date || "",
            }))
          : initialValues.lines, // fallback
      });
    }
  }, []);
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
      console.error("Error fetching categories:", error);
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
      console.error("Error fetching categories:", error);
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
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGstRates = async () => {
    const response = await axios.get(`${BASE_URL}/api/gst-rates`, {
      headers: { Authorization: `Bearer ${user_data.token}` },
    });
    setGstRates(response.data.gstRates);
  };

  useEffect(() => {
    fetchProduct();
    fetchGstRates();
  }, []);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Validation Schema

  const validationSchema = Yup.object().shape({
    branch_id: Yup.string().required("Branch is required"),
    supplier_id: Yup.string().required("Supplier is required"),
    bill_no: Yup.string().required("Bill No is required"),
    bill_date: Yup.date().required("Bill date is required"),

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

          discount_type: Yup.string().nullable(),

          discount: Yup.number()
            .nullable()
            .typeError("Discount must be a number")
            .min(0, "Discount cannot be negative"),

          // hsn_code: Yup.string().required("HSN is required"),

          gst_rate_id: Yup.string().required("GST rate required"),

          batch_no: Yup.string().required("Batch no. is required"),

          expiry_date: Yup.date().required("Expiry date is required"),

          is_opening: Yup.boolean().default(false),
        }),
      ),
  });

  const handleSubmit = async (values, actions) => {
    try {
      const payload = {
        ...values,
        lines: values.lines.map((line) => ({
          ...line,
          is_opening: line.is_opening ? 1 : 0,
          qty: Number(line.qty),
          free_qty: Number(line.free_qty || 0),
          purchase_rate: Number(line.purchase_rate),
          mrp: Number(line.mrp),
          selling_price: Number(line.selling_price),
          discount: line.discount ? Number(line.discount) : 0,
          gst_rate_id: Number(line.gst_rate_id),
          product_id: Number(line.product_id),
        })),
      };

      let response;

      if (isEdit) {
        // UPDATE
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
        // CREATE
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
    // Clear error if valid
    setError("");

    const supplier = {
      id: Date.now(),
      name: newSupplier.trim(),
    };
    let url = `${BASE_URL}/api/suppliers`;
    let method = "post";
    const response = await axios({
      method,
      url,
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
    const product = {
      id: Date.now(),
      name: newProduct.trim(),
    };
    let url = `${BASE_URL}/api/products`;
    let method = "post";
    const response = await axios({
      method,
      url,
      data: product,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${user_data.token}`,
      },
    });
    toast.success("Products Created!");
    setNewProduct("");
    setShowProductModal(false);
    fetchProduct();
  };

  const handleBarcodeScan = async (barcode, values, push, setFieldValue) => {
    if (!barcode) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/sales/scan`,
        { barcode },
        {
          headers: {
            Authorization: `Bearer ${user_data.token}`,
          },
        },
      );

      // If API returns status: false
      if (!response.data.status) {
        toast.error(response.data.message || "Product not found");
        return;
      }

      const product = response.data.product;
      const inventory =
        response.data.batches?.find((b) => b.batch_barcode === barcode) || {};

      // Check if product already exists in lines
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

      // Find first empty line
      const emptyIndex = values.lines.findIndex((l) => !l.product_id);

      const lineData = {
        product_id: product.id.toString(),
        qty: 1,
        free_qty: 0,
        purchase_rate: inventory.purchase_rate || 0,
        mrp: inventory.mrp,
        cost_price: inventory.cost_price,
        selling_price: inventory.selling_price,
        hsn_code: product.hsn_code,
        gst_rate: product.gst_rate.id,
        batch_no: inventory.batch_no || "",
        expiry_date: inventory.expiry_date || "",
      };

      console.log(lineData);

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

  return (
    <Layout>
      <div className="main-content-inner">
        <div className="main-content-wrap">
          <h3 className="mb-20">
            {isEdit ? "Edit Purchase Bill" : "Create Purchase Bill"}
          </h3>

          <div className="wg-box" style={{ width: "100%" }}>
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={validationSchema}
              onSubmit={(values, actions) => handleSubmit(values, actions)}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  {/* ---------------- Basic Form Fields ---------------- */}
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
                                if (value === "add_new") {
                                  setShowModal(true);
                                }
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
                  {/* <div className="container"> */}
                  <div className="row mb-20">
                    <div className="mb-20 col-md-6">
                      <label className="mb-8 purchase-label">Bill No</label>
                      <Field
                        type="text"
                        name="bill_no"
                        className="mb-6"
                        placeholder="Enter bill no"
                      />
                      <ErrorMessage
                        name="bill_no"
                        className="error-text"
                        component="div"
                      />
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
                  {/* </div> */}

                  {/* ---------------- Line Items ---------------- */}
                  <FieldArray name="lines">
                    {({ push, remove }) => (
                      <>
                        {/* BARCODE INPUT */}
                        <input
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
                                "2fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1fr 1fr 1.2fr 2fr 1fr 1fr 1fr 0.4fr",
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
                              <Field
                                as="select"
                                name={`lines.${index}.product_id`}
                              >
                                <option value="">Select</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
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

                            {/* Purchase Rate */}
                            <div className="field-col">
                              <small className="field-label">Rate</small>
                              <Field
                                type="number"
                                name={`lines.${index}.cost_price`}
                              />
                              <ErrorMessage
                                name={`lines.${index}.cost_price`}
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
                                name={`lines.${index}.gst_rate`}
                              >
                                <option value="">–</option>
                                {gstRates.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.rate}%
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name={`lines.${index}.gst_rate`}
                                component="div"
                                className="field-error"
                              />
                            </div>

                            {/* Batch */}
                            <div className="field-col">
                              <small className="field-label">Batch</small>
                              <Field
                                type="text"
                                name={`lines.${index}.batch_no`}
                              />
                              <ErrorMessage
                                name={`lines.${index}.batch_no`}
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

                            {/* Opening Stock */}
                            <div className="field-col">
                              <small className="field-label">Is Opening</small>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  marginBottom: "22px",
                                  marginLeft: "4px",
                                }}
                              >
                                <Field
                                  type="checkbox"
                                  name={`lines.${index}.is_opening`}
                                />
                                Yes
                              </label>
                              <ErrorMessage
                                name={`lines.${index}.is_opening`}
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
                  <button type="submit">
                    {isEdit ? "Update Bill" : "Save Bill"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                  <h5>Add New Supplier</h5>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <input
                    type="text"
                    className={`form-control model-form-control ${
                      error ? "is-invalid" : ""
                    }`}
                    placeholder="Supplier Name"
                    value={newSupplier}
                    onChange={(e) => {
                      setNewSupplier(e.target.value);
                      if (error) setError("");
                    }}
                  />

                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                {/* Footer */}
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
          {showProductModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowProductModal(false)}
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                  <h5>Add New Product</h5>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <input
                    type="text"
                    className={`form-control model-form-control ${
                      error ? "is-invalid" : ""
                    }`}
                    placeholder="Product Name"
                    value={newProduct}
                    onChange={(e) => {
                      setNewProduct(e.target.value);
                      if (error) setError("");
                    }}
                  />

                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary cancel-btn"
                    onClick={() => setShowProductModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary save-btn"
                    disabled={!newProduct.trim()}
                    onClick={(e) => saveProduct(e)}
                  >
                    Save
                  </button>
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
