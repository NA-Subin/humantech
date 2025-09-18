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
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import BadgeIcon from '@mui/icons-material/Badge';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import theme from '../../theme/theme';
import { Item, ItemReport } from '../../theme/style';
import { useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button, InputAdornment } from '@mui/material';
import InsertNews from './InsertNews';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';

export default function CompanyDeshboard() {
    const { firebaseDB, domainKey } = useFirebase();
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
            <Item sx={{ flexGrow: 1, marginTop: 5 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                        <Box
                            sx={{
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontSize="22px"
                                sx={{ opacity: 0.7, color: theme.palette.primary.dark, marginBottom: -5.5, marginLeft: -3 }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                ระบบจัดการบริษัท
                            </Typography>
                            <img src={Logo} width={400} />
                            <Typography
                                variant="subtitle1"
                                fontSize="20px"
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
                </Grid>
            </Item>

            <Grid container spacing={2} marginTop={1} marginBottom={1}>
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer", }} onClick={handleOpenNews}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openNews && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>ข่าวสารใหม่</Typography>
                                <NewspaperIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{employees.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>คน</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                {/* <Grid item size={3}>
                    <Item>
                        <EmailIcon fontSize="large" />
                    </Item>
                </Grid> */}
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer" }} onClick={handleOpenNotify}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openNotify && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>เอกสารขออนุมัติ</Typography>
                                <NotificationsActiveIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{document.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>ใบ</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer" }} onClick={handleOpenEmployee}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openEmployee && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>พนักงานทั้งหมด</Typography>
                                <BadgeIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{employees.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>คน</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            {
                openNews &&
                <Grid container spacing={2} marginTop={1} marginBottom={1}>
                    <Grid item size={12}>
                        <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginLeft: 6 }} fontWeight="bold" gutterBottom>||</Typography>
                    </Grid>
                    <Grid item size={12}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container spacing={2}>
                                <Grid item size={6}>
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>ข่าวสาร</Typography>
                                </Grid>
                                <Grid item size={6} textAlign="right" marginTop={-0.5}>
                                    <InsertNews />
                                </Grid>
                            </Grid>
                            <Divider />
                        </Item>
                    </Grid>
                </Grid>
            }

            {
                openNotify &&
                <Grid container spacing={2} marginTop={1} marginBottom={1}>
                    <Grid item size={12} textAlign="center">
                        <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginLeft: -25 }} fontWeight="bold" gutterBottom>||</Typography>
                    </Grid>
                    <Grid item size={4}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container>
                                <Grid item size={12}>
                                    <Typography variant='h6' textAlign="center" fontWeight="bold" gutterBottom>เอกสารรออนุมัติ</Typography>
                                </Grid>
                                <Grid item size={12} sx={{ marginBottom: 2 }}>
                                    <Divider />
                                </Grid>
                                {/* <Grid item size={12}>
                                    <Paper sx={{ width: "100%" }}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
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
                                                                    <b>เลือกเดือน :</b>
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
                                </Grid> */}
                                {
                                    ["เอกสารขอลา", "เอกสารขอโอที", "เอกสารขอเวลา"].map((docs, index) => (
                                        <Grid
                                            key={index}
                                            item
                                            size={12}
                                            sx={{
                                                height: "70px",
                                                borderRadius: 3,
                                                cursor: "pointer",
                                                pointerEvents: "auto",
                                                textAlign: "center",
                                                marginBottom: 2,
                                                border: `2px solid ${theme.palette.primary.main}`
                                            }}
                                        >
                                            <Box sx={{ backgroundColor: theme.palette.primary.main, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                                                <Typography variant='h6' fontWeight="bold" color="white" gutterBottom>{docs}</Typography>
                                            </Box>
                                            <Typography variant='h5' fontWeight="bold" sx={{ marginTop: -1, color: theme.palette.primary.dark }} gutterBottom>
                                                {
                                                    docs === "เอกสารขอลา" ?
                                                        `${document.filter((item) => item.status === "รออนุมัติ" && item.doctype === "leave").length}/${document.filter((item) => item.doctype === "leave").length}`
                                                        : docs === "เอกสารขอโอที" ?
                                                            `${document.filter((item) => item.status === "รออนุมัติ" && item.doctype === "ot").length}/${document.filter((item) => item.doctype === "ot").length}`
                                                            : docs === "เอกสารขอเวลา" ?
                                                                `${document.filter((item) => item.status === "รออนุมัติ" && item.doctype === "time").length}/${document.filter((item) => item.doctype === "time").length}`
                                                                : ""
                                                }
                                            </Typography>
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </Item>
                    </Grid>
                    <Grid item size={8}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container spacing={2}>
                                <Grid item size={6}>
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>เอกสารขออนุมัติ</Typography>
                                </Grid>
                                <Grid item size={12}>
                                    <Divider />
                                </Grid>
                                <Grid item size={12}>
                                    <BarChart
                                        xAxis={[{ data: dates }]}
                                        series={series}
                                        height={300}
                                    />
                                </Grid>
                            </Grid>
                        </Item>
                    </Grid>
                </Grid>
            }

            {
                openEmployee &&
                <Grid container spacing={2} marginTop={1} marginBottom={1}>
                    <Grid item size={12} textAlign="right">
                        <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginRight: 40 }} fontWeight="bold" gutterBottom>||</Typography>
                    </Grid>
                    <Grid item size={3}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container>
                                <Grid item size={12} textAlign="center">
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>เพศ</Typography>
                                </Grid>
                                <Grid item size={12} >
                                    <Divider />
                                </Grid>
                                <Grid item size={12} >
                                    <Grid container>
                                        <Grid item size={6}>
                                            <ManIcon sx={{ fontSize: 200, color: "#81d4fa", marginLeft: -5 }} />
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                                <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginRight: 1, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.personal && item.personal.sex === "ชาย").length}</Typography>
                                                <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> คน</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item size={6}>
                                            <WomanIcon sx={{ fontSize: 200, color: "#f48fb1", marginLeft: -5 }} />
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                                <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginRight: 1, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.personal && item.personal.sex === "หญิง").length}</Typography>
                                                <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> คน</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant='h6' fontWeight="bold" textAlign="center" color="error" gutterBottom>ไม่กำหนดเพศ {employees.filter((item) => item.personal && item.personal.sex === "").length} คน</Typography>
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant='h5' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom>รวมทั้งหมด</Typography>
                                            <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginTop: -2, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.personal).length} คน</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Item>
                    </Grid>
                    <Grid item size={6}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container>
                                <Grid item size={12} textAlign="center">
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>พนักงานทั้งหมด</Typography>
                                </Grid>
                                <Grid item size={12}>
                                    <Divider />
                                </Grid>
                                <Grid item size={12}>
                                    <Box sx={{ marginTop: 2 }}>
                                        <PieChart
                                            series={[
                                                {
                                                    data: employeesData,
                                                    highlightScope: { fade: 'global', highlight: 'item' },
                                                    faded: { innerRadius: 20, additionalRadius: -20, color: theme.palette.primary.main },
                                                },
                                            ]}
                                            height={350}
                                            width={300}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Item>
                    </Grid>
                    <Grid item size={3}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}`, padding: -2 }}>
                            <Grid container>
                                <Grid item size={12} textAlign="center">
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>ต้องการพนักงาน</Typography>
                                </Grid>
                                <Grid item size={12}>
                                    <Divider sx={{ marginBottom: 2 }} />
                                </Grid>
                                {
                                    employeesData.map((item, index) => (
                                        item.value < item.maxNumber ?
                                            <Grid
                                                key={index}
                                                item
                                                size={12}
                                                sx={{
                                                    height: "70px",
                                                    borderRadius: 3,
                                                    cursor: "pointer",
                                                    pointerEvents: "auto",
                                                    textAlign: "center",
                                                    marginBottom: 2,
                                                    border: `2px solid ${theme.palette.primary.main}`
                                                }}
                                            >
                                                <Box sx={{ backgroundColor: theme.palette.primary.main, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                                                    <Typography variant='h6' fontWeight="bold" color="white" gutterBottom>{item.label}</Typography>
                                                </Box>
                                                <Typography variant='h5' fontWeight="bold" sx={{ marginTop: -1, color: theme.palette.primary.dark }} gutterBottom>{`${item.value}/${item.maxNumber}`}</Typography>
                                            </Grid>
                                            : ""
                                    ))
                                }
                            </Grid>
                        </Item>
                    </Grid>
                </Grid>
            }
        </Container>
    );
}