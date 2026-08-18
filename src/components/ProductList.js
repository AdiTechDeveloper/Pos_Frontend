import React, { useEffect, useState, useRef } from "react";
import { getProducts, scanBarcode } from "../utils/api";
import BatchSelectModal from "../components/BatchSelectModal";

export default function ProductList({
  selectedCategory,
  selectedBrand,
  addToCart,
  handleProductSelection,
  setSelectedCategory,
  setSelectedBrand,
  refreshProducts,
}) {
  const resetFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [batchOptions, setBatchOptions] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const barcodeRef = useRef();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        category_id: selectedCategory,
        brand_id: selectedBrand,
        search,
      });

      const flatProducts = (res.data.products || []).flatMap((product) => {
        const grouped = {};

        product.inventories.forEach((inv) => {
          const key = `${inv.batch_no}_${inv.selling_price}`;

          if (!grouped[key]) {
            grouped[key] = {
              product_id: product.id,
              name: product.name,
              brand: product.brand,
              category: product.category,

              batch_no: inv.batch_no,
              selling_price: Number(inv.selling_price),
              expiry_date: inv.expiry_date || null, // Pick expiry date

              stock: 0,
              free_qty: 0,
              gst_percent: product.gst_rate ? product.gst_rate.rate : 0,
              gst_inclusive: product.gst_inclusive,

              inventories: [], // keep ids for cart logic
              is_opening: inv.is_opening,
            };
          } else {
            // Keep the earliest non-null expiry date if multiple inventory lines share the batch/price
            if (
              inv.expiry_date &&
              (!grouped[key].expiry_date ||
                new Date(inv.expiry_date) < new Date(grouped[key].expiry_date))
            ) {
              grouped[key].expiry_date = inv.expiry_date;
            }
          }

          grouped[key].stock += Number(inv.available_qty);

          if (inv.free === 1) {
            grouped[key].free_qty += Number(inv.available_qty);
          }

          grouped[key].inventories.push({
            inventory_id: inv.id,
            qty: Number(inv.available_qty),
            free: inv.free,
            gst_rate: inv.gst_rate,
            expiry_date: inv.expiry_date,
          });
        });

        return Object.values(grouped);
      });

      setProducts(flatProducts);
    } catch (e) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, search, refreshProducts]);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, [barcode]);

  const handleBarcodeScan = async () => {
    try {
      const res = await scanBarcode(barcode.trim());

      if (!res.data?.status) {
        alert("Product not found");
        return;
      }

      const { product, batches } = res.data;

      if (!batches || batches.length === 0) {
        alert("Out of stock");
        return;
      }

      const groups = batches.map((b) => ({
        product_id: product.id,
        name: product.name,

        batch_no: b.batch_no,
        selling_price: Number(b.selling_price),
        expiry_date: b.expiry_date || null,

        stock: Number(b.total_stock),
        free_qty: 0,

        gst_percent: Number(product.gst_rate?.rate || 0),
        gst_inclusive: Number(product.is_gst_inclusive ?? 0),

        inventories: [
          {
            inventory_id: b.inventory_id,
          },
        ],
      }));

      if (groups.length === 1) {
        addToCart({
          ...groups[0],
          inventory_id: groups[0].inventories[0].inventory_id,
          gst_percent: Number(groups[0].gst_percent),
          gst_inclusive: Number(groups[0].gst_inclusive),
          qty: 1,
        });
      } else {
        setBatchOptions(groups);
        setShowBatchModal(true);
      }
    } catch (err) {
      console.error(err);
      alert("Product not found");
    } finally {
      setBarcode("");
    }
  };

  // Helper function to check if date is within 30 days
  const isNearExpiry = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="flex gap-6 mb-40">
        <input
          ref={barcodeRef}
          type="text"
          placeholder="Scan barcode..."
          className="border p-5 text-2xl w-96 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 mb-12"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && barcode.trim()) {
              handleBarcodeScan();
            }
          }}
        />
        <input
          type="text"
          placeholder="Search product..."
          className="border p-5 text-2xl w-full rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading &&
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-2xl animate-pulse mb-15"
            >
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>

              <div className="mt-6 flex justify-between items-center">
                <span className="h-8 w-20 bg-gray-300 rounded"></span>
                <span className="h-8 w-20 bg-gray-200 rounded"></span>
              </div>
            </div>
          ))}

        {products.length === 0 && !loading && (
          <div className="col-span-3 text-center py-20">
            <h2 className="text-5xl font-bold text-gray-700">
              No Products Found
            </h2>
            <p className="text-gray-500 text-2xl mt-8">
              Try adjusting your search, category, or brand filters.
            </p>

            <button
              onClick={resetFilters}
              className="mt-8 px-6 py-3 text-2xl rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading &&
          products.map((p) => {
            const nearExpiry = isNearExpiry(p.expiry_date);
            return (
              <div
                key={`${p.product_id}-${p.batch_no}-${p.selling_price}`}
                onClick={() => {
                  if (p.stock > 0) {
                    const actualId =
                      p.inventories[0].inventory_id || p.inventories[0].id;

                    addToCart({
                      ...p,
                      inventory_id: actualId,
                      gst_percent: Number(p.gst_percent),
                      gst_inclusive: Number(p.gst_inclusive),
                      qty: 1,
                    });
                  }
                }}
                className={`p-6 rounded-3xl shadow-2xl flex flex-col justify-between mb-15 transition
          ${p.stock > 0 ? "cursor-pointer hover:scale-105" : "opacity-50"}
        `}
                style={{
                  background: p.is_opening ? "#ecfdf5" : "#ffffff",
                  border: nearExpiry
                    ? "2px solid #ef4444"
                    : p.is_opening
                      ? "2px solid #10b981"
                      : "1px solid #e5e7eb",
                }}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-3xl">{p.name}</h3>
                    {p.expiry_date && (
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          nearExpiry
                            ? "bg-red-100 text-red-800" // Removed animate-pulse
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Exp:{" "}
                        {new Date(p.expiry_date).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>

                  <p className="text-xl text-gray-600 mt-1">{p.brand?.name}</p>
                  <p className="text-lg text-gray-500">Batch: {p.batch_no}</p>

                  {p.free_qty > 0 && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                      FREE QTY: {p.free_qty}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-3xl font-bold text-blue-700">
                    ₹{p.selling_price}
                  </span>

                  <span
                    className={`px-4 py-2 rounded-full text-xl font-semibold ${
                      p.stock < 5
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.stock} in stock
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {showBatchModal && (
        <BatchSelectModal
          options={batchOptions}
          onSelect={(option) => {
            const actualInventoryId =
              option.inventories[0].inventory_id || option.inventories[0].id;

            addToCart({
              cart_key: `${actualInventoryId}`,
              inventory_id: actualInventoryId,

              product_id: option.product_id,
              name: option.name,

              batch_no: option.batch_no,
              selling_price: option.selling_price,

              stock: option.stock,
              free_qty: option.free_qty,

              gst_percent: Number(option.gst_percent),
              gst_inclusive: Number(option.gst_inclusive),

              qty: 1,
            });

            setShowBatchModal(false);
          }}
          onClose={() => setShowBatchModal(false)}
        />
      )}
    </div>
  );
}
