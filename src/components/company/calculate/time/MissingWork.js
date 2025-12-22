import React, { useState, useEffect, use } from "react";
import '../../../../App.css'
import { getDatabase, ref, push, onValue, set, serverTimestamp, update, get, child } from "firebase/database";
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
import theme from "../../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../../theme/style"
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SaveIcon from '@mui/icons-material/Save';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Checkbox, FormControlLabel, FormGroup, InputAdornment, Tooltip } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../../sweetalert/sweetalert";
import { useFirebase } from "../../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../../theme/SearchEmployee";
import dayjs from "dayjs";
import { formatThaiShort } from "../../../../theme/DateTH";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
dayjs.locale("en"); // ใส่ตรงนี้ก่อนใช้ dayjs.format("dddd")

const MissingWorkDetail = (props) => {
    const { companyName, dateArray } = props;
    const { firebaseDB, domainKey } = useFirebase();
    // const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [empID, setEmployID] = useState("");
    const [check, setCheck] = useState(false);
    const [empDate, setEmployDate] = useState("");
    const [checkin, setCheckin] = useState("");
    const [checkout, setCheckout] = useState("");

    const [editingRow, setEditingRow] = useState({
        empID: null,
        date: null,
        checkin: "",
        checkout: ""
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const parts = timeStr.split(":"); // ["HH", "MM"]
        if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
        if (parts.length === 3) return timeStr; // ถ้ามีแล้ว :ss
        return "";
    }

    console.log("dateArray in MissingWorkDetail: ", dateArray);

    const result = Array.isArray(dateArray) ?
        dateArray.map((item) => {
            const { attendant = [], dateHistory = [] } = item;

            const newDateHistory = dateHistory.map((d) => {
                // หาวันที่ตรงกับ datein หรือ dateout
                const dayKey = Number(d.DD || d.date.split("/")[0]); // แปลงเป็น number 1–31

                const record = attendant?.[dayKey];

                const found = record
                    ? {
                        ...record,
                        datein: `${record.DDI}/${record.MMI}/${record.YYYYI}`,
                        dateout: `${record.DDO}/${record.MMO}/${record.YYYYO}`,
                    }
                    : null;

                let message = "ขาดงาน";
                let datein = "";
                let dateout = "";
                let checkin = "";
                let checkout = "";

                if (found) {
                    if (found.DDI && found.MMI) {
                        datein = `${found.DDI}/${found.MMI}/${found.YYYYI}`;
                        checkin = found.checkin || ""; // เวลาเข้า
                    }

                    if (found.DDO && found.MMO) {
                        dateout = `${found.DDO}/${found.MMO}/${found.YYYYO}`;
                        checkout = found.checkout || ""; // เวลาออก
                    }

                    if (datein && dateout) {
                        message = "ลงเวลาเข้าออกครบ";
                    } else if (datein && !dateout) {
                        message = "ลงเวลาไม่ครบ (ไม่มีเวลาออก)";
                    } else if (!datein && dateout) {
                        message = "ลงเวลาไม่ครบ (ไม่มีเวลาเข้า)";
                    }
                }

                return {
                    ...d,
                    datein,
                    dateout,
                    checkin,
                    checkout,
                    message,
                };
            });

            return {
                ...item,
                dateHistory: newDateHistory,
            };
        })
        :
        [];

    console.log("result : ", result);

    const current = dayjs();
    const yearStr = current.year().toString();
    const monthStr = (current.month() + 1).toString();
    const totalDays = current.daysInMonth();

    // สร้าง default day map แบบเต็ม field
    const monthDaysMap = {};
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = dayjs(`${i}/${monthStr}/${yearStr}`, "D/M/YYYY").format("DD/MM/YYYY");
        monthDaysMap[i] = {
            date: dateStr,
            message: "ขาดงาน",      // default message เหมือนวันทำงาน
            start: "",
            stop: "",
            workshift: "",
            checkin: "",
            checkout: "",
            DDI: "",
            MMI: "",
            YYYYI: "",
            datein: "",
            datecodeI: "",
            DDO: "",
            MMO: "",
            YYYYO: "",
            dateout: "",
            datecodeO: "",
            status: 0,
            unixin: "",
            unixout: ""
        };
    }

    // รวมผลลัพธ์จาก dateArray
    const merged = Array.isArray(dateArray)
        ? dateArray.map((item) => {
            const { dateHistory = [], attendant = [] } = item;

            const firstSource = dateHistory[0] || attendant[0];
            if (!firstSource) return { ...item, dateHistory: [{ id: 0 }] };

            const firstDate = dayjs(firstSource.date, "DD/MM/YYYY");
            const yearStr = firstDate.year().toString();
            const monthStr = (firstDate.month() + 1).toString();
            const totalDays = firstDate.daysInMonth();

            // default monthDaysMap
            const monthDaysMap = {};
            for (let i = 1; i <= totalDays; i++) {
                const dateStr = dayjs(`${i}/${monthStr}/${yearStr}`, "D/M/YYYY").format("DD/MM/YYYY");
                monthDaysMap[i] = {
                    id: i,
                    date: dateStr,
                    message: "ขาดงาน",
                    start: "",
                    stop: "",
                    workshift: "",
                    checkin: "",
                    checkout: "",
                    DDI: "",
                    MMI: "",
                    YYYYI: "",
                    datein: "",
                    datecodeI: "",
                    DDO: "",
                    MMO: "",
                    YYYYO: "",
                    dateout: "",
                    datecodeO: "",
                    status: "",
                    unixin: "",
                    unixout: ""
                };
            }

            // helper normalize 0 -> ""
            const normalize = (obj) => {
                const result = {};
                Object.keys(obj).forEach(k => {
                    if (k === "message" && obj[k] === 0) result[k] = "ว่าง";
                    else result[k] = obj[k] === 0 ? "" : obj[k];
                });
                return result;
            };

            // map dateHistory
            const dateHistoryMap = {};
            dateHistory.forEach(d => {
                const dayNum = Number(d.DD || dayjs(d.date, "DD/MM/YYYY").date());
                dateHistoryMap[dayNum] = normalize(d);
            });

            // map attendant (ใช้ DDI เป็นหลัก)
            const source = (Array.isArray(attendant) && attendant.length > 0)
                ? attendant
                : (Array.isArray(dateHistory) ? dateHistory : []);

            const attendantMap = {};

            source.forEach(a => {
                const dayNum = Number(a.DDI);
                if (!isNaN(dayNum)) {
                    attendantMap[dayNum] = normalize(a);
                }
            });

            // merge finalDays
            const finalDays = [];
            finalDays[0] = { id: 0 }; // placeholder

            for (let day = 1; day <= totalDays; day++) {
                let result = { ...monthDaysMap[day] };

                // merge dateHistory
                if (dateHistoryMap[day]) {
                    Object.keys(dateHistoryMap[day]).forEach(key => {
                        if (dateHistoryMap[day][key] !== undefined) {
                            result[key] = dateHistoryMap[day][key];
                        }
                    });
                }

                // merge attendant → override + set message = "วันทำงาน"
                if (attendantMap[day]) {
                    Object.keys(attendantMap[day]).forEach(key => {
                        if (attendantMap[day][key] !== undefined && key !== "id" && key !== "date") {
                            result[key] = attendantMap[day][key];
                        }
                    });
                    result.message = "วันทำงาน"; // ตั้ง message ใหม่ถ้ามี attendant
                }

                // date และ id ใช้ของ monthDaysMap
                result.date = monthDaysMap[day].date;
                result.id = day;

                finalDays[day] = result;
            }

            return {
                ...item,
                dateHistory: finalDays
            };
        })
        : [];

    console.log("merged : ", merged);
    console.log("checkin : ", checkin);
    console.log("checkout : ", checkout);

    const handleUpdateTime = (empID, newdate) => {
        const emp = merged.find(item => item.employeeID === empID);
        console.log("emp : ", emp);
        if (!emp) return;

        const found = emp.dateHistory.find(d => {
            const dDate = dayjs(d.date, ["D/M/YYYY", "DD/MM/YYYY"]).format("DD/MM/YYYY");
            const newDateFormatted = dayjs(newdate, ["D/M/YYYY", "DD/MM/YYYY"]).format("DD/MM/YYYY");
            return dDate === newDateFormatted;
        });

        console.log("found : ", found);
        if (!found) return;

        setCheckin(formatTime(found.start));
        setCheckout(formatTime(found.stop));
        setCheck(true);
        setEmployID(empID);
        setEmployDate(newdate);
    }

    const updateInvalidMessage = (
        dateHistory,       // ← array ของวันในเดือน
        dayIndex,          // index 0–30
        checkin,
        checkout,
        newdate,
        dateOutObj
    ) => {

        // วันที่จริง (1–31)
        const day = dayIndex + 1;
        const dateObj = dayjs(`${day}/${monthStr}/${yearStr}`, "D/M/YYYY");

        // หา object ของวันนั้น
        const target = dateHistory[dayIndex];
        if (!target) return dateHistory; // safety

        // อัปเดตข้อมูล
        const updated = {
            ...target,

            // วันที่เข้า
            DDI: checkin ? String(day).padStart(2, "0") : "",
            MMI: checkin ? String(monthStr).padStart(2, "0") : "",
            YYYYI: checkin ? yearStr : "",
            datein: checkin ? dateObj.format("DD/MM/YYYY") : "",
            datecodeI: checkin ? dateObj.format("YYYY.MMDD") : "",

            // วันที่ออก
            DDO: checkout ? dateOutObj.format("DD") : "",
            MMO: checkout ? dateOutObj.format("MM") : "",
            YYYYO: checkout ? dateOutObj.format("YYYY") : "",
            dateout: checkout ? dateOutObj.format("DD/MM/YYYY") : "",
            datecodeO: checkout ? dateOutObj.format("YYYY.MMDD") : "",

            // เวลา
            checkin: checkin || "",
            checkout: checkout || "",

            // สถานะ
            status: (!checkin || !checkout) ? 1 : 2,

            // unix time
            unixin: checkin
                ? dayjs(`${newdate.date} ${checkin}`, "DD/MM/YYYY HH:mm:ss").valueOf()
                : "",

            unixout: checkout
                ? dayjs(`${dateOutObj.format("DD/MM/YYYY")} ${checkout}`, "DD/MM/YYYY HH:mm:ss").valueOf()
                : "",
        };

        // ใส่ message ใหม่ตามเงื่อนไขของคุณ
        if (updated.checkin && updated.checkout) {
            updated.message = "ลงเวลาเข้าออกครบ";
        } else if (updated.checkin && !updated.checkout) {
            updated.message = "ลงเวลาไม่ครบ (ไม่มีเวลาออก)";
        } else if (!updated.checkin && updated.checkout) {
            updated.message = "ลงเวลาไม่ครบ (ไม่มีเวลาเข้า)";
        } else {
            updated.message = "ขาดงาน";
        }

        // set กลับเข้า array
        dateHistory[dayIndex] = updated;

        return dateHistory; // ส่งตัวใหม่กลับ
    };

    // const handleUpdateTime = (empID, newdate) => {
    //     const emp = result.find(item => item.employeeID === empID);
    //     if (!emp) return;

    //     const found = emp.dateHistory.find(d => {
    //         const dDate = dayjs(d.date, ["D/M/YYYY", "DD/MM/YYYY"]).format("DD/MM/YYYY");
    //         const newDateFormatted = dayjs(newdate.date, ["D/M/YYYY", "DD/MM/YYYY"]);
    //         return dDate === newDateFormatted;
    //     });

    //     if (!found) return;

    //     const dayIndex = Number(found.date.split("/")[0]) - 1;

    //     setCheckin(formatTime(found.start));
    //     setCheckout(formatTime(found.stop));
    //     setCheck(true);
    //     setEmployID(empID);
    //     setEmployDate(newdate);

    //     const checkin = formatTime(found.start);
    //     const checkout = formatTime(found.stop);

    //     const dateOutObj = dayjs(newdate.dateout, ["D/M/YYYY", "DD/MM/YYYY"]);

    //     updateInvalidMessage(dayIndex, checkin, checkout, newdate, dateOutObj);
    // };

    const handleCancel = () => {
        setCheck(false);
        setEmployID("");
        setEmployDate("");
        setCheckin("");
        setCheckout("");
    }

    const handleSave = async (empID) => {
        if (!empDate) return;

        const dateObj = dayjs(empDate, "DD/MM/YYYY");
        const year = dateObj.year();
        const month = dateObj.month(); // 0-based
        const day = dateObj.date();

        const sourceDateHistory = merged
            .find(e => e.employeeID === empID)
            ?.dateHistory || [];

        const totalDays = sourceDateHistory.length - 1; // index 0 = placeholder

        // --- สร้าง newDateHistory พร้อม field ทั้งหมด + index 0 placeholder ---
        const newDateHistory = [];
        newDateHistory[0] = {
            DDI: "",
            DDO: "",
            ID: "",
            MMI: "",
            MMO: "",
            YYYYI: "",
            YYYYO: "",
            checkin: "",
            checkout: "",
            datecodeI: "",
            datecodeO: "",
            datein: "",
            dateout: "",
            shift: "",
            status: "",
            unixin: "",
            unixout: ""
        };

        for (let i = 1; i <= totalDays; i++) {
            const isTargetDay = (day === i);
            const d = sourceDateHistory[i] || {};

            const checkinTime = isTargetDay && checkin ? dayjs(checkin, "HH:mm:ss") : null;
            const checkoutTime = isTargetDay && checkout ? dayjs(checkout, "HH:mm:ss") : null;
            const isNextDay = isTargetDay && checkoutTime?.isBefore(checkinTime);
            const dateOutObj = isNextDay ? dateObj.add(1, "day") : dateObj;

            newDateHistory[i] = {
                DDI: isTargetDay ? String(day).padStart(2, "0") : "",
                DDO: isTargetDay ? String(dateOutObj.date()).padStart(2, "0") : "",
                ID: i,
                MMI: isTargetDay ? String(dateObj.month() + 1).padStart(2, "0") : "",
                MMO: isTargetDay ? String(dateOutObj.month() + 1).padStart(2, "0") : "",
                YYYYI: isTargetDay ? String(year) : "",
                YYYYO: isTargetDay ? String(dateOutObj.year()) : "",
                checkin: isTargetDay ? checkin ?? "" : "",
                checkout: isTargetDay ? checkout ?? "" : "",
                datecodeI: isTargetDay ? dateObj.format("YYYY.MMDD") : "",
                datecodeO: isTargetDay ? dateOutObj.format("YYYY.MMDD") : "",
                datein: isTargetDay ? empDate : "",
                dateout: isTargetDay ? dateOutObj.format("DD/MM/YYYY") : "",
                shift: d.shift || "",
                status: isTargetDay ? ((checkin === "" || checkout === "") ? 1 : 2) : d.status || "",
                unixin: isTargetDay && checkin
                    ? dayjs(`${empDate} ${checkin}`, "DD/MM/YYYY HH:mm:ss").valueOf()
                    : "",
                unixout: isTargetDay && checkout
                    ? dayjs(`${dateOutObj.format("DD/MM/YYYY")} ${checkout}`, "DD/MM/YYYY HH:mm:ss").valueOf()
                    : ""
            };
        }

        const attendantRef = ref(firebaseDB,
            `workgroup/company/${companyId}/employee/${empID}/attendant/${year}/${month + 1}`
        );

        try {
            const snapshot = await get(attendantRef);
            const exists = snapshot.exists();

            if (!exists) {
                const monthObject = newDateHistory.reduce((acc, item, index) => {
                    acc[index] = item;
                    return acc;
                }, {});
                await update(attendantRef, monthObject);
            } else {
                const dayIndex = newDateHistory.findIndex(d => d.datein === empDate);
                if (dayIndex > 0) {
                    await update(attendantRef, {
                        [dayIndex]: newDateHistory[dayIndex]
                    });
                }
            }

            ShowSuccess("เพิ่มเวลาสำเร็จ");
            setEmployID("");
            setEmployDate("");
            setCheckin("");
            setCheckout("");

        } catch (error) {
            ShowError("เกิดข้อผิดพลาดในการบันทึก");
            console.error(error);
        }
    };

    // const handleSave = () => {
    //     const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

    //     const invalidMessages = [];

    //     leave.forEach((row, rowIndex) => {
    //         columns.forEach((col) => {
    //             const value = row[col.key];

    //             if (value === "") {
    //                 invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
    //                 return;
    //             }

    //             if (col.type === "number" && isNaN(Number(value))) {
    //                 invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
    //                 return;
    //             }

    //             if (
    //                 col.type === "select" &&
    //                 !col.options?.some(opt => opt.value === value)
    //             ) {
    //                 invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
    //                 return;
    //             }
    //         });
    //     });

    //     // ✅ ตรวจสอบว่า level.name ซ้ำหรือไม่
    //     const names = leave.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
    //     const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    //     if (duplicates.length > 0) {
    //         invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
    //     }

    //     // ❌ แสดงคำเตือนถ้ามีข้อผิดพลาด
    //     if (invalidMessages.length > 0) {
    //         ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
    //         return;
    //     }

    //     // ✅ บันทึกเมื่อผ่านเงื่อนไข
    //     set(companiesRef, leave)
    //         .then(() => {
    //             ShowSuccess("บันทึกข้อมูลสำเร็จ");
    //             console.log("บันทึกสำเร็จ");
    //             setIncompleteTime(false);
    //         })
    //         .catch((error) => {
    //             ShowError("เกิดข้อผิดพลาดในการบันทึก");
    //             console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
    //         });
    // };

    // const handleCancel = () => {
    //     const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

    //     onValue(leaveRef, (snapshot) => {
    //         const leaveData = snapshot.val() || [{ ID: 0, name: '' }];
    //         setLeave(leaveData);
    //         setIncompleteTime(false);
    //     }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    // };

    return (
        <React.Fragment>
            {/* <Grid item size={editIncomepleteTime ? 12 : 11}> */}
            <Grid item size={12}>
                {
                    // editIncomepleteTime ?
                    //     <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                    //         <TableExcel
                    //             columns={columns}
                    //             initialData={department}
                    //             onDataChange={setDepartment}
                    //         />
                    //     </Paper>
                    //     :
                    <TableContainer component={Paper} textAlign="center" sx={{ height: "70vh", width: "100%" }}>
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                            <TableHead
                                sx={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 2,
                                    backgroundColor: theme.palette.primary.dark,
                                }}
                            >
                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                    <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                    <TablecellHeader sx={{ width: 120 }}>วันที่</TablecellHeader>
                                    <TablecellHeader sx={{ width: 120 }}>กะการทำงาน</TablecellHeader>
                                    <TablecellHeader sx={{ width: 120 }}>เวลาทำงาน</TablecellHeader>
                                    <TablecellHeader>การลงเวลา</TablecellHeader>
                                    <TablecellHeader sx={{ width: 200 }}>หมายเหตุ</TablecellHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    merged.length === 0 ?
                                        <TableRow sx={{ height: "60vh" }}>
                                            <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                        </TableRow>
                                        :
                                        merged.map((emp, index) => (
                                            <React.Fragment>
                                                {
                                                    emp.dateHistory
                                                        .filter(date => date.message === "ขาดงาน").length > 0 &&
                                                    <TableRow>
                                                        <TableCell sx={{ textAlign: "left", height: "50px", backgroundColor: theme.palette.primary.light }} colSpan={6}>
                                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", paddingLeft: 2 }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 2 }} gutterBottom>รหัสพนักงาน : {emp.employeecode}</Typography>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>{emp.employname}</Typography>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>({emp.nickname})</Typography>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>
                                                                    ฝ่ายงาน {
                                                                        emp.department?.split("-")[1]?.startsWith("ฝ่าย")
                                                                            ? emp.department.split("-")[1].replace("ฝ่าย", "").trim()
                                                                            : emp.department?.split("-")[1] || ""
                                                                    }
                                                                </Typography>
                                                                {
                                                                    emp.section.split("-")[1] !== "ไม่มี" &&
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>ส่วนงาน {emp.section.split("-")[1]}</Typography>
                                                                }
                                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ตำแหน่ง {emp.position.split("-")[1]}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                }
                                                {
                                                    // (emp.attendant ?? emp.dateHistory)
                                                    emp.dateHistory.filter(date => date.message === "ขาดงาน")
                                                        .map((date, index) => (
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{formatThaiShort(dayjs(date.date, "DD/MM/YYYY"))}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {typeof date.workshift === "string" && date.workshift.includes("-")
                                                                        ? date.workshift.split("-")[1]
                                                                        : ""}
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{`${date.start} - ${date.stop}`}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {
                                                                        empID === emp.employeeID &&
                                                                            empDate === dayjs(date.date, "DD/MM/YYYY").format("DD/MM/YYYY") ?
                                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                <Grid container spacing={1}>
                                                                                    <Grid item size={5}>
                                                                                        <TimePicker
                                                                                            label="เข้างาน"
                                                                                            value={dayjs(checkin, 'HH:mm:ss')}
                                                                                            onChange={(newValue) => setCheckin(newValue.format('HH:mm:ss'))}
                                                                                            views={['hours', 'minutes', 'seconds']}
                                                                                            ampm={false}
                                                                                            slotProps={{
                                                                                                textField: {
                                                                                                    size: 'small',
                                                                                                    fullWidth: true,
                                                                                                    sx: {
                                                                                                        '& .MuiOutlinedInput-root': {
                                                                                                            height: 25, // ปรับความสูงที่นี่
                                                                                                        },
                                                                                                        '& .MuiInputBase-input': {
                                                                                                            height: '100%',
                                                                                                            padding: "0 8px",
                                                                                                            fontSize: "14px",
                                                                                                        },
                                                                                                        '& .MuiInputLabel-root': {
                                                                                                            fontSize: "14px",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item size={5}>
                                                                                        <TimePicker
                                                                                            label="ออกงาน"
                                                                                            value={dayjs(checkout, 'HH:mm:ss')}
                                                                                            onChange={(newValue) => setCheckout(newValue.format('HH:mm:ss'))}
                                                                                            views={['hours', 'minutes', 'seconds']}
                                                                                            ampm={false}
                                                                                            slotProps={{
                                                                                                textField: {
                                                                                                    size: 'small',
                                                                                                    fullWidth: true,
                                                                                                    sx: {
                                                                                                        '& .MuiOutlinedInput-root': {
                                                                                                            height: 25, // ปรับความสูงที่นี่
                                                                                                        },
                                                                                                        '& .MuiInputBase-input': {
                                                                                                            height: '100%',
                                                                                                            padding: "0 8px",
                                                                                                            fontSize: "14px",
                                                                                                        },
                                                                                                        '& .MuiInputLabel-root': {
                                                                                                            fontSize: "14px",
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                    </Grid>
                                                                                    <Grid item size={2}>
                                                                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                                            <IconButton onClick={() => handleSave(emp.employeeID, date)}>
                                                                                                <SaveIcon color="success" />
                                                                                            </IconButton>
                                                                                            <IconButton onClick={() => handleCancel()}>
                                                                                                <DisabledByDefaultIcon color="error" />
                                                                                            </IconButton>
                                                                                        </Box>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </LocalizationProvider>
                                                                            // <Grid container spacing={2}>
                                                                            //     <Grid item size={5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                            //         <TextField
                                                                            //             type="time"
                                                                            //             size="small"
                                                                            //             fullWidth
                                                                            //             InputProps={{
                                                                            //                 startAdornment: (
                                                                            //                     <InputAdornment
                                                                            //                         position="start"
                                                                            //                         sx={{ display: "flex", alignItems: "center", ml: 1 }}
                                                                            //                     >
                                                                            //                         <Typography
                                                                            //                             variant="body1"
                                                                            //                             fontWeight="bold"
                                                                            //                             sx={{ whiteSpace: "nowrap", fontSize: "14px" }}
                                                                            //                         >
                                                                            //                             เข้างาน :
                                                                            //                         </Typography>
                                                                            //                     </InputAdornment>
                                                                            //                 ),
                                                                            //                 sx: {
                                                                            //                     height: 30, // ปรับความสูง input
                                                                            //                     padding: 0,
                                                                            //                     '& input': {
                                                                            //                         height: 30,
                                                                            //                         padding: "0 8px", // ปรับให้พอดีช่อง
                                                                            //                         fontSize: 14,
                                                                            //                     }
                                                                            //                 }
                                                                            //             }}
                                                                            //             sx={{
                                                                            //                 '& .MuiOutlinedInput-root': {
                                                                            //                     height: 30,
                                                                            //                     fontSize: 14,
                                                                            //                 }
                                                                            //             }}
                                                                            //         />
                                                                            //     </Grid>
                                                                            //     <Grid item size={5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                            //         <TextField
                                                                            //             type="time"
                                                                            //             size="small"
                                                                            //             fullWidth
                                                                            //             InputProps={{
                                                                            //                 startAdornment: (
                                                                            //                     <InputAdornment
                                                                            //                         position="start"
                                                                            //                         sx={{ display: "flex", alignItems: "center", ml: 1 }}
                                                                            //                     >
                                                                            //                         <Typography
                                                                            //                             variant="body1"
                                                                            //                             fontWeight="bold"
                                                                            //                             sx={{ whiteSpace: "nowrap", fontSize: "14px" }}
                                                                            //                         >
                                                                            //                             ออกงาน :
                                                                            //                         </Typography>
                                                                            //                     </InputAdornment>
                                                                            //                 ),
                                                                            //                 sx: {
                                                                            //                     height: 30, // ปรับความสูง input
                                                                            //                     padding: 0,
                                                                            //                     '& input': {
                                                                            //                         height: 30,
                                                                            //                         padding: "0 8px", // ปรับให้พอดีช่อง
                                                                            //                         fontSize: 14,
                                                                            //                     }
                                                                            //                 }
                                                                            //             }}
                                                                            //             sx={{
                                                                            //                 '& .MuiOutlinedInput-root': {
                                                                            //                     height: 30,
                                                                            //                     fontSize: 14,
                                                                            //                 }
                                                                            //             }}
                                                                            //         />
                                                                            //     </Grid>
                                                                            //     <Grid item size={2}>
                                                                            //         <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                            //             <IconButton onClick={() => handleSave(emp.employeeID, date)}>
                                                                            //                 <SaveIcon color="success" />
                                                                            //             </IconButton>
                                                                            //             <IconButton onClick={() => handleCancel()}>
                                                                            //                 <DisabledByDefaultIcon color="error" />
                                                                            //             </IconButton>
                                                                            //         </Box>
                                                                            //     </Grid>
                                                                            // </Grid>
                                                                            :
                                                                            <Box>
                                                                                {
                                                                                    (date.checkin === "" && date.checkout === "") ?
                                                                                        ""
                                                                                        : date.checkin === "" ?
                                                                                            `ลงชื่อออก ${date.checkout}`
                                                                                            : date.checkout === "" ?
                                                                                                `ลงชื่อเข้า ${date.checkin}`
                                                                                                :
                                                                                                `เข้า ${date.checkin} - ออก ${date.checkout}`
                                                                                }
                                                                                <Tooltip title="เพิ่มเวลา" placement="right">
                                                                                    <IconButton onClick={() => handleUpdateTime(emp.employeeID, date.date)}>
                                                                                        <AddAlarmIcon color="warning" />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Box>
                                                                    }
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center", color: theme.palette.error.main, fontWeight: "bold" }}>{date.message}</TableCell>
                                                            </TableRow>
                                                        ))
                                                }
                                            </React.Fragment>
                                        ))
                                }
                            </TableBody>

                        </Table>
                    </TableContainer>
                }
            </Grid>
        </React.Fragment>
    )
}

export default MissingWorkDetail