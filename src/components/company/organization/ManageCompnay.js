import React, { useState, useEffect, use } from "react";
import { getDatabase, ref, push, onValue } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { useNavigate, useParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import HotTable from "@handsontable/react";

const ManageCompany = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const { companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [data, setData] = useState([
        { EmployeeID: '', socialSecurity: '' },
    ]);
    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

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

    const handleAddRow = () => {
        setData((prev) => [...prev, { EmployeeID: '', socialSecurity: '' }]);
    };

    const handleRemoveRow = () => {
        setData((prev) => prev.slice(0, -1)); // ลบแถวสุดท้าย
    };


    console.log("company : ", selectedCompany?.companyname);

    console.log("data : ", data);

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>{selectedCompany?.companyname}</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลบริษัท</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5 }}>
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ระดับตำแหน่งงาน (Lavel)</Typography>
                    <Paper sx={{ flexGrow: 1, width: '100%' }}>
                        <HotTable
                            data={data}
                            licenseKey="non-commercial-and-evaluation"
                            preventOverflow="horizontal"
                            colHeaders={['ชื่อ', 'ระดับ']}
                            autoWrapRow={true}
                            autoWrapCol={true}
                            wordWrap={true}
                            autoRowSize={true}
                            width="100%"
                            stretchH="all"
                            style={{ width: "100%" }}
                            rowHeaders={true}
                            columnHeaderHeight={30}
                            manualColumnMove={true}
                            manualRowResize={true}
                            manualColumnResize={true}
                            copyPaste={true}
                            contextMenu={true}
                            allowInsertRow={true}
                            allowInsertColumn={true}
                            columns={[
                                { data: 'EmployeeID', width: 465, className: 'htCenter htMiddle' },
                                { data: 'socialSecurity', width: 300, className: 'htCenter htMiddle' },
                            ]}
                            afterGetRowHeader={(row, TH) => {
                                TH.style.background = theme.palette.primary.main;
                                TH.style.color = theme.palette.primary.contrastText;
                                TH.style.fontWeight = 'bold';
                            }}
                            afterGetColHeader={(row, TH) => {
                                TH.style.background = theme.palette.primary.main;
                                TH.style.color = theme.palette.primary.contrastText;
                                TH.style.fontWeight = 'bold';
                            }}
                            afterChange={(changes, source) => {
                                if (source === 'loadData' || !changes) return;

                                setData((prevData) => {
                                    const newData = [...prevData];
                                    changes.forEach(([row, prop, oldVal, newVal]) => {
                                        newData[row][prop] = newVal;
                                    });
                                    return newData;
                                });
                            }}
                            cells={(row, col) => {
                                return { className: 'htCenter htMiddle' };
                            }}
                        />

                        <IconButton variant="contained" color="info" onClick={handleAddRow}>
                            <AddCircleOutlineIcon />
                        </IconButton>
                        <IconButton variant="contained" color="error" onClick={handleRemoveRow}>
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                    </Paper>
                    <Grid container spacing={2} paddingLeft={2}>
                        {/* <Grid item size={6}>
                            <TextField
                                size="small"
                                // value={shortName}
                                // onChange={(e) => setShortName(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ชื่อ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <TextField
                                size="small"
                                // value={shortName}
                                // onChange={(e) => setShortName(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ระดับ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid> */}
                    </Grid>
                </Box>
                <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ฝ่ายงาน (Department)</Typography>
                </Box>
                <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตำแหน่ง (Position)</Typography>
                </Box>
            </Paper>
        </Container>
    )
}

export default ManageCompany