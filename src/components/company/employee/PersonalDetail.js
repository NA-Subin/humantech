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
import GirlIcon from '@mui/icons-material/Girl';
import BoyIcon from '@mui/icons-material/Boy';
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
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { database } from "../../../server/firebase";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import ThaiAddressSelector from "../../../theme/ThaiAddressSelector";

const PersonalDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [openDetail, setOpenDetail] = useState({});

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [hoveredEmpID, setHoveredEmpID] = useState(null);
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    const [thailand, setThailand] = useState([]);
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

    const personal = employees.map(emp => ({
        employeecode: emp.employeecode,
        employname: `${emp.employname} (${emp.nickname})`,
        position: emp.position.split("-")[1],
        sex: emp.personal?.sex || '',
        militaryStatus: emp.personal?.militaryStatus || '',
        amphure: emp.personal?.address?.amphure || '',
        province: emp.personal?.address?.province || '',
        tambon: emp.personal?.address?.tambon || '',
        zipCode: emp.personal?.address?.zipCode || '',
        nationality: emp.personal?.nationality || '',
        religion: emp.personal?.religion || '',
        height: emp.personal?.height || '',
        weight: emp.personal?.weight || '',
        statusEmployee: emp.personal?.statusEmployee || '',
        phone: emp.personal?.phone || '',
        homephone: emp.personal?.homephone || '',
        lineID: emp.personal?.lineID || '',
        country: emp.personal?.country || '',
    }));

    const address = employees.map(emp => ({
        employname: `${emp.employname} (${emp.nickname})`,
        position: emp.position.split("-")[1],
        amphure: emp.personal?.address?.amphure || '',
        province: emp.personal?.address?.province || '',
        tambon: emp.personal?.address?.tambon || '',
        zipCode: emp.personal?.address?.zipCode || '',
    }));

    const personalColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true, width: 300 },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true, width: 200 },

        {
            label: "เพศ",
            key: "sex",
            type: "select",
            options: [
                { value: "ชาย", label: "ชาย" },
                { value: "หญิง", label: "หญิง" }
            ],
            width: 100,
        },
        {
            label: "สถานภาพทางทหาร",
            key: "militaryStatus",
            type: "select",
            options: [
                { value: "ผ่านเกณฑ์แล้ว", label: "ผ่านเกณฑ์แล้ว" },
                { value: "ได้รับการยกเว้น", label: "ได้รับการยกเว้น" },
                { value: "ยังไม่ได้เกณฑ์ทหาร", label: "ยังไม่ได้เกณฑ์ทหาร" }
            ],
            width: 150,
        },
        {
            label: "ตำบล",
            key: "tambon",
            type: "dependent-select",
            dependsOn: "amphure",
            options: thailand.flatMap((p) =>
                (p.amphure || []).flatMap((a) =>
                    (a.tambon || []).map((t) => ({
                        label: t.name_th,
                        value: `${t.id}-${t.name_th}`,
                        parent: `${a.id}-${a.name_th}`,
                    }))
                )
            ),
            width: 120,
        },
        {
            label: "อำเภอ",
            key: "amphure",
            type: "dependent-select",
            dependsOn: "province",
            options: thailand.flatMap((p) =>
                (p.amphure || []).map((a) => ({
                    label: a.name_th,
                    value: `${a.id}-${a.name_th}`,
                    parent: `${p.id}-${p.name_th}`,
                }))
            ),
            width: 120,
        },
        {
            label: "จังหวัด",
            key: "province",
            type: "select",
            options: thailand.map((p) => ({
                label: p.name_th,
                value: `${p.id}-${p.name_th}`,
            })),
            width: 120,
        },
        { label: "รหัสไปรษณีย์", key: "zipCode", type: "text", disabled: true, width: 100 },
        { label: "สัญชาติ", key: "nationality", type: "text", width: 100 },
        { label: "ศาสนา", key: "religion", type: "text", width: 100 },
        { label: "ส่วนสูง", key: "height", type: "text", width: 100 },
        { label: "น้ำหนัก", key: "weight", type: "text", width: 100 },
        {
            label: "สถานภาพ",
            key: "statusEmployee",
            type: "select",
            options: [
                { value: "โสด", label: "โสด" },
                { value: "สมรส", label: "สมรส" },
                { value: "หย่า", label: "หย่า" },
                { value: "หม้าย", label: "หม้าย" }
            ],
            width: 100,
        },
        { label: "เบอร์โทรศัพท์", key: "phone", type: "text", width: 120 },
        { label: "โทรศัพท์บ้าน", key: "homephone", type: "text", width: 120 },
        { label: "LINE ID", key: "lineID", type: "text", width: 150 },
        { label: "ประเทศ", key: "country", type: "text", width: 150 },
    ];

    const addressColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },

        {
            label: "จังหวัด",
            key: "province",
            type: "select",
            options: thailand.map((p) => ({
                label: p.name_th,
                value: `${p.id}-${p.name_th}`,
            })),
        },

        {
            label: "อำเภอ",
            key: "amphure",
            type: "dependent-select",
            dependsOn: "province",
            options: thailand.flatMap((p) =>
                (p.amphure || []).map((a) => ({
                    label: a.name_th,
                    value: `${a.id}-${a.name_th}`,
                    parent: `${p.id}-${p.name_th}`,
                }))
            ),
        },

        {
            label: "ตำบล",
            key: "tambon",
            type: "dependent-select",
            dependsOn: "amphure",
            options: thailand.flatMap((p) =>
                (p.amphure || []).flatMap((a) =>
                    (a.tambon || []).map((t) => ({
                        label: t.name_th,
                        value: `${t.id}-${t.name_th}`,
                        parent: `${a.id}-${a.name_th}`,
                    }))
                )
            ),
        },

        {
            label: "รหัสไปรษณีย์",
            key: "zipCode",
            type: "text",
            disabled: true
        },
    ];


    const handlePersonalChange = (updatedList) => {
        const merged = employees.map((emp, idx) => {
            const provinceKey = updatedList[idx].province;
            const amphureKey = updatedList[idx].amphure;
            const tambonKey = updatedList[idx].tambon;

            const [pId] = (provinceKey || "").split("-");
            const [aId] = (amphureKey || "").split("-");
            const [tId] = (tambonKey || "").split("-");

            // ค้นหา zipCode จาก thailand
            const province = thailand.find(p => `${p.id}` === pId);
            const amphure = province?.amphure.find(a => `${a.id}` === aId);
            const tambon = amphure?.tambon.find(t => `${t.id}` === tId);

            return {
                ...emp,
                personal: {
                    ...emp.personal,
                    sex: updatedList[idx].sex,
                    militaryStatus: updatedList[idx].militaryStatus,
                    address: {
                        province: provinceKey || '',
                        amphure: amphureKey || '',
                        tambon: tambonKey || '',
                        zipCode: tambon?.zip_code || '',
                    },
                    nationality: updatedList[idx].nationality,
                    religion: updatedList[idx].religion,
                    height: updatedList[idx].height,
                    weight: updatedList[idx].weight,
                    statusEmployee: updatedList[idx].statusEmployee,
                    phone: updatedList[idx].phone,
                    homephone: updatedList[idx].homephone,
                    lineID: updatedList[idx].lineID,
                    country: updatedList[idx].country,
                }
            };
        });
        setEmployees(merged);  // หรือ setPersonal หากแยก state
    };

    const handleAddressChange = (updatedList) => {
        const merged = employees.map((emp, idx) => {
            const provinceKey = updatedList[idx].province;
            const amphureKey = updatedList[idx].amphure;
            const tambonKey = updatedList[idx].tambon;

            const [pId] = (provinceKey || "").split("-");
            const [aId] = (amphureKey || "").split("-");
            const [tId] = (tambonKey || "").split("-");

            // ค้นหา zipCode จาก thailand
            const province = thailand.find(p => `${p.id}` === pId);
            const amphure = province?.amphure.find(a => `${a.id}` === aId);
            const tambon = amphure?.tambon.find(t => `${t.id}` === tId);

            return {
                ...emp,
                personal: {
                    ...emp.personal,
                    address: {
                        province: provinceKey || '',
                        amphure: amphureKey || '',
                        tambon: tambonKey || '',
                        zipCode: tambon?.zip_code || '',
                    }
                }
            };
        });

        setEmployees(merged);
    };


    console.log("personals : ", personal);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            if (!employeeData) {
                setAllEmployees([]);
                setEmployees([]);
            } else {
                const employeeArray = Object.values(employeeData);
                setAllEmployees(employeeArray);
                setEmployees(employeeArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    console.log("employees : ", employees);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const invalidMessages = [];

        employees.forEach((row, rowIndex) => {
            personalColumns.forEach((col) => {
                const value = row[col.key];

                if (value === "") {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
                    return;
                }

                if (col.type === "number" && isNaN(Number(value))) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
                    return;
                }

                // if (
                //     col.type === "select" &&
                //     !col.options?.some(opt => opt.value === value)
                // ) {
                //     invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
                //     return;
                // }
            });
        });

        // ✅ ตรวจสอบว่า employee.name ซ้ำหรือไม่
        const names = employees.map(row => row.name?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        // ❌ แสดงคำเตือนถ้ามีข้อผิดพลาด
        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(companiesRef, employees)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEdit(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val() || [{ ID: 0, name: '', employeenumber: '' }];
            setEmployees(employeeData);
            setEdit(false);
            setEditAddress(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };


    return (
        <Box sx={{ marginTop: 5, width: "100%" }}>
            <Grid container spacing={2} sx={{ marginBottom: 1 }}>
                <Grid item size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการ{data}</Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
            <Grid container spacing={2}>
                <Grid item size={edit ? 12 : 11}>
                    {
                        edit ?
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                    stylesTable={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2500px" }}
                                    columns={personalColumns}
                                    initialData={personal}
                                    onDataChange={handlePersonalChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลทั่วไปรายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2500px" }}>
                                        <TableHead
                                            sx={{
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 2,
                                            }}
                                        >
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 50, borderRight: "2px solid white" }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 300, borderRight: "2px solid white", position: "sticky", left: 0, zIndex: 2, backgroundColor: theme.palette.primary.dark }}>ชื่อ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 200, borderRight: "2px solid white" }}>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>เพศ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150, borderRight: "2px solid white" }}>สถานภาพทางทหาร</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120, borderRight: "2px solid white" }}>ตำบล</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120, borderRight: "2px solid white" }}>อำเภอ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120, borderRight: "2px solid white" }}>จังหวัด</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>รหัสไปรณีย์</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>สัญชาติ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>ศาสนา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>ส่วนสูง</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>น้ำหนัก</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>สถานภาพ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120, borderRight: "2px solid white" }}>เบอร์โทรศัพท์</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120, borderRight: "2px solid white" }}>โทรศัพท์บ้าน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150, borderRight: "2px solid white" }}>Line ID</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ประเทศ</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                personal.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={18}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    personal.map((row, index) => (
                                                        <TableRow
                                                            key={index}
                                                            onClick={() => setOpenDetail(row)}
                                                            onMouseEnter={() => setHoveredEmpID(row.employeecode)}
                                                            onMouseLeave={() => setHoveredEmpID(null)}
                                                            sx={{
                                                                cursor: hoveredEmpID === row.employeecode ? 'pointer' : 'default',
                                                                backgroundColor: hoveredEmpID === row.employeecode ? theme.palette.primary.light : 'inherit',
                                                            }}
                                                        >
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{index + 1}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "left", position: "sticky", left: 0, zIndex: 2, backgroundColor: "#f5f5f5" }}>
                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>
                                                                    {row.employname}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "left" }}>
                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.position}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.sex}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.militaryStatus}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.tambon.split("-")[1]}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.amphure.split("-")[1]}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.province.split("-")[1]}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.zipCode}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.nationality}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.religion}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.height}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.weight}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.statusEmployee}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.phone}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.homephone}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.lineID}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpID === row.employeecode ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>{row.country}</Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </React.Fragment>
                    }
                </Grid>
                {
                    !edit &&
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
                                onClick={() => setEdit(true)}
                            >
                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                แก้ไข
                            </Button>
                        </Box>
                    </Grid>
                }
            </Grid>
            {
                edit &&
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                </Box>
            }

            {
                openDetail?.employname && (
                    <Dialog
                        open
                        onClose={() => setOpenDetail({})}
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
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลทั่วไป</Typography>
                                </Grid>
                                <Grid item size={2} sx={{ textAlign: "right" }}>
                                    <IconButtonError sx={{ marginTop: -2 }} onClick={() => setOpenDetail({})}>
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
                            <Grid container spacing={2} marginTop={2}>
                                <Grid item size={3}>
                                    <Typography variant="subtitle2" fontWeight="bold">ชื่อเล่น</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={
                                            openDetail?.employname?.includes("(")
                                                ? openDetail.employname.split(" (")[1].replace(")", "")
                                                : ""
                                        }
                                        disabled
                                    />
                                </Grid>

                                <Grid item size={4.5}>
                                    <Typography variant="subtitle2" fontWeight="bold">ชื่อ</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={
                                            openDetail?.employname?.split(" (")[0] || ""
                                        }
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={4.5}>
                                    <Typography variant="subtitle2" fontWeight="bold">ตำแหน่ง</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.position}
                                        disabled
                                    />
                                </Grid>

                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >เพศ</Typography>
                                    <Grid container spacing={5} marginLeft={4} marginRight={4} >
                                        <Grid item size={1.5} />
                                        <Grid item size={4.5}
                                            sx={{
                                                height: "70px",
                                                backgroundColor: openDetail?.sex !== "หญิง" ? "#81d4fa" : "#eeeeee",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                        //onClick={() => setOpenSex(true)}
                                        >
                                            <Typography variant="h4" fontWeight="bold" color={openDetail?.sex !== "หญิง" ? "white" : "textDisabled"} gutterBottom>ชาย</Typography>
                                            <BoyIcon
                                                sx={{ fontSize: 70, color: openDetail?.sex !== "หญิง" ? "white" : "lightgray" }} // กำหนดขนาดไอคอนเป็น 60px
                                            />
                                        </Grid>
                                        <Grid item size={4.5}
                                            sx={{
                                                height: "70px",
                                                backgroundColor: openDetail?.sex !== "หญิง" ? "#eeeeee" : "#f48fb1",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                        // onClick={() => setOpenSex(false)}
                                        >
                                            <Typography variant="h4" fontWeight="bold" color={openDetail?.sex !== "หญิง" ? "textDisabled" : "white"} gutterBottom>หญิง</Typography>
                                            <GirlIcon
                                                color="disabled"
                                                sx={{ fontSize: 70, color: openDetail?.sex !== "หญิง" ? "lightgray" : "white" }} // กำหนดขนาดไอคอนเป็น 60px
                                            />
                                        </Grid>
                                        <Grid item size={1.5} />
                                    </Grid>
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >สถานภาพทางการทหาร</Typography>
                                    {/* <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={militaryStatus}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                        onChange={(e) => setMilitaryStatus(e.target.value)}
                                    >
                                        <MenuItem value="ผ่านการเกณฑ์แล้ว">ผ่านการเกณฑ์แล้ว</MenuItem>
                                        <MenuItem value="ได้รับการยกเว้น">ได้รับการยกเว้น</MenuItem>
                                        <MenuItem value="ยังไม่ได้เกณฑ์">ยังไม่ได้เกณฑ์</MenuItem>
                                    </TextField> */}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.militaryStatus}
                                        disabled
                                    // onChange={(e) => setHeight(e.target.value)}
                                    />
                                </Grid>
                                {/* <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >กรอกข้อมูลวันเกิด</Typography>
                                    <ThaiDateSelector
                                        label="วันเกิด"
                                        value={birthDate}
                                        onChange={(val) => setBirthDate(val)}
                                    />
                                </Grid> */}
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >สัญชาติ</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.nationality}
                                        // onChange={(e) => setNationality(e.target.value)}
                                        placeholder="กรุณากรอกสัญชาติ"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ศาสนา</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.religion}
                                        // onChange={(e) => setReligion(e.target.value)}
                                        placeholder="กรุณากรอกศาสนา"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2"><b>น้ำหนัก</b>(กิโลกรัม)</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.weight}
                                        // onChange={(e) => setWeight(e.target.value)}
                                        placeholder="กรุณากรอกน้ำหนัก"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2"><b>ส่วนสูง</b>(เซนติเมตร)</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.height}
                                        // onChange={(e) => setHeight(e.target.value)}
                                        placeholder="กรุณากรอกส่วนสูง"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >สถานภาพ</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.statusEmployee}
                                        disabled
                                    // onChange={(e) => setHeight(e.target.value)}
                                    />
                                    {/* <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={statusEmployee}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                        onChange={(e) => setStatusEmployee(e.target.value)}
                                    >
                                        {
                                            statuss.map((row, index) => (
                                                <MenuItem key={index} value={`${row.label}`}>{row.label}</MenuItem>
                                            ))
                                        }
                                    </TextField> */}
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >เบอร์โทรศัพท์</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.phone}
                                        // onChange={(e) => setPhone(e.target.value)}
                                        placeholder="กรุณากรอกเบอร์โทรศัพท์"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >โทรศัพท์บ้าน</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.homePhone}
                                        // onChange={(e) => setHomePhone(e.target.value)}
                                        placeholder="กรุณากรอกเบอร์โทรศัพท์บ้าน"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >LINE ID</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.lineID}
                                        //onChange={(e) => setLineID(e.target.value)}
                                        placeholder="กรุณากรอก LINE ID"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ประเทศ</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.country}
                                        //onChange={(e) => setCountry(e.target.value)}
                                        placeholder="กรุณากรอกประเทศ"
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่ปัจจุบัน</Typography>
                                    <TextField
                                        type="text"
                                        size="small"
                                        placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        disabled
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <ThaiAddressSelector
                                        label="ที่อยู่ปัจจุบัน"
                                        thailand={thailand}
                                        value={openDetail}
                                        placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                        disabled
                                    //onChange={(val) => setAddress(val)}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {/* <DialogActions sx={{ justifyContent: "space-between", px: 3, borderTop: `1px solid ${theme.palette.primary.dark}` }}>
                            <Button variant="contained" color="error" onClick={() => setOpenDetail({})}>
                                ยกเลิก
                            </Button>
                            <Button variant="contained" color="success" onClick={() => setOpenDetail({})}>
                                บันทึก
                            </Button>
                        </DialogActions> */}
                    </Dialog>
                )
            }

            {/* <Grid container spacing={2} sx={{ marginBottom: 1, marginTop: 5 }}>
                <Grid item size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการที่อยู่</Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
            <Grid container spacing={2}>
                <Grid item size={editAddress ? 12 : 11}>
                    {
                        editAddress ?
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                    columns={addressColumns}
                                    initialData={address}
                                    onDataChange={handleAddressChange}
                                />
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อ</TablecellHeader>
                                            <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                            <TablecellHeader>ตำบล</TablecellHeader>
                                            <TablecellHeader>อำเภอ</TablecellHeader>
                                            <TablecellHeader>จังหวัด</TablecellHeader>
                                            <TablecellHeader>รหัสไปรณีย์</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            address.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                address.map((row, index) => (
                                                    <TableRow>
                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.position}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.tambon.split("-")[1]}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.amphure.split("-")[1]}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.province.split("-")[1]}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.zipCode}</TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Grid>
                {
                    !editAddress &&
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
                                onClick={() => setEditAddress(true)}
                            >
                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                แก้ไข
                            </Button>
                        </Box>
                    </Grid>
                }
            </Grid>
            {
                editAddress &&
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                </Box>
            } */}
        </Box>
    )
}

export default PersonalDetail