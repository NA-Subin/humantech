import React, { useState, useEffect, use } from "react";
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
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import dayjs from "dayjs";
import "dayjs/locale/th";

const PositionDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editLavel, setEditLavel] = useState(false);
    const [editDepartment, setEditDepartment] = useState(false);
    const [editPosition, setEditPosition] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [position, setPosition] = useState([{ ID: 0, positionname: '', levelid: ':', deptid: ':', sectionid: ':' }]);
    const [level, setlevel] = useState([]);
    const [department, setDepartment] = useState([]);
    const [section, setSection] = useState([]);
    const [selectedDateReceive, setSelectedDateReceive] = useState(dayjs(new Date));

    console.log(selectedDateReceive);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/level`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // แปลง object เป็น array ของ { value, label }
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.name}`, // ค่าเวลาบันทึก
                    label: item.name,                 // แสดงผล
                }));
                setlevel(opts); // <-- ใช้ใน columns
            }
        });
    }, [companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/department`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // แปลง object เป็น array ของ { value, label }
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.deptname}`, // ค่าเวลาบันทึก
                    label: item.deptname,                 // แสดงผล
                }));
                setDepartment(opts); // <-- ใช้ใน columns
            }
        });
    }, [companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.sectionname}`,
                    label: item.sectionname,
                    keyposition: item.keyposition
                }));

                // เพิ่มตัวเลือก "ไม่มี" เข้าไปที่ด้านบน
                opts.unshift({ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" });

                setSection(opts);
            } else {
                // ถ้าไม่มีข้อมูล section เลย ให้มีตัวเลือก "ไม่มี" อย่างน้อย
                setSection([{ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" }]);
            }
        });
    }, [companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!positionData) {
                setPosition([{ ID: 0, positionname: '', levelid: ':', deptid: ':', sectionid: ':', max: ':' }]);
            } else {
                setPosition(positionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const [allSection, setAllSection] = useState([]);        // Section ทั้งหมดจาก Firebase
    const [filteredSection, setFilteredSection] = useState([]); // Section ที่กรองแล้ว
    const [keyPosition, setKeyPosition] = useState("");       // เช่น "3:ผู้จัดการฝ่ายการตลาด"

    console.log("position : ", position);
    console.log("all Section : ", allSection);
    console.log("fillter section : ", filteredSection);
    console.log("key Position : ", keyPosition);

    // โหลด section ทั้งหมดจาก Firebase
    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const opts = Object.values(data).map((item) => ({
                    ...item, // ต้องมี item.departmentid อยู่
                    value: `${item.ID}-${item.sectionname}`,
                    label: item.sectionname,
                }));
                setAllSection(opts);
            } else {
                setAllSection([]);
            }
        });
    }, [companyId]);

    // 🔁 กรอง section โดยอิงจาก departmentId ที่ได้จาก keyPosition
    useEffect(() => {
        const departmentId = keyPosition?.split("-")[0];

        const filtered = allSection.filter(section => String(section.departmentid) === departmentId);

        // เพิ่มตัวเลือก "ไม่มี" ที่ด้านบน
        filtered.unshift({ value: "0-ไม่มี", label: "ไม่มี" });

        setFilteredSection(filtered.length > 0 ? filtered : [{ value: "0-ไม่มี", label: "ไม่มี" }]);
    }, [keyPosition, allSection]);

    console.log("position : ", position);
    console.log("department : ", department);
    console.log("section : ", section);

    const columns = [
        { label: "ชื่อตำแหน่ง", key: "positionname", type: "text" },
        {
            label: "ระดับ",
            key: "levelid",
            type: "select",
            width: "20%",
            options: level,
        },
        {
            label: "ฝ่ายงาน",
            key: "deptid",
            type: "select",
            width: "20%",
            options: department,
        },
        {
            label: "ส่วนงาน",
            key: "sectionid",
            type: "dependent-select",
            dependsOn: "deptid",
            options: section.map((item) => ({
                label: item.label,
                value: item.value,
                parent: item.keyposition, // 👈 ใช้เฉพาะ ID ฝ่ายงาน
            })),
        },
        { label: "อัตราที่ต้องการ", key: "max", type: "number" },
    ];

    console.log("section :: ", section.map((item) => ({
        label: item.label,
        value: item.value,
        parent: item.keyposition.split("-")[0], // 👈 ใช้เฉพาะ ID ฝ่ายงาน
    })))

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const invalidMessages = [];

        position.forEach((row, rowIndex) => {
            columns.forEach((col) => {
                const value = row[col.key];

                if (value === "") {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
                    return;
                }

                if (col.type === "number" && isNaN(Number(value))) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
                    return;
                }

                if (
                    col.type === "select" &&
                    !col.options?.some(opt => opt.value === value)
                ) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
                    return;
                }
            });
        });

        if (invalidMessages.length > 0) {
            // รวมข้อความเป็นบรรทัด ๆ
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(companiesRef, position)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditPosition(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val() || [{ ID: 0, positionname: '', levelid: ':', deptid: ':', sectionid: ':', max: ':' }];
            setPosition(positionData);
            setEditPosition(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5, width: windowWidth - 290 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>ตำแหน่งงาน (Position)</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4, height: "75vh" }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลตำแหน่งงาน</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <Grid container spacing={2}>
                        <Grid item size={editPosition ? 12 : 11}>
                            {
                                editPosition ?
                                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                        {/* <HotTable
                                            data={position}
                                            afterChange={handleChange(setPosition)}
                                            licenseKey="non-commercial-and-evaluation"
                                            preventOverflow="horizontal"
                                            colHeaders={['ชื่อตำแหน่ง', 'ฝ่ายงาน', 'ระดับ']}
                                            rowHeaders={true}
                                            width="100%"
                                            height="auto"
                                            stretchH="all"
                                            manualColumnResize={true}
                                            manualRowResize={true}
                                            rowHeights={28}               // ความสูงของ td
                                            columnHeaderHeight={45}       // ความสูงของ th (หัวตาราง)
                                            contextMenu={true}
                                            copyPaste={true}
                                            className="mui-hot-table"
                                            columns={[
                                                { data: 'PositionName', className: 'htCenter htMiddle' },
                                                { data: 'Department', className: 'htCenter htMiddle' },
                                                { data: 'Lavel', className: 'htCenter htMiddle' },
                                            ]}
                                        /> */}
                                        <TableExcel
                                            columns={columns}
                                            styles={{ height: "55vh" }}
                                            initialData={position}
                                            onDataChange={setPosition}
                                        />
                                    </Paper>
                                    :
                                    <TableContainer component={Paper} textAlign="center" sx={{ height: "55vh" }}>
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" } }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                                    <TablecellHeader>ชื่อตำแหน่ง</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "15%" }}>ระดับ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "15%" }}>ฝ่ายงาน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "15%" }}>ส่วนงาน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "10%" }}>อัตราที่ต้องการ</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    position.length === 0 ?
                                                        <TableRow>
                                                            <TablecellNoData colSpan={4}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                        </TableRow>
                                                        :
                                                        position.map((row, index) => (
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.positionname}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.levelid.split("-")[1]}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.deptid.split("-")[1]}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.sectionid.split("-")[1]}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.max}</TableCell>
                                                            </TableRow>
                                                        ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                            }
                        </Grid>
                        {
                            !editPosition &&
                            <Grid item size={1} textAlign="right">
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="warning"
                                        fullWidth
                                        sx={{
                                            height: "60px",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                        }}
                                        onClick={() => setEditPosition(true)}
                                    >
                                        <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                        แก้ไข
                                    </Button>
                                    {/* {
                                    editPosition ?
                                        <Box textAlign="right">
                                            <IconButton variant="contained" color="info" onClick={() => handleAddRow("position")}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton variant="contained" color="error" onClick={() => handleRemoveRow("position")}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                        :
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="warning"
                                            fullWidth
                                            sx={{
                                                height: "60px",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                            }}
                                            onClick={() => setEditPosition(true)}
                                        >
                                            <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                            แก้ไข
                                        </Button>
                                } */}
                                </Box>
                            </Grid>
                        }
                    </Grid>
                    {
                        editPosition &&
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                            <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                            <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                        </Box>
                    }
                </Box>
            </Paper>
        </Container>
    )
}

export default PositionDetail