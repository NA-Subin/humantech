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
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import theme from '../../theme/theme';
import { Item, ItemReport } from '../../theme/style';
import { useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button } from '@mui/material';
import InsertNews from './InsertNews';

export default function CompanyDeshboard() {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];
    const [employees, setEmployees] = useState([]);

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
                <Grid item size={3}>
                    <Item>
                        <PhoneIcon fontSize="large" />
                    </Item>
                </Grid>
                <Grid item size={3}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)' }}>
                        <Grid container spacing={2}>
                            <Grid item size={6} sx={{ backgroundColor: theme.palette.primary.main, padding: theme.spacing(2), borderTopLeftRadius: 10, borderBottomLeftRadius: 10, textAlign: "center" }}>
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
                <Grid item size={3}>
                    <Item>
                        <FacebookIcon fontSize="large" />
                    </Item>
                </Grid>
                <Grid item size={3}>
                    <Item>
                        <EmailIcon fontSize="large" />
                    </Item>
                </Grid>
            </Grid>
            <Grid container spacing={2} marginTop={1} marginBottom={1}>
                <Grid item size={12}>
                    <Item sx={{ height: 500 }}>
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
        </Container>
    );
}