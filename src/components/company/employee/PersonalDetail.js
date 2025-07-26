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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { database } from "../../../server/firebase";

const PersonalDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");
    const [editAddress, setEditAddress] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
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
        employname: emp.employname,
        position: emp.position.split("-")[1],
        sex: emp.personal?.sex || '',
        militaryStatus: emp.personal?.militaryStatus || '',
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
        employname: emp.employname,
        position: emp.position.split("-")[1],
        amphure: emp.personal?.address?.amphure || '',
        province: emp.personal?.address?.province || '',
        tambon: emp.personal?.address?.tambon || '',
        zipCode: emp.personal?.address?.zipCode || '',
    }));

    const personalColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        // { label: "เพศ", key: "sex", type: "text" },
        // { label: "สถานภาพทางทหาร", key: "militaryStatus", type: "text" },
        {
            label: "เพศ",
            key: "sex",
            type: "select",
            options: [
                { value: "ชาย", label: "ชาย" },
                { value: "หญิง", label: "หญิง" }
            ],
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
        },
        { label: "สัญชาติ", key: "nationality", type: "text" },
        { label: "ศาสนา", key: "religion", type: "text" },
        { label: "ส่วนสูง", key: "height", type: "text" },
        { label: "น้ำหนัก", key: "weight", type: "text" },
        //{ label: "สถานภาพ", key: "statusEmployee", type: "text" },
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
        },
        { label: "เบอร์โทรศัพท์", key: "phone", type: "text" },
        { label: "โทรศัพท์บ้าน", key: "homephone", type: "text" },
        { label: "LINE ID", key: "lineID", type: "text" },
        { label: "ประเทศ", key: "country", type: "text" },
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
        const merged = employees.map((emp, idx) => ({
            ...emp,
            personal: {
                ...emp.personal,
                sex: updatedList[idx].sex,
                militaryStatus: updatedList[idx].militaryStatus,
                nationality: updatedList[idx].nationality,
                religion: updatedList[idx].religion,
                height: updatedList[idx].height,
                weight: updatedList[idx].weight,
                statusEmployee: updatedList[idx].statusEmployee,
                phone: updatedList[idx].phone,
                homephone: updatedList[idx].homephone,
                lineID: updatedList[idx].lineID,
                country: updatedList[idx].country,
            },
        }));
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

                if (
                    col.type === "select" &&
                    !col.options?.some(opt => opt.value === value)
                ) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
                    return;
                }
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
        <Box sx={{ marginTop: 5, width: "1080px" }}>
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
                                    stylesTable={{ width: "2000px" }} // ✅ ส่งเป็น object
                                    columns={personalColumns}
                                    initialData={personal}
                                    onDataChange={handlePersonalChange}
                                />
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อ</TablecellHeader>
                                            <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                            <TablecellHeader>เพศ</TablecellHeader>
                                            <TablecellHeader>สถานภาพทางทหาร</TablecellHeader>
                                            <TablecellHeader>สัญชาติ</TablecellHeader>
                                            <TablecellHeader>ศาสนา</TablecellHeader>
                                            <TablecellHeader>ส่วนสูง</TablecellHeader>
                                            <TablecellHeader>น้ำหนัก</TablecellHeader>
                                            <TablecellHeader>สถานภาพ</TablecellHeader>
                                            <TablecellHeader>เบอร์โทรศัพท์</TablecellHeader>
                                            <TablecellHeader>โทรศัพท์บ้าน</TablecellHeader>
                                            <TablecellHeader>Line ID</TablecellHeader>
                                            <TablecellHeader>ประเทศ</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            personal.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                personal.map((row, index) => (
                                                    <TableRow>
                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.position}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.sex}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.militaryStatus}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.nationality}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.religion}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.height}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.weight}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.statusEmployee}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.phone}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.homephone}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.lineID}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.country}</TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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

            <Grid container spacing={2} sx={{ marginBottom: 1, marginTop: 5 }}>
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
            }
        </Box>
    )
}

export default PersonalDetail