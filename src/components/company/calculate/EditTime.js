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

    const generateFilteredDatesFromHistories = (workshifthistories) => {
        if (!Array.isArray(workshifthistories)) return [];

        const datesSet = new Set();

        // ฟังก์ชันย่อย แปลงปี 2 หลักเป็น 4 หลัก
        const parseYear = (y) => {
            if (y === "now") return dayjs().year();
            if (y.length === 2) return 2000 + parseInt(y);
            return parseInt(y);
        };

        // แปลงเดือน
        const parseMonth = (m) => (m === "now" ? dayjs().month() : parseInt(m) - 1);

        // แปลงวัน โดย "now" = วันสุดท้ายของเดือนนั้น
        const parseDay = (d, year, month) => {
            if (d === "now") {
                return dayjs().year(year).month(month).endOf("month").date();
            }
            return parseInt(d);
        };

        workshifthistories.forEach(history => {
            if (!history || !Array.isArray(history.holiday)) return;

            const holidays = history.holiday.map(h => h.name);

            const now = dayjs();

            const startYear = parseYear(history.YYYYstart);
            const endYear = parseYear(history.YYYYend);

            const startMonth = parseMonth(history.MMstart);
            const endMonth = parseMonth(history.MMend);

            const startDay = parseDay(history.DDstart, startYear, startMonth);
            const endDay = history.DDend === "now"
                ? dayjs().year(endYear).month(endMonth).endOf("month").date()
                : parseInt(history.DDend);

            const startDate = dayjs().year(startYear).month(startMonth).date(startDay);
            const endDate = dayjs().year(endYear).month(endMonth).date(endDay);

            let current = startDate;

            while (current.isSameOrBefore(endDate, "day")) {
                const dayName = dayNameMap[current.format("dddd")];
                if (!holidays.includes(dayName)) {
                    datesSet.add(current.format("DD/MM/YYYY"));
                }
                current = current.add(1, "day");
            }
        });

        // แปลง Set กลับเป็น Array และ sort วันที่
        return Array.from(datesSet).sort((a, b) => {
            return dayjs(a, "DD/MM/YYYY").unix() - dayjs(b, "DD/MM/YYYY").unix();
        });
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
        const map = {};

        employees.forEach(emp => {
            const filteredDates = generateFilteredDatesFromHistories(emp.workshifthistory);
            map[emp.ID] = filteredDates;
        });

        console.log("Filtered Date Map:", map);
        setDateArrayMap(map);
    }, [employees]);


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
                            จัดการข้อมูล{
                                day === 1 ? "วันทำงาน/ไม่มาทำงาน"
                                    : day === 2 ? "ลงเวลาไม่ครบคู่"
                                        : day === 3 ? "สาย"
                                            : day === 4 ? "กลับก่อน"
                                                : day === 5 ? "พักเกิน"
                                                    : day === 6 ? "โอที"
                                                        : day === 7 ? "ลางาน"
                                                            : "ทำงานในวันหยุด"
                            }
                        </Typography>
                    </Grid>
                    {
                        day === 1 ? <MissingWorkDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                            : day === 2 ? <IncomepleteTime department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                : day === 3 ? <LateDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                    : day === 4 ? <LeaveEarly department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                        : day === 5 ? <OverbreakDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                            : day === 6 ? <OTDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                                : day === 7 ? <LeaveDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                                                    : <DayOffDetail department={department} section={section} position={position} employee={employee} dateArray={dateArrayMap} />
                    }
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default EditTimeDetail