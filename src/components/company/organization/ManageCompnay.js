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
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

const ManageCompany = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const { companyName } = useParams();
    const [editLavel, setEditLavel] = useState(false);
    const [editDepartment, setEditDepartment] = useState(false);
    const [editPosition, setEditPosition] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [lavel, setLavel] = useState([{ Name: '', Lavel: '' }]);
    const [department, setDepartment] = useState([{ DepartmentName: '', Section: '' }]);
    const [position, setPosition] = useState([{ PositionName: '', DepartmentName: '', Lavel: '' }]);


    console.log("Lavel : ", lavel.length);
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

    const handleChange = (setFn) => (changes, source) => {
        if (source === 'loadData' || !changes) return;

        setFn((prev) => {
            const newData = [...prev];
            let hasChange = false;

            changes.forEach(([row, prop, oldVal, newVal]) => {
                if (oldVal !== newVal) {
                    newData[row][prop] = newVal;
                    hasChange = true;
                }
            });

            return hasChange ? newData : prev;
        });
    };


    const handleAddRow = (type) => {
        if (type === 'lavel') {
            const newRow = { Name: '', Lavel: '' };
            setLavel((prev) => [...prev, newRow]);
        } else if (type === 'department') {
            const newRow = { DepartmentName: '', Section: '' };
            setDepartment((prev) => [...prev, newRow]);
        } else if (type === 'position') {
            const newRow = { PositionName: '', DepartmentName: '', Lavel: '' };
            setPosition((prev) => [...prev, newRow]);
        }
    };

    const handleRemoveRow = (type) => {
        if (type === 'lavel') {
            setLavel((prev) => prev.slice(0, -1));
        } else if (type === 'department') {
            setDepartment((prev) => prev.slice(0, -1));
        } else if (type === 'position') {
            setPosition((prev) => prev.slice(0, -1));
        }
    };



    console.log("company : ", selectedCompany?.companyname);
    console.log("Lavel Data : ", lavel);
    console.log("Department Data : ", department);
    console.log("Position Data : ", position);

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
            <Paper sx={{ p: 5, width: "1200px" }}>
                <Box sx={{ marginTop: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ระดับตำแหน่งงาน (Lavel)</Typography>
                        </Grid>
                        <Grid item size={2} textAlign="right">
                            {!editLavel && <Button variant="contained" size="small" color="warning" onClick={() => setEditLavel(true)} >แก้ไข</Button>}
                        </Grid>
                    </Grid>
                    {
                        editLavel ?
                            <Paper sx={{ flexGrow: 1, width: '100%' }}>
                                <HotTable
                                    data={lavel}
                                    afterChange={handleChange(setLavel)}
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
                                        { data: 'Name', className: 'htCenter htMiddle' },
                                        { data: 'Lavel', className: 'htCenter htMiddle' },
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
                                    cells={(row, col) => {
                                        return { className: 'htCenter htMiddle' };
                                    }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item size={12}>
                                        {
                                            editLavel &&
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" size="small" color="error" onClick={() => setEditLavel(false)} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" size="small" color="success" onClick={() => setEditLavel(false)} >บันทึก</Button>
                                            </Box>
                                        }
                                    </Grid>
                                    <Grid item size={12} marginTop={-6}>
                                        <Box textAlign="right">
                                            <IconButton variant="contained" color="info" onClick={() => handleAddRow("lavel")}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton variant="contained" color="error" onClick={() => handleRemoveRow("lavel")}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>


                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center">
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                            <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อ</TablecellHeader>
                                            <TablecellHeader>ระดับ</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            lavel.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                lavel.map((row, index) => (
                                                    <TableRow>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{index + 1}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.Name}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.Lavel}</TablecellBody>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Box>
                <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
                <Box sx={{ marginTop: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ฝ่ายงาน (Department)</Typography>
                        </Grid>
                        <Grid item size={2} textAlign="right">
                            {!editDepartment && <Button variant="contained" size="small" color="warning" onClick={() => setEditDepartment(true)} >แก้ไข</Button>}
                        </Grid>
                    </Grid>
                    {
                        editDepartment ?
                            <Paper sx={{ flexGrow: 1, width: '100%' }}>
                                <HotTable
                                    data={department}
                                    afterChange={handleChange(setDepartment)}
                                    licenseKey="non-commercial-and-evaluation"
                                    preventOverflow="horizontal"
                                    colHeaders={['ชื่อแผนก', 'ส่วนงาน']}
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
                                        { data: 'DepartmentName', className: 'htCenter htMiddle' },
                                        { data: 'Section', className: 'htCenter htMiddle' },
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
                                    cells={(row, col) => {
                                        return { className: 'htCenter htMiddle' };
                                    }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item size={12}>
                                        {
                                            editDepartment &&
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" size="small" color="error" onClick={() => setEditDepartment(false)} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" size="small" color="success" onClick={() => setEditDepartment(false)} >บันทึก</Button>
                                            </Box>
                                        }
                                    </Grid>
                                    <Grid item size={12} marginTop={-6}>
                                        <Box textAlign="right">
                                            <IconButton variant="contained" color="info" onClick={() => handleAddRow("department")}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton variant="contained" color="error" onClick={() => handleRemoveRow("department")}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center">
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                            <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อแผนก</TablecellHeader>
                                            <TablecellHeader>ส่วนงาน</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            department.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                department.map((row, index) => (
                                                    <TableRow>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{index + 1}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.DepartmentName}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.Section}</TablecellBody>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Box>
                <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
                <Box sx={{ marginTop: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ตำแหน่ง (Position)</Typography>
                        </Grid>
                        <Grid item size={2} textAlign="right">
                            {!editPosition && <Button variant="contained" size="small" color="warning" onClick={() => setEditPosition(true)} >แก้ไข</Button>}
                        </Grid>
                    </Grid>
                    {
                        editPosition ?
                            <Paper sx={{ flexGrow: 1, width: '100%' }}>
                                <HotTable
                                    data={position}
                                    afterChange={handleChange(setPosition)}
                                    licenseKey="non-commercial-and-evaluation"
                                    preventOverflow="horizontal"
                                    colHeaders={['ชื่อตำแหน่ง', 'ฝ่ายงาน', 'ระดับ']}
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
                                        { data: 'PositionName', className: 'htCenter htMiddle' },
                                        { data: 'Department', className: 'htCenter htMiddle' },
                                        { data: 'Lavel', className: 'htCenter htMiddle' },
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
                                    cells={(row, col) => {
                                        return { className: 'htCenter htMiddle' };
                                    }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item size={12}>
                                        {
                                            editPosition &&
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" size="small" color="error" onClick={() => setEditPosition(false)} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" size="small" color="success" onClick={() => setEditPosition(false)} >บันทึก</Button>
                                            </Box>
                                        }
                                    </Grid>
                                    <Grid item size={12} marginTop={-6}>
                                        <Box textAlign="right">
                                            <IconButton variant="contained" color="info" onClick={() => handleAddRow("position")}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton variant="contained" color="error" onClick={() => handleRemoveRow("position")}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center">
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                            <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อตำแหน่ง</TablecellHeader>
                                            <TablecellHeader>ฝ่ายงาน</TablecellHeader>
                                            <TablecellHeader>ระดับ</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            position.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={4}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                position.map((row,index) => (
                                                    <TableRow>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{index + 1}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.PositionName}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.DepartmentName}</TablecellBody>
                                                        <TablecellBody sx={{ textAlign: "center" }}>{row.Lavel}</TablecellBody>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Box>
            </Paper>
        </Container>
    )
}

export default ManageCompany