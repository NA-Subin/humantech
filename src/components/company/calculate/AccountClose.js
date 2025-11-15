import React, { useState, useEffect, use } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../../../App.css'
import { getDatabase, ref, push, onValue, set, update } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { formatThaiFull } from "../../../theme/DateTH";
import "dayjs/locale/th";
import ThaiDateSelector from "../../../theme/ThaiDateSelector";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
dayjs.locale("th");

const AccountDetail = (props) => {
    const { department, section, position, employee, month, close, salaryhistory } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const [selectedDateStart, setSelectDateStart] = useState(salaryhistory ? {
        day: salaryhistory.DDF,
        month: salaryhistory.MMF,
        year: salaryhistory.YYYYF,
    } : null);
    const [selectedDateEnd, setSelectDateEnd] = useState(salaryhistory ? {
        day: salaryhistory.DDT,
        month: salaryhistory.MMT,
        year: salaryhistory.YYYYT,
    } : null);
    const [closeAccount, setCloseAccount] = useState(close);
    const [edit, setEdit] = useState(true);

    const [income, setIncome] = useState([]);
    const [deduction, setDeduction] = useState([]);
    const [documentincome, setDocumentIncome] = useState([]);
    const [documentdeduction, setDocumentDeduction] = useState([]);
    const [documentleave, setDocumentLeave] = useState([]);
    const [documentot, setDocumentOT] = useState([]);
    const [holiday, setHoliday] = useState([]);

    const year = month.year();
    const m = month.month();
    const daysInMonth = month.daysInMonth();

    const [menu, setMenu] = useState('0-แก้ไขเวลา');

    console.log("Menu : ", menu);
    console.log("closeAccount :", closeAccount);

    useEffect(() => {
        if (!salaryhistory) {
            setSelectDateStart(null);
            setSelectDateEnd(null);
            setCloseAccount(false);
            return;
        }

        setSelectDateStart({
            day: salaryhistory?.DDF || "",
            month: salaryhistory?.MMF || "",
            year: salaryhistory?.YYYYF || "",
        });

        setSelectDateEnd({
            day: salaryhistory?.DDT || "",
            month: salaryhistory?.MMT || "",
            year: salaryhistory?.YYYYT || "",
        });

        setCloseAccount(close);
    }, [salaryhistory, close, month]); // 👈 เพิ่ม month ด้วย

    // ทุกครั้งที่ department, section หรือ position เปลี่ยน จะ reset employee

    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [salary, setSalary] = useState([]);
    const [selectedType, setSelectedType] = useState("all");

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    const holidaysInMonth = holiday.filter(h =>
        parseInt(h.YYYY) === year && parseInt(h.MM) === m + 1
    );
    const holidayCount = holidaysInMonth.length;

    const workingDays = daysInMonth - holidayCount;

    console.log('จำนวนวันทำงานจริง:', workingDays);
    console.log("salaryhistory : ", salaryhistory);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")

    const incomeActive = income.filter(row => row.status === 1);
    const deductionActive = deduction.filter(row => row.status === 1);

    // 1️⃣ กรอง employees ตาม props
    let filteredEmployees = employees.length !== 0 ? employees : [];

    if (department && department !== "all-ทั้งหมด") {
        filteredEmployees = filteredEmployees.filter(e => e.department === department);
    }

    if (section && section !== "all-ทั้งหมด") {
        filteredEmployees = filteredEmployees.filter(e => e.section === section);
    }

    if (position && position !== "all-ทั้งหมด") {
        filteredEmployees = filteredEmployees.filter(e => e.position === position);
    }

    if (employee && employee !== "all-ทั้งหมด") {
        const empId = Number(employee.split("-")[0]);
        filteredEmployees = filteredEmployees.filter(e => e.ID === empId);
    }

    if (selectedType !== "all") {
        filteredEmployees = filteredEmployees.filter(emp => {
            if (selectedType === "all") return true;

            const typeId = emp.employmenttype?.split("-")[0];
            return Number(typeId || 0) === selectedType;
        });
    }

    console.log("filteredEmployees : ", filteredEmployees);

    const dayNameMap = {
        Sunday: "อาทิตย์",
        Monday: "จันทร์",
        Tuesday: "อังคาร",
        Wednesday: "พุธ",
        Thursday: "พฤหัสบดี",
        Friday: "ศุกร์",
        Saturday: "เสาร์",
    };

    const generateHolidayDatesFromHistories = (
        employeeID,
        employeecode,
        nickname,
        employname,
        department,
        section,
        position,
        workshifthistories,
        filterYear,
        filterMonth
    ) => {
        if (!Array.isArray(workshifthistories)) return {
            employeeID,
            employeecode,
            nickname,
            employname,
            department,
            section,
            position,
            holidayDates: []
        };

        const parseYear = (y) =>
            y === "now" ? dayjs().year() : parseInt(y) > 2500 ? parseInt(y) - 543 : parseInt(y);
        const parseMonth = (m) =>
            m === "now" ? dayjs().month() : parseInt(m) - 1;
        const parseDay = (d) =>
            d === "now" ? dayjs().date() : parseInt(d);

        const allHolidayDates = [];

        workshifthistories.forEach((history) => {
            const holidays = history.holiday?.map(h => h.name) || [];

            const startYear = parseYear(history.YYYYstart);
            const startMonth = parseMonth(history.MMstart);
            const startDay = parseDay(history.DDstart);

            const endYear = parseYear(history.YYYYend);
            const endMonth = parseMonth(history.MMend);
            const endDay = parseDay(history.DDend);

            let current = dayjs().year(startYear).month(startMonth).date(startDay);
            const end = dayjs().year(endYear).month(endMonth).date(endDay);

            while (current.isSameOrBefore(end, "day")) {
                const currentDateStr = current.format("DD/MM/YYYY");
                const dayName = dayNameMap[current.format("dddd")];

                // ✅ ใช้ holiday ของช่วงนั้นเท่านั้น
                if (holidays.includes(dayName)) {
                    if (current.year() === filterYear && current.month() === filterMonth) {
                        allHolidayDates.push({
                            date: currentDateStr,
                            dayName,
                            workshift: history.workshift || null,
                            periodID: history.ID,
                        });
                    }
                }

                current = current.add(1, "day");
            }
        });

        allHolidayDates.sort((a, b) =>
            dayjs(a.date, "DD/MM/YYYY").unix() - dayjs(b.date, "DD/MM/YYYY").unix()
        );

        return {
            employeeID,
            employeecode,
            nickname,
            employname,
            department,
            section,
            position,
            holidayDates: allHolidayDates
        };
    };

    const parseDate = (str) => {
        if (str === "now") return new Date(9999, 11, 31); // ค่ามากสุดแทน now

        const [d, m, y] = str.split("/");
        return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const getSalaryByMonth = (salaryhistory, selectedMonth, selectedYear) => {
        if (!salaryhistory || salaryhistory.length === 0) return 0;

        // วันที่ที่ต้องการตรวจสอบ = วันที่ 1 ของเดือนนั้น
        const targetDate = new Date(selectedYear, selectedMonth, 1);

        for (const item of salaryhistory) {
            const startDate = parseDate(item.datestart);
            const endDate = parseDate(item.dateend);

            if (startDate <= targetDate && targetDate <= endDate) {
                return Number(item.salary);
            }
        }

        // ไม่มีช่วงไหนครอบ → return 0
        return 0;
    };

    // 3️⃣ สร้าง Rows จาก filteredEmployees
    const Rows = salary ? salary : filteredEmployees.map(emp => {
        const docIncome = documentincome.find(doc => doc.employid === emp.ID);
        const docDeduction = documentdeduction.find(doc => doc.employid === emp.ID);
        const attendantCount = emp.attendant?.[year]?.[m + 1]?.filter(item =>
            Number(item.status) === 2
        ).length ?? 0;

        const leave = documentleave.filter((doc) => doc.empid === emp.ID);

        let otHours = 0; // ตัวแปรเก็บผลรวมชั่วโมง OT

        const ot = documentot.filter(doc => doc.empid === emp.ID);

        ot.forEach(doc => {
            let start = dayjs(doc.timestart, "HH:mm");
            let end = dayjs(doc.timeend, "HH:mm");

            // ถ้า OT ข้ามวัน (end < start) → บวกเพิ่ม 1 วัน
            if (end.isBefore(start)) {
                end = end.add(1, "day");
            }

            // คำนวณชั่วโมง OT
            const hours = end.diff(start, "minute") / 60;

            // รวมเข้ากับ otHours
            otHours += hours;
        });

        // ✅ generate holidayDates ของพนักงานคนนี้
        const holidayResult = generateHolidayDatesFromHistories(
            emp.ID,
            emp.employeecode,
            emp.nickname,
            emp.employname,
            emp.department,
            emp.section,
            emp.position,
            emp.workshifthistory,
            year,
            m
        );

        const employeetype = emp.employmenttype ? emp.employmenttype.split("-")[1] : 0

        const salary = getSalaryByMonth(emp.salaryhistory, m, year);

        const row = {
            employeecode: emp.employeecode,
            employeetype: emp.employmenttype,
            department: emp.department,
            section: emp.section,
            position: emp.position,
            workshift: emp.workshift,
            salary: Number(salary),
            employid: emp.ID,
            employname: `${emp.employname} (${emp.nickname})`,
            workday: employeetype !== 0 ? workingDays : 0,
            attendantCount: attendantCount,
            holidayCount: holidayResult.holidayDates.length, // ✅ เพิ่มจำนวนวันหยุด
            holiday: holidayResult.holidayDates, // ✅ เพิ่มจำนวนวันหยุด
            // leaveCount: leave.length,
            otHours: otHours,
            missingWork: 0,
            totalIncome: 0,
            totalDeduction: 0,
            total: 0,
            sso: 0,
            totalSalary: 0,
        };

        // income flat
        incomeActive.forEach(inc => {
            const docIncomes = docIncome?.income?.find(item => item.ID === inc.ID);
            const incomeValue = docIncomes?.income || 0;
            row[`income${inc.ID}`] = incomeValue;
            row.totalIncome += incomeValue;
        });

        // deduction flat
        deductionActive.forEach(ded => {
            const docDeductions = docDeduction?.deduction?.find(item => item.ID === ded.ID);
            const deductionValue = docDeductions?.deduction || 0;
            row[`deduction${ded.ID}`] = deductionValue;
            row.totalDeduction += deductionValue;
        });

        // รวมวันลาแต่ละ leaveid
        leave.forEach((ded) => {
            // ถ้ามีค่าเดิมอยู่แล้วให้บวกเพิ่ม ไม่งั้นเริ่มที่ 0
            const current = row[`leave${ded.leaveid}`] || 0;
            const deductionValue = current + 1; // บวกเพิ่ม 1 วัน

            row[`leave${ded.leaveid}`] = deductionValue;
        });

        // ✅ รวมค่า leave ทั้งหมดใน row
        const totalLeaveDays = Object.keys(row)
            .filter(key => key.startsWith("leave")) // เอาเฉพาะ key ที่เป็น leave
            .reduce((sum, key) => sum + (row[key] || 0), 0);

        // คำนวณ missingWork
        row.missingWork =
            (employeetype !== 0 ? workingDays : 0) -
            (attendantCount + holidayResult.holidayDates.length + Number(totalLeaveDays));

        row.total = (Number(salary) + row.totalIncome) - row.totalDeduction;
        row.sso = Number(salary >= 15000 ? 15000 : salary) * 0.05;

        return row;
    });

    console.log("RowS : ", Rows);

    const typeCount = (id) =>
        employees.filter((t) => Number(t.employmenttype?.split("-")[0] ?? 0) === id).length;

    // 4️⃣ กรอง columns ที่มีค่าไม่เป็น 0 อย่างน้อย 1 แถว
    const visibleIncome = incomeActive.filter(inc =>
        Rows.some(row => (row[`income${inc.ID}`] ?? 0) !== 0)
    );

    const visibleDeduction = deductionActive.filter(ded =>
        Rows.some(row => (row[`deduction${ded.ID}`] ?? 0) !== 0)
    );

    const visibleLeave = documentleave.filter(ded =>
        Rows.some(row => (row[`leave${ded.leaveid}`] ?? 0) !== 0)
    );

    // 5️⃣ Group ข้อมูลตาม ฝ่ายงาน / ส่วนงาน / ตำแหน่ง
    const groupedRows = Rows.reduce((acc, row) => {
        const dept = row.department || "ไม่ระบุฝ่าย";
        const sec = row.section || "ไม่ระบุส่วน";
        const pos = row.position || "ไม่ระบุตำแหน่ง";

        if (!acc[dept]) acc[dept] = {};
        if (!acc[dept][sec]) acc[dept][sec] = {};
        if (!acc[dept][sec][pos]) acc[dept][sec][pos] = [];

        acc[dept][sec][pos].push(row);
        return acc;
    }, {});

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const holidayRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);

        const unsubscribe = onValue(holidayRef, (snapshot) => {
            const holidaysData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!holidaysData) {
                setHoliday([{ ID: 0, name: '' }]);
            } else {
                setHoliday(holidaysData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeTypeRef = ref(firebaseDB, `workgroup/company/${companyId}/employeetype`);

        const unsubscribe = onValue(employeeTypeRef, (snapshot) => {
            const employeeTypeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            setEmployeeTypes(employeeTypeData);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const departmentRef = ref(firebaseDB, `workgroup/company/${companyId}/department`);

        const unsubscribe = onValue(departmentRef, (snapshot) => {
            const departmentData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!departmentData) {
                setDepartments([{ ID: 0, name: '' }]);
            } else {
                setDepartments(departmentData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const sectionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        const unsubscribe = onValue(sectionRef, (snapshot) => {
            const sectionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!sectionData) {
                setSections([{ ID: 0, name: '' }]);
            } else {
                setSections(sectionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!positionData) {
                setPositions([{ ID: 0, name: '' }]);
            } else {
                setPositions(positionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployees([{ ID: 0, name: '' }]);
            } else {
                setEmployees(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const incomeRef = ref(firebaseDB, `workgroup/company/${companyId}/income`);

        const unsubscribe = onValue(incomeRef, (snapshot) => {
            const incomeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!incomeData) {
                setIncome([{ ID: 0, name: '' }]);
            } else {
                setIncome(incomeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const deductionRef = ref(firebaseDB, `workgroup/company/${companyId}/deductions`);

        const unsubscribe = onValue(deductionRef, (snapshot) => {
            const deductionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!deductionData) {
                setDeduction([{ ID: 0, name: '' }]);
            } else {
                setDeduction(deductionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const documentRef = ref(firebaseDB, `workgroup/company/${companyId}/documentincome/${dayjs(month).format("YYYY/M")}`);

        const unsubscribe = onValue(documentRef, (snapshot) => {
            const documentData = snapshot.val();

            if (!documentData) {
                setDocumentIncome([]);
            } else {
                const documentArray = Object.values(documentData);
                setDocumentIncome(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, month]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const documentRef = ref(firebaseDB, `workgroup/company/${companyId}/documentdeductions/${dayjs(month).format("YYYY/M")}`);

        const unsubscribe = onValue(documentRef, (snapshot) => {
            const documentData = snapshot.val();

            if (!documentData) {
                setDocumentDeduction([]);
            } else {
                const documentArray = Object.values(documentData);
                setDocumentDeduction(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, month]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/documentleave/${dayjs(month).format("YYYY/M")}`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            if (!leaveData) {
                setDocumentLeave([]);
            } else {
                const documentArray = Object.values(leaveData);
                setDocumentLeave(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, month]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const OTRef = ref(firebaseDB, `workgroup/company/${companyId}/documentot/${dayjs(month).format("YYYY/M")}`);

        const unsubscribe = onValue(OTRef, (snapshot) => {
            const OTData = snapshot.val();

            if (!OTData) {
                setDocumentOT([]);
            } else {
                const documentArray = Object.values(OTData);
                setDocumentOT(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, month]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const salaryRef = ref(firebaseDB, `workgroup/company/${companyId}/salary/${dayjs(month).format("YYYY/M")}/salarylist`);

        const unsubscribe = onValue(salaryRef, (snapshot) => {
            const salaryData = snapshot.val();

            if (!salaryData) {
                setSalary([]);
            } else {
                const documentArray = Object.values(salaryData);
                setSalary(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, month]);

    useEffect(() => {
        if (!firebaseDB) return;

        const companiesRef = ref(firebaseDB, "workgroup/company");
        const unsubscribe = onValue(companiesRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};
            const list = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            setCompanies(list);

            // ค้นหา company ตาม companyId
            const found = list.find((item, index) => String(index) === companyId);
            if (found) {
                setSelectedCompany(found);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!leaveData) {
                setLeave([{ ID: 0, name: '' }]);
            } else {
                setLeave(leaveData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleCancel = () => {
        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val() || [{ ID: 0, name: '' }];
            setLeave(leaveData);
            setEditLeave(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    console.log("group rows : ", Object.entries(groupedRows));
    console.log("Employees for Excel : ", employees);

    const exportSocialSecurityToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("000000");

        // ✅ ตั้งค่าหัวคอลัมน์ตรง Row 1
        worksheet.columns = [
            { header: "เลขประจำตัวประชาชน", key: "citizenId", width: 20 },
            { header: "คำนำหน้าชื่อ", key: "prefix", width: 15 },
            { header: "ชื่อผู้ประกันตน", key: "firstName", width: 20 },
            { header: "นามสกุลผู้ประกันตน", key: "lastName", width: 20 },
            { header: "ค่าจ้าง", key: "salary", width: 15 },
            { header: "จำนวนเงินสมทบ", key: "socialSecurity", width: 18 },
        ];

        // ✅ เพิ่มสไตล์ให้ header (Row 1)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 30;

        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern" };
            cell.border = { bottom: { style: "medium" } };
            cell.height = 25
        });

        // เพิ่มข้อมูลพนักงาน
        filteredEmployees.forEach(emp => {
            const row = worksheet.addRow({
                nataionalID: emp?.personal.nataionalID,
                prefix: emp?.personal.prefix || "",
                firstName: emp?.personal.name || "",
                lastName: emp?.personal.lastname || "",
                salary: Number(emp.salary || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
                socialSecurity: Number(emp.socialSecurity || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            });

            // กำหนดความสูงแต่ละ row
            row.height = 25;

            // จัดข้อความและฟอนต์
            row.alignment = { horizontal: "center", vertical: "middle" };
            row.getCell('F').font = { name: 'Arial', color: { argb: 'FF0000' } };
        });

        // ✅ ดาวน์โหลดไฟล์
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `SampleExcel.xlsx`);
    };

    const exportEmployeesToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("รายงานสรุป");

        // 🟩 สร้างหัวคอลัมน์
        const baseHeaders1 = [
            { header: "รหัส", key: "employeecode", width: 15 },
            { header: "ชื่อ", key: "employname", width: 25 },
            { header: "มาทำงาน", key: "attendantCount", width: 15 },
            { header: "วันหยุดตามกะ", key: "holidayCount", width: 15 },
        ]
        const baseHeaders2 = [
            { header: "ขาดงาน", key: "missingWork", width: 15 },
            { header: "โอที", key: "otHours", width: 15 },
            { header: "วันทำงาน", key: "workday", width: 15 },
            { header: "เงินเดือน", key: "salary", width: 15 },
        ];

        const leaveHeaders = visibleLeave.map(inc => ({
            header: inc.leave,
            key: `leave${inc.leaveid}`,
            width: 18,
        }));

        const incomeHeaders = visibleIncome.map(inc => ({
            header: inc.name,
            key: `income${inc.ID}`,
            width: 18,
        }));

        const deductionHeaders = visibleDeduction.map(ded => ({
            header: ded.name,
            key: `deduction${ded.ID}`,
            width: 18,
        }));

        const finalHeaders = [
            ...baseHeaders1,
            ...leaveHeaders,
            ...baseHeaders2,
            ...incomeHeaders,
            ...(visibleIncome.length !== 0 ? [{ header: "รวมรายรับ", key: "totalIncome", width: 18 }] : []),
            ...deductionHeaders,
            ...(visibleDeduction.length !== 0 ? [{ header: "รวมรายจ่าย", key: "totalDeduction", width: 18 }] : []),
            { header: "รวมทั้งหมด", key: "total", width: 18 },
        ];

        worksheet.columns = finalHeaders;

        // 🟦 สไตล์ Header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 30;
        headerRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB2DFDB" } };
            cell.border = { bottom: { style: "medium" } };
        });

        // 🟨 วน loop group ข้อมูล
        Object.entries(groupedRows).forEach(([dept, secObj]) => {
            // ✅ ฝ่ายงาน
            const deptRow = worksheet.addRow([`ฝ่ายงาน: ${dept.split("-")[1]}`]);
            worksheet.mergeCells(`A${deptRow.number}:${String.fromCharCode(64 + finalHeaders.length)}${deptRow.number}`);
            deptRow.font = { bold: true };
            deptRow.alignment = { horizontal: "left" };
            deptRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB2DFDB" } };

            Object.entries(secObj).forEach(([sec, posObj]) => {
                // ✅ ส่วนงาน
                if (sec.split("-")[1] !== "ไม่มี") {
                    const secRow = worksheet.addRow([`ส่วนงาน: ${sec.split("-")[1]}`]);
                    worksheet.mergeCells(`A${secRow.number}:${String.fromCharCode(64 + finalHeaders.length)}${secRow.number}`);
                    secRow.font = { bold: true };
                    secRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCEE8E7" } };
                }

                Object.entries(posObj).forEach(([pos, empList]) => {
                    // ✅ ตำแหน่ง
                    const posRow = worksheet.addRow([`ตำแหน่ง: ${pos.split("-")[1]}`]);
                    worksheet.mergeCells(`A${posRow.number}:${String.fromCharCode(64 + finalHeaders.length)}${posRow.number}`);
                    posRow.font = { bold: true };
                    posRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5F4F3" } };

                    // ✅ พนักงาน
                    empList.forEach(row => {
                        const dataRow = {
                            employeecode: row.employeecode,
                            employname: row.employname,
                            attendantCount: row.attendantCount ? `${row.attendantCount} วัน` : "-",
                            holidayCount: row.holidayCount ? `${row.holidayCount} วัน` : "-",
                            ...Object.fromEntries(visibleLeave.map(inc => [`leave${inc.leaveid}`, row[`leave${inc.leaveid}`] ? `${new Intl.NumberFormat("en-US").format(row[`leave${inc.leaveid}`])} วัน` : "-"])),
                            missingWork: row.missingWork ? `${row.missingWork} วัน` : "-",
                            otHours: row.otHours ? `${row.otHours} ชม.` : "-",
                            workday: row.workday ? `${row.workday} วัน` : "-",
                            salary: new Intl.NumberFormat("en-US").format(row.salary),
                            ...Object.fromEntries(visibleIncome.map(inc => [`income${inc.ID}`, row[`income${inc.ID}`] ? new Intl.NumberFormat("en-US").format(row[`income${inc.ID}`]) : "-"])),
                            ...(visibleIncome.length ? { totalIncome: new Intl.NumberFormat("en-US").format(row.totalIncome || 0) } : {}),
                            ...Object.fromEntries(visibleDeduction.map(ded => [`deduction${ded.ID}`, row[`deduction${ded.ID}`] ? new Intl.NumberFormat("en-US").format(-Math.abs(row[`deduction${ded.ID}`])) : "-"])),
                            ...(visibleDeduction.length ? { totalDeduction: new Intl.NumberFormat("en-US").format(-Math.abs(row.totalDeduction || 0)) } : {}),
                            total: new Intl.NumberFormat("en-US").format(row.total),
                        };

                        const r = worksheet.addRow(dataRow);
                        r.alignment = { horizontal: "center", vertical: "middle" };
                        r.height = 25;
                        r.eachCell(cell => {
                            cell.border = {
                                top: { style: "thin" },
                                left: { style: "thin" },
                                bottom: { style: "thin" },
                                right: { style: "thin" }
                            };
                        });
                    });
                });
            });
        });

        // 📦 ดาวน์โหลดไฟล์
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "รายงานสรุป.xlsx");
    };

    const exportEmployeesToPDF = () => {
        const doc = new jsPDF();

        autoTable(doc, {   // ✅ ต้องเรียกผ่านฟังก์ชัน autoTable(doc, {...})
            head: [
                ["เลขประจำตัวประชาชน", "คำนำหน้า", "ชื่อผู้ประกันตน", "นามสกุลผู้ประกันตน", "ค่าจ้าง", "จำนวนเงินสมทบ"]
            ],
            body: filteredEmployees.map(emp => [
                emp?.persolnal.nataionalID || "",
                emp?.persolnal.prefix || "",
                emp?.persolnal.nameame || "",
                emp?.persolnal.lastname || "",
                Number(emp.salary || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
                Number(emp.socialSecurity || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            ]),
            styles: { fontSize: 12, halign: "center", valign: "middle" },
            headStyles: { fillColor: [200, 200, 200], fontStyle: "bold" },
            margin: { top: 20 },
        });

        doc.save("SampleEmployees.pdf");
    };

    console.log("selectedDateStart : ", selectedDateStart);
    console.log("selectedDateEnd : ", selectedDateEnd);

    const handleSave = () => {
        const accounttingperiodRef = ref(firebaseDB, `workgroup/company/${companyId}/salary/${dayjs(month).format("YYYY/M")}`);

        const dateStart = selectedDateStart
            ? dayjs(`${selectedDateStart.year}-${selectedDateStart.month}-${selectedDateStart.day}`, "YYYY-M-D")
            : null;

        const dateEnd = selectedDateEnd
            ? dayjs(`${selectedDateEnd.year}-${selectedDateEnd.month}-${selectedDateEnd.day}`, "YYYY-M-D")
            : null;

        const newPeriod = {
            DDF: dateStart && dateStart.isValid() ? dateStart.date() : null,
            MMF: dateStart && dateStart.isValid() ? dateStart.month() + 1 : null,
            YYYYF: dateStart && dateStart.isValid() ? dateStart.year() : null,

            DDT: dateEnd && dateEnd.isValid() ? dateEnd.date() : null,
            MMT: dateEnd && dateEnd.isValid() ? dateEnd.month() + 1 : null,
            YYYYT: dateEnd && dateEnd.isValid() ? dateEnd.year() : null,

            salarylist: Rows,

            Closed: "ปิดงวดบัญชี"
        };

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(accounttingperiodRef, newPeriod)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setCloseAccount(true);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleUpdate = () => {
        const accounttingperiodRef = ref(firebaseDB, `workgroup/company/${companyId}/salaryhistory/${dayjs(month).format("YYYY/M")}`);

        const dateStart = selectedDateStart
            ? dayjs(`${selectedDateStart.year}-${selectedDateStart.month}-${selectedDateStart.day}`, "YYYY-M-D")
            : null;

        const dateEnd = selectedDateEnd
            ? dayjs(`${selectedDateEnd.year}-${selectedDateEnd.month}-${selectedDateEnd.day}`, "YYYY-M-D")
            : null;

        const newPeriod = {
            DDF: dateStart && dateStart.isValid() ? dateStart.date() : null,
            MMF: dateStart && dateStart.isValid() ? dateStart.month() + 1 : null,
            YYYYF: dateStart && dateStart.isValid() ? dateStart.year() : null,

            DDT: dateEnd && dateEnd.isValid() ? dateEnd.date() : null,
            MMT: dateEnd && dateEnd.isValid() ? dateEnd.month() + 1 : null,
            YYYYT: dateEnd && dateEnd.isValid() ? dateEnd.year() : null,

            salarylist: Rows,
        };

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        update(accounttingperiodRef, newPeriod)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEdit(true);
                setCloseAccount(true);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const generatePDF = () => {
        const invoiceData = {
            Employee: filteredEmployees,
            Address: selectedCompany?.companyaddress,
            Companyname: selectedCompany?.companyname,
            Companyserial: selectedCompany?.companyserial,
            Company: selectedCompany
        };

        sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // เปิดแท็บใหม่
        const printWindow = window.open(
            "/?domain=happygroup&company=1:TEST-T001&employee=print",
            "_blank"
        );

        if (!printWindow) {
            alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        }

        // บันทึกข้อมูลลง sessionStorage
        // sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData));

        // // เปิดหน้าต่างใหม่ไปที่ /print-invoice
        // const screenWidth = window.screen.width;
        // const screenHeight = window.screen.height;
        // const windowWidth = 820;
        // const windowHeight = 559;

        // const left = (screenWidth - windowWidth) / 2;
        // const top = (screenHeight - windowHeight) / 2;

        // const printWindow = window.open(
        //     "/?domain=happygroup&company=1:TEST-T001&employee=print",
        //     "_blank",
        //     `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`
        // );


        // if (!printWindow) {
        //     alert("กรุณาปิด pop-up blocker แล้วลองใหม่");
        // }
    };

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <Divider sx={{ marginTop: 1 }} />
                </Grid>
                <Grid item size={9}>
                    <Grid container spacing={1}>
                        <Grid item size={12}>
                            {/* <Typography variant="subtitle2" fontWeight="bold" >กรอกข้อมูลวันที่จ่าย</Typography> */}
                            <ThaiDateSelector
                                label="วันที่จ่าย"
                                value={selectedDateStart}
                                onChange={(val) => setSelectDateStart(val)}
                                disabled={closeAccount ? edit : false}
                            />
                        </Grid>
                        <Grid item size={12}>
                            {/* <Typography variant="subtitle2" fontWeight="bold" >กรอกข้อมูลวันที่จ่ายภาษี</Typography> */}
                            <ThaiDateSelector
                                label="วันที่จ่ายภาษี"
                                value={selectedDateEnd}
                                onChange={(val) => setSelectDateEnd(val)}
                                disabled={closeAccount ? edit : false}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item size={3}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "right", // ✅ แยกซ้าย-ขวา
                            marginTop: 7.5,
                        }}
                    >
                        {/* <Button variant="contained" color="success" size="small" sx={{ marginLeft: 5 }}>
                            บันทึก
                        </Button> */}

                        <Box display="flex" justifyContent="center" alignItems="center" >
                            {
                                closeAccount ?
                                    (
                                        edit ?
                                            <Button variant="contained" color="warning" size="small" sx={{ marginRight: 2 }} onClick={() => setEdit(false)}>
                                                แก้ไข
                                            </Button>
                                            :
                                            <React.Fragment>
                                                <Button variant="contained" color="info" size="small" sx={{ marginRight: 2 }} onClick={handleUpdate}>
                                                    ปิกงวดบัญชี
                                                </Button>
                                                <Button variant="contained" color="error" size="small" onClick={() => setEdit(true)}>
                                                    ยกเลิก
                                                </Button>
                                            </React.Fragment>
                                    )
                                    :
                                    <Button variant="contained" color="primary" size="small" onClick={handleSave}>
                                        ปิดงวดบัญชี
                                    </Button>
                            }
                        </Box>
                    </Box>
                </Grid>
                <Grid item size={12}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                            gap: 1, // เพิ่มช่องว่างระหว่างช่อง
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประเภทการจ้างงาน : </Typography>
                        <Paper onClick={() => setSelectedType("all")}
                            sx={{
                                textAlign: "center",
                                border: `1px solid ${theme.palette.primary.main}`,
                                boxShadow:
                                    selectedType === "all"
                                        ? "0px 4px 10px rgba(134, 134, 134, 0.63)"
                                        : "0px 1px 3px rgba(98, 98, 98, 0.1)",
                                borderRadius: "5px",
                                pt: 0.5,
                                pl: 1,
                                pr: 1,
                                mt: -0.5,
                                cursor: "pointer",
                                // transition: "0.2s",
                                backgroundColor: selectedType === "all" ? theme.palette.primary.main : theme.palette.primary.light,
                                color: selectedType === "all" ? "white" : "black",
                                "&:hover": {
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: "0px 4px 10px rgba(134, 134, 134, 0.63)",
                                },
                            }}>
                            <Typography variant="subtitle2" gutterBottom>
                                ทั้งหมด
                            </Typography>
                        </Paper>
                        {employeeTypes.map((type) => (
                            typeCount(type.ID) > 0 && (
                                <Paper key={type.ID} onClick={() => setSelectedType(type.ID)}
                                    sx={{
                                        textAlign: "center",
                                        border: `1px solid ${theme.palette.primary.main}`,
                                        boxShadow:
                                            selectedType === type.ID
                                                ? "0px 4px 10px rgba(134, 134, 134, 0.63)"
                                                : "0px 1px 3px rgba(98, 98, 98, 0.1)",
                                        borderRadius: "5px",
                                        pt: 0.5,
                                        pl: 1,
                                        pr: 1,
                                        mt: -0.5,
                                        cursor: "pointer",
                                        // transition: "0.2s",
                                        backgroundColor: selectedType === type.ID ? theme.palette.primary.main : theme.palette.primary.light,
                                        color: selectedType === type.ID ? "white" : "black",
                                        "&:hover": {
                                            borderColor: theme.palette.primary.main,
                                            boxShadow: "0px 4px 10px rgba(134, 134, 134, 0.63)",
                                        },
                                    }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {`${type.name} ${typeCount(type.ID)} คน`}
                                    </Typography>
                                </Paper>
                            )
                        ))}
                    </Box>
                </Grid>
                <Grid item size={12}>
                    <TableContainer component={Paper} textAlign="center">
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1060px" }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                    <TablecellHeader>
                                        รายงาน
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ width: 150 }}>
                                        จำนวนพนักงาน
                                    </TablecellHeader>
                                    <TablecellHeader sx={{ width: 250 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow sx={{ backgroundColor: "#e0f2f1" }}>
                                    <TableCell colSpan={3} >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>เงินเดือน</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            รายงานผลการสรุปเงินเดือนสุทธิงวดปกติ
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }} gutterBottom>
                                            {
                                                filteredEmployees.filter(emp => {
                                                    if (selectedType === "all") return true;

                                                    const typeId = emp.employmenttype?.split("-")[0];
                                                    return Number(typeId || 0) === selectedType;
                                                }).length
                                            }
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                onClick={exportEmployeesToExcel}
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            รายงานสรุปเงินที่ต้องจ่าย
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }} >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }} gutterBottom>
                                            {
                                                filteredEmployees.filter(emp => {
                                                    if (selectedType === "all") return true;

                                                    const typeId = emp.employmenttype?.split("-")[0];
                                                    return Number(typeId || 0) === selectedType;
                                                }).length
                                            }
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            สลิปเงินเดือน
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }} >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }} gutterBottom>
                                            {
                                                filteredEmployees.filter(emp => {
                                                    if (selectedType === "all") return true;

                                                    const typeId = emp.employmenttype?.split("-")[0];
                                                    return Number(typeId || 0) === selectedType;
                                                }).length
                                            }
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                                onClick={generatePDF}
                                            >
                                                PDF
                                            </Button>
                                            {/* <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button> */}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ backgroundColor: "#e0f2f1" }}>
                                    <TableCell colSpan={3}>
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>ภาษีประกันสังคม</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            รายงานประกันสังคม
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }} />
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                onClick={exportEmployeesToPDF}
                                                disabled={!closeAccount}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                onClick={exportSocialSecurityToExcel}
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            รายงานภาษี ภงด.1
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }} />
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            display: { md: "", lg: "flex" },
                                            justifyContent: { md: "left", lg: "space-between" }, // เล็ก: เริ่มต้น, ปกติ: space-between
                                            alignItems: "center",
                                            flexDirection: { md: "column", lg: "row" }, // เล็ก: ซ้อนบรรทัด, ปกติ: แถวเดียว
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap", marginLeft: 2 }} gutterBottom>
                                            รายงานภาษี ภงด.3
                                        </Typography>
                                        {!closeAccount && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 2,
                                                    color: theme.palette.error.dark,
                                                    fontSize: "12px",
                                                }}
                                                gutterBottom
                                            >
                                                *กรุณาปิดงวดบัญชีเพื่อทำการดาวน์โหลดเอกสาร*
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }} />
                                    <TableCell>
                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="error"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={closeAccount ? "outlined" : "contained"}
                                                size="small"
                                                color="success"
                                                sx={{
                                                    marginRight: 1,
                                                    height: "25px"
                                                }}
                                                startIcon={
                                                    <DownloadIcon />
                                                }
                                                disabled={!closeAccount}
                                            >
                                                Excel
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>

                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default AccountDetail