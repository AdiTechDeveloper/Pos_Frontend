import React, { forwardRef } from "react";

const ReceiptModal = forwardRef(
  ({ isOpen, onClose, data = {}, onPrint }, ref) => {
    if (!isOpen || !data?.data?.length) return null;

    // Get the first bill object from data
    const billData = data.data[0] || {};
    const { store, branch, bill, items = [], barcode, footer } = billData;

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div ref={ref} style={styles.receiptBox}>
            {/* Store Header */}
            <h2 style={styles.storeName}>{store?.name || "Store Name"}</h2>
            <div style={styles.branchName}>{branch?.name || store?.name}</div>
            <div style={styles.address}>{branch?.address || store?.state}</div>
            <div style={styles.phone}>Phone: {store?.phone}</div>

            <hr style={styles.separator} />

            {/* Bill Info */}
            <div style={styles.row}>
              <span>Bill No:</span>
              <span>{bill?.number || "-"}</span>
            </div>
            <div style={styles.row}>
              <span>Date:</span>
              <span>{bill?.date || new Date().toLocaleString()}</span>
            </div>
            <div style={styles.row}>
              <span>Cashier:</span>
              <span>{bill?.cashier || "N/A"}</span>
            </div>

            <hr style={styles.separator} />

            {/* Items */}
            <h4 style={styles.sectionTitle}>Items</h4>
            <div>
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div key={i} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemQty}>
                      {item.qty} × ₹{parseFloat(item.selling).toFixed(2)}
                    </span>
                    <span style={styles.itemAmount}>
                      ₹{parseFloat(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    margin: "10px 0",
                  }}
                >
                  No items found
                </div>
              )}
            </div>

            <hr style={styles.separator} />

            {/* Totals */}
            <div style={styles.summaryRow}>
              <span>Total Taxable:</span>
              <span>₹{parseFloat(bill?.subtotal - bill?.total_gst || 0).toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Total GST:</span>
              <span>₹{parseFloat(bill?.total_gst || 0).toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Total Saved:</span>
              <span>₹{parseFloat(bill?.total_saved || 0).toFixed(2)}</span>
            </div>
            <div
              style={{
                ...styles.summaryRow,
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              <span>Total:</span>
              <span>₹{parseFloat(bill?.total_amount || 0).toFixed(2)}</span>
            </div>

            {/* Barcode */}
            {barcode && (
              <div style={{ textAlign: "center", margin: "20px 40px" }}>
                <img src={barcode} alt="barcode" style={{ height: 60 }} />
              </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
              {footer || "Thank You! Visit Again"}
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button onClick={onPrint} style={styles.printBtn}>
              Print
            </button>
            <button onClick={onClose} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ReceiptModal;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0px 3px 12px rgba(0,0,0,0.2)",
  },
  receiptBox: {
    padding: "15px",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "14px",
    color: "#333",
  },
  storeName: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "22px",
  },
  branchName: {
    textAlign: "center",
    fontSize: "16px",
  },
  address: {
    textAlign: "center",
    fontSize: "14px",
  },
  phone: {
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "10px",
  },
  separator: {
    border: "none",
    borderTop: "1px dashed #333",
    margin: "5px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    margin: "3px 0",
  },
  sectionTitle: {
    fontSize: "16px",
    margin: "5px 0",
    fontWeight: "bold",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "3px 0",
  },
  itemName: {
    flex: 2,
  },
  itemQty: {
    flex: 1,
    textAlign: "center",
  },
  itemAmount: {
    flex: 1,
    textAlign: "right",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "3px 0",
  },
  footer: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  actions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
  },
  printBtn: {
    padding: "12px 24px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "15px",
  },
  closeBtn: {
    padding: "12px 24px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "15px",
  },
};
