import * as React from 'react';
import * as XLSX from "xlsx";
import { getDatabase, ref, push, onValue, set, update, child, get } from "firebase/database";
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
import { Button, Chip, Dialog, DialogContent, DialogTitle, InputAdornment, MenuItem, Slider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import { useRef } from 'react';
import { ShowError, ShowSuccess } from '../../sweetalert/sweetalert';
import { useTranslation } from 'react-i18next';

export default function AddLeave() {
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
    const [employ, setEmploy] = useState({});
    const [leave, setLeave] = useState([]);
    const [dateLeave, setDateLeave] = useState(dayjs());
    const [timeStart, setTimeStart] = useState(dayjs().set("hour", 8).set("minute", 0));
    const [timeEnd, setTimeEnd] = useState(dayjs().set("hour", 17).set("minute", 0));
    const [selectedID, setSelectedID] = useState(null); // ✅ บอกว่าเลือกหลอดไหนอยู่
    const [leaves, setLeaves] = useState("");
    const date = dayjs(new Date());
    const [month, setMonth] = useState(date.month() + 1);
    const [year, setYear] = useState(date.format("YYYY"));

    const handleChangeEmployee = (event) => {
        const selectedEmployee = event.target.value;
        setEmploy(selectedEmployee);
        setLeave(selectedEmployee.leave);
    }

    console.log("Employ : ", employ);
    console.log("leaves : ", leaves);

    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setDateLeave(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
            setMonth(newValue.month() + 1); // month ของ dayjs เริ่มจาก 0
            setYear(newValue.year());

            const updatedLeave = (employ?.empleave || []).map((lv) => {
                const number = (employ?.empleaveapprove[year][month] || []).filter(l => l.leave === lv.name).length;
                return { ...lv, number };
            });

            setLeave(updatedLeave); // ✅ number จะแสดงตั้งแต่เลือกพนักงาน
        }
    };

    const handleDateChangeTimeStart = (newValue) => {
        if (newValue) {
            setTimeStart(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const handleDateChangeTimeEnd = (newValue) => {
        if (newValue) {
            setTimeEnd(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const [selectedId, setSelectedId] = useState(null);
    const [leaveName, setLeaveName] = useState("");

    console.log("leaveName : ", leaveName);

    const handleClick = (lv) => {
        setLeaveName(lv.name);

        setLeave((prev) => prev.map((item) => {
            if (item.ID === lv.ID) {
                const currentNumber = item.number || 0;

                if (selectedId === lv.ID) {
                    // กดซ้ำ → ปลดล็อกและลดจำนวน 1
                    setSelectedId(null);
                    return { ...item, number: Math.max(0, currentNumber - 1) };
                }

                if (!selectedId) {
                    // เลือกช่องนี้ → เพิ่ม 1 และล็อกช่องอื่น
                    setSelectedId(lv.ID);
                    return { ...item, number: currentNumber + 1 };
                }

                // ช่องอื่น ๆ ถูกล็อก → ไม่ทำอะไร
                return item;
            }
            return item;
        }));
    };

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const docLeaveRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${employ?.ID}/empleaveapprove/${year}/${month}`);

        const unsubscribe = onValue(docLeaveRef, (snapshot) => {
            const docLeaveData = snapshot.val() || {};

            setLeaves(Object.values(docLeaveData));
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, year, month]);

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
        try {
            const docLeaveRef = ref(firebaseDB, `workgroup/company/${companyId}/documentleave/${year}/${month}`);
            const approveRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${employ?.ID}/empleaveapprove/${year}/${month}`);

            const startDate = dayjs(dateLeave, "DD/MM/YYYY");
            const endDate = dayjs(dateLeave, "DD/MM/YYYY");
            const dayCount = endDate.diff(startDate, "day") + 1;

            // ฟังก์ชันสร้าง object
            const createData = (id) => ({
                ID: id,
                empid: employ?.ID ?? 0,
                empname: employ?.employname ?? "",
                department: employ?.department ?? "",
                section: employ?.section ?? "",
                deptid: "0",
                secid: "0",
                hr: "0",
                leave: leaveName ?? "",
                leaveid: 0,
                doctype: "leave",
                status: "อนุมัติ",
                datestart: startDate.format("DD/MM/YYYY"),
                dateend: endDate.format("DD/MM/YYYY"),
                daterequest: dayjs().format("DD/MM/YYYY"),
                day: String(dayCount),
                timestart: timeStart?.format("HH:mm") ?? "08:00",
                timeend: timeEnd?.format("HH:mm") ?? "17:00",
                min: "0",
                remark: "",
                picture: "",
                YYYYF: startDate.year(),
                MMF: startDate.month() + 1,
                DDF: startDate.date(),
                YYYYT: endDate.year(),
                MMT: endDate.month() + 1,
                DDT: endDate.date(),
                datecodefrom: startDate.format("YYYY.MMDD"),
                datecodeto: endDate.format("YYYY.MMDD"),
            });

            // 🔹 อ่านจำนวนรายการปัจจุบันเพื่อสร้าง key
            const [docSnap, approveSnap] = await Promise.all([get(docLeaveRef), get(approveRef)]);
            const newKey = String(docSnap.exists() ? Object.keys(docSnap.val()).length : 0);
            const newKeyDoc = String(approveSnap.exists() ? Object.keys(approveSnap.val()).length : 0);

            // 🔹 บันทึกลง Firebase
            await Promise.all([
                set(child(docLeaveRef, newKey), createData(newKey)),
                set(child(approveRef, newKeyDoc), createData(newKeyDoc)),
            ]);

            ShowSuccess(t("success"), t("ok"));
            setOpen(false);
            setEmploy({});
            setLeave([]);
            setDateLeave(dayjs());
            setTimeStart(dayjs().set("hour", 8).set("minute", 0));
            setTimeEnd(dayjs().set("hour", 17).set("minute", 0));
            setSelectedId(null);
            setLeaveName("");
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            ShowError(t("error"), t("ok"));
        }
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

    console.log("employ : ", employ);
    console.log("leave : ", leave);
    console.log("employee : ", employees);

    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => setOpen(true)}
                sx={{ marginRight: 2 }}
            >
                {t("addLeave")}
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
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{t("leaveInfo")}</Typography>
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
                    {/* <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >{t("generalInfo")}</Typography> */}
                    <Grid container spacing={2} marginLeft={2} marginTop={2}>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("selectDate")}</Typography>
                            <Paper sx={{ width: "100%", marginRight: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={t("language")}>
                                    <DatePicker
                                        openTo="day"
                                        views={["year", "month", "day"]}
                                        value={dateLeave}
                                        format="DD/MM/YYYY"
                                        onChange={handleDateChangeDate}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: dateLeave ? dateLeave.format("DD/MM/YYYY") : "",
                                                    readOnly: true,
                                                },
                                                InputProps: {
                                                    // startAdornment: (
                                                    //     <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    //         <b>{t("selectDate")}</b>
                                                    //     </InputAdornment>
                                                    // ),
                                                    sx: {
                                                        fontSize: "16px",
                                                        height: "40px",
                                                        padding: "10px",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Paper>
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("selectStart")}</Typography>
                            <Paper sx={{ width: "100%", marginRight: 2 }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                    adapterLocale={t("language")} // ถ้าใช้ i18n
                                >
                                    <TimePicker
                                        ampm={false} // ✅ ใช้เวลา 24 ชม. (ถ้าอยากได้ 12 ชม. ใช้ true)
                                        views={["hours", "minutes", "seconds"]} // ✅ เลือกได้ถึงวินาที
                                        value={timeStart}
                                        onChange={handleDateChangeTimeStart}
                                        format="HH:mm" // ✅ หรือ "HH:mm:ss" ถ้าต้องการวินาที
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: timeStart ? timeStart.format("HH:mm") : "",
                                                    readOnly: true,
                                                },
                                                InputProps: {
                                                    sx: {
                                                        fontSize: "16px",
                                                        height: "40px",
                                                        padding: "10px",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Paper>
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("selectEnd")}</Typography>
                            <Paper sx={{ width: "100%", marginRight: 2 }}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                    adapterLocale={t("language")} // ถ้าใช้ i18n
                                >
                                    <TimePicker
                                        ampm={false} // ✅ ใช้เวลา 24 ชม. (ถ้าอยากได้ 12 ชม. ใช้ true)
                                        views={["hours", "minutes", "seconds"]} // ✅ เลือกได้ถึงวินาที
                                        value={timeEnd}
                                        onChange={handleDateChangeTimeEnd}
                                        format="HH:mm" // ✅ หรือ "HH:mm:ss" ถ้าต้องการวินาที
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true,
                                                inputProps: {
                                                    value: timeEnd ? timeEnd.format("HH:mm") : "",
                                                    readOnly: true,
                                                },
                                                InputProps: {
                                                    sx: {
                                                        fontSize: "16px",
                                                        height: "40px",
                                                        padding: "10px",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Paper>
                        </Grid>
                        {/* <Grid item size={6}></Grid> */}
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >{t("selectEmployee")}</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={employ?.ID ?? "-1"}
                                onChange={(e) => {
                                    const id = e.target.value.toString();

                                    // หา employee ที่ตรงกับ id
                                    const selected = employees.find(emp => emp.ID.toString() === id) || {};
                                    setEmploy(selected);

                                    // อัปเดต leave array พร้อมคำนวณ number สำหรับแต่ละ leave
                                    const updatedLeave = (selected?.empleave || []).map((lv) => {
                                        const number = (selected?.empleaveapprove[year][month] || []).filter(l => l.leave === lv.name).length;
                                        return { ...lv, number };
                                    });

                                    setLeave(updatedLeave); // ✅ number จะแสดงตั้งแต่เลือกพนักงาน
                                }}
                            >
                                <MenuItem value="-1">{t("pleaseSelectEmploy")}</MenuItem>

                                {employees.map((emp) => (
                                    <MenuItem key={emp.ID} value={emp.ID.toString()}>
                                        {emp.employname}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}>
                        <Chip label={<Typography variant="subtitle2" fontWeight="bold" >{t("addLeaveTitle")}</Typography>} />
                    </Divider>
                    <Grid container spacing={2} marginLeft={2}>
                        {leave.map((lv) => {
                            const percent = (lv.number / lv.max) * 100;
                            const isSelected = selectedId !== null && Number(selectedId) === Number(lv.ID);
                            const isLocked = selectedId !== null && !isSelected; // ช่องอื่น ๆ ล็อกถ้า selectedId มีค่า

                            return (
                                <Grid item size={6} key={lv.ID}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                        {translateLeaveName(lv.name, t)}
                                    </Typography>

                                    <Box
                                        onClick={() => !isLocked && handleClick(lv)}
                                        sx={{
                                            position: "relative",
                                            height: 30,
                                            width: "100%",
                                            borderRadius: 2,
                                            backgroundColor: theme.palette.grey[300],
                                            overflow: "hidden",
                                            cursor: isLocked ? "not-allowed" : "pointer",
                                            border: isSelected
                                                ? `3px solid ${theme.palette.primary.main}`
                                                : `1px solid ${theme.palette.divider}`,
                                            boxShadow: isSelected
                                                ? `0 0 6px ${theme.palette.primary.main}`
                                                : "none",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                height: "100%",
                                                width: `${percent}%`,
                                                backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.grey[400],
                                                transition: "width 0.25s ease",
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={"black"}
                                            // color={isSelected ? "white" : "black"}
                                            sx={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                            }}
                                        >
                                            {lv.number || 0}/{lv.max}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}


                        {/* <Grid item size={3}>
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