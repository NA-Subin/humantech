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
import { Checkbox, FormControlLabel, FormGroup, InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import OTDetail from "./document/OT";
import LeaveDetail from "./document/Leave";
import AddTimeDetail from "./document/AddTime";
import DayOffDetail from "./document/DayOff";
import WorkShiftDetail from "./document/WorkShift";
import dayjs from "dayjs";

const DocumentDetal = (props) => {
    const { companyName, department, section, position, employee, month, onReturn } = props;
    const { firebaseDB, domainKey } = useFirebase();
    // const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [holiday, setHoliday] = useState([]);
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

    console.log("windowWidth : ", windowWidth);

    const [dateArrayMap, setDateArrayMap] = useState([]);
    const [dateArray, setDateArray] = useState([]);
    const [menu, setMenu] = useState('0-แก้ไขเวลา');
    const [doc, setDoc] = useState(1);

    console.log("dateArrayMap : ", dateArrayMap);
    console.log("dateArray : ", dateArray);

    // ทุกครั้งที่ department, section หรือ position เปลี่ยน จะ reset employee

    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);

    console.log("employees : ", employees);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    const dayNameMap = {
        Sunday: "อาทิตย์",
        Monday: "จันทร์",
        Tuesday: "อังคาร",
        Wednesday: "พุธ",
        Thursday: "พฤหัสบดี",
        Friday: "ศุกร์",
        Saturday: "เสาร์",
    };

    const generateFilteredDatesFromHistories = (
        employeeID,
        attendant,
        employeecode,
        nickname,
        employname,
        department,
        section,
        position,
        workshifthistories,
        filterYear,
        filterMonth,
        holidaysInMonth = []
    ) => {
        if (!Array.isArray(workshifthistories)) return {
            employeeID,
            attendant,
            nickname,
            employeecode,
            department,
            section,
            position,
            employname,
            dateHistory: []
        };

        const parseYear = (y) => y === "now" ? dayjs().year() : parseInt(y) > 2500 ? parseInt(y) - 543 : parseInt(y);
        const parseMonth = (m) => m === "now" ? dayjs().month() : parseInt(m) - 1;
        const parseDay = (d) => d === "now" ? dayjs().date() : parseInt(d);

        const holidayDatesSet = new Set(holidaysInMonth.map(h => h.date)); // เช่น "28/07/2025"
        const allDates = [];

        workshifthistories.forEach((history) => {
            const shiftHolidays = history.holiday?.map(h => h.name) || [];

            const startYear = parseYear(history.YYYYstart);
            const startMonth = parseMonth(history.MMstart);
            const startDay = parseDay(history.DDstart);

            const endYear = parseYear(history.YYYYend);
            const endMonth = parseMonth(history.MMend);
            const endDay = parseDay(history.DDend);

            let current = dayjs().year(startYear).month(startMonth).date(startDay);
            const end = dayjs().year(endYear).month(endMonth).date(endDay);

            // while (current.isSameOrBefore(end, 'day')) {
            //     const currentDateStr = current.format("DD/MM/YYYY");
            //     const dayName = dayNameMap[current.format("dddd")]; // ex: "Sunday" → "อาทิตย์"

            //     let holidayType = null;

            //     if (shiftHolidays.includes(dayName)) {
            //         holidayType = "shift"; // หยุดจาก workshift
            //     } else if (holidayDatesSet.has(currentDateStr)) {
            //         holidayType = "global"; // หยุดจาก global holiday
            //     }

            //     if (holidayType && current.year() === filterYear && current.month() === filterMonth) {
            //         allDates.push({
            //             date: currentDateStr,
            //             workshift: history.workshift || null,
            //             start: history.start || null,
            //             stop: history.stop || null,
            //             dayName,
            //             holidayType
            //         });
            //     }

            //     current = current.add(1, 'day');
            // }
            while (current.isSameOrBefore(end, 'day')) {
                const currentDateStr = current.format("DD/MM/YYYY");
                const dayName = dayNameMap[current.format("dddd")]; // ex: "Sunday" → "อาทิตย์"

                let holidayType = null;

                if (shiftHolidays.includes(dayName)) {
                    holidayType = "shift"; // หยุดจาก workshift
                } else if (holidayDatesSet.has(currentDateStr)) {
                    holidayType = "global"; // หยุดจาก global holiday
                }

                if (holidayType) {
                    // เก็บวันหยุด
                    if (current.year() === filterYear && current.month() === filterMonth) {
                        allDates.push({
                            date: currentDateStr,
                            workshift: history.workshift || null,
                            start: history.start || null,
                            stop: history.stop || null,
                            dayName,
                            holidayType
                        });
                    }
                } else {
                    // เก็บวันทำงาน (workshift)
                    if (current.year() === filterYear && current.month() === filterMonth) {
                        allDates.push({
                            date: currentDateStr,
                            workshift: history.workshift || null,
                            start: history.start || null,
                            stop: history.stop || null,
                            dayName,
                            holidayType: "work" // 👈 เพิ่ม type ใหม่
                        });
                    }
                }

                current = current.add(1, 'day');
            }

        });

        allDates.sort((a, b) => dayjs(a.date, "DD/MM/YYYY").unix() - dayjs(b.date, "DD/MM/YYYY").unix());

        return {
            employeeID,
            attendant,
            employeecode,
            nickname,
            employname,
            department,
            section,
            position,
            dateHistory: allDates
        };
    };

    // ---------------- useEffect ตัวอย่าง
    useEffect(() => {
        if (!employees || employees.length === 0 || !month) return;

        let filteredEmployees = employees;

        if (department) {
            filteredEmployees = filteredEmployees.filter(e => e.department === department);
        }

        if (section) {
            filteredEmployees = filteredEmployees.filter(e => e.section === section);
        }

        if (position) {
            filteredEmployees = filteredEmployees.filter(e => e.position === position);
        }

        if (employee) {
            const empId = Number(employee.split("-")[0]);
            filteredEmployees = filteredEmployees.filter(e => e.ID === empId);
        }

        const year = month.year();   // จาก dayjs, เช่น 2025
        const m = month.month();     // จาก dayjs, 0-11

        const holidaysInMonth = holiday.filter(h =>
            parseInt(h.YYYY) === year && parseInt(h.MM) === m + 1
        );

        const mapped = filteredEmployees.map(e =>
            generateFilteredDatesFromHistories(
                e.ID,
                e.attendant?.[year]?.[m + 1], // ใน attendant ใช้ 1-based เดือน
                e.employeecode,
                e.nickname,
                e.employname,
                e.department,
                e.section,
                e.position,
                e.workshifthistory,
                year,
                m,
                holidaysInMonth
            )
        );

        console.log("Mapped Employee Dates (filtered):", mapped);
        setDateArray(mapped);
    }, [employees, department, section, position, employee, month, holiday]);

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
        if (!employees || employees.length === 0 || !month) {
            setDateArrayMap([]); // ถ้าไม่มี employee หรือเดือน -> clear เป็น array ว่าง
            return;
        }

        let filteredEmployees = employees;

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

        console.log("Filtered Employees:", filteredEmployees);

        // ถ้า filter แล้วไม่เหลือใคร -> ให้เป็น array ว่าง
        setDateArrayMap(filteredEmployees.length > 0 ? filteredEmployees : []);
    }, [employees, department, section, position, employee, month]);

    const handleChange = (value) => {
        setDoc(value);
        onReturn?.(value === 1 ? "เอกสารโอที"
            : value === 2 ? "เอกสารลางาน"
                : value === 3 ? "เอกสารเพิ่มเวลา"
                    : value === 4 ? "เอกสารวันหยุด"
                        : value === 5 ? "เอกสารกะการทำงาน"
                            : ""); // 👈 ส่งค่าออกไปหาพ่อ
    };

    return (
        <React.Fragment>
            <Box sx={{ marginTop: 5, width: "100%" }}>
                <Grid container spacing={2}>
                    {/* <Grid item size={4}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1 }} gutterBottom>
                            {
                                doc === 1 ? "เอกสารโอที"
                                    : doc === 2 ? "เอกสารลางาน"
                                        : doc === 3 ? "เอกสารเพิ่มเวลา"
                                            : doc === 4 ? "เอกสารวันหยุด"
                                                : doc === 5 ? "เอกสารกะการทำงาน"
                                                    : ""
                            }
                        </Typography>
                    </Grid> */}
                    <Grid item size={12}>
                        <FormGroup
                            row
                            sx={{
                                marginTop: -5
                            }}
                        // sx={{
                        //     display: "flex",
                        //     justifyContent: "flex-end",
                        // }}
                        >
                            {/* <FormControlLabel control={<Checkbox defaultChecked />} label="ทั้งหมด" /> */}
                            <FormControlLabel control={<Checkbox checked={doc === 1} onClick={() => handleChange(1)} />} label="โอที" />
                            <FormControlLabel control={<Checkbox checked={doc === 2} onClick={() => handleChange(2)} />} label="ลางาน" />
                            <FormControlLabel control={<Checkbox checked={doc === 3} onClick={() => handleChange(3)} />} label="เพิ่มเวลา" />
                            <FormControlLabel control={<Checkbox checked={doc === 4} onClick={() => handleChange(4)} />} label="วันหยุด" />
                            <FormControlLabel control={<Checkbox checked={doc === 5} onClick={() => handleChange(5)} />} label="กะการทำงาน" />
                        </FormGroup>
                    </Grid>
                    {/* <Grid item size={12}>
                        <Divider sx={{ marginTop: -1 }} />
                    </Grid> */}
                    {
                        doc === 1 ? <OTDetail companyName={companyName} dateArray={dateArrayMap} month={month} />
                            : doc === 2 ? <LeaveDetail companyName={companyName} dateArray={dateArrayMap} month={month} />
                                : doc === 3 ? <AddTimeDetail companyName={companyName} dateArray={dateArrayMap} month={month} />
                                    : doc === 4 ? <DayOffDetail companyName={companyName} dateArray={dateArray} month={month} />
                                        : doc === 5 ? <WorkShiftDetail companyName={companyName} dateArray={dateArrayMap} month={month} />
                                            : ""
                    }
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default DocumentDetal