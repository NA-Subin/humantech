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
import { Button, Chip, Dialog, DialogContent, DialogTitle, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import { useRef } from 'react';
import { ShowError, ShowSuccess } from '../../sweetalert/sweetalert';
import { useTranslation } from 'react-i18next';

export default function AddEmployee() {
    const { firebaseDB, domainKey } = useFirebase();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [employeeID, setEmployeeID] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [openSex, setOpenSex] = React.useState(true);
    const [leave, setLeave] = useState([]);
    const [leavePersonal, setLeavePersonal] = useState(0);
    const [leaveSick, setLeaveSick] = useState(0);
    const [leaveVacation, setLeaveVacation] = useState(0);
    const [leaveTraining, setLeaveTraining] = useState(0);
    const [leaveMaternity, setLeaveMaternity] = useState(0);
    const [leaveSterilization, setLeaveSterilization] = useState(0);
    const [selected, setSelected] = useState([]);

    const handleSelect = (item, index) => {
        const isSelected = selected.some(sel => sel.ID === item.ID);

        if (isSelected) {
            const updated = selected.filter(sel => sel.ID !== item.ID);
            setSelected(
                updated.map((sel, idx) => ({
                    no: idx,
                    ID: sel.ID,
                    name: sel.name,
                    max: sel.max ?? sel.maxDaysPerYear, // ✅ fallback ป้องกัน undefined
                }))
            );
        } else {
            const newItem = { ...item, no: selected.length };
            const updated = [...selected, newItem];
            setSelected(
                updated.map((sel, idx) => ({
                    no: idx,
                    ID: sel.ID,
                    name: sel.name,
                    max: sel.max ?? sel.maxDaysPerYear, // ✅ fallback ป้องกัน undefined
                }))
            );
        }
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

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            if (!leaveData) {
                setLeave([]);
            } else {
                const leaveArray = Object.values(leaveData);
                setLeave(leaveArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = async () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);
        // ✅ บันทึก
        update(child(companiesRef, String(employees.length)), {
            ID: employees.length,
            employeecode: employeeID,
            employname: `${name} ${lastName}`,
            department: department,
            section: section,
            sex: openSex ? "ชาย" : "หญิง",
            empleave: selected,
        })
            .then(() => {
                ShowSuccess(t("success"), t("ok"));
                setOpen(false);
                setEmployeeID("");
                setName("");
                setLastName("");
                setDepartment("");
                setSection("");
                setOpenSex(true);
                setSection([]);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
                ShowError(t("error"), t("ok"));
            });
    };

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


    console.log("leave", leave);
    console.log("selected", selected);

    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setOpen(true)}
            >
                {t("addEmployee")}
            </Button>
            <Dialog
                open={open ? true : false}
                onClose={() => setOpen(false)}
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
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{t("addEmployeeTitle")}</Typography>
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }} onClick={() => setOpen(false)}>
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
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >{t("addLeaveTitle")}</Typography>
                    <Grid container spacing={2} marginLeft={2} marginBottom={1}>
                        <Grid item size={12} sx={{ marginTop: -1 }}>
                            {leave.map((item, index) => {
                                const isSelected = selected.some(sel => sel.name === item.name);

                                return (
                                    <Chip
                                        key={index}
                                        label={translateLeaveName(item.name, t)}
                                        onClick={() => handleSelect(item, index)}
                                        color={isSelected ? "primary" : "default"}
                                        variant={isSelected ? "filled" : "outlined"}
                                        sx={{
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            minWidth: 140,
                                            marginRight: 1,
                                            marginTop: 1,
                                            fontSize: "14px"
                                        }}
                                    />
                                );
                            })}

                        </Grid>
                    </Grid>

                    <Grid container spacing={2} marginLeft={2}>
                        {/*     <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("personalLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leavePersonal}
                                        onChange={(e) => setLeavePersonal(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("sickLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveSick}
                                        onChange={(e) => setLeaveSick(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("vacationLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveVacation}
                                        onChange={(e) => setLeaveVacation(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("trainingLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveTraining}
                                        onChange={(e) => setLeaveTraining(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("maternityLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveMaternity}
                                        onChange={(e) => setLeaveMaternity(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">{t("sterilizationLeave")}</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                                <Box sx={{ position: "relative", width: "100%", height: 40 }}>
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "left",
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0% 100%)", // ซ้ายเฉียง
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginLeft: 1 }}>
                                            {t("max")}
                                        </Typography>
                                    </Paper>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaveSterilization}
                                        onChange={(e) => setLeaveSterilization(e.target.value)}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            height: "100%",
                                            "& .MuiInputBase-root": {
                                                height: "100%",
                                                textAlign: "center",
                                                paddingLeft: 7
                                            },
                                            clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)", // ขวาเฉียง
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
                                </Box>
                            </Box>
                        </Grid> */}
                        <Grid item size={12}>
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