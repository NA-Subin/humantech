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
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import theme from '../../theme/theme';
import { Item, ItemReport } from '../../theme/style';
import { useParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button } from '@mui/material';
import InsertNews from './InsertNews';

export default function CompanyDeshboard() {
    const { firebaseDB, domainKey } = useFirebase();
    const { domain, companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];

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
                    <Item>
                        <StoreIcon fontSize="large" />
                    </Item>
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