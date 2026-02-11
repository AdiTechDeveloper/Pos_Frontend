import React, { forwardRef } from "react";
import Barcode from "react-barcode";

const BarcodePrintSheet = forwardRef(({ product }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Centering horizontally
        justifyContent: "center", // Centering vertically
        padding: "1mm",
        boxSizing: "border-box",
        backgroundColor: "white",
      }}
    >
      {/* Product Name */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          marginBottom: "2px",
          textAlign: "center",
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {product?.name}
      </div>

      {/* Barcode Element */}
      <Barcode
        value={product?.barcode || product?.sku || "0000"}
        width={1}
        height={40}
        renderer="svg"
        displayValue={true}
        fontSize={10}
        margin={0}
      />

      {/* Footer Info */}
      <div
        style={{
          fontSize: "9px",
          marginTop: "2px",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          fontWeight: "bold",
        }}
      >
        <span>SKU: {product?.sku}</span>
        <span>Price: ₹{product?.selling_price}</span>
      </div>
    </div>
  );
});

export default BarcodePrintSheet;
