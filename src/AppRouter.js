import { Routes, Route } from "react-router-dom";
import DomainLogin from "./components/login/login-user/Login";
import RequestDomainForm from "./components/registration/RegistationDomain";
import AdminApproveDomainForm from "./components/registration/ConfigDomain";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import SideBarCompany from "./components/company/SideBarCompany";
import CompanyDeshboard from "./components/company/Deshboard";
import theme from "./theme/theme";
import { Box } from "@mui/material";
import Company from "./components/company/Company";
import LevelDetail from "./components/company/Level";
import DepartmentDetail from "./components/company/Department";
import PositionDetail from "./components/company/Position";

function CompanyRoutes() {
  return (
    <Routes>
      <Route path="" element={<CompanyDeshboard />} />
      <Route path="level" element={<LevelDetail />} />
      <Route path="department" element={<DepartmentDetail />} />
      <Route path="position" element={<PositionDetail />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<DomainLogin />} />
      <Route path="/register-domain" element={<RequestDomainForm />} />
      <Route path="/config-domain" element={<AdminApproveDomainForm />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard route */}
        <Route path="/:domain" element={<Dashboard />} />
        <Route path="/:domain/dashboard" element={<Company />} />
        {/* <Route path="/company" element={<Company />} /> */}
        {/* Company routes under layout */}
        <Route
          path="/:domain/:companyName/*"
          element={
            <Box sx={{ display: 'flex', backgroundColor: theme.palette.primary.light }}>
              <SideBarCompany />
              <Box sx={{ flexGrow: 1 }}>{/* nested routes here */}
                <CompanyRoutes />
              </Box>
            </Box>
          }
        />
      </Route>
    </Routes>
  );
}
