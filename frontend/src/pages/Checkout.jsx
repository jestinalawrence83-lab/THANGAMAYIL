
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import "./Checkout.css";

const API = "http://localhost:5000/api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getToken() {
  return (
    localStorage.getItem("thangamayil_token") ||
    sessionStorage.getItem("thangamayil_token")
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout({
  cartProducts = [],
  cartTotal = 0,
}) {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const getOrderItems = () => {
    return cartProducts.map((product) => ({
      product:
        product._id ||
        product.product?._id ||
        product.product ||
        product.productId ||
        product.id,
      quantity: Number(product.quantity || 1),
    }));
  };

  const getShippingAddress = () => ({
    fullName: customer.fullName.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    city: customer.city.trim(),
    state: customer.state.trim(),
    pincode: customer.pincode.trim(),
  });

  const clearCartAfterOrder = (order) => {
    window.dispatchEvent(
      new CustomEvent("thangamayil-order-placed", {
        detail: { order },
      })
    );
  };

  const placeCODOrder = async (token, items, shippingAddress) => {
    const response = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        shippingAddress,
        paymentMethod: "COD",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.order) {
      throw new Error(data.message || "Unable to place COD order.");
    }

    setPlacedOrder(data.order);
    clearCartAfterOrder(data.order);
    toast.success("Your COD order has been placed!");
  };

  const placeRazorpayOrder = async (
    token,
    items,
    shippingAddress
  ) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Unable to load Razorpay. Check your internet connection.");
    }

    // Create Razorpay order on our backend.
    const createResponse = await fetch(
      `${API}/orders/razorpay/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          shippingAddress,
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok || !createData.success) {
      throw new Error(
        createData.message || "Unable to start online payment."
      );
    }

    return new Promise((resolve, reject) => {
      let completed = false;

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "THANGAMAYIL",
        description: "Jewels of Heritage",
        order_id: createData.razorpayOrderId,

        prefill: {
          name: customer.fullName.trim(),
          email: customer.email.trim(),
          contact: customer.phone.trim(),
        },

        theme: {
          color: "#c8a45d",
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API}/orders/razorpay/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...paymentResponse,
                  items,
                  shippingAddress,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success ||
              !verifyData.order
            ) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            completed = true;
            setPlacedOrder(verifyData.order);
            clearCartAfterOrder(verifyData.order);
            toast.success("Payment successful! Your order is confirmed.");
            resolve(verifyData.order);
          } catch (error) {
            completed = true;
            toast.error(error.message);
            reject(error);
          } finally {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: function () {
            if (!completed) {
              setPlacingOrder(false);
              toast.error("Payment was cancelled.");
              reject(new Error("Payment cancelled."));
            }
          },
        },
      };

      const paymentWindow = new window.Razorpay(options);

      paymentWindow.on("payment.failed", function (response) {
        if (!completed) {
          completed = true;
          setPlacingOrder(false);

          const message =
            response.error?.description ||
            "Payment failed. Please try again.";

          toast.error(message);
          reject(new Error(message));
        }
      });

      paymentWindow.open();
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (placingOrder) return;

    if (!cartProducts.length) {
      toast.error("Your shopping bag is empty.");
      navigate("/cart");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login before placing your order.");
      navigate("/login");
      return;
    }

    const items = getOrderItems();

    if (items.some((item) => !item.product)) {
      toast.error("One or more products have an invalid ID.");
      return;
    }

    setPlacingOrder(true);

    try {
      const shippingAddress = getShippingAddress();

      if (paymentMethod === "COD") {
        await placeCODOrder(token, items, shippingAddress);
      } else {
        await placeRazorpayOrder(
          token,
          items,
          shippingAddress
        );
      }
    } catch (error) {
      if (error.message !== "Payment cancelled.") {
        toast.error(error.message || "Unable to place order.");
      }

      setPlacingOrder(false);
    }
  };

  if (placedOrder) {
    const isOnlinePayment =
      placedOrder.paymentMethod === "RAZORPAY";

    return (
      <main className="checkout-page">
        <section className="checkout-success">
          <CheckCircle2 size={52} />

          <span className="checkout-eyebrow">
            THANGAMAYIL
          </span>

          <h1>
            Thank you, <em>{customer.fullName}</em>
          </h1>

          <p>
            {isOnlinePayment
              ? "Your payment has been verified and your order is confirmed."
              : "Your Cash on Delivery order has been saved."}
          </p>

          <p>
            Order ID: <strong>{placedOrder._id}</strong>
          </p>

          <p>
            Total: <strong>{money(placedOrder.totalAmount)}</strong>
          </p>

          <p>
            Payment method:{" "}
            {isOnlinePayment ? "Online Payment" : "Cash on Delivery"}
          </p>

          <p>
            Payment status: <strong>{placedOrder.paymentStatus}</strong>
          </p>

          <button
            type="button"
            className="checkout-submit"
            onClick={() => navigate("/account")}
          >
            View My Account
          </button>

          <button
            type="button"
            className="checkout-submit"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <Link to="/cart" className="checkout-back">
        <ArrowLeft size={17} />
        Back to bag
      </Link>

      <header className="checkout-heading">
        <span className="checkout-eyebrow">
          THE FINAL TOUCH
        </span>

        <h1>
          Checkout <em>with care.</em>
        </h1>

        <p>Enter your delivery details to place your order.</p>
      </header>

      {cartProducts.length === 0 ? (
        <section className="checkout-empty">
          <h2>Your bag is empty</h2>
          <p>Add jewellery before continuing to checkout.</p>

          <Link to="/" className="checkout-submit">
            Explore Jewellery
          </Link>
        </section>
      ) : (
        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={placeOrder}
          >
            <h2>Delivery Details</h2>

            <div className="checkout-field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={customer.fullName}
                onChange={updateField}
                required
                autoComplete="name"
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={customer.email}
                onChange={updateField}
                required
                autoComplete="email"
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Mobile number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={updateField}
                required
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                placeholder="10-digit mobile number"
                autoComplete="tel"
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="address">Full address</label>
              <textarea
                id="address"
                name="address"
                value={customer.address}
                onChange={updateField}
                required
                rows={3}
                autoComplete="street-address"
              />
            </div>

            <div className="checkout-two-columns">
              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={customer.city}
                  onChange={updateField}
                  required
                  autoComplete="address-level2"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  value={customer.state}
                  onChange={updateField}
                  required
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label htmlFor="pincode">PIN code</label>
              <input
                id="pincode"
                name="pincode"
                value={customer.pincode}
                onChange={updateField}
                required
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                autoComplete="postal-code"
              />
            </div>

            <h2 className="checkout-payment-heading">
              Payment Method
            </h2>

            <label className="checkout-payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <Banknote size={21} />

              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your jewellery arrives</small>
              </span>
            </label>

            <label className="checkout-payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="RAZORPAY"
                checked={paymentMethod === "RAZORPAY"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <CreditCard size={21} />

              <span>
                <strong>Pay Online with Razorpay</strong>
                <small>UPI, cards and supported payment methods</small>
              </span>
            </label>

            <p className="checkout-privacy-note">
              <ShieldCheck size={16} />
              Your order details are securely sent to the server.
            </p>

            <button
              className="checkout-submit"
              type="submit"
              disabled={placingOrder}
            >
              {placingOrder
                ? "Please wait..."
                : paymentMethod === "COD"
                  ? `Place COD Order · ${money(cartTotal)}`
                  : `Pay Online · ${money(cartTotal)}`}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Your Order</h2>

            {cartProducts.map((product) => {
              const id =
                product._id ||
                product.id ||
                product.productId ||
                product.product?._id;

              return (
                <div className="checkout-product" key={id}>
                  <img
                    src={product.image || product.imageUrl}
                    alt={product.name || product.title}
                  />

                  <div>
                    <strong>
                      {product.name || product.title}
                    </strong>
                    <span>Qty: {product.quantity}</span>
                  </div>

                  <strong>
                    {money(
                      Number(product.price || 0) *
                        Number(product.quantity || 1)
                    )}
                  </strong>
                </div>
              );
            })}

            <div className="checkout-total">
              <span>Subtotal</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <p className="checkout-warning">
              Final product prices and shipping charges are
              calculated by the server.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
