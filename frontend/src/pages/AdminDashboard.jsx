
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard, ShoppingBag, Package, Users, ChartNoAxesCombined,
  Search, Bell, LogOut, Menu, X, RefreshCw, Plus, Pencil, Trash2,
  Eye, TrendingUp, IndianRupee, Clock3, CheckCircle2, Truck,
  AlertTriangle, ChevronDown, CalendarDays
} from "lucide-react";
import "./AdminDashboard.css";

const API = import.meta.env.VITE_API_URL;

const emptyProduct = {
  name: "",
  description: "",
  category: "Necklaces",
  material: "Gold",
  price: "",
  originalPrice: "",
  stock: "",
  image: "",
  purity: "22K",
  audience: "Women"
};

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("thangamayil_user") || "null");
  } catch {
    return null;
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function getOrderStatus(order) {
  const rawStatus = String(order.orderStatus || order.status || "Pending")
    .trim()
    .toUpperCase();

  const statusLabels = {
    PLACED: "Pending",
    PENDING: "Pending",
    PROCESSING: "Processing",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    CANCELED: "Cancelled",
  };

  return statusLabels[rawStatus] || "Pending";
}

function getOrderTotal(order) {
  return Number(order.totalAmount ?? order.total ?? order.amount ?? 0);
}

function getProductName(product) {
  return product.name || product.title || "Unnamed product";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = readUser();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);

  const token = localStorage.getItem("thangamayil_token");

  const logout = () => {
    localStorage.removeItem("thangamayil_token");
    localStorage.removeItem("thangamayil_user");
    localStorage.removeItem("thangamayil_logged_in");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const apiRequest = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${localStorage.getItem("thangamayil_token") || ""}`,
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error(data.message || "Admin access denied. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }, []);

  const loadDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const results = await Promise.allSettled([
        apiRequest("/admin/dashboard"),
        apiRequest("/admin/orders"),
        apiRequest("/admin/products"),
        apiRequest("/admin/customers")
      ]);

      const [statsResult, ordersResult, productsResult, customersResult] = results;

      if (statsResult.status === "fulfilled") {
        const data = statsResult.value;
        setStats(data.stats || data.data?.stats || data.data || data);
      } else {
        console.error("Dashboard:", statsResult.reason);
      }

      if (ordersResult.status === "fulfilled") {
        const data = ordersResult.value;
        setOrders(data.orders || data.data?.orders || data.data || []);
      } else {
        console.error("Orders:", ordersResult.reason);
      }

      if (productsResult.status === "fulfilled") {
        const data = productsResult.value;
        setProducts(data.products || data.data?.products || data.data || []);
      } else {
        console.error("Products:", productsResult.reason);
      }

      if (customersResult.status === "fulfilled") {
        const data = customersResult.value;
        setCustomers(data.customers || data.data?.customers || data.data || []);
      } else {
        console.error("Customers:", customersResult.reason);
      }

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length === results.length) {
        toast.error(failed[0].reason?.message || "Unable to load admin data");
      } else if (failed.length) {
        console.warn("Some admin sections could not be loaded.");
      }
    } catch (error) {
      toast.error(error.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "admin") {
      navigate("/account", { replace: true });
      return;
    }

    loadDashboard();
  }, [token, user?.role, navigate, loadDashboard]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return orders.filter((order) => {
      const customer = order.user || order.customer || {};
      const status = getOrderStatus(order);
      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      const searchable = [
        order._id,
        order.orderNumber,
        customer.name,
        customer.email,
        order.shippingAddress?.name
      ].join(" ").toLowerCase();

      return matchesStatus && searchable.includes(query);
    });
  }, [orders, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((product) =>
      [
        getProductName(product),
        product.category,
        product.material,
        product._id
      ].join(" ").toLowerCase().includes(query)
    );
  }, [products, search]);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return customers.filter((customer) =>
      [customer.name, customer.email, customer._id]
        .join(" ").toLowerCase().includes(query)
    );
  }, [customers, search]);

  const computedRevenue = orders.reduce((total, order) => {
    const status = getOrderStatus(order).toLowerCase();
    if (["cancelled", "canceled", "failed"].includes(status)) return total;
    return total + getOrderTotal(order);
  }, 0);

  const totalRevenue = Number(
    stats.totalRevenue ?? stats.revenue ?? computedRevenue
  );

  const totalOrders = Number(stats.totalOrders ?? orders.length);
  const totalProducts = Number(stats.totalProducts ?? products.length);
  const totalCustomers = Number(stats.totalUsers ?? stats.totalCustomers ?? customers.length);

  const pendingOrders = orders.filter((order) =>
    ["pending", "processing", "confirmed"].includes(getOrderStatus(order).toLowerCase())
  ).length;

  const lowStock = products.filter((product) =>
    Number(product.stock ?? product.stockQuantity ?? 0) <= 5
  );

  async function updateOrderStatus(orderId, orderStatus) {
    try {
      await apiRequest(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus })
      });
      toast.success("Order status updated");
      await loadDashboard(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductModal(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      ...emptyProduct,
      ...product,
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      stock: product.stock ?? product.stockQuantity ?? "",
      image: product.image ?? product.imageUrl ?? product.images?.[0] ?? ""
    });
    setProductModal(true);
  }

  async function uploadProductImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 10 MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "thangamayil_products");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/d6xzgvfv/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed.");
      }

      setProductForm((previous) => ({
        ...previous,
        image: data.secure_url
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Cloudinary upload:", error);
      toast.error(error.message || "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (uploadingImage) {
      toast.error("Please wait until the image upload finishes.");
      return;
    }
    setSaving(true);

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice || productForm.price),
        stock: Number(productForm.stock)
      };

      const isEditing = Boolean(editingProduct?._id);
      await apiRequest(
        isEditing ? `/admin/products/${editingProduct._id}` : "/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      toast.success(isEditing ? "Product updated" : "Product added");
      setProductModal(false);
      await loadDashboard(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${getProductName(product)}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/admin/products/${product._id}`, {
        method: "DELETE"
      });
      toast.success("Product deleted");
      await loadDashboard(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: pendingOrders },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined }
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <div className="tm-admin">
      {sidebarOpen && (
        <button
          className="tm-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`tm-sidebar ${sidebarOpen ? "tm-sidebar-open" : ""}`}>
        <div className="tm-brand">
          <div className="tm-brand-mark">T</div>
          <div>
            <h2>THANGAMAYIL</h2>
            <span>JEWELS OF HERITAGE</span>
          </div>
          <button className="tm-mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="tm-side-label">MANAGEMENT</div>
        <nav className="tm-nav">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`tm-nav-link ${activeTab === id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(id);
                setSearch("");
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {count > 0 && <span className="tm-nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="tm-sidebar-bottom">
          <div className="tm-admin-profile">
            <div className="tm-avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div>
            <div className="tm-profile-text">
              <strong>{user?.name || "Administrator"}</strong>
              <span>Store Administrator</span>
            </div>
          </div>
          <button className="tm-logout" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
          <div className="tm-sidebar-footer">THANGAMAYIL © 2026</div>
        </div>
      </aside>

      <main className="tm-main">
        <header className="tm-topbar">
          <div className="tm-topbar-left">
            <button
              className="tm-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="tm-breadcrumb">THANGAMAYIL <span>/</span> ADMIN</div>
              <h1>
                {navItems.find((item) => item.id === activeTab)?.label || "Overview"}
              </h1>
            </div>
          </div>
          <div className="tm-topbar-actions">
            <span className="tm-live-indicator"><i /> Store connected</span>
            <button
              className="tm-icon-button"
              title="Refresh data"
              onClick={() => loadDashboard()}
            >
              <RefreshCw size={18} />
            </button>
            <button className="tm-icon-button" title="Low stock alerts" onClick={() => {
              setActiveTab("products");
              setSearch("");
            }}>
              <Bell size={18} />
              {lowStock.length > 0 && <i className="tm-notification-dot" />}
            </button>
          </div>
        </header>

        <div className="tm-content">
          <div className="tm-welcome-row">
            <div>
              <p className="tm-eyebrow">YOUR STORE AT A GLANCE</p>
              <h2>
                {activeTab === "overview" ? "Welcome back" : navItems.find((item) => item.id === activeTab)?.label}
                {activeTab === "overview" && <span>, {user?.name?.split(" ")[0] || "Admin"}.</span>}
              </h2>
              <p className="tm-subtitle">Manage your jewellery store with confidence.</p>
            </div>
            <button className="tm-button tm-button-secondary" onClick={() => loadDashboard()}>
              <RefreshCw size={16} /> Refresh data
            </button>
          </div>

          {loading && (
            <div className="tm-loading">
              <span className="tm-spinner" /> Loading live store data from MongoDB...
            </div>
          )}

          {!loading && activeTab === "overview" && (
            <>
              <section className="tm-stats-grid">
                <StatCard icon={IndianRupee} label="Store revenue*" value={money(totalRevenue)} note="Based on available order data" />
                <StatCard icon={ShoppingBag} label="Total orders" value={totalOrders.toLocaleString("en-IN")} note={`${pendingOrders} need attention`} />
                <StatCard icon={Package} label="Products" value={totalProducts.toLocaleString("en-IN")} note={`${lowStock.length} low-stock items`} />
                <StatCard icon={Users} label="Customers" value={totalCustomers.toLocaleString("en-IN")} note="Registered accounts" />
              </section>

              <section className="tm-overview-grid">
                <div className="tm-panel tm-revenue-panel">
                  <div className="tm-panel-heading">
                    <div>
                      <span className="tm-eyebrow">SALES PERFORMANCE</span>
                      <h3>Order revenue</h3>
                    </div>
                    <span className="tm-period"><CalendarDays size={15} /> All loaded orders</span>
                  </div>
                  <RevenueChart orders={orders} />
                  <p className="tm-chart-note">
                    *Estimated from available orders. This is not verified paid revenue unless your payment records confirm successful payments.
                  </p>
                </div>

                <div className="tm-panel tm-insight-panel">
                  <div className="tm-panel-heading">
                    <div>
                      <span className="tm-eyebrow">STORE HEALTH</span>
                      <h3>Needs attention</h3>
                    </div>
                    <AlertTriangle size={19} className="tm-gold-icon" />
                  </div>
                  <button className="tm-insight-row" onClick={() => setActiveTab("orders")}>
                    <span className="tm-insight-icon"><Clock3 size={18} /></span>
                    <span><strong>Pending orders</strong><small>Orders awaiting next action</small></span>
                    <b>{pendingOrders}</b>
                  </button>
                  <button className="tm-insight-row" onClick={() => {
                    setActiveTab("products");
                    setSearch("");
                  }}>
                    <span className="tm-insight-icon"><AlertTriangle size={18} /></span>
                    <span><strong>Low inventory</strong><small>Five or fewer units in stock</small></span>
                    <b>{lowStock.length}</b>
                  </button>
                  <button className="tm-insight-row" onClick={() => setActiveTab("customers")}>
                    <span className="tm-insight-icon"><Users size={18} /></span>
                    <span><strong>Registered customers</strong><small>Customer accounts</small></span>
                    <b>{totalCustomers}</b>
                  </button>
                </div>
              </section>

              <section className="tm-panel tm-recent-panel">
                <div className="tm-panel-heading">
                  <div>
                    <span className="tm-eyebrow">LATEST ACTIVITY</span>
                    <h3>Recent orders</h3>
                  </div>
                  <button className="tm-text-button" onClick={() => setActiveTab("orders")}>View all orders →</button>
                </div>
                <OrderTable orders={recentOrders} onStatusChange={updateOrderStatus} compact />
              </section>
            </>
          )}

          {!loading && activeTab === "orders" && (
            <section className="tm-panel tm-list-panel">
              <div className="tm-list-toolbar">
                <div>
                  <h3>Order management</h3>
                  <p>Review purchases and update fulfilment status.</p>
                </div>
                <div className="tm-toolbar-controls">
                  <SearchBox value={search} onChange={setSearch} placeholder="Search order or customer..." />
                  <select className="tm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {["All", "Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <OrderTable orders={filteredOrders} onStatusChange={updateOrderStatus} />
            </section>
          )}

          {!loading && activeTab === "products" && (
            <section className="tm-panel tm-list-panel">
              <div className="tm-list-toolbar">
                <div>
                  <h3>Product inventory</h3>
                  <p>Manage catalogue, prices and stock.</p>
                </div>
                <div className="tm-toolbar-controls">
                  <SearchBox value={search} onChange={setSearch} placeholder="Search products..." />
                  <button className="tm-button" onClick={openAddProduct}><Plus size={17} /> Add product</button>
                </div>
              </div>
              <div className="tm-table-wrap">
                <table className="tm-table">
                  <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const stock = Number(product.stock ?? product.stockQuantity ?? 0);
                      const image = product.image || product.imageUrl || product.images?.[0];
                      return (
                        <tr key={product._id}>
                          <td><div className="tm-product-cell">
                            {image ? <img src={image} alt="" /> : <div className="tm-product-placeholder"><Package size={19} /></div>}
                            <div><strong>{getProductName(product)}</strong><small>{product.material || "Jewellery"}{product.purity ? ` · ${product.purity}` : ""}</small></div>
                          </div></td>
                          <td>{product.category || "—"}</td>
                          <td><strong>{money(product.price)}</strong></td>
                          <td>{stock}</td>
                          <td><StatusBadge status={stock <= 5 ? "Low stock" : "In stock"} /></td>
                          <td><div className="tm-action-buttons">
                            <button title="Edit product" onClick={() => openEditProduct(product)}><Pencil size={16} /></button>
                            <button title="Delete product" className="tm-delete-action" onClick={() => deleteProduct(product)}><Trash2 size={16} /></button>
                          </div></td>
                        </tr>
                      );
                    })}
                    {filteredProducts.length === 0 && <EmptyRow columns={6} text="No products found." />}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading && activeTab === "customers" && (
            <section className="tm-panel tm-list-panel">
              <div className="tm-list-toolbar">
                <div><h3>Customer directory</h3><p>Registered customer accounts from the database.</p></div>
                <SearchBox value={search} onChange={setSearch} placeholder="Search customers..." />
              </div>
              <div className="tm-table-wrap">
                <table className="tm-table">
                  <thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>ROLE</th><th>REGISTERED</th></tr></thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td><div className="tm-customer-cell"><span>{(customer.name || "C").charAt(0).toUpperCase()}</span><strong>{customer.name || "Customer"}</strong></div></td>
                        <td>{customer.email || "—"}</td>
                        <td><StatusBadge status={customer.role || "customer"} /></td>
                        <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && <EmptyRow columns={4} text="No customers found." />}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {!loading && activeTab === "analytics" && (
            <section className="tm-analytics-grid">
              <div className="tm-panel tm-analytics-main">
                <span className="tm-eyebrow">ORDER PERFORMANCE</span>
                <h3>Order status breakdown</h3>
                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
                  const count = orders.filter((order) => getOrderStatus(order).toLowerCase() === status.toLowerCase()).length;
                  const percent = orders.length ? (count / orders.length) * 100 : 0;
                  return <div className="tm-breakdown" key={status}>
                    <div><span>{status}</span><strong>{count}</strong></div>
                    <div className="tm-progress-track"><span style={{ width: `${percent}%` }} /></div>
                  </div>;
                })}
              </div>
              <div className="tm-panel tm-analytics-summary">
                <span className="tm-eyebrow">CATALOGUE SUMMARY</span>
                <h3>Inventory snapshot</h3>
                <div className="tm-summary-number">{totalProducts}<small> products</small></div>
                <div className="tm-summary-line"><span>Low stock</span><strong>{lowStock.length}</strong></div>
                <div className="tm-summary-line"><span>Customers</span><strong>{totalCustomers}</strong></div>
                <div className="tm-summary-line"><span>Orders</span><strong>{totalOrders}</strong></div>
                <div className="tm-summary-line"><span>Order value estimate</span><strong>{money(totalRevenue)}</strong></div>
              </div>
            </section>
          )}

          <footer className="tm-footer">
            <span>THANGAMAYIL <span className="tm-footer-dot">✦</span> JEWELS OF HERITAGE</span>
            <span>Admin workspace · 2026</span>
          </footer>
        </div>
      </main>

      {productModal && (
        <div className="tm-modal-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setProductModal(false);
        }}>
          <form className="tm-product-modal" onSubmit={saveProduct}>
            <div className="tm-modal-heading">
              <div><span className="tm-eyebrow">CATALOGUE MANAGEMENT</span><h3>{editingProduct ? "Edit product" : "Add new product"}</h3></div>
              <button type="button" className="tm-icon-button" onClick={() => setProductModal(false)}><X size={19} /></button>
            </div>
            <div className="tm-form-grid">
              <label className="tm-form-full">Product name<input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></label>
              <label>Price (₹)<input type="number" min="0" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></label>
              <label>Original price (₹)<input type="number" min="0" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} /></label>
              <label>Stock quantity<input type="number" min="0" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></label>
              <label>Category<input required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></label>
              <label>Material<select value={productForm.material} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}><option>Gold</option><option>Silver</option><option>Diamond</option><option>Platinum</option></select></label>
              <label>Purity<input value={productForm.purity} onChange={(e) => setProductForm({ ...productForm, purity: e.target.value })} /></label>
              <label>Audience<select value={productForm.audience} onChange={(e) => setProductForm({ ...productForm, audience: e.target.value })}><option>Women</option><option>Men</option><option>Kids</option><option>Unisex</option></select></label>
              <div className="tm-form-full">
                <label>
                  Product image
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadProductImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <small>
                  Select a jewellery photo from your computer (maximum 10 MB).
                  {uploadingImage ? " Uploading image..." : ""}
                </small>
                {productForm.image && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={productForm.image}
                      alt="Product preview"
                      style={{
                        width: "130px",
                        height: "130px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #c8a45d"
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      className="tm-text-button"
                      onClick={() =>
                        setProductForm((previous) => ({ ...previous, image: "" }))
                      }
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
              <label className="tm-form-full">Or paste a direct image URL<input type="url" placeholder="https://...jpg" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} /></label>
              <label className="tm-form-full">Description<textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label>
            </div>
            <div className="tm-modal-actions">
              <button type="button" className="tm-button tm-button-secondary" onClick={() => setProductModal(false)}>Cancel</button>
              <button type="submit" className="tm-button" disabled={saving || uploadingImage}>{uploadingImage ? "Uploading image..." : saving ? "Saving..." : editingProduct ? "Save changes" : "Create product"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note }) {
  return <div className="tm-stat-card">
    <div className="tm-stat-top"><span>{label}</span><span className="tm-stat-icon"><Icon size={19} /></span></div>
    <strong className="tm-stat-value">{value}</strong>
    <span className="tm-stat-note">{note}</span>
  </div>;
}

function SearchBox({ value, onChange, placeholder }) {
  return <label className="tm-search-box"><Search size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /><kbd>⌕</kbd></label>;
}

function StatusBadge({ status }) {
  const value = String(status || "Pending");
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  return <span className={`tm-status tm-status-${normalized}`}>{value}</span>;
}

function EmptyRow({ columns, text }) {
  return <tr><td colSpan={columns} className="tm-empty-row">{text}</td></tr>;
}

function OrderTable({ orders, onStatusChange, compact = false }) {
  return <div className="tm-table-wrap">
    <table className="tm-table">
      <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>PAYMENT</th><th>STATUS</th></tr></thead>
      <tbody>
        {orders.map((order) => {
          const customer = order.user || order.customer || {};
          const status = getOrderStatus(order);
          const orderId = order.orderNumber || String(order._id || "").slice(-8).toUpperCase();
          const payment = order.paymentStatus || order.payment?.status || "Unspecified";
          return <tr key={order._id}>
            <td><strong className="tm-order-id">#{orderId}</strong></td>
            <td><div className="tm-customer-order"><strong>{customer.name || order.shippingAddress?.name || "Customer"}</strong><small>{customer.email || ""}</small></div></td>
            <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}</td>
            <td><strong>{money(getOrderTotal(order))}</strong></td>
            <td><StatusBadge status={payment} /></td>
            <td><select className={`tm-status-select tm-status-${status.toLowerCase()}`} value={status} onChange={(e) => onStatusChange(order._id, e.target.value)} aria-label={`Update status for order ${orderId}`}>
              {["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((item) => <option key={item}>{item}</option>)}
            </select></td>
          </tr>;
        })}
        {orders.length === 0 && <EmptyRow columns={6} text="No orders found." />}
      </tbody>
    </table>
  </div>;
}

function RevenueChart({ orders }) {
  const recent = [...orders]
    .filter((order) => !["cancelled", "canceled", "failed"].includes(getOrderStatus(order).toLowerCase()))
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .slice(-7);

  const max = Math.max(...recent.map(getOrderTotal), 1);

  if (!recent.length) {
    return <div className="tm-chart-empty"><ChartNoAxesCombined size={28} /><span>Order data will appear here when orders are available.</span></div>;
  }

  return <div className="tm-chart">
    {recent.map((order, index) => {
      const amount = getOrderTotal(order);
      const height = Math.max((amount / max) * 100, 5);
      return <div className="tm-chart-column" key={order._id || index} title={`${money(amount)} · ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Order"}`}>
        <span className="tm-chart-bar-value">{money(amount)}</span>
        <div className="tm-chart-bar-track"><span className="tm-chart-bar" style={{ height: `${height}%` }} /></div>
        <span className="tm-chart-label">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : `Order ${index + 1}`}</span>
      </div>;
    })}
  </div>;
}
