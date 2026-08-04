import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Admin() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get("/admin/metrics")
      .then((res) => setMetrics(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard metrics."));
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="empty-state">Please login to see the owner dashboard.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2>Owner Dashboard</h2>
      <p className="subtle">Live order and delivery analytics for Gabba Home Delivery.</p>
      {error && <div className="error-banner">{error}</div>}
      {!metrics ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="metric-card">
            <span className="metric-label">Active users</span>
            <strong>{metrics.activeUsers}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total orders</span>
            <strong>{metrics.totalOrders}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Revenue</span>
            <strong>₹{metrics.totalRevenue.toFixed(2)}</strong>
          </div>

          <div className="dashboard-panel">
            <h3>Top delivery areas</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.areaStats.map((area) => (
                    <tr key={area.area}>
                      <td>{area.area}</td>
                      <td>{area.orders}</td>
                      <td>₹{area.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-panel" style={{ gridColumn: "1 / -1" }}>
            <h3>Recent orders</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Area</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.delivery_area || "Unknown"}</td>
                      <td>₹{Number(order.total).toFixed(2)}</td>
                      <td>{order.order_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
