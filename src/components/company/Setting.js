import React, { useEffect, useState } from 'react';
import { getDatabase, ref, push, onValue, update } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import theme from '../../theme/theme';
import { Item, ItemReport, TablecellHeader } from '../../theme/style';
import { useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, Chip, InputAdornment, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Table } from 'jspdf-autotable';
import ThaiAddressSelector from '../../theme/ThaiAddressSelector';
import { database } from '../../server/firebase';
import { ShowError, ShowSuccess } from '../../sweetalert/sweetalert';

export default function Setting({ tabState, setTabState, tabId }) {
    const { domain, company } = tabState;
    const { firebaseDB, domainKey } = useFirebase();
    const companyId = company?.split(":")[0];

    const [selectedCompany, setSelectedCompany] = useState({
        address: []
    });

    const [companyid, setCompanyid] = useState(null);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [googlemap, setGooglemap] = useState("");
    const [address, setAddress] = useState({
        amphure: "",
        province: "",
        tambon: "",
        zipCode: ""
    });

    const [thailand, setThailand] = React.useState([]);
    useEffect(() => {
        if (!database) return;

        const thailandRef = ref(database, `thailand`);

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
    }, [database]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}`);

        const unsubscribe = onValue(companiesRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};

            setSelectedCompany({
                ...data,
                address: Array.isArray(data.address) ? data.address : []
            });
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleAddress = (row) => {
        console.log("CLICK ROW 👉", row);
        if (!row) return;

        setCompanyid(row.ID ?? null);
        setLat(row.lat ?? "");
        setLng(row.lng ?? "");

        setAddress({
            amphure: row.amphure ?? "",
            province: row.province ?? "",
            tambon: row.tambon ?? "",
            zipCode: row.zipCode ?? ""
        });
    };

    function formatAddress(data = {}) {
        const getName = (str = "") => {
            const parts = str.split("-");
            return parts.length > 1 ? parts[1] : str;
        };

        return `ตำบล ${getName(data.tambon)}, อำเภอ ${getName(data.amphure)}, จังหวัด ${getName(data.province)}, รหัสไปรษณีย์ ${data.zipCode || ""}`;
    }

    const handleMapLinkChange = (e) => {
        const value = e.target.value;
        setGooglemap(value);

        // รวม regex สำหรับหลายรูปแบบ
        const regexList = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,              // แบบ @lat,lng,...
            /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/,      // แบบ /place/lat,lng
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/,             // แบบ ?q=lat,lng
            /\/maps\/(-?\d+\.\d+),(-?\d+\.\d+)/,       // แบบ /maps/lat,lng
            /\/\?ll=(-?\d+\.\d+),(-?\d+\.\d+)/,        // แบบ ?ll=lat,lng
        ];

        let found = false;

        for (const regex of regexList) {
            const match = value.match(regex);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                setLat(lat);
                setLng(lng);
                found = true;
                break;
            }
        }

        if (!found) {
            console.warn("ไม่พบพิกัดในลิงก์");
        }
    };

    const handleCloseCoordinates = () => {
        setCompanyid(null);
    };

    const handleSaveCoordinates = () => {
        const companyRef = ref(firebaseDB, `workgroup/company/${companyId}`);

        const updates = {
            lat: lat,
            lng: lng,
        };

        update(companyRef, updates)
            .then(() => {
                ShowSuccess("บันทึกพิกัดสำเร็จ");
                console.log("บันทึก lat/lng สำเร็จ");
                setCompanyid(null);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึกพิกัด");
                console.error("เกิดข้อผิดพลาด:", error);
            });
    };

    console.log("Address : ", address);
    console.log("selectedCompany : ", selectedCompany);
    console.log("selectedAddress : ", selectedCompany?.address);

    return (
        <Container maxWidth="xl" sx={{ p: 5 }} >
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>แก้ไขข้อมูลบริษัท</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4, height: "100%" }}>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <Typography component="span">รายละเอียดบริษัท</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Typography component="span">เพิ่มพิกัดของบริษัท</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: "#eeeeee" }}>
                        <Paper sx={{ borderRadius: 1, mt: 3 }}>
                            <Grid container spacing={2} sx={{ backgroundColor: theme.palette.primary.dark, height: "35px", }} >
                                <Grid item size={1} align="center" sx={{ borderRight: "1px solid white", mt: 1, fontWeight: "bold", color: "white" }} >ลำดับ</Grid>
                                <Grid item size={4} align="center" sx={{ borderRight: "1px solid white", mt: 1, fontWeight: "bold", color: "white" }} >ชื่อ</Grid>
                                <Grid item size={7} align="center" sx={{ mt: 1, fontWeight: "bold", color: "white" }} >ที่อยู่</Grid>
                            </Grid>
                            {Array.isArray(selectedCompany?.address) && selectedCompany.address.length === 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item size={12} colSpan={3} align="center">
                                        <FolderOffRoundedIcon />
                                        <br />
                                        ไม่มีข้อมูล
                                    </Grid>
                                </Grid>
                            ) : (
                                selectedCompany?.address?.map((row, index) => (
                                    <Grid container spacing={2}
                                        key={index}
                                        hover
                                        sx={{ cursor: "pointer", height: "30px" }}
                                        onClick={() => handleAddress(row)}
                                    >
                                        <Grid item size={1} align="center" sx={{ fontSize: "14px", mt: 0.5 }}>{index + 1}</Grid>
                                        <Grid item size={4} align="center" sx={{ fontSize: "14px", mt: 0.5 }}>{row.name}</Grid>
                                        <Grid item size={7} align="center" sx={{ fontSize: "14px", mt: 0.5 }}>{formatAddress(row)}</Grid>
                                    </Grid>
                                ))
                            )}
                        </Paper>

                        {
                            selectedCompany?.address?.map((row, index) => (
                                row.ID === companyid &&
                                <React.Fragment>
                                    <Grid container spacing={2} marginTop={3}>
                                        <Grid item size={12}>
                                            <Divider sx={{ color: theme.palette.primary.dark }}>
                                                <Chip sx={{ backgroundColor: theme.palette.primary.dark, color: "white" }} label="พิกัดละติจูดและลองจิจูด" size="small" />
                                            </Divider>
                                        </Grid>

                                        <Grid item size={12}>
                                            <ThaiAddressSelector
                                                label="ที่อยู่ปัจจุบัน"
                                                thailand={thailand}
                                                value={address}
                                                placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                                onChange={setAddress}
                                            />
                                        </Grid>

                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold">latitude</Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={lat}
                                                    onChange={(e) => setLat(e.target.value)}
                                                />
                                            </Paper>
                                        </Grid>

                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold">longitude</Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={lng}
                                                    onChange={(e) => setLng(e.target.value)}
                                                />
                                            </Paper>
                                        </Grid>

                                        <Grid item size={12}>
                                            <Divider>
                                                <Chip label="หรือ" size="small" />
                                            </Divider>
                                        </Grid>

                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                url จาก google map
                                            </Typography>
                                            <Paper sx={{ width: "100%" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={googlemap}
                                                    onChange={handleMapLinkChange}
                                                />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            ))
                        }
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                            <Button variant="contained" color="error" sx={{ mr: 2 }} onClick={handleCloseCoordinates}>ยกเลิก</Button>
                            {

                                selectedCompany?.address?.map((row, index) => (
                                    companyid === row.ID &&
                                    <Button variant="contained" color="success" onClick={handleSaveCoordinates}>บันทึก</Button>
                                ))
                            }
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3-content"
                        id="panel3-header"
                    >
                        <Typography component="span">Accordion Actions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </AccordionDetails>
                    <AccordionActions>
                        <Button>Cancel</Button>
                        <Button>Agree</Button>
                    </AccordionActions>
                </Accordion>
            </Paper>
        </Container>
    );
}