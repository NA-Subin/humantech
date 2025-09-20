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

export default function AddEmployee() {
    const { firebaseDB, domainKey } = useFirebase();
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
    const [leavePersonal, setLeavePersonal] = useState("");
    const [leaveSick, setLeaveSick] = useState("");
    const [leaveVacation, setLeaveVacation] = useState("");
    const [leaveTraining, setLeaveTraining] = useState("");
    const [leaveMaternity, setLeaveMaternity] = useState("");
    const [leaveSterilization, setLeaveSterilization] = useState("");

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
        update(child(companiesRef, String(employees.length)), {
            ID: employees.length,
            employeecode: employeeID,
            employname: `${name} ${lastName}`,
            department: department,
            section: section,
            sex: openSex ? "ชาย" : "หญิง",
            leave: {
                0: {
                    ID: 0,
                    name: "ลากิจ",
                    max: leavePersonal
                },
                1: {
                    ID: 1,
                    name: "ลาป่วย",
                    max: leaveSick
                },
                2: {
                    ID: 2,
                    name: "ลาพักร้อน",
                    max: leaveVacation
                },
                3: {
                    ID: 3,
                    name: "ลาฝึกอบรม",
                    max: leaveTraining
                },
                4: {
                    ID: 4,
                    name: "ลาคลอด",
                    max: leaveMaternity
                },
                5: {
                    ID: 5,
                    name: "ลาเพื่อทำหมัน",
                    max: leaveSterilization
                }
            }
        })
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                setOpen(false);
                setEmployeeID("");
                setName("");
                setLastName("");
                setDepartment("");
                setSection("");
                setOpenSex(true);
                setLeavePersonal("");
                setLeaveSick("");
                setLeaveVacation("");
                setLeaveTraining("");
                setLeaveMaternity("");
                setLeaveSterilization("");
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
            });
    };

    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setOpen(true)}
            >
                เพิ่มพนักงาน
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
                            <Typography variant="h6" fontWeight="bold" gutterBottom>เพิ่มข้อมูลพนักงาน</Typography>
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
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >ข้อมูลทั่วไป</Typography>
                    <Grid container spacing={2} marginLeft={2}>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >รหัสพนักงาน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={employeeID}
                                onChange={(e) => setEmployeeID(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}></Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >สกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold">ฝ่ายงาน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold">ส่วนงาน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เพศ</Typography>
                            <Grid container spacing={5} marginLeft={4} marginRight={4} >
                                <Grid item size={1.5} />
                                <Grid item size={4.5}
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
                                    <Typography variant="h4" fontWeight="bold" color={openSex ? "white" : "textDisabled"} gutterBottom>ชาย</Typography>
                                    <BoyIcon
                                        sx={{ fontSize: 70, color: openSex ? "white" : "lightgray" }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={4.5}
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
                                    <Typography variant="h4" fontWeight="bold" color={openSex ? "textDisabled" : "white"} gutterBottom>หญิง</Typography>
                                    <GirlIcon
                                        color="disabled"
                                        sx={{ fontSize: 70, color: openSex ? "lightgray" : "white" }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={1.5} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 2, marginBottom: 1 }} >ข้อมูลการลา</Typography>
                    <Grid container spacing={2} marginLeft={2}>
                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลากิจ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leavePersonal}
                                onChange={(e) => setLeavePersonal(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลาป่วย</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leaveSick}
                                onChange={(e) => setLeaveSick(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลาพักร้อน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leaveVacation}
                                onChange={(e) => setLeaveVacation(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลาฝึกอบรม</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leaveTraining}
                                onChange={(e) => setLeaveTraining(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลาคลอด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leaveMaternity}
                                onChange={(e) => setLeaveMaternity(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={3}>
                            <Typography variant="subtitle2" fontWeight="bold">ลาเพื่อทำหมัน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={leaveSterilization}
                                onChange={(e) => setLeaveSterilization(e.target.value)}
                            />
                        </Grid>

                        <Grid item size={12}>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Button variant="contained" color="error" size="medium" sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }} onClick={() => setOpen(false)}>
                                    ยกเลิก
                                </Button>
                                <Button variant="contained" color="success" size="medium" sx={{ marginTop: 2, marginBottom: 2 }} onClick={handleSave}>
                                    บันทึกข้อมูล
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}