import { Routes, Route } from "react-router-dom";
import DomainLogin from "./components/login/login-user/Login";
import RequestDomainForm from "./components/registration/RegistationDomain";
import AdminApproveDomainForm from "./components/registration/ConfigDomain";
import Dashboard from "./components/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute"; // <- อย่าลืม import
import SideBarCompany from "./components/company/SideBarCompany";
import CompanyDeshboard from "./components/company/Deshboard";
import CompanyTodolist from "./components/company/organization/TodoList"
import CompanyManage from "./components/company/organization/Manage"
import CompanyEmployeeGroup from "./components/company/setting/EmployeeGroup"
import CompanyEmployee from "./components/company/setting/Employee"
import CompanyDoman from "./components/company/setting/Doman"
import CompanyScanner from "./components/company/setting/Scanner"
import CompanyEmployeeProfile from "./components/company/Profile"
import theme from "./theme/theme";
import { Box } from "@mui/material";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<DomainLogin />} />
      <Route path="/register-domain" element={<RequestDomainForm />} />
      <Route path="/config-domain" element={<AdminApproveDomainForm />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/company" element={
          <Box sx={{ display: 'flex', backgroundColor: theme.palette.primary.light, }}>
            <SideBarCompany />
            <CompanyDeshboard />
          </Box>
        } />
        <Route path="company/*" element={
          <Box sx={{ display: 'flex' }} >

            <SideBarCompany />

            <Box sx={{
              flexGrow: 1, backgroundColor: theme.palette.primary.light, backgroundSize: 'auto'
            }}>
              <Routes>
                <Route path="/deshboard" element={
                  < CompanyDeshboard />
                } />
                <Route path="/todo-list" element={
                  < CompanyTodolist />
                } />
                <Route path="/manage" element={
                  <CompanyManage />
                } />
                <Route path="/employee-group" element={
                  < CompanyEmployeeGroup />
                } />
                <Route path="/employee" element={
                  < CompanyEmployee />
                } />
                <Route path="/domain" element={
                  < CompanyDoman />
                } />
                <Route path="/scanner" element={
                  < CompanyScanner />
                } />
                <Route path="/employee-profile" element={
                  < CompanyEmployeeProfile />
                } />
              </Routes>
            </Box>
          </Box>
        }
        />
        {/* ✅ เพิ่มเส้นทางย่อยในนี้ได้ เช่น */}
        {/* <Route path="/dashboard/settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
}
