import * as React from 'react';
import { getDatabase, ref, push, onValue } from "firebase/database";
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
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import AlarmIcon from '@mui/icons-material/Alarm';
import BadgeIcon from '@mui/icons-material/Badge';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import theme from '../../theme/theme';
import { Item, ItemReport, TablecellHeader } from '../../theme/style';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button, InputAdornment, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import TimeAttendant from './TimeAttendant';
import Caluculate from './Calculate';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../LanguageContext';
import 'dayjs/locale/th';
import 'dayjs/locale/en';

export default function DashboardAttendant() {
    const { language, changeLanguage } = React.useContext(LanguageContext);
    const { t } = useTranslation();
    const { firebaseDB, domainKey } = useFirebase();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];
    const [openNews, setOpenNews] = useState(true);
    const [openNotify, setOpenNotify] = useState(false);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [dateApprove, setDateApprove] = useState(dayjs(new Date))
    const [employees, setEmployees] = useState([]);
    const [position, setPosition] = useState([]);
    const [document, setDocument] = useState([]);
    const [openNavbar, setopenNamevar] = useState(false)

    console.log("document : ", document);

    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setDateApprove(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const handleOpenNews = () => {
        setOpenNews(true);
        setOpenNotify(false);
        setOpenEmployee(false);
    }

    const handleOpenNotify = () => {
        setOpenNews(false);
        setOpenNotify(true);
        setOpenEmployee(false);
    }

    const handleOpenEmployee = () => {
        setOpenNews(false);
        setOpenNotify(false);
        setOpenEmployee(true);
    }

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

        const paths = ["documentleave", "documenttime", "documentot"];
        const unsubscribes = [];

        paths.forEach((path) => {
            const refPath = ref(firebaseDB, `workgroup/company/${companyId}/${path}`);
            const unsubscribe = onValue(refPath, (snapshot) => {
                const data = snapshot.val();

                // flatten ข้อมูลจากปี → เดือน → เอกสาร
                let allDocs = [];
                if (data) {
                    Object.values(data).forEach((months) => {
                        Object.values(months).forEach((docs) => {
                            allDocs = [...allDocs, ...Object.values(docs)];
                        });
                    });
                }

                setDocument((prev) => {
                    // ลบของเก่าที่เป็น path เดียวกันก่อน
                    const filtered = prev.filter((doc) => doc._type !== path);
                    return [...filtered, ...allDocs.map((item) => ({ ...item, _type: path }))];
                });
            });

            unsubscribes.push(unsubscribe);
        });

        return () => unsubscribes.forEach((unsub) => unsub());
    }, [firebaseDB, companyId]);

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const positionData = snapshot.val();

            if (!positionData) {
                setPosition([]);
            } else {
                const positionArray = Object.values(positionData);
                setPosition(positionArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    React.useEffect(() => {
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

    const grouped = document.reduce((acc, doc) => {
        const date = doc.daterequest;
        const type = doc.doctype;

        if (!acc[date]) acc[date] = {};
        if (!acc[date][type]) acc[date][type] = 0;

        acc[date][type] += 1;

        return acc;
    }, {});

    const types = ["leave", "time", "ot"];

    const dates = Object.keys(grouped).sort(
        (a, b) => new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-"))
    );

    const series = types.map(type => ({
        label: type === "leave" ? "เอกสารขอลา" : type === "time" ? "เอกสารขอเวลา" : "เอกสารขอโอที",
        data: dates.map(date => grouped[date][type] || 0)
    }));

    console.log("grouped : ", grouped);

    // pastel palette generator
    const generatePastelColors = (count, baseHue = 340) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (baseHue + (i * 200) / count) % 300;
            colors.push(`hsl(${hue}, 75%, 60%)`);
        }
        return colors;
    };

    const pastelColors = generatePastelColors(position.length, 340);
    // 340° ~ hue ของ #f48fb1

    const employeesData = position.map((pos, index) => {
        const value = employees.filter(
            (item) => item.position && Number(item.position.split("-")[0]) === pos.ID
        ).length;

        return {
            id: index,
            value,
            label: pos.positionname,
            maxNumber: pos.max,
            color: pastelColors[index],
        };
    });

    console.log("employeee : ", employees);

    return (
        <Container maxWidth="xl" sx={{ p: 5 }} >
            <Grid container spacing={2} marginTop={-2}>
                {/* <Grid item size={0.5}>
                    <Box
                        item
                        sx={{
                            position: "fixed",  // ทำให้ลอย
                            top: "60px",       // ระยะจากด้านบน
                            left: "30px",      // ระยะจากด้านขวา
                            display: "flex",
                            flexDirection: "column"
                        }}
                        size={0.5}
                    >
                        <Button
                            variant="contained"
                            sx={{ width: 150, marginTop: 1 }}
                            color={openNavbar ? "inherit" : "primary"}
                            onClick={() => setopenNamevar(false)}
                        >
                            หน้าหลัก
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ width: 150, marginTop: 2 }}
                            color={openNavbar ? "primary" : "inherit"}
                            onClick={() => setopenNamevar(true)}
                        >
                            คำนวณเงินเดือน
                        </Button>
                    </Box>
                </Grid> */}

                <Grid item size={12}>
                    {/* <Item sx={{ flexGrow: 1 }}> */}
                    <Grid container>
                        <Grid item size={12} sx={{ display: "flex", justifyContent: "left" }}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginBottom: 2,
                                    marginTop: -4
                                }}
                            >
                                {/* <Typography
                                        variant="h6"
                                        fontSize="22px"
                                        sx={{ opacity: 0.7, color: theme.palette.primary.dark, marginBottom: -5.5, marginLeft: -3 }}
                                        fontWeight="bold"
                                        gutterBottom
                                    >
                                        ระบบจัดการบริษัท
                                    </Typography> */}
                                <img src={Logo} width={500} />
                                <Typography
                                    variant="subtitle1"
                                    fontSize="25px"
                                    sx={{
                                        opacity: 0.7,
                                        color: theme.palette.primary.dark,
                                        marginTop: -2,
                                    }}
                                    fontWeight="bold"
                                    gutterBottom
                                >
                                    ( {selectedCompany?.companyname ?? "ชื่อบริษัท"} )
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item size={11} textAlign="right" marginTop={-13}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "right",
                                    marginRight: 2,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ marginRight: 2, fontWeight: "bold", color: "gray" }}
                                >
                                    {t("selectLanguage")}
                                </Typography>

                                {/* ปุ่มภาษาไทย */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        marginRight: 1,
                                        backgroundColor: language === "th" ? "#A51931" : "lightgray",
                                        color: language === "th" ? "white" : "gray",
                                        fontWeight: "bold",
                                        "&:hover": {
                                            color: "white",
                                            backgroundColor: language === "th" ? "#7a0f24" : "gray",
                                        },
                                    }}
                                    onClick={() => changeLanguage("th")}
                                    endIcon={
                                        <ReactCountryFlag
                                            countryCode="TH"
                                            svg
                                            style={{
                                                fontSize: "1.5em",
                                                borderRadius: "2px",
                                            }}
                                        />
                                    }
                                >
                                    TH
                                </Button>

                                {/* ปุ่มภาษาอังกฤษ */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        backgroundColor: language === "en" ? "#00247D" : "lightgray",
                                        color: language === "en" ? "white" : "gray",
                                        fontWeight: "bold",
                                        "&:hover": {
                                            color: "white",
                                            backgroundColor: language === "en" ? "#001c63" : "gray",
                                        },
                                    }}
                                    onClick={() => changeLanguage("en")}
                                    endIcon={
                                        <ReactCountryFlag
                                            countryCode="GB"
                                            svg
                                            style={{
                                                fontSize: "1.5em",
                                                borderRadius: "2px",
                                            }}
                                        />
                                    }
                                >
                                    ENG
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item size={1} textAlign="right" marginTop={-13}></Grid>
                        <Grid item size={12} textAlign="right" marginTop={-7}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                                <Paper sx={{ width: "20%", marginRight: 2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
                                        <DatePicker
                                            openTo="month"
                                            views={["year", "month"]}
                                            value={dateApprove}
                                            format="MMMM"
                                            onChange={handleDateChangeDate}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    inputProps: {
                                                        value: dateApprove ? dateApprove.format("MMMM") : "",
                                                        readOnly: true,
                                                    },
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                                <b>{t("selectMonth")}</b>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            fontSize: "16px",
                                                            height: "40px",
                                                            padding: "10px",
                                                            fontWeight: "bold",
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Paper>
                                <Button onClick={() => navigate(`/?domain=${domain}&page=dashboard`)} variant="contained" size="large" color="error" endIcon={<KeyboardReturnIcon />}>
                                    {t("back")}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    {/* </Item> */}
                    <TimeAttendant date={dateApprove} language={language} />
                </Grid>
            </Grid>
        </Container>
    );
}