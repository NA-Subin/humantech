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
    const { dateArray } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [empID, setEmployID] = useState("");
    const [empDate, setEmployDate] = useState("");
    const [checkin, setCheckin] = useState("");
    const [checkout, setCheckout] = useState("");

    const result = Array.isArray(dateArray) ?
        dateArray.map((item) => {
            const { attendant = [], dateHistory = [] } = item;

            const newDateHistory = dateHistory.map((d) => {
                // หาวันที่ตรงกับ datein หรือ dateout
                const found = attendant.find((a) => {
                    const datein = a.DDI && a.MMI ? `${a.DDI}/${a.MMI}/2025` : null;
                    const dateout = a.DDO && a.MMO ? `${a.DDO}/${a.MMO}/2025` : null;
                    return d.date === datein || d.date === dateout;
                });

                let message = "ขาดงาน";
                let datein = "";
                let dateout = "";
                let checkin = "";
                let checkout = "";

                if (found) {
                    if (found.DDI && found.MMI) {
                        datein = `${found.DDI}/${found.MMI}/2025`;
                        checkin = found.checkin || ""; // เวลาเข้า
                    }

                    if (found.DDO && found.MMO) {
                        dateout = `${found.DDO}/${found.MMO}/2025`;
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

    const handleUpdateTime = (empID, empdate) => {
        setEmployID(empID);
        setEmployDate(empdate);
    }

    const handleCancel = () => {
        setEmployID("");
        setEmployDate("");
        setCheckin("");
        setCheckout("");
    }

    const handleSave = async (empID, newdate) => {
        console.log("new Date : ", newdate);
        const dateObj = dayjs(newdate.date, "DD/MM/YYYY");
        const year = dateObj.year();
        const m = dateObj.month(); // 0-based
        const day = dateObj.date();

        console.log("new Year : ", year);
        console.log("new Month : ", m);
        console.log("new Date : ", day);
        console.log("newdate.checkin: ", newdate.checkin);
        console.log("newdate.checkout: ", newdate.checkout);

        const checkinTime = dayjs(checkin, "HH:mm:ss");
        const checkoutTime = dayjs(checkout, "HH:mm:ss");

        const isNextDay = checkoutTime.isBefore(checkinTime);
        const dateOutObj = isNextDay ? dateObj.add(1, "day") : dateObj;

        const attendantRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${empID}/attendant/${year}/${m + 1}`);
        const atendantSnapshot = await get(attendantRef);
        const data = atendantSnapshot.val() || {};
        const index = Object.keys(data).length;

        const invalidMessages = {
            ID: index,
            DDI: checkin !== "" ? String(day).padStart(2, "0") : "",
            MMI: checkin !== "" ? String(m + 1).padStart(2, "0") : "",
            YYYYI: checkin !== "" ? year.toString() : "",
            datein: checkin !== "" ? dateObj.format("DD/MM/YYYY") : "",
            datecodeI: checkin !== "" ? dateObj.format("YYYY.MMDD") : "",

            DDO: checkout !== "" ? String(dateOutObj.date()).padStart(2, "0") : "",
            MMO: checkout !== "" ? String(dateOutObj.month() + 1).padStart(2, "0") : "",
            YYYYO: checkout !== "" ? dateOutObj.year().toString() : "",
            dateout: checkout !== "" ? dateOutObj.format("DD/MM/YYYY") : "",
            datecodeO: checkout !== "" ? dateOutObj.format("YYYY.MMDD") : "",

            checkin: checkin ?? "",
            checkout: checkout ?? "",

            status: (checkin === "" || checkout === "") ? 1 : 2,

            unixin: checkin === ""
                ? ""
                : dayjs(`${newdate.date} ${checkin}`, "DD/MM/YYYY HH:mm:ss").valueOf(),

            unixout: checkout === ""
                ? ""
                : dayjs(`${dateOutObj.format("DD/MM/YYYY")} ${checkout}`, "DD/MM/YYYY HH:mm:ss").valueOf(),
        };


        console.log("invalidMessages : ", invalidMessages);
        console.log("index : ", index.toString());

        try {
            await set(child(attendantRef, index.toString()), invalidMessages);
            ShowSuccess("เพิ่มเวลาสำเร็จ");
            setEmployID("");
            setEmployDate("");
            setCheckin("");
            setCheckout("");
        } catch (error) {
            ShowError("เกิดข้อผิดพลาดในการบันทึก");
            console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
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
                    <TableContainer component={Paper} textAlign="center" sx={{ height: "70vh", overflow: "auto" }}>
                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1080px" }}>
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
                                    result.length === 0 ?
                                        <TableRow sx={{ height: "60vh" }}>
                                            <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                        </TableRow>
                                        :
                                        result.map((emp, index) => (
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
                                                    emp.dateHistory
                                                        .filter(date => date.message === "ขาดงาน")
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
                                                                        empID === emp.employeeID && empDate === formatThaiShort(dayjs(date.date, "DD/MM/YYYY")) ?
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
                                                                                    <IconButton onClick={() => handleUpdateTime(emp.employeeID, formatThaiShort(dayjs(date.date, "DD/MM/YYYY")), date.checkin, date.checkout)}>
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