import React, { useState, useEffect, use } from "react";
import '../../../../App.css'
import { getDatabase, ref, push, onValue, set, get, serverTimestamp, update } from "firebase/database";
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

const IncomepleteTime = (props) => {
    const { dateArray } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [empID, setEmployID] = useState("");
    const [empDate, setEmployDate] = useState("");
    const [checkin, setCheckin] = useState("");
    const [checkout, setCheckout] = useState("");

    const result = dateArray.map((item) => {
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
            let attendantID = "";

            //console.log("found : ",found);

            if (found) {
                attendantID = found.ID;

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
                attendantID
            };
        });

        return {
            ...item,
            dateHistory: newDateHistory,
        };
    });

    const handleUpdateTime = (empID, empdate, newcheckin, newcheckout) => {
        setEmployID(empID);
        setEmployDate(empdate);
        setCheckin(newcheckin);
        setCheckout(newcheckout);
    }

    const handleCancel = () => {
        setEmployID("");
        setEmployDate("");
    }

    const handleSave = async (empID, newdate) => {
        console.log("new Date : ", newdate);
        const dateObj = dayjs(newdate.date, "DD/MM/YYYY"); // วันเริ่มต้น
        const year = dateObj.year();
        const m = dateObj.month(); // 0-based
        const day = dateObj.date(); // วันที่ในเดือน

        const checkinTime = dayjs(checkin, "HH:mm:ss");
        const checkoutTime = dayjs(checkout, "HH:mm:ss");

        // ตรวจสอบว่าข้ามวันหรือไม่
        const isNextDay = checkoutTime.isBefore(checkinTime);

        // หากข้ามวัน ให้ใช้วันที่ถัดไปสำหรับออกงาน
        const dateOutObj = isNextDay ? dateObj.add(1, "day") : dateObj;

        const attendantRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${empID}/attendant/${year}/${m + 1}/${newdate.attendantID}`);
        const atendantSnapshot = await get(attendantRef);
        const data = atendantSnapshot.val();

        const invalidMessages = {
            ...data,
            DDI: day,
            MMI: m + 1,
            YYYYI: year,
            datein: dateObj.format("DD/MM/YYYY"),
            datecodeI: dateObj.format("YYYY.DDMM"),

            DDO: dateOutObj.date(),
            MMO: dateOutObj.month() + 1,
            YYYYO: dateOutObj.year(),
            dateout: dateOutObj.format("DD/MM/YYYY"),
            datecodeO: dateOutObj.format("YYYY.DDMM"),

            checkin,
            checkout,
            status: 2,
            unixin: newdate.checkin === "" ? serverTimestamp() : data.unixin,
            unixout: newdate.checkout === "" ? serverTimestamp() : data.unixout,
        };

        console.log("invalidMessages : ", invalidMessages);

        update(attendantRef, invalidMessages)
            .then(() => {
                ShowSuccess("เพิ่มเวลาสำเร็จ");
                setEmployID("");
                setEmployDate("");
                setCheckin("");
                setCheckout("");
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    console.log("result : ", result);

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
                                    result.length === 0 ?
                                        <TableRow sx={{ height: "60vh" }}>
                                            <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                        </TableRow>
                                        :
                                        result.map((emp, index) => (
                                            emp.attendant !== undefined ?
                                                <React.Fragment>
                                                    {
                                                        emp.dateHistory
                                                            .filter(date => date.message !== "ขาดงาน" && date.message !== "ลงเวลาเข้าออกครบ").length !== 0 &&
                                                        <TableRow>
                                                            <TableCell sx={{ textAlign: "left", height: "50px", backgroundColor: theme.palette.primary.light }} colSpan={6}>
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", paddingLeft: 2 }}>
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 2 }} gutterBottom>รหัสพนักงาน : {emp.employeecode}</Typography>
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>{emp.employname}</Typography>
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>({emp.nickname})</Typography>
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>
                                                                        ฝ่ายงาน {emp.department.split("-")[1].startsWith("ฝ่าย")
                                                                            ? emp.department.split("-")[1].replace("ฝ่าย", "").trim()
                                                                            : emp.department.split("-")[1]}
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
                                                            .filter(date => date.message !== "ขาดงาน" && date.message !== "ลงเวลาเข้าออกครบ")
                                                            .map((date, index) => (
                                                                <TableRow>
                                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>{formatThaiShort(dayjs(date.date, "DD/MM/YYYY"))}</TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>{date.workshift.split("-")[1]}</TableCell>
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
                                                                                //             value={checkin}
                                                                                //             onChange={(e) => setCheckin(e.target.value)}
                                                                                //             fullWidth
                                                                                //             InputProps={{
                                                                                //                 step: 1,
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
                                                                                //             value={checkout}
                                                                                //             onChange={(e) => setCheckout(e.target.value)}
                                                                                //             InputProps={{
                                                                                //                 step: 1,
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
                                                                                //             <IconButton onClick={() => handleSave(emp.employeeID, date.date, date.workshift, date.attendantID)}>
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
                                                                                                <>
                                                                                                    <Tooltip title="เพิ่มเวลาเข้า" placement="left">
                                                                                                        <IconButton onClick={() => handleUpdateTime(emp.employeeID, formatThaiShort(dayjs(date.date, "DD/MM/YYYY")), date.checkin, date.checkout)}>
                                                                                                            <AddAlarmIcon color="warning" />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                    {`ลงชื่อออก ${date.checkout}`}
                                                                                                </>

                                                                                                : date.checkout === "" ?
                                                                                                    <>
                                                                                                        {`ลงชื่อเข้า ${date.checkin}`}
                                                                                                        <Tooltip title="เพิ่มเวลาออก" placement="right">
                                                                                                            <IconButton onClick={() => handleUpdateTime(emp.employeeID, formatThaiShort(dayjs(date.date, "DD/MM/YYYY")), date.checkin, date.checkout)}>
                                                                                                                <AddAlarmIcon color="warning" />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                    </>

                                                                                                    :
                                                                                                    `เข้า ${date.checkin} - ออก ${date.checkout}`
                                                                                    }
                                                                                </Box>
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center", color: theme.palette.error.main, fontWeight: "bold" }}>{date.message}</TableCell>
                                                                </TableRow>
                                                            ))
                                                    }
                                                </React.Fragment>
                                                :
                                                (
                                                    index === 0 &&
                                                    <TableRow sx={{ height: "60vh" }}>
                                                        <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                )
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

export default IncomepleteTime