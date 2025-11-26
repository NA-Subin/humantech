import { Routes, Route, useSearchParams, useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
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
import SSODetail from "./components/company/salary/SSO";
import HolidayDetail from "./components/company/time/Holiday";
import TaxDetail from "./components/company/salary/Tax";
import TaxDeductionDetail from "./components/company/salary/TaxDeduction";
import Employee from "./components/company/employee/Employee";
import OTDetail from "./components/company/time/OT";
import ReportLeave from "./components/company/report/Leave";
import ReportOT from "./components/company/report/OT";
import ReportTime from "./components/company/report/Time";
import ReportWorkingOutside from "./components/company/report/WorkingOutside";
import ReportWorkCertificat from "./components/company/report/WorkCertificate";
import ReportSalaryCertificate from "./components/company/report/SalaryCertificate";
import CalculateSalary from "./components/company/calculate/CalculateSalary";
import { loadEncryptedCookie } from "./server/cookieUtils";
import { useEffect, useState } from "react";
import DomainLoginAdmin from "./components/login/login-admin/Login";
import IncomeDetail from "./components/company/salary/Income";
import DeductionsDetail from "./components/company/salary/Deductions";
import EmployeeTypeDetail from "./components/company/structure/EmployeeType";
import DashboardAttendant from "./components/attendant/DashboardAttendant";
import { database } from "./server/firebase";
import { onValue, ref } from "firebase/database";
import { ProjectFirebaseProvider } from "./server/ProjectFirebaseContext";
import ReportLoan from "./components/company/report/Loan";
import PrintDocument from "./components/company/calculate/PrintDocument";

// --- Protected Route Wrapper สำหรับ User ---
const ProtectedRouteWrapper = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const cookie = loadEncryptedCookie();

        if (!cookie) {
            navigate("/login", { replace: true });
            return;
        }

        // admin -> redirect ไป /config-domain
        if (cookie.role === "admin") {
            if (location.pathname !== "/config-domain") {
                navigate("/config-domain", { replace: true });
            }
        }
        // user -> ตรวจสอบ domain จาก cookie
        else {
            const savedDomain = cookie.domainKey;
            if (!savedDomain) {
                navigate("/login", { replace: true });
            }
        }
    }, [location, navigate]);

    return children;
};

// --- Admin Protected Route ---
const AdminProtectedRouteWrapper = ({ children }) => {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const cookie = loadEncryptedCookie();
        if (!cookie || cookie.role !== "admin") {
            navigate("/login-admin", { replace: true });
            return;
        }
        setAuthorized(true);
    }, [navigate]);

    if (!authorized) return null;
    return children;
};

// --- Company Routes (เหมือนเดิม) ---
function CompanyRoutes({ group, page }) {
    if (!group || group === "dashboard") return <CompanyDeshboard />;

    switch (group) {
        case "operation":
            switch (page) {
                case "level":
                    return <LevelDetail />;
                case "department":
                    return <DepartmentDetail />;
                case "section":
                    return <SectionDetail />;
                case "position":
                    return <PositionDetail />;
                case "employee-type":
                    return <EmployeeTypeDetail />;
                case "social-security":
                    return <SSODetail />;
                default:
                    return <CompanyDeshboard />;
            }
        case "salary":
            switch (page) {
                case "social-security":
                    return <SSODetail />;
                case "calculate":
                    return <CalculateSalary />;
                case "tax":
                    return <TaxDetail />;
                case "taxdeduction":
                    return <TaxDeductionDetail />;
                case "income":
                    return <IncomeDetail />;
                case "deductions":
                    return <DeductionsDetail />;
                default:
                    return <CompanyDeshboard />;
            }
        case "time":
            switch (page) {
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
        case "employee":
            switch (page) {
                case "employee":
                    return <Employee />;
                case "calculate":
                    return <CalculateSalary />;
                default:
                    return <CompanyDeshboard />;
            }
        case "report":
            switch (page) {
                case "leave":
                    return <ReportLeave />;
                case "ot":
                    return <ReportOT />;
                case "time":
                    return <ReportTime />;
                case "loan":
                    return <ReportLoan />;
                case "working-outside":
                    return <ReportWorkingOutside />;
                case "work-certificate":
                    return <ReportWorkCertificat />;
                case "salary-certificate":
                    return <ReportSalaryCertificate />;
                default:
                    return <CompanyDeshboard />;
            }
        case "attendant":
            return <DashboardAttendant />;
        case "print":
            return <PrintDocument />;
        default:
            return <CompanyDeshboard />;
    }
}

// --- Main Entry (path-based) ---
function MainEntry() {
    const { domain: pathDomain, company: pathCompany, group: pathGroup, page: pathPage } = useParams();
    const [domainData, setDomainData] = useState([]);
    const navigate = useNavigate();

    // โหลด domainData
    useEffect(() => {
        const optionRef = ref(database, `workgroupid`);
        onValue(optionRef, snapshot => {
            const data = snapshot.val();
            setDomainData(data ? Object.values(data) : []);
        });
    }, []);

    // ค่าใน localStorage / cookie
    const cookie = loadEncryptedCookie();
    const storedDomain = cookie?.domainKey || localStorage.getItem("domainKey") || pathDomain;
    const storedCompany = localStorage.getItem("company") || pathCompany;
    const storedGroup = localStorage.getItem("group") || pathGroup;
    const storedPage = localStorage.getItem("page") || pathPage;

    const domain = storedDomain;
    const companyId = storedCompany;

    // === group/page logic ===
    let group = storedGroup || "dashboard";
    let page = storedPage || "dashboard";

    // สำหรับ dashboard และ attendant ใช้แค่ group
    if (group === "dashboard" || group === "attendant") {
        page = null;
    }

    // ===============================
    //     REDIRECT LOGIC 
    // ===============================
    useEffect(() => {
        if (!domain) return;

        let redirectPath;
        if (!companyId) {
            redirectPath = `/${domain}/dashboard`;
        } else if (group === "dashboard" || group === "attendant") {
            redirectPath = `/${domain}/${companyId}/${group}`;
        } else {
            redirectPath = `/${domain}/${companyId}/${group}/${page}`;
        }

        const currentPath = `/${pathDomain || ""}/${pathCompany || ""}/${pathGroup || ""}${pathPage ? `/${pathPage}` : ""}`;

        if (currentPath !== redirectPath) {
            navigate(redirectPath, { replace: true });
        }
    }, [domain, companyId, group, page, pathDomain, pathCompany, pathGroup, pathPage, navigate]);

    // ถ้า domain ไม่มี → login
    if (!domain) return <Navigate to="/login" replace />;

    // หา groupType สำหรับ sidebar
    const groupType = domainData.find(item => item.domainKey === domain)?.grouptype;

    // ===============================
    //   RENDER CASES
    // ===============================

    // CASE 1: ยังไม่มี companyCode → แสดงหน้าเลือกบริษัท
    if (!companyId) {
        return <Company domain={domain} />;
    }

    // CASE 2: dashboard / attendant → ใช้แค่ group
    if (group === "dashboard" || group === "attendant") {
        return (
            <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
                {groupType !== "attendant" && <SideBarCompany domain={domain} company={companyId} />}
                <Box sx={{ flexGrow: 1 }}>
                    {group === "dashboard" ? <CompanyDeshboard /> : <DashboardAttendant />}
                </Box>
            </Box>
        );
    }

    // CASE 3: group อื่น → ใช้ group + page
    return (
        <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
            {groupType !== "attendant" && <SideBarCompany domain={domain} company={companyId} />}
            <Box sx={{ flexGrow: 1 }}>
                <CompanyRoutes group={group} page={page} />
            </Box>
        </Box>
    );
}


// --- App Router ---
export default function AppRouter() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<DomainLogin />} />
            <Route path="/login-admin" element={<DomainLoginAdmin />} />
            <Route path="/register-domain" element={<RequestDomainForm />} />

            {/* Admin-only */}
            <Route
                path="/config-domain"
                element={
                    <AdminProtectedRouteWrapper>
                        <AdminApproveDomainForm />
                    </AdminProtectedRouteWrapper>
                }
            />

            {/* User Routes (path-based) */}
            <Route
                path="/:domain/:page/*"
                element={
                    <ProtectedRouteWrapper>
                        <MainEntry />
                    </ProtectedRouteWrapper>
                }
            />
            <Route
                path="/:domain/*"
                element={
                    <ProtectedRouteWrapper>
                        <MainEntry />
                    </ProtectedRouteWrapper>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRouteWrapper>
                        <MainEntry />
                    </ProtectedRouteWrapper>
                }
            />
        </Routes>
    );
}