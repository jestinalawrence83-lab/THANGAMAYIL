import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  ArrowRight,
  Sparkles,
  UserRound,
  X,
  Check,
  Trash2,
  Gem,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import usePersistentState from "./hooks/usePersistentState";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import PeacockLogo from "./PeacockLogo";
import StoreLocation from "./components/StoreLocation";
import HeroCarousel from "./components/HeroCarousel";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;
const MATERIALS = ["All Materials", "Gold", "Silver", "Diamond", "Platinum"];
const AUDIENCES = ["All Audiences", "Women", "Kids", "Men"];

const CATEGORIES = [
  "All Categories",
  "Anklets",
  "Bangles",
  "Bracelets",
  "Bridal Sets",
  "Chains",
  "Chokers",
  "Earrings",
  "Haram",
  "Kadas",
  "Kasu Mala",
  "Necklaces",
  "Pendant Sets",
  "Pendants",
  "Rings",
  "Stud Earrings",
];

function getProductId(product) {
  return String(product?._id ?? product?.id ?? "");
}

function getProductName(product) {
  return product?.name ?? product?.title ?? "Jewellery";
}

function getProductPrice(product) {
  return Number(product?.price ?? product?.salePrice ?? 0);
}

function getProductImage(product) {
  const image =
    product?.image ??
    product?.imageUrl ??
    product?.images?.[0]?.url ??
    product?.images?.[0] ??
    "";

  return typeof image === "string" ? image : "";
}

function getProductMaterial(product) {
  return String(product?.material ?? product?.metal ?? "");
}

function getProductAudience(product) {
  return String(
    product?.audience ?? product?.gender ?? product?.collection ?? ""
  );
}

function getProductCategory(product) {
  return String(product?.category ?? "");
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("thangamayil_user") || "null");
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, adminOnly = false }) {
  const user = getSavedUser();
  const loggedIn = localStorage.getItem("thangamayil_logged_in") === "true";
  const token = localStorage.getItem("thangamayil_token");

  if (!user || (!loggedIn && !token)) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Login and Register pages-la header hide pannum
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Backend request failed (${response.status})`);
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : null;

        if (!list) {
          throw new Error("Backend response format is not a product list.");
        }

        if (isMounted) {
          setProducts(list);
          setProductsError("");
        }
      } catch (error) {
        if (isMounted) {
          setProductsError(error.message || "Unable to load products.");
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const [cart, setCart] = usePersistentState("thangamayil_cart", []);
  const [wishlist, setWishlist] = usePersistentState(
    "thangamayil_wishlist",
    []
  );

  const [search, setSearch] = useState("");
  const [selectedAudience, setSelectedAudience] =
    useState("All Audiences");
  const [selectedMaterial, setSelectedMaterial] =
    useState("All Materials");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const productList = products;

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const category = getProductCategory(product).toLowerCase();
      const material = getProductMaterial(product).toLowerCase();
      const audience = getProductAudience(product).toLowerCase();
      const searchText = search.trim().toLowerCase();

      return (
        (!searchText ||
          name.includes(searchText) ||
          category.includes(searchText) ||
          material.includes(searchText)) &&
        (selectedAudience === "All Audiences" ||
          audience.includes(selectedAudience.toLowerCase())) &&
        (selectedMaterial === "All Materials" ||
          material.includes(selectedMaterial.toLowerCase())) &&
        (selectedCategory === "All Categories" ||
          category === selectedCategory.toLowerCase())
      );
    });
  }, [
    productList,
    search,
    selectedAudience,
    selectedMaterial,
    selectedCategory,
  ]);

  const cartProducts = useMemo(
    () =>
      cart.map((item) => {
        const itemId = String(item.productId ?? item.id ?? "");
        const product = productList.find(
          (p) => getProductId(p) === itemId
        );

        return {
          ...(product ?? {}),
          ...item,
          productId: itemId,
          quantity: Math.max(1, Number(item.quantity ?? 1)),
        };
      }),
    [cart, productList]
  );

  const wishlistProducts = useMemo(
    () =>
      wishlist
        .map((item) => {
          const id =
            typeof item === "object" && item !== null
              ? getProductId(item)
              : String(item);

          return (
            productList.find((product) => getProductId(product) === id) ??
            (typeof item === "object" && item !== null ? item : null)
          );
        })
        .filter(Boolean),
    [wishlist, productList]
  );

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity ?? 1),
    0
  );

  const cartTotal = cartProducts.reduce(
    (total, item) =>
      total + getProductPrice(item) * Number(item.quantity ?? 1),
    0
  );

  function addToCart(product) {
    const productId = getProductId(product);

    if (!productId) {
      return toast.error("This product cannot be added right now");
    }

    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.productId ?? item.id ?? "") === productId
      );

      if (existing) {
        return current.map((item) =>
          String(item.productId ?? item.id ?? "") === productId
            ? {
                ...item,
                quantity: Number(item.quantity ?? 1) + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId,
          name: getProductName(product),
          price: getProductPrice(product),
          image: getProductImage(product),
          quantity: 1,
        },
      ];
    });

    toast.success("Added to your bag");
  }

  function removeFromCart(productId) {
    setCart((current) =>
      current.filter(
        (item) =>
          String(item.productId ?? item.id ?? "") !== String(productId)
      )
    );

    toast.success("Item removed from bag");
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.productId ?? item.id ?? "") === String(productId)
            ? {
                ...item,
                quantity: Number(item.quantity ?? 1) + amount,
              }
            : item
        )
        .filter((item) => Number(item.quantity) > 0)
    );
  }

  function toggleWishlist(product) {
    const productId = getProductId(product);

    if (!productId) {
      return toast.error("This product cannot be saved right now");
    }

    const exists = wishlist.some((item) => {
      const id =
        typeof item === "object" && item !== null
          ? getProductId(item)
          : String(item);

      return id === productId;
    });

    setWishlist((current) =>
      exists
        ? current.filter((item) => {
            const id =
              typeof item === "object" && item !== null
                ? getProductId(item)
                : String(item);

            return id !== productId;
          })
        : [...current, product]
    );

    toast.success(
      exists ? "Removed from wishlist" : "Added to wishlist"
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedAudience("All Audiences");
    setSelectedMaterial("All Materials");
    setSelectedCategory("All Categories");
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#171717",
            color: "#F5F0E6",
            border: "1px solid #C8A45D",
          },
        }}
      />

      {/* HEADER */}
      {!isAuthPage && (
        <header className="site-header">
          <div className="announcement-bar">
            AN HEIRLOOM OF ELEGANCE ✦ COMPLIMENTARY SHIPPING ON ORDERS ABOVE ₹999
          </div>

          <nav className="navbar">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            <PeacockLogo />

            <div className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>

              <a href="/#collections" onClick={() => setMobileMenuOpen(false)}>
                Collections
              </a>

              <a href="/#shop" onClick={() => setMobileMenuOpen(false)}>
                Shop All
              </a>

              <a href="/#story" onClick={() => setMobileMenuOpen(false)}>
                Our Story
              </a>
            </div>

            <div className="nav-actions">
              <label className="header-search">
                <Search size={17} />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);

                    if (window.location.pathname !== "/") {
                      navigate("/");
                    }
                  }}
                  placeholder="Search jewellery"
                  aria-label="Search jewellery"
                />
              </label>

              <button
                type="button"
                className="icon-button"
                aria-label="Wishlist"
                onClick={() => setWishlistOpen(true)}
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="nav-count">{wishlist.length}</span>
                )}
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label="Account"
                onClick={() => navigate("/account")}
              >
                <UserRound size={20} />
              </button>

              <button
                type="button"
                className="icon-button"
                aria-label="Shopping bag"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="nav-count">{cartCount}</span>
                )}
              </button>
            </div>
          </nav>
        </header>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <HeroCarousel />

              <section className="trust-strip">
                <div>
                  <Gem size={19} />
                  <span>Crafted with Care</span>
                </div>

                <div>
                  <Check size={19} />
                  <span>Timeless Designs</span>
                </div>

                <div>
                  <Sparkles size={19} />
                  <span>Made for Memories</span>
                </div>
              </section>

              <section className="collections-section" id="collections">
                <div className="section-heading">
                  <span className="eyebrow">DISCOVER YOUR STYLE</span>

                  <h2>
                    Collections <em>for every story</em>
                  </h2>

                  <p>
                    From timeless bridal treasures to everyday elegance.
                  </p>
                </div>

                <div className="collection-grid">
                  {[
                    {
                      name: "Bridal Jewellery",
                      subtitle: "FOR YOUR FOREVER MOMENT",
                      category: "Bridal Sets",
                      image:
                        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=90",
                    },
                    {
                      name: "Temple Treasures",
                      subtitle: "ROOTED IN HERITAGE",
                      category: "Necklaces",
                      image:
                        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=90",
                    },
                    {
                      name: "Everyday Elegance",
                      subtitle: "BEAUTY IN EVERY DETAIL",
                      category: "Earrings",
                      image:
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=90",
                    },
                  ].map((collection, index) => (
                    <button
                      type="button"
                      className={`collection-card collection-card-${index + 1}`}
                      key={collection.name}
                      onClick={() => {
                        setSelectedCategory(collection.category);

                        document.getElementById("shop")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    >
                      <img
                        src={collection.image}
                        alt={collection.name}
                        loading="lazy"
                      />

                      <div className="collection-overlay">
                        <span className="collection-subtitle">
                          {collection.subtitle}
                        </span>

                        <span className="collection-title">
                          {collection.name}
                        </span>

                        <span className="collection-explore">
                          EXPLORE COLLECTION
                          <ArrowRight size={17} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="shop-section" id="shop">
                <div className="section-heading">
                  <span className="eyebrow">THE THANGAMAYIL EDIT</span>

                  <h2>
                    Find your <em>forever piece</em>
                  </h2>

                  <p>Explore pieces selected for every occasion.</p>
                </div>

                <div className="filter-panel">
                  <div className="filter-row">
                    <label>
                      <span>Audience</span>

                      <select
                        value={selectedAudience}
                        onChange={(e) =>
                          setSelectedAudience(e.target.value)
                        }
                      >
                        {AUDIENCES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>

                      <ChevronDown size={15} />
                    </label>

                    <label>
                      <span>Material</span>

                      <select
                        value={selectedMaterial}
                        onChange={(e) =>
                          setSelectedMaterial(e.target.value)
                        }
                      >
                        {MATERIALS.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>

                      <ChevronDown size={15} />
                    </label>

                    <label>
                      <span>Category</span>

                      <select
                        value={selectedCategory}
                        onChange={(e) =>
                          setSelectedCategory(e.target.value)
                        }
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>

                      <ChevronDown size={15} />
                    </label>

                    <button
                      type="button"
                      className="clear-filters"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </div>

                  <div className="filter-summary">
                    <span>
                      {productsLoading
                        ? "Loading products..."
                        : `${filteredProducts.length} pieces to discover`}
                    </span>

                    <span>{selectedMaterial}</span>
                  </div>
                </div>

                {productsLoading ? (
                  <div className="empty-products">
                    <Gem size={36} />
                    <h3>Loading jewellery collections...</h3>
                    <p>Please wait while we fetch products.</p>
                  </div>
                ) : productsError ? (
                  <div className="empty-products">
                    <Gem size={36} />
                    <h3>Unable to load products</h3>
                    <p>{productsError}</p>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="product-grid">
                    {filteredProducts.map((product) => {
                      const productId = getProductId(product);

                      const isWishlisted = wishlist.some((item) => {
                        const id =
                          typeof item === "object" && item !== null
                            ? getProductId(item)
                            : String(item);

                        return id === productId;
                      });

                      return (
                        <article className="product-card" key={productId}>
                          <div className="product-image-wrap">
                            <Link to={`/product/${productId}`}>
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)}
                                  alt={getProductName(product)}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="product-image-fallback">
                                  <Gem size={35} />
                                  <span>THANGAMAYIL</span>
                                </div>
                              )}
                            </Link>

                            <button
                              type="button"
                              className={`wishlist-button ${
                                isWishlisted ? "is-wishlisted" : ""
                              }`}
                              aria-label={
                                isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              onClick={() => toggleWishlist(product)}
                            >
                              <Heart
                                size={19}
                                fill={
                                  isWishlisted ? "currentColor" : "none"
                                }
                              />
                            </button>
                          </div>

                          <div className="product-info">
                            <span className="product-category">
                              {getProductCategory(product)}
                            </span>

                            <Link
                              to={`/product/${productId}`}
                              className="product-name"
                            >
                              {getProductName(product)}
                            </Link>

                            <div className="product-price">
                              ₹
                              {getProductPrice(product).toLocaleString(
                                "en-IN"
                              )}

                              {product.priceType === "DEMO" && (
                                <span className="demo-price-note">
                                  Demo price
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className="add-to-bag-button"
                              onClick={() => addToCart(product)}
                            >
                              Add to Bag <Plus size={16} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-products">
                    <Gem size={36} />
                    <h3>No pieces found</h3>
                    <p>Try changing your search or filters.</p>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </section>

              <section className="story-section" id="story">
                <div>
                  <span className="eyebrow">OUR PROMISE</span>

                  <h2>
                    More than jewellery.{" "}
                    <em>A part of your story.</em>
                  </h2>
                </div>

                <p>
                  Every occasion holds a memory. Discover designs inspired
                  by tradition and created to accompany your most treasured
                  moments.
                </p>
              </section>
            </main>
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={productList}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cartProducts={cartProducts}
              cartTotal={cartTotal}
              changeQuantity={changeQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cartProducts={cartProducts}
              cartTotal={cartTotal}
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <main className="empty-products">
              <h2>Page not found</h2>

              <Link to="/" className="primary-button">
                Return to Home <ArrowRight size={17} />
              </Link>
            </main>
          }
        />
      </Routes>

      {/* STORE LOCATION - HOME PAGE ONLY */}
      {location.pathname === "/" && <StoreLocation />}

      {/* CART DRAWER */}
      {cartOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setCartOpen(false)}
          role="presentation"
        >
          <aside
            className="side-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">YOUR SELECTION</span>
                <h2>Your Shopping Bag ({cartCount})</h2>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Close bag"
                onClick={() => setCartOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            {cartProducts.length === 0 ? (
              <div className="drawer-empty">
                <ShoppingBag size={35} />
                <p>Your bag is waiting for something beautiful.</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/");
                  }}
                >
                  Explore Jewellery
                </button>
              </div>
            ) : (
              <>
                <div className="drawer-items">
                  {cartProducts.map((item) => (
                    <div className="drawer-product" key={item.productId}>
                      {getProductImage(item) ? (
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                        />
                      ) : (
                        <div className="drawer-product-placeholder">
                          <Gem size={22} />
                        </div>
                      )}

                      <div className="drawer-product-details">
                        <strong>{getProductName(item)}</strong>

                        <span>
                          ₹
                          {getProductPrice(item).toLocaleString("en-IN")}
                        </span>

                        <div className="quantity-controls">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              changeQuantity(item.productId, -1)
                            }
                          >
                            <Minus size={14} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              changeQuantity(item.productId, 1)
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="remove-item-button"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="drawer-bottom">
                  <div className="drawer-total">
                    <span>Subtotal</span>

                    <strong>
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <p>
                    Shipping and final charges are calculated at checkout.
                  </p>

                  <button
                    type="button"
                    className="primary-button drawer-checkout-button"
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/cart");
                    }}
                  >
                    View Full Bag <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* WISHLIST DRAWER */}
      {wishlistOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setWishlistOpen(false)}
          role="presentation"
        >
          <aside
            className="side-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">YOUR FAVOURITES</span>
                <h2>My Wishlist ({wishlistProducts.length})</h2>
              </div>

              <button
                type="button"
                className="icon-button"
                aria-label="Close wishlist"
                onClick={() => setWishlistOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="drawer-empty">
                <Heart size={35} />
                <p>Save the pieces you love and find them here.</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setWishlistOpen(false);
                    navigate("/");
                  }}
                >
                  Discover Pieces
                </button>
              </div>
            ) : (
              <div className="drawer-items">
                {wishlistProducts.map((item) => (
                  <div
                    className="drawer-product"
                    key={getProductId(item)}
                  >
                    {getProductImage(item) ? (
                      <img
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                      />
                    ) : (
                      <div className="drawer-product-placeholder">
                        <Gem size={22} />
                      </div>
                    )}

                    <div className="drawer-product-details">
                      <strong>{getProductName(item)}</strong>

                      <span>
                        ₹
                        {getProductPrice(item).toLocaleString("en-IN")}
                      </span>

                      <button
                        type="button"
                        className="text-action"
                        onClick={() => {
                          addToCart(item);
                          setWishlistOpen(false);
                        }}
                      >
                        Add to bag
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-item-button"
                      aria-label="Remove from wishlist"
                      onClick={() => toggleWishlist(item)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}