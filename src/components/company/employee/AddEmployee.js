import React, { useState, useEffect, use, useMemo } from "react";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import '../../../App.css'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import BadgeIcon from '@mui/icons-material/Badge';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GirlIcon from '@mui/icons-material/Girl';
import BoyIcon from '@mui/icons-material/Boy';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FormControl, InputAdornment, InputLabel, MenuItem, Select } from "@mui/material";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import MuiExcelLikeTable from "../test";
import TableExcel from "../../../theme/TableExcel";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { DatePicker, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import "dayjs/locale/th";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { formatThaiFull, formatThaiSlash } from "../../../theme/DateTH";
import ThaiDateSelector from "../../../theme/ThaiDateSelector";
import ThaiAddressSelector from "../../../theme/ThaiAddressSelector";

// const Transition = React.forwardRef(function Transition(
//     props: TransitionProps & { children: React.ReactElement },
//     ref: React.Ref<unknown>,
// ) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

// const SlideTransition = React.forwardRef(function Transition(
//     props: TransitionProps & { children: React.ReactElement<any, any> },
//     ref: React.Ref<unknown>
// ) {
//     return <Slide direction="left" ref={ref} {...props} />;
// });


const AddEmployee = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [openSex, setOpenSex] = React.useState(true);
    const [openBike, setOpenBike] = React.useState("");
    const [openCar, setOpenCar] = React.useState("");
    const [openTruck, setOpenTruck] = React.useState("");
    const [militaryStatus, setMilitaryStatus] = React.useState("");
    const [education, setEducation] = React.useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            const formattedDate = dayjs(newValue); // แปลงวันที่เป็นฟอร์แมต
            setSelectedDate(formattedDate);
        }
    };
    const [educationList, setEducationList] = useState([
        {
            education: "",
            educationLevel: "",
            institution: "",
            graduateYear: "",
            gpa: "",
        },
    ]);

    const [languageList, setLanguageList] = useState([
        {
            language: "",
            speaking: "",
            reading: "",
            writing: "",
        },
    ]);
    const companyId = companyName?.split(":")[0];
    const [editEmployee, setEditEmployee] = useState(false);
    const [editDepartment, setEditDepartment] = useState(false);
    const [thailand, setThailand] = useState([]);
    const [address, setAddress] = useState({});
    const [addressTrain, setAddressTrain] = useState({});
    const [checkPosition, setCheckPosition] = useState("0:0");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [employee, setEmployee] = useState([{ ID: 0, position: '', }]);
    const [department, setDepartment] = useState([{ DepartmentName: '', Section: '' }]);
    const [position, setPosition] = useState([{
        ID: 0,
        deptid: "",
        levelid: "",
        positionname: "",
        sectionid: "",
    }]);
    const employeeOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
    }));
    const columns = [
        { label: "ชื่อ", key: "name", type: "text", width: "60%" },
        {
            label: "ระดับ",
            key: "employeenumber",
            type: "select",
            options: employeeOptions,
        },
    ];

    const [birthDate, setBirthDate] = useState(null);
    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [dateStartCost, setDateStartCost] = useState(null);
    const [dateEndCost, setDateEndCost] = useState(null);

    // const [selectedDay, setSelectedDay] = useState("");
    // const [selectedMonth, setSelectedMonth] = useState("");
    // const [selectedYear, setSelectedYear] = useState("");
    // const [province, setProvince] = useState("");
    // const [amphure, setAmphure] = useState("");
    // const [tambon, setTambon] = useState("");

    // const provinceId = Number(province.split(":")[0]);
    // const amphureId = Number(amphure.split(":")[0]);
    // const tambonId = Number(tambon.split(":")[0]);

    // // ใช้ useMemo ช่วยประสิทธิภาพ
    // const amphureList = useMemo(() => {
    //     const prov = thailand.find(p => p.id === provinceId);
    //     return prov?.amphure || [];
    // }, [province, thailand]);

    // const tambonList = useMemo(() => {
    //     const amp = amphureList.find(a => a.id === amphureId);
    //     return amp?.tambon || [];
    // }, [amphureList, amphure]);

    // const zipCode = useMemo(() => {
    //     const tb = tambonList.find(t => t.id === tambonId);
    //     return tb?.zip_code || "";
    // }, [tambonList, tambon]);


    // const monthNames = [
    //     "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    //     "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    // ];

    // const getDaysInMonth = (month, year) => {
    //     if (!month || !year) return 31;
    //     const engYear = parseInt(year) - 543; // ถ้าใช้ พ.ศ. → ค.ศ.
    //     return dayjs(`${engYear}-${month}-01`).daysInMonth();
    // };

    // const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

    // const handleMonthChange = (e) => {
    //     const newMonth = e.target.value;
    //     setSelectedMonth(newMonth);
    //     if (selectedDay > getDaysInMonth(newMonth, selectedYear)) {
    //         setSelectedDay(""); // ล้างวันที่ถ้าเกินจำนวนวันใหม่
    //     }
    // };

    // const handleYearChange = (e) => {
    //     const newYear = e.target.value;
    //     setSelectedYear(newYear);
    //     if (selectedDay > getDaysInMonth(selectedMonth, newYear)) {
    //         setSelectedDay("");
    //     }
    // };

    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState("next");
    const [style, setStyle] = useState({
        transform: "translateX(0)",
        opacity: 1,
        transition: "transform 0.3s ease, opacity 0.3s ease",
    });

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

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployee([{ ID: 0, name: '', employeenumber: '' }]);
            } else {
                setEmployee(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB) return;

        const thailandRef = ref(firebaseDB, `workgroup/thailand`);

        const unsubscribe = onValue(thailandRef, (snapshot) => {
            const thailandData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!thailandData) {
                setThailand([{ ID: 0, name: '', employeenumber: '' }]);
            } else {
                setThailand(thailandData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!positionData) {
                setPosition([{
                    ID: 0,
                    deptid: "",
                    levelid: "",
                    positionname: "",
                    sectionid: "",
                }]);
            } else {
                setPosition(positionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployee([{
                    ID: 0,
                    position: "",
                }]);
            } else {
                setEmployee(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleAdd = () => {
        setEducationList([
            ...educationList,
            {
                education: "",
                educationLevel: "",
                majorCategory: "", // <-- เพิ่มหมวดหมู่
                institution: "",
                graduateYear: "",
                gpa: "",
            },
        ]);
    };

    const handleRemove = (index) => {
        const updatedList = [...educationList];
        updatedList.splice(index, 1);
        setEducationList(updatedList);
    };

    const handleChange = (index, field, value) => {
        const updatedList = [...educationList];
        updatedList[index][field] = value;
        setEducationList(updatedList);
    };

    const handleAddLanguage = () => {
        setLanguageList([
            ...languageList,
            { language: "", speaking: "", reading: "", writing: "" },
        ]);
    };

    const handleRemoveLanguage = (index) => {
        const updated = [...languageList];
        updated.splice(index, 1);
        setLanguageList(updated);
    };

    const handleLanguageChange = (index, field, value) => {
        const updated = [...languageList];
        updated[index][field] = value;
        setLanguageList(updated);
    };

    console.log("Name : ", name);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        ShowConfirm(
            "ยกเลิกข้อมูล",
            "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกข้อมูล?",
            () => {
                setOpen(false);
                setStep(0);
            },
            () => {
                setOpen(true);
            }
        );
    };

    const educationStatus = [
        { value: "กำลังศึกษา", label: "กำลังศึกษา" },
        { value: "จบการศึกษา", label: "จบการศึกษา" },
        { value: "ลาออก", label: "ลาออก" },
    ];

    const educationLevels = [
        { value: "primary", label: "ประถมศึกษา" },
        { value: "secondary", label: "มัธยมศึกษา" },
        { value: "bachelor", label: "ปริญญาตรี" },
        { value: "master", label: "ปริญญาโท" },
        { value: "doctorate", label: "ปริญญาเอก" }
    ];

    const bachelorCategories = [
        { value: "วิทยาศาสตร์", label: "วิทยาศาสตร์" },
        { value: "วิศวกรรมศาสตร์", label: "วิศวกรรมศาสตร์" },
        { value: "บริหารธุรกิจ", label: "บริหารธุรกิจ" },
        { value: "นิติศาสตร์", label: "นิติศาสตร์" },
        { value: "ศึกษาศาสตร์", label: "ศึกษาศาสตร์" },
        { value: "ศิลปศาสตร์", label: "ศิลปศาสตร์" },
        { value: "สังคมศาสตร์", label: "สังคมศาสตร์" },
        { value: "อื่นๆ", label: "อื่นๆ" },
    ];

    const steps = [
        {
            title: "เลือกตำแหน่งพนักงาน",
            content: (
                <>
                    <Grid container spacing={2} marginTop={2}>
                        {position.map((row, index) => {
                            const currentCount = employee.filter(
                                (emp) => Number(emp.position.split(":")[0]) === row.ID
                            ).length;

                            const isFull = currentCount >= row.max;

                            return (
                                <Grid
                                    key={index}
                                    item
                                    size={6}
                                    onClick={() => {
                                        if (!isFull) {
                                            console.log(`เลือกตำแหน่ง: ${row.positionname}`);
                                            setCheckPosition(`${row.ID}:${row.positionname}`);
                                            // หรือเรียกฟังก์ชัน handleSelect(row) ที่คุณกำหนดไว้
                                        }
                                    }}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: checkPosition.split(":")[1] === row.positionname ? theme.palette.primary.main : (isFull ? "#e0e0e0" : "lightgray"),
                                        borderRadius: 3,
                                        cursor: isFull ? "not-allowed" : "pointer",
                                        pointerEvents: isFull ? "none" : "auto" // ปิดการคลิกจริง
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "right",
                                        alignItems: "center",
                                        p: 2,
                                        paddingRight: 5.5,
                                        marginTop: 0.5
                                    }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ color: checkPosition.split(":")[1] === row.positionname ? "white" : (isFull ? "#9e9e9e" : "gray"), marginRight: 1 }}
                                            gutterBottom
                                        >
                                            {`${row.positionname}`}
                                        </Typography>
                                        <Box sx={{ textAlign: "right" }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{ color: checkPosition.split(":")[1] === row.positionname ? "white" : (isFull ? "#9e9e9e" : "gray"), marginRight: 1 }}
                                                gutterBottom
                                            >
                                                {`(${currentCount}/${row.max})`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: "right", marginTop: -7.5, marginRight: 0.5 }}>
                                        <BadgeIcon sx={{ fontSize: 40, color: checkPosition.split(":")[1] === row.positionname ? "white" : (isFull ? "#9e9e9e" : "gray") }} />
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </>
            ),
        },
        {
            title: "ข้อมูลส่วนบุคคล",
            content: (
                <>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "100%" }}>
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
                            <Typography variant="subtitle2" fontWeight="bold" >นามสกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
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
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพทางการทหาร</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={militaryStatus}
                                onChange={(e) => setMilitaryStatus(e.target.value)}
                            >
                                <MenuItem value="ผ่านการเกณฑ์แล้ว">ผ่านการเกณฑ์แล้ว</MenuItem>
                                <MenuItem value="ได้รับการยกเว้น">ได้รับการยกเว้น</MenuItem>
                                <MenuItem value="ยังไม่ได้เกณฑ์">ยังไม่ได้เกณฑ์</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >กรอกข้อมูลวันเกิด</Typography>
                            <ThaiDateSelector
                                label="วันเกิด"
                                value={birthDate}
                                onChange={(val) => setBirthDate(val)}
                            />
                            {/* <Grid container spacing={2}>
                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        วันที่
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        เดือน
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {monthNames.map((month, index) => (
                                            <MenuItem key={index + 1} value={index + 1}>
                                                {month}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        ปี (พ.ศ.)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        placeholder="เช่น 2568"
                                    />
                                </Grid>
                            </Grid> */}
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >สัญชาติ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ศาสนา</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>น้ำหนัก</b>(กิโลกรัม)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>ส่วนสูง</b>(เซนติเมตร)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >เบอร์โทรศัพท์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >โทรศัพท์บ้าน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >LINE ID</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ประเทศ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่ปัจจุบัน</Typography>
                            <TextField
                                type="text"
                                size="small"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={12}>
                            <ThaiAddressSelector
                                label="ที่อยู่ปัจจุบัน"
                                thailand={thailand}
                                value={address}
                                onChange={(val) => setAddress(val)}
                            />
                        </Grid>
                        {/* <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >จังหวัด</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                SelectProps={{
                                    MenuProps: { PaperProps: { style: { maxHeight: 150 } } }
                                }}
                            >
                                {thailand.map((row) => (
                                    <MenuItem key={row.id} value={`${row.id}:${row.name_th}`}>
                                        {row.name_th}
                                    </MenuItem>
                                ))}
                            </TextField>
                            
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >เขต/อำเภอ</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={amphure}
                                onChange={(e) => setAmphure(e.target.value)}
                                SelectProps={{
                                    MenuProps: { PaperProps: { style: { maxHeight: 150 } } }
                                }}
                            >
                                {amphureList.map((amp) => (
                                    <MenuItem key={amp.id} value={`${amp.id}:${amp.name_th}`}>
                                        {amp.name_th}
                                    </MenuItem>
                                ))}
                            </TextField>
                            
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >แขวง/ตำบล</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={tambon}
                                onChange={(e) => setTambon(e.target.value)}
                                SelectProps={{
                                    MenuProps: { PaperProps: { style: { maxHeight: 150 } } }
                                }}
                            >
                                {tambonList.map((tb) => (
                                    <MenuItem key={tb.id} value={`${tb.id}:${tb.name_th}`}>
                                        {tb.name_th}
                                    </MenuItem>
                                ))}
                            </TextField>

                            
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >รหัสไปรณีย์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={zipCode}
                            />
                            
                        </Grid> */}
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >พาหนะส่วนตัว</Typography>
                            <Grid container spacing={2} marginLeft={2} marginRight={2} >
                                <Grid item size={4}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: openBike ? "#ffa726" : "#eeeeee",
                                        borderRadius: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setOpenBike(!openBike)}
                                >
                                    <Typography variant="subtitle2" color={openBike ? "white" : "textDisabled"} gutterBottom>รถจักรยานยนต์</Typography>
                                    <TwoWheelerIcon
                                        sx={{ fontSize: 40, color: openBike ? "white" : "lightgray", marginLeft: 1 }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={4}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: openCar ? "#9575cd" : "#eeeeee",
                                        borderRadius: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setOpenCar(!openCar)}
                                >
                                    <Typography variant="subtitle2" color={openCar ? "white" : "textDisabled"} gutterBottom>รถยนต์</Typography>
                                    <LocalShippingIcon
                                        color="disabled"
                                        sx={{ fontSize: 40, color: openCar ? "white" : "lightgray", marginLeft: 1 }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                                <Grid item size={4}
                                    sx={{
                                        height: "70px",
                                        backgroundColor: openTruck ? "#66bb6a" : "#eeeeee",
                                        borderRadius: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onClick={() => setOpenTruck(!openTruck)}
                                >
                                    <Typography variant="subtitle2" color={openTruck ? "white" : "textDisabled"} gutterBottom>รถบรรทุก</Typography>
                                    <DirectionsCarIcon
                                        color="disabled"
                                        sx={{ fontSize: 40, color: openTruck ? "white" : "lightgray", marginLeft: 1 }} // กำหนดขนาดไอคอนเป็น 60px
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            ),
        },
        {
            title: "ประวัติการศึกษา",
            content: (
                <>
                    {educationList.map((item, index) => (
                        <Grid container spacing={2} marginTop={3} key={index}>
                            <Grid item size={10}>
                                <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
                                    ลำดับที่ {index + 1}
                                </Typography>
                            </Grid>
                            <Grid item size={2} textAlign="right">
                                {educationList.length > 1 && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemove(index)}
                                    >
                                        ลบ
                                    </Button>
                                )}
                            </Grid>

                            <Grid item size={12}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    สถานภาพการศึกษา
                                </Typography>
                                <Grid container spacing={2} marginLeft={2} marginRight={2} marginTop={1}>
                                    <Grid item size={6}
                                        sx={{
                                            height: "70px",
                                            backgroundColor: education ? "#66bb6a" : "#eeeeee",
                                            borderRadius: 2,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                        onClick={() => setEducation(true)}
                                    >
                                        <Typography variant="h6" fontWeight="bold" color={education ? "white" : "textDisabled"} gutterBottom>จบการศึกษา</Typography>
                                        <MilitaryTechIcon
                                            sx={{ fontSize: 70, color: education ? "white" : "lightgray", marginLeft: 2 }} // กำหนดขนาดไอคอนเป็น 60px
                                        />
                                    </Grid>
                                    <Grid item size={6}
                                        sx={{
                                            height: "70px",
                                            backgroundColor: education ? "#eeeeee" : "#81d4fa",
                                            borderRadius: 2,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                        onClick={() => setEducation(false)}
                                    >
                                        <Typography variant="h6" fontWeight="bold" color={education ? "textDisabled" : "white"} gutterBottom>กำลังศึกษาอยู่</Typography>
                                        <MenuBookIcon
                                            color="disabled"
                                            sx={{ fontSize: 70, color: education ? "lightgray" : "white", marginLeft: 2 }} // กำหนดขนาดไอคอนเป็น 60px
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item size={12}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    ระดับการศึกษา
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={item.educationLevel}
                                    onChange={(e) =>
                                        handleChange(index, "educationLevel", e.target.value)
                                    }
                                >
                                    {educationLevels.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {
                                (item.educationLevel === "primary" || item.educationLevel === "secondary" || item.educationLevel === "") ?
                                    <React.Fragment>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                สถานศึกษา
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={item.institution}
                                                onChange={(e) =>
                                                    handleChange(index, "institution", e.target.value)
                                                }
                                            />
                                        </Grid>
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                สถานศึกษา
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={item.institution}
                                                onChange={(e) =>
                                                    handleChange(index, "institution", e.target.value)
                                                }
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >หมวดการศึกษา</Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={item.educationLevel}
                                                onChange={(e) =>
                                                    handleChange(index, "majorCategory", e.target.value)
                                                }
                                            >
                                                {bachelorCategories.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >คณะ</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >สาขา</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อปริญญา</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                    </React.Fragment>
                            }
                            <Grid item size={6}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    ปีที่สำเร็จการศึกษา
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={item.graduateYear}
                                    onChange={(e) =>
                                        handleChange(index, "graduateYear", e.target.value)
                                    }
                                />
                            </Grid>

                            <Grid item size={6}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    เกรดเฉลี่ย
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={item.gpa}
                                    onChange={(e) =>
                                        handleChange(index, "gpa", e.target.value)
                                    }
                                />
                            </Grid>
                            <Grid item size={12}>
                                <Divider sx={{ marginTop: 1 }} />
                            </Grid>
                        </Grid>
                    ))}

                    <Box textAlign="center" marginTop={3}>
                        <Button variant="outlined" size="small" onClick={handleAdd}>
                            เพิ่ม
                        </Button>
                    </Box>
                </>
            ),
        },
        {
            title: "ประวัติการทำงาน/ฝึกงาน",
            content: (
                <>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "100%" }}>
                        <Grid item size={12}>
                            <ThaiDateSelector
                                label="เริ่มตั้งแต่วันที่"
                                value={dateStart}
                                onChange={(val) => setDateStart(val)}
                            />
                            {/* <Grid container spacing={2}>
                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        เริ่มตั้งแต่วันที่
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        เดือน
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {monthNames.map((month, index) => (
                                            <MenuItem key={index + 1} value={index + 1}>
                                                {month}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        ปี (พ.ศ.)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        placeholder="เช่น 2568"
                                    />
                                </Grid>
                            </Grid> */}
                        </Grid>
                        <Grid item size={12}>
                            <ThaiDateSelector
                                label="จนถึงวันที่"
                                value={dateEnd}
                                onChange={(val) => setDateEnd(val)}
                            />
                            {/* <Grid container spacing={2}>
                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        จนถึงวันที่
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        เดือน
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 150, // ปรับตรงนี้ เช่น 200px
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {monthNames.map((month, index) => (
                                            <MenuItem key={index + 1} value={index + 1}>
                                                {month}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item size={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        ปี (พ.ศ.)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        placeholder="เช่น 2568"
                                    />
                                </Grid>
                            </Grid> */}
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อบริษัท</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่</Typography>
                            <TextField
                                type="text"
                                size="small"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={12}>
                            <ThaiAddressSelector
                                label="ที่อยู่ปัจจุบัน"
                                thailand={thailand}
                                value={addressTrain}
                                onChange={(val) => setAddressTrain(val)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ตำแหน่งงาน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ประเภทงาน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ระดับ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >เงินเดือน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >รายละเอียด</Typography>
                            <TextField
                                type="text"
                                size="small"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </>
            ),
        },
        {
            title: "ประวัติการฝึกอบรม และประกาศนียบัตร",
            content: (
                <>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "100%" }}>
                        <Grid item size={12}>
                            <ThaiDateSelector
                                label="เริ่มตั้งแต่วันที่"
                                value={dateStartCost}
                                onChange={(val) => setDateStartCost(val)}
                            />
                            {/* <Typography variant="subtitle2" fontWeight="bold" >เริ่มตั้งแต่</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            /> */}
                        </Grid>
                        <Grid item size={12}>
                            <ThaiDateSelector
                                label="จนถึง"
                                value={dateEndCost}
                                onChange={(val) => setDateEndCost(val)}
                            />
                            {/* <Typography variant="subtitle2" fontWeight="bold" >จนถึง</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            /> */}
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถาบัน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >หลักสูตร</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ประกาศนียบัตร/วุฒิบัตร</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </>
            ),
        },
        {
            title: "ความสามารถทางภาษา",
            content: (
                <>
                    {languageList.map((lang, index) => (
                        <Grid container spacing={2} marginTop={3} sx={{ width: "100%" }} key={index}>
                            <Grid item size={10}>
                                <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
                                    {lang.language}
                                </Typography>
                            </Grid>
                            <Grid item size={2} textAlign="right">
                                {languageList.length > 1 && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveLanguage(index)}
                                    >
                                        ลบ
                                    </Button>
                                )}
                            </Grid>

                            <Grid item size={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={lang.language}
                                    onChange={(e) =>
                                        handleLanguageChange(index, "language", e.target.value)
                                    }
                                />
                                {/* <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={lang.language}
                                    onChange={(e) =>
                                        handleLanguageChange(index, "language", e.target.value)
                                    }
                                >
                                    <MenuItem value="ไทย">ภาษาไทย</MenuItem>
                                    <MenuItem value="อังกฤษ">ภาษาอังกฤษ</MenuItem>
                                    <MenuItem value="ญี่ปุ่น">ภาษาญี่ปุ่น</MenuItem>
                                    <MenuItem value="เกาหลี">ภาษาเกาหลี</MenuItem>
                                </TextField> */}
                            </Grid>

                            <Grid item size={3}>
                                <Box sx={{ borderRadius: 40, backgroundColor: "lightgray", width: "150px", height: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }} gutterBottom>{lang.language}</Typography>
                                </Box>
                            </Grid>
                            <Grid item size={8}>
                                <Grid container spacing={2}>
                                    <Grid item size={2}>
                                        <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">พูด</Typography>
                                    </Grid>
                                    <Grid item size={10}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={lang.speaking}
                                            onChange={(e) => handleLanguageChange(index, "speaking", e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item size={2}>
                                        <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">อ่าน</Typography>
                                    </Grid>
                                    <Grid item size={10}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={lang.reading}
                                            onChange={(e) => handleLanguageChange(index, "reading", e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item size={2}>
                                        <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">เขียน</Typography>
                                    </Grid>
                                    <Grid item size={10}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={lang.writing}
                                            onChange={(e) => handleLanguageChange(index, "writing", e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item size={12}><Divider sx={{ mt: 1 }} /></Grid>
                        </Grid>
                    ))}
                    <Box textAlign="center" marginTop={3}>
                        <Button variant="outlined" size="small" onClick={handleAddLanguage}>
                            เพิ่มภาษา
                        </Button>
                    </Box>
                </>
            ),
        },
        {
            title: "ความสามารถอื่นๆและบุคคลอ้างอิง",
            content: (
                <>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "100%" }}>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ความสามารถเฉพาะทาง</Typography>
                            <Grid container spacing={1}>
                                <Grid item size={1}>
                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >1.</Typography>
                                </Grid>
                                <Grid item size={11}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item size={1}>
                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >2.</Typography>
                                </Grid>
                                <Grid item size={11}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item size={1}>
                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >3.</Typography>
                                </Grid>
                                <Grid item size={11}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ความสามารถในการขับขี่</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ความเร็วในการพิมพ์</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold" >ไทย</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold" >อังกฤษ</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >โครงการ ผลงาน และประสบการณ์อื่นๆ</Typography>
                                    <TextField
                                        type="text"
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >บุคคลอ้างอิง</Typography>
                                    <TextField
                                        type="text"
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            ),
        },
    ];

    const handleNext = () => {
        if (step < steps.length - 1 && !animating) {
            setDirection("prev");
            setAnimating(true);
            setStyle({
                transform: "translateX(-200px)",
                opacity: 0,
                transition: "transform 0.3s ease, opacity 0.3s ease",
            });
            setTimeout(() => {
                setStep(prev => prev + 1);
                setStyle({
                    transform: "translateX(200px)",
                    opacity: 0,
                    transition: "none",
                });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setStyle({
                            transform: "translateX(0)",
                            opacity: 1,
                            transition: "transform 0.3s ease, opacity 0.3s ease",
                        });
                        setAnimating(false);
                    });
                });
            }, 300);
        }
    };

    const handlePrev = () => {
        if (step > 0 && !animating) {
            setDirection("next");
            setAnimating(true);
            setStyle({
                transform: "translateX(200px)",
                opacity: 0,
                transition: "transform 0.3s ease, opacity 0.3s ease",
            });
            setTimeout(() => {
                setStep(prev => prev - 1);
                setStyle({
                    transform: "translateX(-200px)",
                    opacity: 0,
                    transition: "none",
                });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setStyle({
                            transform: "translateX(0)",
                            opacity: 1,
                            transition: "transform 0.3s ease, opacity 0.3s ease",
                        });
                        setAnimating(false);
                    });
                });
            }, 300);
        }
    };


    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleClickOpen}>
                เพิ่มพนักงาน
            </Button>
            {/* Dialog ด้านซ้าย (ก่อนหน้า) */}
            {/* เงาแบบ Box ด้านซ้าย */}
            {
                open &&
                (step > 0 && (
                    <Paper
                        elevation={4}
                        sx={{
                            position: "fixed",
                            top: "50%",
                            left: "calc(50% - 700px)",
                            height: "80vh", // <<< เท่ากับ Dialog หลัก
                            width: "600px",
                            transform: "translateY(-50%)",
                            p: 2,
                            borderRadius: 4,
                            pointerEvents: "none",
                            zIndex: (theme) => theme.zIndex.modal - 1,
                            textAlign: "left", // <-- เพิ่มบรรทัดนี้
                            backgroundColor: "rgba(255, 255, 255, 0.95)", // <-- พื้นหลังขาวใสขึ้น
                            backdropFilter: "blur(2px)", // <-- เพิ่มเอฟเฟกต์เบลอแบบ Dialog
                            boxShadow: (theme) => theme.shadows[5], // เหมือน Dialog
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" textAlign="center">
                            {steps[step - 1].title}
                        </Typography>
                        <Divider sx={{ marginTop: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                        <Box
                            sx={{
                                maxHeight: 'calc(77vh - 100px)', // ลบความสูงของหัวเรื่อง, padding ฯลฯ
                                overflowY: 'auto',
                                pr: 1, // padding ขวาเผื่อ scrollbar
                            }}
                        >
                            {steps[step - 1].content}
                        </Box>
                    </Paper>
                ))
            }

            {/* Dialog หลัก */}
            <Dialog
                open={open ? true : false}
                PaperProps={{
                    sx: {
                        borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                        width: "600px",
                        height: "90vh", // <<< เท่ากับ Dialog หลัก
                        position: "absolute",
                        ...style,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        // borderBottom: `1px solid ${theme.palette.primary.main}`,
                        // backgroundColor: theme.palette.primary.dark,
                        // color: "white",
                        // height: "50px",
                        // paddingTop: -1
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            {steps[step].title}
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }} onClick={handleClose}>
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
                    {steps[step].content}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, borderTop: `1px solid ${theme.palette.primary.dark}` }}>
                    <Button color="info" onClick={handlePrev} disabled={step === 0}>
                        ← ก่อนหน้า
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button color="info" onClick={handleNext}>ถัดไป →</Button>
                    ) : (
                        <Button variant="contained" color="success">
                            บันทึก
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* เงาแบบ Box ด้านขวา */}
            {
                open &&
                (step < steps.length - 1 && (
                    <Paper
                        elevation={4}
                        sx={{
                            position: "fixed",
                            top: "50%",
                            right: "calc(50% - 700px)",
                            height: "80vh", // <<< เท่ากับ Dialog หลัก
                            width: "600px",
                            transform: "translateY(-50%)",
                            p: 2,
                            borderRadius: 4,
                            pointerEvents: "none",
                            zIndex: (theme) => theme.zIndex.modal - 1,
                            textAlign: "left", // <-- เพิ่มบรรทัดนี้
                            backgroundColor: "rgba(255, 255, 255, 0.95)", // <-- พื้นหลังขาวใสขึ้น
                            backdropFilter: "blur(2px)", // <-- เพิ่มเอฟเฟกต์เบลอแบบ Dialog
                            boxShadow: (theme) => theme.shadows[5], // เหมือน Dialog
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" textAlign="center" >
                            {steps[step + 1].title}
                        </Typography>
                        <Divider sx={{ marginTop: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                        <Box
                            sx={{
                                maxHeight: 'calc(77vh - 100px)', // ลบความสูงของหัวเรื่อง, padding ฯลฯ
                                overflowY: 'auto',
                                pr: 1, // padding ขวาเผื่อ scrollbar
                            }}
                        >
                            {steps[step + 1].content}
                        </Box>
                    </Paper>
                ))
            }
            {/* <Dialog
                open={open}
                slots={{
                    transition: Transition,
                }}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: theme.palette.primary.dark,
                        color: "white",
                        height: "50px",
                        paddingTop: -1
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            เพิ่มรายชื่อพนักงาน
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }}>
                                <CloseIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent sx={{ p: 5 }}>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "600px" }}>
                        <Grid item size={12}>
                            <Typography variant="subtitle1" textAlign="center" fontWeight="bold" >ข้อมูลส่วนบุคคล</Typography>
                            <Divider />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >นามสกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เพศ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพทางการทหาร</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >วันเกิด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >เดือน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >ปี</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >สัญชาติ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ศาสนา</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>น้ำหนัก</b>(กิโลกรัม)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>ส่วนสูง</b>(เซนติเมตร)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เบอร์โทรศัพท์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >โทรศัพท์บ้าน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >LINE ID</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ประเทศ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่ปัจจุบัน</Typography>
                            <TextField
                                type="text"
                                size="small"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >จังหวัด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เขต/อำเภอ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >แขวง/ตำบล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >รหัสไปรณีย์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >พาหนะส่วนตัว</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderTop: `1px solid ${theme.palette.primary.main}` }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleClose}>บันทึก</Button>
                </DialogActions>
            </Dialog> */}
        </React.Fragment>
    )
}

export default AddEmployee