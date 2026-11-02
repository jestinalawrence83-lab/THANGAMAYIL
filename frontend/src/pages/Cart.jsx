
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import "./Cart.css";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Cart({
  cartProducts = [],
  cartTotal = 0,
  changeQuantity,
  removeFromCart,
}) {
  const navigate = useNavigate();

  return (
    <main className="cart-page">
      <Link to="/" className="cart-back">
        <ArrowLeft size={17} /> Continue shopping
      </Link>

      <header className="cart-heading">
        <span className="cart-eyebrow">YOUR THANGAMAYIL SELECTION</span>
        <h1>Your Shopping <em>Bag</em></h1>
        <p>Your chosen treasures, gathered in one place.</p>
      </header>

      {cartProducts.length === 0 ? (
        <section className="cart-empty">
          <ShoppingBag size={44} />
          <h2>Your bag is waiting</h2>
          <p>You haven't added any jewellery yet.</p>
          <Link to="/" className="cart-gold-button">
            Explore Jewellery <ArrowRight size={17} />
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cartProducts.map((product) => (
              <article className="cart-item" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="cart-item-image"
                >
                  <img src={product.image} alt={product.name} />
                </Link>

                <div className="cart-item-info">
                  <span>
                    {product.material} · {product.category}
                  </span>

                  <Link
                    to={`/product/${product.id}`}
                    className="cart-item-name"
                  >
                    {product.name}
                  </Link>

                  <strong>{money(product.price)}</strong>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={product.quantity <= 1}
                      onClick={() =>
                        changeQuantity?.(product.id, -1)
                      }
                    >
                      <Minus size={14} />
                    </button>

                    <span>{product.quantity}</span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={
                        product.quantity >= Number(product.stock ?? 10)
                      }
                      onClick={() =>
                        changeQuantity?.(product.id, 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeFromCart?.(product.id)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <strong className="cart-line-total">
                  {money(Number(product.price || 0) * product.quantity)}
                </strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div>
              <span>Subtotal</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>Calculated later</strong>
            </div>

            <div className="cart-summary-total">
              <span>Estimated total</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <p className="cart-demo-note">
              Demo catalogue prices only. Actual jewellery prices,
              taxes and shipping must be verified before purchase.
            </p>

            <button
              type="button"
              className="cart-gold-button cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Continue to Checkout <ArrowRight size={17} />
            </button>

            <Link to="/" className="cart-continue-link">
              Continue exploring
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
