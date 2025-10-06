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
import IncomepleteTime from "./time/IncompleteTime";
import LeaveEarly from "./time/LeaveEarly";
import LateDetail from "./time/Late";
import MissingWorkDetail from "./time/MissingWork";
import OverbreakDetail from "./time/Overbreak";
import OTDetail from "./time/OT";
import LeaveDetail from "./time/Leave";
import DayOffDetail from "./time/DayOff";
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.locale("en"); // ใส่ตรงนี้ก่อนใช้ dayjs.format("dddd")
dayjs.extend(isSameOrBefore);

const EditTimeDetail = (props) => {
    const { department, section, position, employee, month, onReturn } = props;
    console.log("Search : ", department, section, position, employee);
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [holiday, setHoliday] = useState([]);
    const [workshift, setWorkshift] = useState([]);
    const [dateArrayMap, setDateArrayMap] = useState({});
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

    console.log("holiday : ", holiday);
    console.log("MOnth : ", month);
    console.log("department : ", department);
    console.log("section : ", section);
    console.log("position : ", position);

    const [menu, setMenu] = useState('0-แก้ไขเวลา');
    const [day, setDay] = useState(1);

    console.log("Menu : ", menu);

    console.log("workshift : ", workshift);
    const [employees, setEmployees] = useState([]);

    const attendantRows = [];

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    // ฟังก์ชัน map วันที่อังกฤษ → ไทย
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
            const holidays = history.holiday?.map(h => h.name) || [];

            const startYear = parseYear(history.YYYYstart);
            const startMonth = parseMonth(history.MMstart);
            const startDay = parseDay(history.DDstart);

            const endYear = parseYear(history.YYYYend);
            const endMonth = parseMonth(history.MMend);
            const endDay = parseDay(history.DDend);

            let current = dayjs().year(startYear).month(startMonth).date(startDay);
            const end = dayjs().year(endYear).month(endMonth).date(endDay);

            while (current.isSameOrBefore(end, 'day')) {
                const currentDateStr = current.format("DD/MM/YYYY");
                const dayName = dayNameMap[current.format("dddd")]; // ex: "Sunday" → "อาทิตย์"

                const isNotInShiftHoliday = !holidays.includes(dayName);
                const isNotInGlobalHoliday = !holidayDatesSet.has(currentDateStr);

                if (isNotInShiftHoliday && isNotInGlobalHoliday) {
                    if (current.year() === filterYear && current.month() === filterMonth) {
                        allDates.push({
                            date: currentDateStr,
                            workshift: history.workshift || null,
                            start: history.start || null,
                            stop: history.stop || null,
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

    useEffect(() => {
        if (!employees || employees.length === 0 || !month) {
            setDateArrayMap([]); // ถ้าไม่มี employee หรือเดือน ให้เคลียร์เป็นว่าง
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

        // ถ้า filter แล้วไม่เหลือพนักงาน
        if (filteredEmployees.length === 0) {
            setDateArrayMap([]);
            return;
        }

        const year = month.year();   // เช่น 2025
        const m = month.month();     // 0-11

        const holidaysInMonth = holiday.filter(h =>
            parseInt(h.YYYY) === year && parseInt(h.MM) === m + 1
        );

        const mapped = filteredEmployees.map(e =>
            generateFilteredDatesFromHistories(
                e.ID,
                e.attendant?.[year]?.[m + 1],
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
        setDateArrayMap(mapped);
    }, [employees, department, section, position, employee, month, holiday]);

    employees.forEach(emp => {
        const position = emp.position ? emp.position.split("-")[1] : "";
        const department = emp.department ? emp.department.split("-")[1] : "";
        const section = emp.section ? emp.section.split("-")[1] : "";
        const year = dayjs().format("YYYY") || "";
        const month = (dayjs().month() + 1) || ""; // ใช้เลขเดือนตรงกับ key
        //setDateArray(generateFilteredDates(workshift));

        const attendantList = emp.attendant?.[year]?.[month] || [];

        attendantList.forEach((entry, idx) => {
            attendantRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                department,
                section,
                checkin: entry.checkin,
                checkout: entry.checkout,
                datein: entry.datein,
                dateout: entry.dateout,
                workshift: entry.shift,
                isFirst: idx === 0,
                rowSpan: attendantList.length,
            });
        });

        // ถ้าไม่มีข้อมูลการเข้างาน
        if (attendantList.length === 0) {
            attendantRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                department,
                section,
                checkin: "",
                checkout: "",
                datein: "",
                dateout: "",
                workshift: "",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });

    // // ตัวอย่างเรียกใช้:
    // const dateArray = generateFilteredDates(workshift[1]); // หรือ [1]

    console.log("dateArrayMap : ", dateArrayMap);

    console.log("attendantRows : ", attendantRows);
    console.log("employees : ", employees);

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

        const workshiftRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        const unsubscribe = onValue(workshiftRef, (snapshot) => {
            const workshiftData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!workshiftData) {
                setWorkshift([{ ID: 0, name: '' }]);
            } else {
                setWorkshift(workshiftData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleChange = (value) => {
        setDay(value);
        onReturn?.(value === 1 ? "จัดการข้อมูลวันทำงานไม่มาทำงาน"
            : value === 2 ? "จัดการข้อมูลลงเวลาไม่ครบคู่"
                : value === 3 ? "จัดการข้อมูลสาย"
                    : value === 4 ? "จัดการข้อมูลกลับก่อน"
                        : ""); // 👈 ส่งค่าออกไปหาพ่อ
    };

    return (
        <React.Fragment>
            <Box sx={{ marginTop: 5, width: "100%" }}>
                <Grid container spacing={2}>
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
                            <FormControlLabel control={<Checkbox checked={day === 1} onClick={() => handleChange(1)} />} label="วันทำงานไม่มาทำงาน" />
                            <FormControlLabel control={<Checkbox checked={day === 2} onClick={() => handleChange(2)} />} label="ลงเวลาไม่ครบคู่" />
                            <FormControlLabel control={<Checkbox checked={day === 3} onClick={() => handleChange(3)} />} label="สาย" />
                            <FormControlLabel control={<Checkbox checked={day === 4} onClick={() => handleChange(4)} />} label="กลับก่อน" />
                            {/* <FormControlLabel control={<Checkbox checked={day === 5} onClick={() => handleChange(5)} />} label="โอที" />
                            <FormControlLabel control={<Checkbox checked={day === 6} onClick={() => handleChange(6)} />} label="ลางาน" />
                            <FormControlLabel control={<Checkbox checked={day === 7} onClick={() => handleChange(7)} />} label="ทำงานในวันหยุด" /> */}
                        </FormGroup>
                    </Grid>
                    {/* <Grid item size={12}>
                        <Divider sx={{ marginTop: -1 }} />
                    </Grid>
                    <Grid item size={12}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>
                            {
                                day === 1 ? "จัดการข้อมูลวันทำงานไม่มาทำงาน"
                                    : day === 2 ? "จัดการข้อมูลลงเวลาไม่ครบคู่"
                                        : day === 3 ? "จัดการข้อมูลสาย"
                                            : day === 4 ? "จัดการข้อมูลกลับก่อน"
                                                : day === 5 ? "จัดการข้อมูลโอที"
                                                    : day === 6 ? "จัดการข้อมูลลางาน"
                                                        : day === 7 ? "จัดการข้อมูลทำงานในวันหยุด"
                                                            : ""
                            }
                        </Typography>
                    </Grid> */}
                    {
                        day === 1 ? <MissingWorkDetail dateArray={dateArrayMap} month={month} />
                            : day === 2 ? <IncomepleteTime dateArray={dateArrayMap} month={month} />
                                : day === 3 ? <LateDetail dateArray={dateArrayMap} month={month} />
                                    : day === 4 ? <LeaveEarly dateArray={dateArrayMap} month={month} />
                                        // : day === 5 ? <OTDetail dateArray={dateArrayMap} month={month} />
                                        //     : day === 6 ? <LeaveDetail dateArray={dateArrayMap} month={month} />
                                        //         : day === 7 ? <DayOffDetail dateArray={dateArrayMap} month={month} />
                                        : ""
                    }
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default EditTimeDetail