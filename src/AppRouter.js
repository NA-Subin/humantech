import { Routes, Route } from "react-router-dom";
import DomainLogin from "./components/login/login-user/Login";
import RequestDomainForm from "./components/registration/RegistationDomain";
import AdminApproveDomainForm from "./components/registration/ConfigDomain";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import SideBarCompany from "./components/company/SideBarCompany";
import CompanyDeshboard from "./components/company/Deshboard";
import CompanyTodolist from "./components/company/organization/TodoList";
import CompanyManage from "./components/company/organization/Manage";
import ManageCompany from "./components/company/organization/ManageCompnay";
import CompanyEmployeeGroup from "./components/company/setting/EmployeeGroup";
import CompanyEmployee from "./components/company/setting/Employee";
import CompanyDoman from "./components/company/setting/Doman";
import CompanyScanner from "./components/company/setting/Scanner";
import CompanyEmployeeProfile from "./components/company/Profile";
import theme from "./theme/theme";
import { Box } from "@mui/material";

function CompanyRoutes() {
  return (
    <Routes>
      <Route path="deshboard" element={<CompanyDeshboard />} />
      <Route path="todo-list" element={<CompanyTodolist />} />
      <Route path="manage" element={<CompanyManage />} />
      <Route path="manage/:companyName" element={<ManageCompany />} />
      <Route path="employee-group" element={<CompanyEmployeeGroup />} />
      <Route path="employee" element={<CompanyEmployee />} />
      <Route path="domain" element={<CompanyDoman />} />
      <Route path="scanner" element={<CompanyScanner />} />
      <Route path="employee-profile" element={<CompanyEmployeeProfile />} />
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
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Company routes under layout */}
        <Route
          path="/company/*"
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
