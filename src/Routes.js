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
import Setting from "./components/company/Setting";

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
function CompanyRoutes({ group, page, tabState, setTabState }) {
    if (!group || group === "dashboard") return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;

    switch (group) {
        case "operation":
            switch (page) {
                case "level":
                    return <LevelDetail tabState={tabState} setTabState={setTabState} />;
                case "department":
                    return <DepartmentDetail tabState={tabState} setTabState={setTabState} />;
                case "section":
                    return <SectionDetail tabState={tabState} setTabState={setTabState} />;
                case "position":
                    return <PositionDetail tabState={tabState} setTabState={setTabState} />;
                case "employee-type":
                    return <EmployeeTypeDetail tabState={tabState} setTabState={setTabState} />;
                case "social-security":
                    return <SSODetail tabState={tabState} setTabState={setTabState} />;
                default:
                    return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
            }
        case "salary":
            switch (page) {
                case "social-security":
                    return <SSODetail tabState={tabState} setTabState={setTabState} />;
                case "calculate":
                    return <CalculateSalary tabState={tabState} setTabState={setTabState} />;
                case "tax":
                    return <TaxDetail tabState={tabState} setTabState={setTabState} />;
                case "taxdeduction":
                    return <TaxDeductionDetail tabState={tabState} setTabState={setTabState} />;
                case "income":
                    return <IncomeDetail tabState={tabState} setTabState={setTabState} />;
                case "deductions":
                    return <DeductionsDetail tabState={tabState} setTabState={setTabState} />;
                default:
                    return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
            }
        case "time":
            switch (page) {
                case "leave":
                    return <LeaveDetail tabState={tabState} setTabState={setTabState} />;
                case "ot":
                    return <OTDetail tabState={tabState} setTabState={setTabState} />;
                case "workshift":
                    return <WorkShiftDetail tabState={tabState} setTabState={setTabState} />;
                case "dayoff":
                    return <HolidayDetail tabState={tabState} setTabState={setTabState} />;
                default:
                    return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
            }
        case "employee":
            switch (page) {
                case "employee":
                    return <Employee tabState={tabState} setTabState={setTabState} />;
                case "calculate":
                    return <CalculateSalary tabState={tabState} setTabState={setTabState} />;
                default:
                    return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
            }
        case "report":
            switch (page) {
                case "leave":
                    return <ReportLeave tabState={tabState} setTabState={setTabState} />;
                case "ot":
                    return <ReportOT tabState={tabState} setTabState={setTabState} />;
                case "time":
                    return <ReportTime tabState={tabState} setTabState={setTabState} />;
                case "loan":
                    return <ReportLoan tabState={tabState} setTabState={setTabState} />;
                case "working-outside":
                    return <ReportWorkingOutside tabState={tabState} setTabState={setTabState} />;
                case "work-certificate":
                    return <ReportWorkCertificat tabState={tabState} setTabState={setTabState} />;
                case "salary-certificate":
                    return <ReportSalaryCertificate tabState={tabState} setTabState={setTabState} />;
                default:
                    return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
            }
        case "attendant":
            return <DashboardAttendant tabState={tabState} setTabState={setTabState} />;
        default:
            return <CompanyDeshboard tabState={tabState} setTabState={setTabState} />;
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

    // อ่าน tabId จาก query string หรือ sessionStorage
    const searchParams = new URLSearchParams(window.location.search);
    const urlTabId = searchParams.get("tabId");
    let tabId = urlTabId || sessionStorage.getItem("tabId");
    if (!tabId) {
        tabId = crypto.randomUUID();
        sessionStorage.setItem("tabId", tabId);
    }

    // โหลด tabState ของแท็บนี้
    const cookie = loadEncryptedCookie();
    const allTabsState = JSON.parse(localStorage.getItem("tabsState") || "{}");
    const initialTabState = allTabsState[tabId] || {};

    // const [tabState, setTabState] = useState({
    //     domain: initialTabState.domain || cookie?.domainKey || pathDomain,
    //     company: initialTabState.company || pathCompany,
    //     group: initialTabState.group || pathGroup || "dashboard",
    //     page: initialTabState.page || pathPage || "dashboard"
    // });
    const [tabState, setTabState] = useState({
        domain: initialTabState.domain || cookie?.domainKey || pathDomain,
        company: initialTabState.company || pathCompany,
        group: initialTabState.group || pathGroup || "dashboard",
        page:
            initialTabState.page ??
            (["dashboard", "attendant", "print", "setting"].includes(pathGroup)
                ? null
                : pathPage ?? null)
    });


    const { domain, company: companyId, group, page } = tabState;
    const effectivePage = group === "dashboard" || group === "attendant" || group === "setting" ? null : page;

    // บันทึก tabState ของแท็บนี้ลง localStorage
    useEffect(() => {
        const allTabsState = JSON.parse(localStorage.getItem("tabsState") || "{}");
        allTabsState[tabId] = tabState;
        localStorage.setItem("tabsState", JSON.stringify(allTabsState));
    }, [tabState, tabId]);

    // Redirect logic
    useEffect(() => {
        if (!domain) return;

        let redirectPath;
        if (!companyId) redirectPath = `/${domain}/dashboard`;
        else if (group === "dashboard" || group === "attendant" || group === "print" || group === "setting")
            redirectPath = `/${domain}/${companyId}/${group}`;
        else redirectPath = `/${domain}/${companyId}/${group}/${page}`;

        const currentPath = window.location.pathname;
        if (currentPath !== redirectPath) {
            navigate(redirectPath, { replace: true });
        }
    }, [domain, companyId, group, page, navigate]);

    // Title
    useEffect(() => {
        if (!companyId && !group && !page) {
            document.title = domain || "My System";
            return;
        }

        const groupMap = {
            OPERATION: "โครงสร้างองค์กร",
            SALARY: "เงินเดือนและภาษี",
            TIME: "เวลาทำงาน",
            EMPLOYEE: "โครงสร้างพนักงาน",
            REPORT: "เอกสารและการอนุมัติ",
            DASHBOARD: "Dashboard",
            ATTENDANT: "บันทึกเวลา",
            PRINT: "พิมพ์เอกสาร"
        };

        const pageMap = {
            LEVEL: "ระดับงาน",
            DEPARTMENT: "แผนก",
            SECTION: "ฝ่าย",
            POSITION: "ตำแหน่งงาน",
            "EMPLOYEE-TYPE": "ประเภทพนักงาน",
            "SOCIAL-SECURITY": "ประกันสังคม",
            CALCULATE: "คำนวณเงินเดือน",
            TAX: "ภาษีเงินได้",
            TAXDEDUCTION: "ลดหย่อนภาษี",
            INCOME: "รายได้",
            DEDUCTIONS: "หักค่าใช้จ่าย",
            LEAVE: "ลางาน",
            OT: "ทำงานล่วงเวลา",
            WORKSHIFT: "กะงาน",
            DAYOFF: "วันหยุดประจำปี",
            EMPLOYEE: "พนักงาน",
            LOAN: "เงินกู้",
            TIME: "บันทึกเวลา",
            "WORKING-OUTSIDE": "ทำงานนอกสถานที่",
            "WORK-CERTIFICATE": "หนังสือรับรองการทำงาน",
            "SALARY-CERTIFICATE": "หนังสือรับรองเงินเดือน"
        };

        const companyName = companyId?.split(":")[1] || "";
        const groupTitle = groupMap[group?.toUpperCase()] || group || "";
        const pageTitle = pageMap[page?.toUpperCase()] || page || "";
        document.title = [companyName, groupTitle, pageTitle].filter(Boolean).join(" - ");
    }, [domain, companyId, group, page]);

    // ถ้า domain ไม่มี → login
    if (!domain) return <Navigate to="/login" replace />;

    // หา groupType สำหรับ sidebar
    const groupType = domainData.find(item => item.domainKey === domain)?.grouptype;

    // RENDER CASES
    if (!companyId) return <Company tabState={tabState} setTabState={setTabState} tabId={tabId} />;

    if (group === "dashboard" || group === "attendant" || group === "print" || group === "setting") {
        return (
            <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
                {groupType !== "attendant" && (
                    <SideBarCompany tabState={tabState} setTabState={setTabState} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                    {group === "dashboard" && effectivePage === null ? (
                        <CompanyDeshboard tabState={tabState} setTabState={setTabState} />
                    ) : group === "setting" && effectivePage === null ? (
                        <Setting tabState={tabState} setTabState={setTabState} />
                    ) : group === "print" && effectivePage === null ? (
                        <PrintDocument tabState={tabState} setTabState={setTabState} />
                    ) : (
                        <DashboardAttendant tabState={tabState} setTabState={setTabState} />
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", backgroundColor: theme.palette.primary.light }}>
            {groupType !== "attendant" && <SideBarCompany tabState={tabState} setTabState={setTabState} />}
            <Box sx={{ flexGrow: 1 }}>
                <CompanyRoutes group={group} page={effectivePage} tabState={tabState} setTabState={setTabState} />
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

            <Route
                path="/:domain/:company/print"
                element={
                    <ProtectedRouteWrapper>
                        <MainEntry />
                    </ProtectedRouteWrapper>
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