import * as React from 'react';
import * as XLSX from "xlsx";
import { getDatabase, ref, push, onValue, set, update, child } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GirlIcon from '@mui/icons-material/Girl';
import BoyIcon from '@mui/icons-material/Boy';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import CloseIcon from '@mui/icons-material/Close';
import theme from '../../theme/theme';
import { IconButtonError, Item, ItemReport, TablecellHeader } from '../../theme/style';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import { useRef } from 'react';
import { ShowError, ShowSuccess } from '../../sweetalert/sweetalert';
import { useTranslation } from 'react-i18next';

export default function UpdateEmployee({ item, index, leave, date }) {
    const { firebaseDB, domainKey } = useFirebase();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [open, setOpen] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [employeeID, setEmployeeID] = useState(item.employeecode);
    const [name, setName] = useState(item.employname.split(" ")[0]);
    const [lastName, setLastName] = useState(item.employname.split(" ")[1]);
    const [department, setDepartment] = useState(item.department);
    const [section, setSection] = useState(item.section);
    const [openSex, setOpenSex] = React.useState(item.sex === "ชาย" ? true : false);
    const [leaves, setLeaves] = useState(item.empleave);
    const [month, setMonth] = useState(date.month() + 1);
    const [year, setYear] = useState(date.format("YYYY"));
    // const [leavePersonal, setLeavePersonal] = useState(item.empleave[0]?.number || 0);
    // const [leaveSick, setLeaveSick] = useState(item.empleave[1]?.number || 0);
    // const [leaveVacation, setLeaveVacation] = useState(item.empleave[2]?.number || 0);
    // const [leaveTraining, setLeaveTraining] = useState(item.empleave[3]?.number || 0);
    // const [leaveMaternity, setLeaveMaternity] = useState(item.empleave[4]?.number || 0);
    // const [leaveSterilization, setLeaveSterilization] = useState(item.empleave[5]?.number || 0);

    const translateLeaveName = (name, t) => {
        const mapping = {
            "ลาป่วย": t("leave.sickLeave"),
            "ลากิจได้รับค่าจ้าง": t("leave.personalLeavePaid"),
            "ลากิจไม่ได้รับค่าจ้าง": t("leave.personalLeaveUnpaid"),
            "ลาหยุดพักผ่อน": t("leave.annualLeave"),
            "ลาคลอดบุตร": t("leave.maternityLeave"),
            "ลาไปช่วยเหลือภรรยาที่คลอดบุตร": t("leave.paternitySupportLeave"),
            "ลาเพื่อเข้ารับการคัดเลือกทหาร": t("leave.militarySelectionLeave"),
            "ลาอุปสมบท": t("leave.ordinationLeave"),
            "ลาเพื่อทำหมัน": t("leave.sterilizationLeave"),
            "ลาฝึกอบรม": t("leave.trainingLeave"),
            "ลาเพื่อจัดการศพ": t("leave.funeralLeave"),
        };

        return mapping[name] || name;
    };

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            if (!employeeData) {
                setEmployees([]);
            } else {
                const employeeArray = Object.values(employeeData);
                setEmployees(employeeArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = async () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);
        // ✅ บันทึก
        update(child(companiesRef, String(item.ID)), {
            employeecode: employeeID,
            employname: `${name} ${lastName}`,
            department: department,
            section: section,
            sex: openSex ? "ชาย" : "หญิง",
            leave: ""
        })
            .then(() => {
                ShowSuccess(t("success"), t("ok"));
                setOpen(null);
                setEmployeeID(item.employeecode);
                setName(item.employname.split(" ")[0]);
                setLastName(item.employname.split(" ")[1]);
                setDepartment(item.department);
                setSection(item.section);
                setOpenSex(item.sex === "ชาย" ? true : false);
                // setLeavePersonal(item.empleave[0]?.number || 0);
                // setLeaveSick(item.empleave[1]?.number || 0);
                // setLeaveVacation(item.empleave[2]?.number || 0);
                // setLeaveTraining(item.empleave[3]?.number || 0);
                // setLeaveMaternity(item.empleave[4]?.number || 0);
                // setLeaveSterilization(item.empleave[5]?.number || 0);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
                ShowError(t("error"), t("ok"));
            });
    };

    return (
        <React.Fragment>
            <TableRow key={item.ID} onClick={() => setOpen(item.ID)}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "rgba(41, 181, 148, 0.19)", // สีน้ำเงินจาง (ปรับตาม theme ได้)
                    },
                }}>
                <TableCell sx={{ width: 50, textAlign: "center" }}>{index + 1}</TableCell>
                <TableCell sx={{ width: 100, textAlign: "center" }}>{employeeID}</TableCell>
                <TableCell sx={{ width: 300, textAlign: "center", position: "sticky", left: 0 }}>
                    <Box sx={{ backgroundColor: "white" }}>{name + lastName}</Box>
                </TableCell>
                <TableCell sx={{ width: 150, textAlign: "center" }}>{openSex ? "ชาย" : "หญิง"}</TableCell>
                <TableCell sx={{ width: 150, textAlign: "center" }}> </TableCell>
                {leave.map((header) => {
                    // sort item.empleave ตาม ID ก่อน
                    const sortedLeave = [...item.empleave].sort((a, b) => a.ID - b.ID);

                    // หา leave ของพนักงานที่ตรง header
                    const leaveType = sortedLeave.find(l => l.ID === header.ID);

                    console.log("leaveType : ", leaveType);

                    // แสดงค่าตาม no (ถ้ามี) หรือ 0/max
                    return (
                        <TableCell key={header.ID} sx={{ width: 200, textAlign: "center" }}>
                            {leaveType ? `${item.empleaveapprove?.[year]?.[month]?.filter((row) => row.leave === leaveType.name).length || 0}/${leaveType.max}` : `-`}
                        </TableCell>
                    );
                })}
            </TableRow>
            <Dialog
                open={open === item.ID ? true : false}
                onClose={() => setOpen(null)}
                PaperProps={{
                    sx: {
                        borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                        width: "600px",
                        height: "90vh", // <<< เท่ากับ Dialog หลัก
                        position: "absolute",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{t("updateEmployeeTitle")}</Typography>
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }} onClick={() => setOpen(null)}>
                                <CloseIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                </DialogTitle>
                <DialogContent
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        overflowY: 'auto',
                        height: "300px", // หรือความสูง fixed ที่คุณใช้
                    }}
                >
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >{t("generalInfo")}</Typography>
                    <Grid container spacing={2} marginLeft={2}>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("employeeId")}</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={employeeID}
                                onChange={(e) => setEmployeeID(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}></Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("firstName")}</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("lastName")}</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("department")}</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("section")}</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("sex")}</Typography>
                            <Grid container spacing={5} marginLeft={1} marginRight={1} >
                                <Grid item size={1} />
                                <Grid item size={5}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: openSex ? "#81d4fa" : "#eeeeee",
                                        cursor: "pointer",
                                        borderRadius: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setOpenSex(true)}
                                >
                                    <Typography variant="h4" fontWeight="bold" color={openSex ? "white" : "textDisabled"} gutterBottom>{t("male")}</Typography>
                                    <BoyIcon
                                        sx={{ fontSize: 70, color: openSex ? "white" : "lightgray" }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={5}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: openSex ? "#eeeeee" : "#f48fb1",
                                        cursor: "pointer",
                                        borderRadius: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setOpenSex(false)}
                                >
                                    <Typography variant="h4" fontWeight="bold" color={openSex ? "textDisabled" : "white"} gutterBottom>{t("female")}</Typography>
                                    <GirlIcon
                                        color="disabled"
                                        sx={{ fontSize: 70, color: openSex ? "lightgray" : "white" }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={1} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >{t("leaveInfo")}</Typography>
                    <Grid container spacing={2} marginLeft={2}>
                        {item.empleave.map((lv, index) => (
                            <Grid item size={6} key={lv.ID}>
                                <Typography variant="subtitle2" fontWeight="bold">{translateLeaveName(lv.name, t)}</Typography>
                                <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                    <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                        {/* TextField ครึ่งซ้าย */}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={item.empleaveapprove?.[year]?.[month]?.filter((row) => row.leave === lv.name).length || 0}
                                            //onChange={(e) => setLeavePersonal(e.target.value)}
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                height: "100%",
                                                "& .MuiInputBase-root": { height: "100%" },
                                                clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                            }}
                                        />

                                        {/* Paper ครึ่งขวา */}
                                        <Paper
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: "65%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: theme.palette.primary.main,
                                                color: "white",
                                                clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {lv.max || ""}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Grid container spacing={2} marginLeft={2}>
                        {/*     <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("personalLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leavePersonal}
                                        onChange={(e) => setLeavePersonal(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeavePersonal("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeavePersonal(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[0]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("sickLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveSick}
                                        onChange={(e) => setLeaveSick(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeaveSick("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeaveSick(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[1]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("vacationLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveVacation}
                                        onChange={(e) => setLeaveVacation(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeaveVacation("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeaveVacation(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[2]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("trainingLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveTraining}
                                        onChange={(e) => setLeaveTraining(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeaveTraining("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeaveTraining(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[3]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("maternityLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveMaternity}
                                        onChange={(e) => setLeaveMaternity(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeaveMaternity("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeaveMaternity(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[4]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("sterilizationLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveSterilization}
                                        onChange={(e) => setLeaveSterilization(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                            },
                                            clipPath: "polygon(0 0, 70% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                setLeaveSterilization("");
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setLeaveSterilization(0);
                                            }
                                        }}
                                    />

                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: "65%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.empleave[5]?.max || ""}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid> */}
                        <Grid item size={12} sx={{ marginTop: 2 }}>
                            <Divider sx={{ marginTop: 1, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                        </Grid>
                        <Grid item size={12}>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Button variant="contained" color="error" size="medium" sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }} onClick={() => setOpen(false)}>
                                    {t("cancel")}
                                </Button>
                                <Button variant="contained" color="success" size="medium" sx={{ marginTop: 2, marginBottom: 2 }} onClick={handleSave}>
                                    {t("save")}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}