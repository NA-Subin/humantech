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
    const { department, section, position, employee } = props;
    console.log("Search : ", department, section, position, employee);
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [workshift, setWorkshift] = useState([]);
    const [dateArrayMap, setDateArrayMap] = useState({});
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    console.log("department : ", department);
    console.log("section : ", section);
    console.log("position : ", position);

    const [menu, setMenu] = useState('0-แก้ไขเวลา');
    const [day, setDay] = useState("");

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

    const generateFilteredDatesFromHistories = (employeeID, attendant, employeecode, nickname, employname, department, section, position, workshifthistories) => {
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
        const parseDay = (d, y, m) => d === "now" ? dayjs().year(y).month(m).endOf("month").date() : parseInt(d);

        const allDates = [];

        workshifthistories.forEach((history) => {
            const holidays = history.holiday?.map(h => h.name) || [];

            const startYear = parseYear(history.YYYYstart);
            const startMonth = parseMonth(history.MMstart);
            const startDay = parseDay(history.DDstart, startYear, startMonth);

            const endYear = parseYear(history.YYYYend);
            const endMonth = parseMonth(history.MMend);
            const endDay = parseDay(history.DDend, endYear, endMonth);

            let current = dayjs().year(startYear).month(startMonth).date(startDay);
            const end = dayjs().year(endYear).month(endMonth).date(endDay);

            while (current.isSameOrBefore(end, 'day')) {
                const dayName = dayNameMap[current.format("dddd")];
                if (!holidays.includes(dayName)) {
                    allDates.push({
                        date: current.format("DD/MM/YYYY"),
                        workshift: history.workshift || null,
                        start: history.start || null,
                        stop: history.stop || null,
                    });
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

    employees.forEach(emp => {
        const position = emp.position.split("-")[1];
        const department = emp.department.split("-")[1];
        const section = emp.section.split("-")[1];
        const year = dayjs().format("YYYY");
        const month = dayjs().month() + 1; // ใช้เลขเดือนตรงกับ key
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

    useEffect(() => {
        if (!employees || employees.length === 0) return;

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

        const year = dayjs(new Date()).format("YYYY");
        const month = dayjs(new Date()).format("M");


        const mapped = filteredEmployees.map(e =>
            generateFilteredDatesFromHistories(
                e.ID,
                e.attendant?.[year]?.[month],
                e.employeecode,
                e.nickname,
                e.employname,
                e.department,
                e.section,
                e.position,
                e.workshifthistory
            )
        );

        console.log("Mapped Employee Dates (filtered):", mapped);
        setDateArrayMap(mapped);
    }, [employees, department, section, position, employee]);

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
                setEmployees([{ ID: 0, name: '' }]);
            } else {
                setEmployees(employeeData);
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

    return (
        <React.Fragment>
            <Box sx={{ marginTop: 5, width: "1080px" }}>
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
                            <FormControlLabel control={<Checkbox checked={day === 1} onClick={() => setDay(1)} />} label="วันทำงาน/ไม่มาทำงาน" />
                            <FormControlLabel control={<Checkbox checked={day === 2} onClick={() => setDay(2)} />} label="ลงเวลาไม่ครบคู่" />
                            <FormControlLabel control={<Checkbox checked={day === 3} onClick={() => setDay(3)} />} label="สาย" />
                            <FormControlLabel control={<Checkbox checked={day === 4} onClick={() => setDay(4)} />} label="กลับก่อน" />
                            <FormControlLabel control={<Checkbox checked={day === 5} onClick={() => setDay(5)} />} label="พักเกิน" />
                            <FormControlLabel control={<Checkbox checked={day === 6} onClick={() => setDay(6)} />} label="โอที" />
                            <FormControlLabel control={<Checkbox checked={day === 7} onClick={() => setDay(7)} />} label="ลางาน" />
                            <FormControlLabel control={<Checkbox checked={day === 8} onClick={() => setDay(8)} />} label="ทำงานในวันหยุด" />
                        </FormGroup>
                    </Grid>
                    <Grid item size={12}>
                        <Divider sx={{ marginTop: 1 }} />
                    </Grid>
                    <Grid item size={12}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: -1 }} gutterBottom>
                            {
                                day === 1 ? "จัดการข้อมูลวันทำงาน/ไม่มาทำงาน"
                                    : day === 2 ? "จัดการข้อมูลลงเวลาไม่ครบคู่"
                                        : day === 3 ? "จัดการข้อมูลสาย"
                                            : day === 4 ? "จัดการข้อมูลกลับก่อน"
                                                : day === 5 ? "จัดการข้อมูลพักเกิน"
                                                    : day === 6 ? "จัดการข้อมูลโอที"
                                                        : day === 7 ? "จัดการข้อมูลลางาน"
                                                            : day === 8 ? "จัดการข้อมูลทำงานในวันหยุด"
                                                                : ""
                            }
                        </Typography>
                    </Grid>
                    {
                        day === 1 ? <MissingWorkDetail dateArray={dateArrayMap} />
                            : day === 2 ? <IncomepleteTime dateArray={dateArrayMap} />
                                : day === 3 ? <LateDetail dateArray={dateArrayMap} />
                                    : day === 4 ? <LeaveEarly dateArray={dateArrayMap} />
                                        : day === 5 ? <OverbreakDetail dateArray={dateArrayMap} />
                                            : day === 6 ? <OTDetail dateArray={dateArrayMap} />
                                                : day === 7 ? <LeaveDetail dateArray={dateArrayMap} />
                                                    : day === 8 ? <DayOffDetail dateArray={dateArrayMap} />
                                                        : ""
                    }
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default EditTimeDetail