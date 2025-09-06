import React, { useState, useEffect, use } from "react";
import '../../../App.css'
import { getDatabase, ref, push, onValue, set } from "firebase/database";
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

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import dayjs from "dayjs";

const SalaryDetail = (props) => {
    const { department, section, position, employee, month } = props;
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

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // ทุกครั้งที่ department, section หรือ position เปลี่ยน จะ reset employee

    const [employees, setEmployees] = useState([]);
    const [income, setIncome] = useState([]);
    const [deduction, setDeduction] = useState([]);
    const [documentincome, setDocumentIncome] = useState([]);
    const [documentdeduction, setDocumentDeduction] = useState([]);
    const [documentleave, setDocumentLeave] = useState([]);
    const [documentot, setDocumentOT] = useState([]);
    const [holiday, setHoliday] = useState([]);

    console.log("Leave : ", documentleave);
    console.log("OT : ", documentot);

    const year = month.year();
    const m = month.month();
    const daysInMonth = month.daysInMonth();

    const holidaysInMonth = holiday.filter(h =>
        parseInt(h.YYYY) === year && parseInt(h.MM) === m + 1
    );
    const holidayCount = holidaysInMonth.length;

    const workingDays = daysInMonth - holidayCount;

    console.log('จำนวนวันทำงานจริง:', workingDays);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

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

    // 3️⃣ สร้าง Rows จาก filteredEmployees
    const Rows = filteredEmployees.map(emp => {
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

        const row = {
            employeecode: emp.employeecode,
            employeetype: emp.employmenttype,
            department: emp.department,
            section: emp.section,
            position: emp.position,
            workshift: emp.workshift,
            salary: Number(emp.salary),
            employid: emp.ID,
            employname: `${emp.employname} (${emp.nickname})`,
            workday: employeetype !== 0 ? workingDays : 0,
            attendantCount: attendantCount,
            holidayCount: holidayResult.holidayDates.length, // ✅ เพิ่มจำนวนวันหยุด
            holiday: holidayResult.holidayDates, // ✅ เพิ่มจำนวนวันหยุด
            leaveCount: leave.length,
            otHours: otHours,
            missingWork: (employeetype !== 0 ? workingDays : 0) - (attendantCount + holidayResult.holidayDates.length + leave.length),
            totalIncome: 0,
            totalDeduction: 0,
            total: 0
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

        row.total = (Number(emp.salary) + row.totalIncome) - row.totalDeduction;

        return row;
    });

    // 4️⃣ กรอง columns ที่มีค่าไม่เป็น 0 อย่างน้อย 1 แถว
    const visibleIncome = incomeActive.filter(inc =>
        Rows.some(row => (row[`income${inc.ID}`] ?? 0) !== 0)
    );

    const visibleDeduction = deductionActive.filter(ded =>
        Rows.some(row => (row[`deduction${ded.ID}`] ?? 0) !== 0)
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

    // employees.forEach((emp) => {
    //     const position = emp.position.split("-")[1];
    //     const docIncome = documentincome.find(doc => doc.employid === emp.ID);
    //     const docDeduction = documentdeduction.find(doc => doc.employid === emp.ID);

    //     const row = {
    //         employid: emp.ID,
    //         employname: `${emp.employname} (${emp.nickname})`,
    //         position,
    //         income: {},
    //         deduction: {}
    //     };

    //     // income group
    //     incomeActive.forEach((inc) => {
    //         const docIncomes = docIncome?.income.find(item => item.ID === inc.ID);
    //         row.income[`income${inc.ID}`] = docIncomes?.income || 0;
    //     });

    //     // deduction group
    //     deductionActive.forEach((ded) => {
    //         const docDeductions = docDeduction?.deduction.find(item => item.ID === ded.ID);
    //         row.deduction[`deduction${ded.ID}`] = docDeductions?.deduction || 0;
    //     });

    //     Rows.push(row);
    // });

    console.log("Rows : ", Rows);

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

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployees([]);
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

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const invalidMessages = [];

        leave.forEach((row, rowIndex) => {
            columns.forEach((col) => {
                const value = row[col.key];

                if (value === "") {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
                    return;
                }

                if (col.type === "number" && isNaN(Number(value))) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
                    return;
                }

                if (
                    col.type === "select" &&
                    !col.options?.some(opt => opt.value === value)
                ) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
                    return;
                }
            });
        });

        // ✅ ตรวจสอบว่า level.name ซ้ำหรือไม่
        const names = leave.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        // ❌ แสดงคำเตือนถ้ามีข้อผิดพลาด
        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(companiesRef, leave)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditLeave(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val() || [{ ID: 0, name: '' }];
            setLeave(leaveData);
            setEditLeave(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <React.Fragment>
            <Box sx={{ marginTop: 2, width: `${windowWidth - 500}px` }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <TableContainer component={Paper} sx={{ height: "70vh" }}>
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                <TableHead
                                    sx={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        backgroundColor: theme.palette.primary.dark,
                                    }}
                                >
                                    <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                        {/* <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader> */}
                                        <TablecellHeader sx={{ width: 60 }}>รหัส</TablecellHeader>
                                        <TablecellHeader sx={{ width: 200 }}>ชื่อ</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>มาทำงาน</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>วันหยุดตามกะ</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>ลางาน</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>ขาดงาน</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>โอที</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>วันทำงาน</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }}>เงินเดือน</TablecellHeader>

                                        {visibleIncome.map(inc => (
                                            <TablecellHeader key={inc.ID} sx={{ width: 150 }}>{inc.name}</TablecellHeader>
                                        ))}

                                        {visibleIncome.length !== 0 && <TablecellHeader sx={{ width: 200 }}>รวมรายรับ</TablecellHeader>}

                                        {visibleDeduction.map(ded => (
                                            <TablecellHeader key={ded.ID} sx={{ width: 150 }}>{ded.name}</TablecellHeader>
                                        ))}

                                        {visibleDeduction.length !== 0 && <TablecellHeader sx={{ width: 200 }}>รวมรายจ่าย</TablecellHeader>}

                                        <TablecellHeader sx={{ width: 150 }}>รวมทั้งหมด</TablecellHeader>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {
                                        Object.entries(groupedRows).length === 0 ?
                                            <TableRow sx={{ height: "60vh" }}>
                                                <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                            </TableRow>
                                            :
                                            Object.entries(groupedRows).map(([dept, secObj]) => (
                                                <>
                                                    {/* ✅ แถวแรก ฝ่ายงาน */}
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={2}
                                                            sx={{
                                                                fontWeight: "bold",
                                                                backgroundColor: "#b2dfdb",
                                                                position: "sticky",
                                                                left: 0
                                                            }}
                                                        >
                                                            ฝ่ายงาน: {dept.split("-")[1]}
                                                        </TableCell>
                                                        <TableCell
                                                            colSpan={(visibleIncome.length !== 0 && visibleDeduction.length !== 0 ? 10 : visibleIncome.length === 0 && visibleDeduction.length === 0 ? 8 : 9) + visibleIncome.length + visibleDeduction.length}
                                                            sx={{
                                                                fontWeight: "bold",
                                                                backgroundColor: "#b2dfdb",
                                                            }}
                                                        />
                                                    </TableRow>

                                                    {Object.entries(secObj).map(([sec, posObj]) => (
                                                        <>
                                                            {/* ✅ แถวสอง ส่วนงาน */}
                                                            {
                                                                sec.split("-")[1] !== "ไม่มี" &&
                                                                <TableRow>
                                                                    <TableCell
                                                                        colSpan={2}
                                                                        sx={{
                                                                            fontWeight: "bold",
                                                                            background: "#cee8e7ff",
                                                                            position: "sticky",
                                                                            left: 0
                                                                        }}
                                                                    >
                                                                        ส่วนงาน: {sec.split("-")[1]}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        colSpan={(visibleIncome.length !== 0 && visibleDeduction.length !== 0 ? 10 : visibleIncome.length === 0 && visibleDeduction.length === 0 ? 8 : 9) + visibleIncome.length + visibleDeduction.length}
                                                                        sx={{
                                                                            fontWeight: "bold",
                                                                            background: "#cee8e7ff",
                                                                        }}
                                                                    />
                                                                </TableRow>
                                                            }

                                                            {Object.entries(posObj).map(([pos, empList]) => (
                                                                <>
                                                                    {/* ✅ แถวสาม ตำแหน่ง */}
                                                                    <TableRow>
                                                                        <TableCell
                                                                            colSpan={2}
                                                                            sx={{
                                                                                fontWeight: "bold",
                                                                                background: "#e5f4f3ff",
                                                                                position: "sticky",
                                                                                left: 0
                                                                            }}
                                                                        >
                                                                            ตำแหน่ง: {pos.split("-")[1]}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            colSpan={(visibleIncome.length !== 0 && visibleDeduction.length !== 0 ? 10 : visibleIncome.length === 0 && visibleDeduction.length === 0 ? 8 : 9) + visibleIncome.length + visibleDeduction.length}
                                                                            sx={{
                                                                                fontWeight: "bold",
                                                                                background: "#e5f4f3ff",
                                                                            }}
                                                                        />
                                                                    </TableRow>

                                                                    {/* ✅ รายชื่อพนักงานในตำแหน่ง */}
                                                                    {empList.map((row, index) => (
                                                                        <TableRow key={row.employid}>
                                                                            {/* <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell> */}
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.employeecode}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, backgroundColor: "white" }}>{row.employname}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.attendantCount !== 0 ? `${row.attendantCount} วัน` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.holidayCount !== 0 ? `${row.holidayCount} วัน` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.leaveCount !== 0 ? `${row.leaveCount} วัน` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.missingWork !== 0 ? `${row.missingWork} วัน` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.otHours !== 0 ? `${row.otHours} ชม.` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.workday !== 0 ? `${row.workday} วัน` : "-"}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.salary)}</TableCell>

                                                                            {visibleIncome.map(inc => (
                                                                                <TableCell key={inc.ID} sx={{ textAlign: "center" }}>
                                                                                    {row[`income${inc.ID}`] ? new Intl.NumberFormat("en-US").format(row[`income${inc.ID}`]) : "-"}
                                                                                </TableCell>
                                                                            ))}

                                                                            {visibleIncome.length !== 0 && <TableCell sx={{ textAlign: "center" }}>{row.totalIncome ? new Intl.NumberFormat("en-US").format(row.totalIncome) : "-"}</TableCell>}

                                                                            {visibleDeduction.map(ded => (
                                                                                <TableCell key={ded.ID} sx={{ textAlign: "center" }}>
                                                                                    {row[`deduction${ded.ID}`]
                                                                                        ? new Intl.NumberFormat("en-US").format(-Math.abs(row[`deduction${ded.ID}`]))
                                                                                        : "-"
                                                                                    }
                                                                                </TableCell>
                                                                            ))}

                                                                            {visibleDeduction.length !== 0 && <TableCell sx={{ textAlign: "center" }}>
                                                                                {row.totalDeduction
                                                                                    ? new Intl.NumberFormat("en-US").format(-Math.abs(row.totalDeduction))
                                                                                    : "-"
                                                                                }
                                                                            </TableCell>
                                                                            }

                                                                            <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.total)}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </>
                                                            ))}
                                                        </>
                                                    ))}
                                                </>
                                            ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* <TableContainer component={Paper} textAlign="center">
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                        <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                        <TablecellHeader sx={{ width: 100 }} >รหัส</TablecellHeader>
                                        <TablecellHeader sx={{ width: 300 }} >ชื่อ</TablecellHeader>

                                        {visibleIncome.map(inc => (
                                            <TablecellHeader key={inc.ID} sx={{ width: 150 }}>{inc.name}</TablecellHeader>
                                        ))}

                                        {visibleDeduction.map(ded => (
                                            <TablecellHeader key={ded.ID} sx={{ width: 150 }}>{ded.name}</TablecellHeader>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {Rows.map((row, index) => (
                                        <TableRow key={row.employid}>
                                            <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.employeecode}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>

                                            {visibleIncome.map(inc => (
                                                <TableCell key={inc.ID} sx={{ textAlign: "center" }}>
                                                    {row[`income${inc.ID}`] ?? 0}
                                                </TableCell>
                                            ))}

                                            {visibleDeduction.map(ded => (
                                                <TableCell key={ded.ID} sx={{ textAlign: "center" }}>
                                                    {row[`deduction${ded.ID}`] ?? 0}
                                                </TableCell>
                                            ))}

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer> */}
                    </Grid>
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default SalaryDetail