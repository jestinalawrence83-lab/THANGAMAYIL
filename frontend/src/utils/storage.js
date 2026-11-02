
const safeRead = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const readCart = () => safeRead("thangamayil_cart");

export const saveCart = (cart) => {
  try {
    localStorage.setItem("thangamayil_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to save cart:", error);
  }
};

export const readWishlist = () => safeRead("thangamayil_wishlist");

export const saveWishlist = (wishlist) => {
  try {
    localStorage.setItem("thangamayil_wishlist", JSON.stringify(wishlist));
  } catch (error) {
    console.error("Unable to save wishlist:", error);
  }
};
