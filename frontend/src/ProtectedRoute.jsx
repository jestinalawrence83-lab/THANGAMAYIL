
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("thangamayil_token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("thangamayil_user") || "null"
    );
  } catch {
    user = null;
  }

  if (!token || !user || !user.role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/account"}
        replace
      />
    );
  }

  return <Outlet />;
}
