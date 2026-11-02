import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ZoomIn,
  Gem,
} from "lucide-react";
import toast from "react-hot-toast";
import "./ProductDetails.css";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;
export default function ProductDetails({
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
}) {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        // First try to find the product in the complete API list.
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to connect to the products API.");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : [];

        const found = list.find((item) => {
          const productId = item._id ?? item.id;
          return String(productId) === String(id);
        });

        if (found) {
          if (active) setProduct(found);
          return;
        }

        // If the product is not in the list, try the individual API route.
        const detailResponse = await fetch(
          `${API_URL}/${encodeURIComponent(id)}`
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          const detailProduct =
            detailData.product ?? detailData.data ?? detailData;

          if (
            detailProduct &&
            (detailProduct._id || detailProduct.id || detailProduct.name)
          ) {
            if (active) setProduct(detailProduct);
            return;
          }
        }

        if (active) {
          setError("This product could not be found. Please return to the shop.");
        }
      } catch (err) {
        if (active) {
          setError(
            "Could not load product details. Please check that the backend is running."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    } else {
      setError("Product ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="product-not-found">
        <Gem size={40} />
        <h1>Loading Product...</h1>
        <p>Please wait while we load the product details.</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-not-found">
        <Gem size={40} />
        <h1>Product Not Found</h1>
        <p>{error || "This product is not available."}</p>
        <Link to="/">Back to Shop</Link>
      </main>
    );
  }

  const productId = String(product._id ?? product.id);
  const productName = product.name ?? product.title ?? "Jewellery";
  const image =
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images)
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url
      : "");

  const stock = Number(product.stock ?? 0);
  const saved = wishlist.some(
    (item) => String(item?._id ?? item?.id ?? item) === productId
  );

  const price = Number(product.price || 0).toLocaleString("en-IN");

  function addProduct() {
    if (!onAddToCart) {
      toast.error("Cart connection is not ready.");
      return;
    }

    onAddToCart(product, quantity);
    toast.success(`${quantity} x ${productName} added to bag`);
  }

  return (
    <main className="product-details-page">
      <Link to="/" className="details-back-link">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <section className="product-details-layout">
        <div className="details-image-column">
          <div
            className={`details-main-image ${zoomed ? "image-zoomed" : ""}`}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            {image ? (
              <img src={image} alt={productName} />
            ) : (
              <div className="product-image-fallback">
                <Gem size={40} />
                <p>Image not available</p>
              </div>
            )}

            <button
              type="button"
              className="image-zoom-button"
              onClick={() => setZoomed((value) => !value)}
            >
              <ZoomIn size={18} />
              {zoomed ? "Zoom out" : "Zoom in"}
            </button>
          </div>
        </div>

        <div className="details-information">
          <span>
            {product.audience || "Jewellery"} · {product.category || "Collection"}
          </span>

          <h1>{productName}</h1>

          <h2>₹{price}</h2>

          {(product.priceType === "DEMO" || product.isDemo === true) && (
            <p>Demo price only. Verify the actual price before purchase.</p>
          )}

          <p>{product.description || "Discover this jewellery piece from our collection."}</p>

          <div className="details-specifications">
            <p>Material: {product.material || "Not specified"}</p>
            <p>
              Purity:{" "}
              {product.specifications?.purity ||
                product.purity ||
                "Not verified"}
            </p>
            <p>
              Net Weight:{" "}
              {product.specifications?.netWeightGrams ||
              product.weight
                ? `${product.specifications?.netWeightGrams ?? product.weight} g`
                : "Not provided"}
            </p>
            <p>
              Gross Weight:{" "}
              {product.specifications?.grossWeightGrams
                ? `${product.specifications.grossWeightGrams} g`
                : "Not provided"}
            </p>
            <p>
              HUID: {product.specifications?.huid || "Not verified"}
            </p>
            <p>
              Certification:{" "}
              {product.specifications?.certification || "Not provided"}
            </p>
          </div>

          <p>{stock > 0 ? "Listed as available" : "Out of stock"}</p>

          <div className="details-purchase-row">
            <div className="quantity-selector">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((value) => Math.max(1, value - 1))
                }
              >
                <Minus size={16} />
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                disabled={quantity >= stock}
                onClick={() =>
                  setQuantity((value) => Math.min(stock, value + 1))
                }
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              className="details-add-button"
              disabled={stock < 1}
              onClick={addProduct}
            >
              <ShoppingBag size={18} /> Add to Bag
            </button>

            <button
              type="button"
              className="details-wishlist-button"
              onClick={() => onToggleWishlist?.(product)}
              aria-label="Toggle wishlist"
            >
              <Heart size={19} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}