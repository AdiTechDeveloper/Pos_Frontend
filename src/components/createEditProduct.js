import React, { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Layout from "./layout";
import { toast } from "react-toastify";

let lastTime = 0;

const CreateEditProduct = () => {
  // NOTE: placeholder state/handlers assumed from original component context
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gstRates, setGstRates] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showBrandModel, setShowBrandModel] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState("");
  const isEdit = false;

  const initialValues = {
    name: "",
    sku: "",
    brand_id: "",
    category_id: "",
    gst_rate_id: "",
    hsn_code: "",
    barcode: "",
    gst_inclusive: true,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Product Name is required"),
    brand_id: Yup.string().required("Brand is required"),
    category_id: Yup.string().required("Category is required"),
    gst_rate_id: Yup.string().required("GST rate is required"),
  });

  const handleSubmit = (values, actions) => {
    console.log(values);
  };

  const saveBrand = (e) => {
    e.preventDefault();
  };

  const saveCategory = (e) => {
    e.preventDefault();
  };

  return (
    <Layout>
      <div className="main-content-inner">
        <div className="main-content-wrap">
          <h3 className="mb-20">
            {isEdit ? "Edit Product" : "Create Product"}
          </h3>

          <div className="wg-box">
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form className="wg-form">
                  <div className="row mb-20 col-12">
                    {/* Name */}
                    <fieldset className="col-md-3">
                      <div className="body-title">Name *</div>
                      <div className="body-content">
                        <Field
                          type="text"
                          name="name"
                          placeholder="Enter product name"
                          className="mb-5"
                        />
                        <ErrorMessage
                          name="name"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>

                    {/* SKU */}
                    <fieldset className="col-md-4">
                      <div className="body-title">SKU</div>
                      <div className="body-content mb-15">
                        <Field
                          type="text"
                          name="sku"
                          placeholder="Enter SKU"
                          className="mb-5"
                        />
                        <ErrorMessage
                          name="sku"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>

                    <fieldset className="col-md-4 mb-15">
                      <div className="body-title">Brand *</div>
                      <div className="body-content">
                        <Field name="brand_id" as="select" className="mb-6">
                          {({ field }) => (
                            <select
                              {...field}
                              value={brandId}
                              onChange={(e) => {
                                field.onChange(e);

                                const value = e.target.value;
                                if (value === "add_new") {
                                  setShowBrandModel(true);
                                }
                                setBrandId(value);
                              }}
                            >
                              <option value="">Select Brand</option>
                              {brands.map((b) => (
                                <option value={b.id} key={b.id}>
                                  {b.name}
                                </option>
                              ))}
                              {!newBrand && (
                                <option value="add_new">+ Add New Brand</option>
                              )}
                            </select>
                          )}
                        </Field>
                        <ErrorMessage
                          name="brand_id"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>
                  </div>

                  {/* Category / GST Rate / HSN */}
                  <div className="row mb-20">
                    <fieldset className="col-md-4">
                      <div className="body-title">Category *</div>
                      <div className="body-content">
                        <Field name="category_id" as="select" className="mb-6">
                          {({ field }) => (
                            <select
                              {...field}
                              value={categoryId}
                              onChange={(e) => {
                                field.onChange(e);

                                const value = e.target.value;
                                if (value === "add_new") {
                                  setShowCategoryModal(true);
                                }
                                setCategoryId(value);
                              }}
                            >
                              <option value="">Select Category</option>
                              {categories.map((c) => (
                                <option value={c.id} key={c.id}>
                                  {c.name}
                                </option>
                              ))}
                              {!newCategory && (
                                <option value="add_new">
                                  + Add New Category
                                </option>
                              )}
                            </select>
                          )}
                        </Field>
                        <ErrorMessage
                          name="category_id"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>

                    <fieldset className="col-md-4">
                      <div className="body-title">Gst Rate *</div>
                      <div className="body-content mb-15">
                        <Field as="select" name="gst_rate_id" className="mb-5">
                          <option value="">Select Gst Rate</option>
                          {gstRates.map((element) => (
                            <option value={element.id} key={element.id}>
                              {element.rate}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="gst_rate_id"
                          component="div"
                          className="error-text"
                        />
                      </div>
                    </fieldset>

                    <fieldset className="col-md-4">
                      <div className="body-title">HSN</div>
                      <div className="body-content mb-15">
                        <Field
                          type="text"
                          name="hsn_code"
                          placeholder="Enter HSN code"
                          className="mb-5"
                        />
                        <ErrorMessage
                          name="hsn_code"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>
                  </div>

                  {/* Barcode / GST Included */}
                  <div className="row mb-20">
                    <fieldset className="col-md-6">
                      <div className="body-title">Barcode</div>
                      <div className="body-content mb-15">
                        <Field name="barcode">
                          {({ field, form }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Scan Barcode"
                              autoFocus
                              className="mb-5"
                              onChange={(e) => {
                                const now = Date.now();
                                const isScanner = now - lastTime < 30;
                                lastTime = now;

                                form.setFieldValue("barcode", e.target.value);
                                form.setFieldTouched("barcode", true, false);

                                if (isScanner) {
                                  form.setFieldValue("_scanner", true, false);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();

                                  const barcode = field.value.trim();
                                  if (!barcode) return;

                                  console.log("Process barcode:", barcode);
                                  form.setFieldValue("_scanner", false, false);
                                }
                              }}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="barcode"
                          className="error-text"
                          component="div"
                        />
                      </div>
                    </fieldset>

                    <fieldset className="col-md-6">
                      <div className="body-title mb-5">GST Included</div>

                      <Field name="gst_inclusive">
                        {({ field, form }) => {
                          const isIncluded =
                            field.value === true || field.value === 1;

                          return (
                            <div className="gst-checkbox-wrapper">
                              {/* GST Included */}
                              <label>
                                <input
                                  type="checkbox"
                                  checked={isIncluded}
                                  onChange={() => {
                                    form.setFieldValue("gst_inclusive", true);
                                  }}
                                />
                                <span>Included</span>
                              </label>

                              {/* GST Excluded */}
                              <label>
                                <input
                                  type="checkbox"
                                  checked={!isIncluded}
                                  onChange={() => {
                                    form.setFieldValue("gst_inclusive", false);
                                  }}
                                />
                                <span>Excluded</span>
                              </label>
                            </div>
                          );
                        }}
                      </Field>
                    </fieldset>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="tf-button w208" type="submit">
                    {isEdit ? "Update Product" : "Create Product"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {showCategoryModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowCategoryModal(false)}
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5>Add New Category</h5>
                </div>

                <div className="modal-body">
                  <input
                    type="text"
                    className={`form-control model-form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Category Name"
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      if (error) setError("");
                    }}
                  />

                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary cancel-btn"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary save-btn"
                    disabled={!newCategory.trim()}
                    onClick={(e) => saveCategory(e)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBrandModel && (
            <div
              className="modal-overlay"
              onClick={() => setShowBrandModel(false)}
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5>Add New Brand</h5>
                </div>

                <div className="modal-body">
                  <input
                    type="text"
                    className={`form-control model-form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Brand Name"
                    value={newBrand}
                    onChange={(e) => {
                      setNewBrand(e.target.value);
                      if (error) setError("");
                    }}
                  />

                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary cancel-btn"
                    onClick={() => setShowBrandModel(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary save-btn"
                    disabled={!newBrand.trim()}
                    onClick={(e) => saveBrand(e)}
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

export default CreateEditProduct;