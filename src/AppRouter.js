import { Routes, Route, useSearchParams } from "react-router-dom";
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
import LevelDetail from "./components/company/structure/Level";
import DepartmentDetail from "./components/company/structure/Department";
import SectionDetail from "./components/company/structure/Section";
import PositionDetail from "./components/company/structure/Position";
import LeaveDetail from "./components/company/time/Leave";
import WorkShiftDetail from "./components/company/time/Workshift";
import SSODetail from "./components/company/structure/SSO";
import HolidayDetail from "./components/company/time/Holiday";
import TaxDetail from "./components/company/structure/Tax";
import TaxDeductionDetail from "./components/company/structure/TaxDeduction";
import EmployeeDetail from "./components/company/employee/Employee";
import OTDetail from "./components/company/time/OT";

// รวมหน้า company routes ตาม page query param
function CompanyRoutes({ page }: { page?: string }) {
  if (!page || page === "dashboard") {
    return <CompanyDeshboard />;
  }

  switch (page) {
    case "level":
      return <LevelDetail />;
    case "department":
      return <DepartmentDetail />;
    case "section":
      return <SectionDetail />;
    case "position":
      return <PositionDetail />;
    case "social-security":
      return <SSODetail />;
    case "employee":
      return <EmployeeDetail />;
    case "tax":
      return <TaxDetail />;
    case "deduction":
      return <TaxDeductionDetail />;
    case "leave":
      return <LeaveDetail />;
    case "ot":
      return <OTDetail />;
    case "workshift":
      return <WorkShiftDetail />;
    case "dayoff":
      return <HolidayDetail />;
    default:
      return <CompanyDeshboard />;
  }
}

// ตัวจัดการหลัก route ที่ใช้ query param
function MainEntry() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain");
  const company = searchParams.get("company");
  const page = searchParams.get("page");

  if (!domain) {
    return <DomainLogin />;
  }

  // กรณี page=dashboard แล้วมี company
  if (page === "dashboard" && company) {
    return (
      <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
        <SideBarCompany domain={domain} company={company} />
        <Box sx={{ flexGrow: 1 }}>
          <CompanyRoutes page={page} />
        </Box>
      </Box>
    );
  }

  // กรณี page=dashboard แต่ไม่มี company
  if (page === "dashboard" && !company) {
    return <Company domain={domain} />;
  }

  // กรณีมี company แต่ page ไม่ใช่ dashboard
  if (company) {
    return (
      <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
        <SideBarCompany domain={domain} company={company} />
        <Box sx={{ flexGrow: 1 }}>
          <CompanyRoutes page={page ?? undefined} />
        </Box>
      </Box>
    );
  }

  // กรณีมี domain แต่ไม่มี company และ page ไม่ใช่ dashboard
  return <Dashboard domain={domain} />;
}


// router หลัก
export default function AppRouter() {
  return (
    <Routes>
      {/* เส้นทางหลัก ใช้ query param */}
      <Route path="/" element={<MainEntry />} />

      {/* public routes */}
      <Route path="/register-domain" element={<RequestDomainForm />} />
      <Route path="/config-domain" element={<AdminApproveDomainForm />} />
    </Routes>
  );
}

// function CompanyRoutes() {
//   return (
//     <Routes>
//       <Route path="" element={<CompanyDeshboard />} />
//       <Route path="level" element={<LevelDetail />} />
//       <Route path="department" element={<DepartmentDetail />} />
//       <Route path="section" element={<SectionDetail />} />
//       <Route path="position" element={<PositionDetail />} />

//       <Route path="social-security" element={<SSODetail />} />
//       <Route path="employee" element={<EmployeeDetail />} />

//       <Route path="tax" element={<TaxDetail />} />
//       <Route path="deduction" element={<TaxDeductionDetail />} />
//       <Route path="leave" element={<LeaveDetail />} />
//       <Route path="workshift" element={<WorkShiftDetail />} />
//       <Route path="dayoff" element={<HolidayDetail />} />
//     </Routes>
//   );
// }

// export default function AppRouter() {
//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route path="/" element={<DomainLogin />} />
//       <Route path="/register-domain" element={<RequestDomainForm />} />
//       <Route path="/config-domain" element={<AdminApproveDomainForm />} />

//       {/* Protected routes */}
//       <Route element={<ProtectedRoute />}>
//         {/* Dashboard route */}
//         <Route path="/:domain" element={<Dashboard />} />
//         <Route path="/:domain/dashboard" element={<Company />} />
//         {/* <Route path="/company" element={<Company />} /> */}
//         {/* Company routes under layout */}
//         <Route
//           path="/:domain/:companyName/*"
//           element={
//             <Box sx={{ display: 'flex', backgroundColor: theme.palette.primary.light }}>
//               <SideBarCompany />
//               <Box sx={{ flexGrow: 1 }}>{/* nested routes here */}
//                 <CompanyRoutes />
//               </Box>
//             </Box>
//           }
//         />
//       </Route>
//     </Routes>
//   );
// }
