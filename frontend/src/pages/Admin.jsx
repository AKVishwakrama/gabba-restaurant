import React, { useEffect, useState } from "react";
import "./Admin.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Admin() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [metricsRes, usersRes] = await Promise.all([
          api.get("/admin/metrics"),
          api.get("/admin/users"),
        ]);

        setMetrics(metricsRes.data);
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
            "Failed to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="empty-state">
          Please login to access the owner dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="empty-state">
          Loading owner dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap">
        <div className="error-banner">
          {error}
        </div>
      </div>
    );
  }

  const overview = metrics.overview;

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">
            GABBA BITE
          </p>

          <h1>Owner Dashboard</h1>

          <p>
            Understand your restaurant performance
            at a glance.
          </p>
        </div>

        <div className="admin-welcome">
          Welcome, {user.name}
        </div>
      </div>

      {/* NAVIGATION */}

      <div className="admin-tabs">
        <button
          className={
            activeTab === "overview"
              ? "active"
              : ""
          }
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={
            activeTab === "products"
              ? "active"
              : ""
          }
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>

        <button
          className={
            activeTab === "users"
              ? "active"
              : ""
          }
          onClick={() => setActiveTab("users")}
        >
          Customers
        </button>
      </div>

      {/* OVERVIEW */}

      {activeTab === "overview" && (
        <>
          <div className="admin-stats">

            <StatCard
              title="Total Revenue"
              value={`₹${overview.totalRevenue.toFixed(0)}`}
              subtitle="All non-cancelled orders"
            />

            <StatCard
              title="Total Orders"
              value={overview.totalOrders}
              subtitle="Orders received"
            />

            <StatCard
              title="Customers"
              value={overview.totalUsers}
              subtitle="Registered users"
            />

            <StatCard
              title="Today's Orders"
              value={overview.ordersToday}
              subtitle={`₹${overview.revenueToday.toFixed(
                0
              )} today`}
            />

            <StatCard
              title="Average Order"
              value={`₹${overview.averageOrder.toFixed(
                0
              )}`}
              subtitle="Average order value"
            />

            <StatCard
              title="Active Users"
              value={overview.activeUsers}
              subtitle="Currently active"
            />

          </div>

          <div className="admin-chart-grid">

            {/* SALES */}

            <div className="admin-panel admin-chart-large">

              <div className="panel-heading">
                <div>
                  <h2>Sales Overview</h2>
                  <p>
                    Revenue and orders over the
                    last 7 days
                  </p>
                </div>
              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart
                  data={metrics.dailySales}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#111827"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#f97316"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>

            {/* ORDER STATUS */}

            <div className="admin-panel">

              <h2>Order Status</h2>

              <p>
                Current order distribution
              </p>

              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>

                  <Pie
                    data={metrics.orderStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {metrics.orderStatus.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={
                            [
                              "#111827",
                              "#f97316",
                              "#22c55e",
                              "#eab308",
                              "#ef4444",
                            ][
                              index %
                                5
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* TOP PRODUCTS */}

          <div className="admin-panel">

            <div className="panel-heading">

              <div>
                <h2>Best Selling Products</h2>

                <p>
                  Items customers order the most
                </p>
              </div>

            </div>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <BarChart
                data={metrics.topProducts}
                layout="vertical"
                margin={{
                  left: 30,
                  right: 30,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis type="number" />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                />

                <Tooltip />

                <Bar
                  dataKey="quantitySold"
                  name="Units Sold"
                  fill="#f97316"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* AREAS + RECENT ORDERS */}

          <div className="admin-two-column">

            <div className="admin-panel">

              <h2>Top Delivery Areas</h2>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>

                  <tbody>

                    {metrics.areas.map(
                      (area) => (
                        <tr key={area.area}>
                          <td>
                            {area.area}
                          </td>

                          <td>
                            {area.orders}
                          </td>

                          <td>
                            ₹
                            {Number(
                              area.revenue
                            ).toFixed(0)}
                          </td>
                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            <div className="admin-panel">

              <h2>Recent Orders</h2>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {metrics.recentOrders.map(
                      (order) => (
                        <tr key={order.id}>

                          <td>
                            #{order.id}
                          </td>

                          <td>
                            {order.customer_name}
                          </td>

                          <td>
                            ₹
                            {Number(
                              order.total
                            ).toFixed(0)}
                          </td>

                          <td>
                            <span className="status-badge">
                              {order.order_status}
                            </span>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        </>
      )}

      {/* PRODUCTS */}

      {activeTab === "products" && (
        <div className="admin-panel">

          <h2>Product Performance</h2>

          <p>
            Products ranked by quantity sold.
          </p>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>

                {metrics.topProducts.map(
                  (product, index) => (
                    <tr key={product.id}>

                      <td>
                        #{index + 1}
                      </td>

                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      <td>
                        {product.quantitySold}
                      </td>

                      <td>
                        ₹
                        {product.revenue.toFixed(
                          0
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* USERS */}

      {activeTab === "users" && (
        <div className="admin-panel">

          <div className="panel-heading">

            <div>
              <h2>Registered Customers</h2>

              <p>
                All users registered on GabbaBite.
              </p>
            </div>

            <strong>
              {users.length} Customers
            </strong>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>

                {users.map((customer,index) => (
                  <tr key={customer.id}>
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      <strong>
                        {customer.name}
                      </strong>
                    </td>

                    <td>
                      {customer.email}
                    </td>

                    <td>
                      {customer.phone || "—"}
                    </td>

                    <td>
                      {customer.totalOrders}
                    </td>

                    <td>
                      ₹
                      {customer.totalSpent.toFixed(
                        0
                      )}
                    </td>

                    <td>
                      {new Date(
                        customer.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="admin-stat-card">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {subtitle}
      </small>

    </div>
  );
}