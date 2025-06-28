import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const domainData = localStorage.getItem("domainData");

  return domainData ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
