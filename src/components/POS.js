import React, { useState } from "react";
import LeftSidebar from "./LeftSidebar";
import ProductList from "./ProductList";
import CartPanel from "./CartPanel";
import { toast } from "react-toastify";

export default function POSApp() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [cart, setCart] = useState([]);
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState([]);

  const triggerRefresh = () => {
    setRefreshProducts((prev) => !prev);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.inventory_id === product.inventory_id &&
          item.selling_price === product.selling_price,
      );

      if (index !== -1) {
        const currentQtyInCart = prev[index].qty;

        if (currentQtyInCart + 1 > product.total_stock) {
          toast.error(
            `Only ${product.total_stock} units available for this batch`,
          );
          return prev;
        }

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          qty: currentQtyInCart + 1,
        };
        return updated;
      }

      if (product.total_stock < 1) {
        toast.error("Out of stock for this batch");
        return prev;
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
          cart_key: `${product.inventory_id}_${product.selling_price}`,
        },
      ];
    });
  };

  const handleProductSelection = (productOrGroup) => {
    if (Array.isArray(productOrGroup) && productOrGroup.length > 1) {
      setPopupData(productOrGroup);
      setShowPopup(true);
      return;
    }

    const item = Array.isArray(productOrGroup)
      ? productOrGroup[0]
      : productOrGroup;

    addToCart(item);
  };

  return (
    <div className="pos-flex h-screen bg-gray-100">
      <LeftSidebar
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        setCategory={setSelectedCategory}
        setBrand={setSelectedBrand}
      />
      <ProductList
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        setSelectedCategory={setSelectedCategory}
        setSelectedBrand={setSelectedBrand}
        refreshProducts={refreshProducts}
        addToCart={addToCart}
        handleProductSelection={handleProductSelection}
      />
      <CartPanel
        cart={cart}
        setCart={setCart}
        triggerRefresh={triggerRefresh}
      />
    </div>
  );
}
