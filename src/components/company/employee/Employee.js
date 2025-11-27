import React, { useState, useEffect, use, useRef } from "react";
import { getDatabase, ref, push, onValue, set, get, update } from "firebase/database";
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
import SettingsIcon from '@mui/icons-material/Settings';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import MuiExcelLikeTable from "../test";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import AddEmployee from "./AddEmployee";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import PersonalDetail from "./PersonalDetail";
import EducationDetail from "./EducationDetail";
import InternshipDetail from "./InternshipDetail";
import TrainingDetail from "./TrainingDetail";
import LanguageDetail from "./LanguageDetail";
import OtherDetail from "./OtherDetail";
import dayjs from "dayjs";
import ThaiDateSelector from "../../../theme/ThaiDateSelector";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatThaiSlash } from "../../../theme/DateTH";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import ImageIcon from '@mui/icons-material/Image';
import logo from "../../../img/LogoShort.png";
import none from "../../../img/none.png";
import SalaryDetail from "./SalaryDetail";
import WorkshiftDetail from "./WorkshiftDetail";

dayjs.extend(customParseFormat);

function Employee({ tabState, setTabState, tabId }) {
    const { domain, company } = tabState;
    const { firebaseDB, domainKey } = useFirebase();
    // const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    const companyId = company?.split(":")[0];
    const [check, setCheck] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState([]);
    const [checkEmployee, setCheckEmployee] = useState({});
    const [departmentDetail, setDepartmentDetail] = useState([]);
    const [sectionDetail, setSectionDetail] = useState([]);
    const [positionDetail, setPositionDetail] = useState([]);
    const [workshift, setWorkshift] = useState([]);
    const [workshifts, setWorkshifts] = useState([]);
    const [employeetype, setEmployeetype] = useState([]);
    const [employeetypes, setEmployeetypes] = useState([]);
    const [editWorkshift, setEditWorkshift] = useState(false);
    const [workshiftDate, setWorkshiftDate] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [menu, setMenu] = useState("");
    const paperRef = useRef(null);
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
    const [taxDeduction, setTaxDeduction] = useState([]);
    const [selectedTaxes, setSelectedTaxes] = useState([]);
    console.log("checkEmployee : ", checkEmployee);

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

    const toDateString = (dateObj) => {
        if (!dateObj || !dateObj.day || !dateObj.month || !dateObj.year) return '';

        const { day, month, year } = dateObj;
        const gregorianYear = Number(year) - 543;
        const date = dayjs(`${gregorianYear}-${month}-${day}`, "YYYY-M-D");
        return date.format("DD/MM/YYYY"); // 👉 "01/03/2025"
    };

    const toDateObject = (dateStr) => {
        if (!dateStr) return { day: '', month: '', year: '' };

        const date = dayjs(dateStr, "DD/MM/YYYY");
        return {
            day: date.date(),
            month: date.month() + 1,
            year: String(date.year() + 543),
        };
    };

    useEffect(() => {
        if (paperRef.current) {
            paperRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [menu]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const taxRef = ref(firebaseDB, `workgroup/company/${companyId}/deduction`);

        const unsubscribe = onValue(taxRef, (snapshot) => {
            const taxData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!taxData) {
                setTaxDeduction([{ ID: 0, title: "", detail: "", amount: "", unit: "" }]);
            } else {
                setTaxDeduction(taxData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

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
                setDepartmentDetail(opts); // <-- ใช้ใน columns
            }
        });
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.sectionname}`,
                    label: item.sectionname,
                    keyposition: item.deptid
                }));

                // เพิ่มตัวเลือก "ไม่มี" เข้าไปที่ด้านบน
                opts.unshift({ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" });

                setSectionDetail(opts);
            } else {
                // ถ้าไม่มีข้อมูล section เลย ให้มีตัวเลือก "ไม่มี" อย่างน้อย
                setSectionDetail([{ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" }]);
            }
        });
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);
                const employRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

                const employSnap = await get(employRef);
                const employData = employSnap.val();
                const employList = employData ? Object.values(employData) : [];

                onValue(optionRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const opts = Object.values(data)
                            // .filter((row) => {
                            //     const count = employList.filter((emp) =>
                            //         Number(emp.position.split("-")[0]) === row.ID
                            //     );
                            //     return count.length < Number(row.max); // เช็คว่าเต็มหรือยัง
                            // })
                            .map((item) => ({
                                value: `${item.ID}-${item.positionname}`,
                                label: item.positionname,
                                keyposition: item.deptid
                            }));

                        // ✅ เพิ่มตัวเลือก "ไม่มี" ที่ด้านบน
                        opts.unshift({ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" });
                        setPositionDetail(opts);
                    } else {
                        // ✅ ถ้าไม่มี position เลย
                        setPositionDetail([{ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" }]);
                    }
                });
            } catch (err) {
                console.error("Error fetching position data:", err);
            }
        };

        fetchData();
    }, [firebaseDB, companyId]);

    console.log("position Detail : ", positionDetail);

    const columns = [
        { label: "รหัสพนักงาน", key: "employeecode", type: "text", width: 100 },
        {
            label: "คำนำหน้าชื่อ",
            key: "prefix",
            type: "select",
            options: [
                { value: "นาย", label: "นาย" },
                { value: "นาง", label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
                { value: "ดร.", label: "ดร." },
                { value: "ศ.", label: "ศ." },
                { value: "คุณ", label: "คุณ" },
            ],
            width: 100,
        },
        { label: "ชื่อ", key: "name", type: "text", width: 100 },
        { label: "นามสกุล", key: "lastname", type: "text", width: 100 },
        { label: "ชื่อเล่น", key: "nickname", type: "text", width: 100 }, // (เพิ่มเล็กน้อยเพื่อความสมดุล)
        // { label: "รหัสประจำตัวประชาชน", key: "nationalID", type: "text", width: 150 },
        {
            label: "ฝ่ายงาน",
            key: "department",
            type: "select",
            options: departmentDetail,
            width: 200,
        },
        {
            label: "ส่วนงาน",
            key: "section",
            type: "dependent-select",
            dependsOn: "department",
            options: sectionDetail.map((item) => ({
                label: item.label,
                value: item.value,
                parent: item.keyposition,
            })),
            width: 200,
        },
        {
            label: "ตำแหน่ง",
            key: "position",
            type: "dependent-select",
            dependsOn: "department",
            options: positionDetail.map((item) => ({
                label: item.label,
                value: item.value,
                parent: item.keyposition,
            })),
            width: 200,
        },
        {
            label: "ประเภทการจ้าง",
            key: "employmenttype",
            type: "select",
            options: employeetype,
            width: 120,
        },
        // { label: "เงินเดือน", key: "salary", type: "number", width: 100 },
    ];

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

    const [editEmployee, setEditEmployee] = useState("");
    const [editPersonal, setEditPersonal] = useState("");

    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [position, setPosition] = useState("");
    const [employee, setEmployee] = useState("");
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [opendetail, setOpenDetail] = useState({});

    // ฟังก์ชัน toggle เมื่อกดเลือก
    const handleSelectTax = (tax) => {
        setSelectedTaxes(prev => {
            const exists = prev.some(item => item.ID === tax.ID);
            if (exists) {
                return prev.filter(item => item.ID !== tax.ID);
            }
            return [...prev, {
                ID: selectedTaxes.length,
                taxid: tax.ID,
                name: tax.title,
                amount: tax.amount,
                date: dayjs(new Date).format("DD/MM/YYYY")
            }]; // เพิ่มทั้ง object
        });
    };

    const handleDetailChange = (field, value) => {
        if (field === "taxdeduction") {
            setOpenDetail(prev => {
                const exists = prev.taxdeduction?.some(item => item.taxid === value.ID);

                let updatedList;

                if (exists) {
                    // ลบรายการที่มี taxid ตรงกัน
                    updatedList = prev.taxdeduction.filter(item => item.taxid !== value.ID);
                } else {
                    // เพิ่มรายการใหม่
                    updatedList = [
                        ...(prev.taxdeduction || []),
                        {
                            taxid: value.ID,
                            name: value.title,
                            amount: value.amount,
                            date: dayjs(new Date()).format("DD/MM/YYYY")
                        }
                    ];
                }

                // 👉 สร้าง ID ใหม่ให้เป็น index ของ array ทุกครั้ง
                updatedList = updatedList.map((item, index) => ({
                    ...item,
                    ID: index
                }));

                return {
                    ...prev,
                    [field]: updatedList,
                };
            });

        } else {
            setOpenDetail(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    const personal = employees.map(emp => ({
        nickname: emp.nickname,
        employname: emp.employname,
        position: emp.position.split("-")[1],
        country: emp.personal?.country || '',
        homephone: emp.personal?.homephone || '',
        lineID: emp.personal?.lineID || '',
        nationality: emp.personal?.nationality || '',
        phone: emp.personal?.phone || '',
        religion: emp.personal?.religion || '',
        sex: emp.personal?.sex || '',
        statusEmployee: emp.personal?.statusEmployee || '',
        militaryStatus: emp.personal?.militaryStatus || '',
        height: emp.personal?.height || '',
        weight: emp.personal?.weight || '',
    }));

    const personalColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
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

    console.log("department : ", department);
    console.log("personals : ", personal);
    console.log("workshift s : ", workshifts);

    const renderComponentByMenu = (menu, data) => {
        const key = menu.split("-")[1];

        switch (key) {
            case 'ข้อมูลทั่วไป':
                return <PersonalDetail data={key} companyName={company} />;
            case 'เงินเดือน':
                return <SalaryDetail data={key} companyName={company} />;
            case 'กะการทำงาน':
                return <WorkshiftDetail data={key} companyName={company} />;
            case 'การศึกษา':
                return <EducationDetail data={key} companyName={company} />;
            case 'การทำงาน/ฝึกงาน':
                return <InternshipDetail data={key} companyName={company} />;
            case 'การฝึกอบรม':
                return <TrainingDetail data={key} companyName={company} />;
            case 'ภาษา':
                return <LanguageDetail data={key} companyName={company} />;
            case 'อื่นๆ':
                return <OtherDetail data={key} companyName={company} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const departmentRef = ref(firebaseDB, `workgroup/company/${companyId}/department`);

        const unsubscribe = onValue(departmentRef, (snapshot) => {
            const departmentData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!departmentData) {
                setDepartments([{ ID: 0, name: '' }]);
            } else {
                setDepartments(departmentData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const sectionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        const unsubscribe = onValue(sectionRef, (snapshot) => {
            const sectionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!sectionData) {
                setSections([{ ID: 0, name: '' }]);
            } else {
                setSections(sectionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!positionData) {
                setPositions([]);
            } else {
                setPositions(positionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                setAllEmployees([]);
                setEmployees([]);
                return;
            }

            const employ = Object.values(data).map((emp) => ({
                ...emp,
                // nationalID: emp.personal?.nationalID ?? '',
                prefix: emp.personal?.prefix ?? '',
                name: emp.personal?.name ?? '',
                lastname: emp.personal?.lastname ?? '',
            }));

            setAllEmployees(employ);
            setEmployees(employ); // ค่า default คือแสดงทั้งหมด
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // แปลง object เป็น array ของ { value, label }
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.name}`, // ค่าเวลาบันทึก
                    label: item.name,                 // แสดงผล
                }));
                const workshiftArray = Object.values(data);
                setWorkshift(opts); // <-- ใช้ใน columns
                setWorkshifts(workshiftArray);
            }
        });
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/employeetype`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // แปลง object เป็น array ของ { value, label }
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.name}`, // ค่าเวลาบันทึก
                    label: item.name,                 // แสดงผล
                }));
                const employeetypeArray = Object.values(data);
                setEmployeetype(opts); // <-- ใช้ใน columns
                setEmployeetypes(employeetypeArray);
            }
        });
    }, [firebaseDB, companyId]);

    console.log("2.employees : ", employees);

    useEffect(() => {
        const filtered = allEmployees.filter((emp) => {
            if (department && emp.department !== department) return false;
            if (section && emp.section !== section) return false;
            if (position && emp.position !== position) return false;
            return true;
        });

        setEmployees(filtered);
    }, [department, section, position, allEmployees]);

    const handleEmployeesChange = (newEmployees) => {
        const enrichedEmployees = newEmployees.map(emp => {
            const shiftID = Number(emp.workshift?.split("-")[0]);
            const shiftData = workshifts.find(row => row.ID === shiftID);

            return {
                ...emp,
                workshiftHistory: {
                    start: shiftData.start,
                    stop: shiftData.stop,
                    holiday: shiftData.holiday,
                    DDstart: dayjs(new Date).format("DD"),
                    DDend: "now",
                    MMstart: dayjs(new Date).format("MM"),
                    MMend: "now",
                    YYYYstart: dayjs(new Date).format("YY"),
                    YYYYend: "now",
                }
            };
        });

        setEmployees(enrichedEmployees);
    };

    const handleSave = async () => {
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);
        const groupsRef = ref(firebaseDB, "workgroup");
        const companyRef = ref(firebaseDB, `workgroup/company/${companyId}`);

        const invalidMessages = [];

        // employees.forEach((row, rowIndex) => {
        //     columns.forEach((col) => {
        //         const value = row[col.key];

        //         if (value === "") {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
        //             return;
        //         }

        //         if (col.type === "number" && isNaN(Number(value))) {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
        //             return;
        //         }

        //         if (
        //             col.type === "select" &&
        //             !col.options?.some(opt => opt.value === value)
        //         ) {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
        //             return;
        //         }
        //     });
        // });

        const codes = employees.map(row => row.employeecode?.trim()).filter(Boolean);
        const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);

        if (duplicates.length > 0) {
            invalidMessages.push(`มีรหัสพนักงาน: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // 🔁 โหลดข้อมูล group และ company เพื่อใช้ใน backend call
        let backendGroupID = "";
        let backendCompanyID = "";

        try {
            const groupSnap = await get(groupsRef);
            if (groupSnap.exists()) {
                backendGroupID = groupSnap.val().backendid;
            } else {
                throw new Error("ไม่พบค่า backenid");
            }

            const companySnap = await get(companyRef);
            if (companySnap.exists()) {
                backendCompanyID = companySnap.val().cpnbackendid;
            } else {
                throw new Error("ไม่พบค่า cpnbackendid");
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล backend id:", error);
            ShowError("เกิดข้อผิดพลาดในการโหลดข้อมูล backend id");
            return;
        }

        console.log("1.employees : ", employees);

        // ✅ เติม workshifthistory และสร้าง empbackendid หากยังไม่มี
        const enrichedEmployees = await Promise.all(
            employees.map(async (emp) => {
                let updatedEmp = { ...emp };

                // ✅ เพิ่ม empbackendid ถ้ายังไม่มี
                if (!updatedEmp.empbackendid || updatedEmp.empbackendid === "") {
                    try {
                        const response = await fetch(
                            `https://upload.happysoftth.com/humantech/${backendGroupID}/${backendCompanyID}/employee`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ employee: `${updatedEmp.name} ${updatedEmp.lastname}` }),
                            }
                        );

                        if (!response.ok) {
                            const text = await response.text();
                            console.error("Backend error response:", text);
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        updatedEmp.empbackendid = data.id;
                    } catch (err) {
                        console.error("Error creating employee in backend:", err);
                        ShowError("เกิดข้อผิดพลาดขณะสร้างพนักงานใน backend");
                        return emp;
                    }
                }

                // ✅ จัดการ workshifthistory
                const shiftID = Number(updatedEmp.workshift?.split("-")[0]);
                const shiftData = workshifts.find((row) => row.ID === shiftID);
                const currentHistory = Array.isArray(updatedEmp.workshifthistory) ? [...updatedEmp.workshifthistory] : [];

                const lastIndex = currentHistory.length - 1;
                const lastHistory = currentHistory[lastIndex] || null;

                const isSameWorkshift = (historyEntry, shift) => {
                    if (!historyEntry || !shift) return false;
                    return historyEntry.start === shift.start && historyEntry.stop === shift.stop;
                };

                // ✅ Allowlist ของ field ที่อนุญาตให้เก็บใน Firebase
                const allowedKeys = [
                    "ID", "attendant", "department", "educationList", "empbackendid",
                    "empleaveapprove", "employeecode", "employmenttype", "internship",
                    "languageList", "nickname", "personal", "position", "salary",
                    "section", "specialAbilities", "trainingList", "workshift", "workshifthistory"
                ];

                // Helper: เลือกเฉพาะ key ที่อนุญาตและเติมค่าเริ่มต้น
                const fillAllowlist = (obj) => {
                    const defaults = {
                        ID: "", attendant: "", department: "", educationList: [], empbackendid: "",
                        empleaveapprove: "", employeecode: "", employmenttype: "", internship: "",
                        languageList: [], nickname: "", personal: {}, position: "", salary: "",
                        section: "", specialAbilities: "", trainingList: [], workshift: "", workshifthistory: []
                    };

                    const filtered = {};
                    allowedKeys.forEach(key => {
                        filtered[key] = obj[key] !== undefined && obj[key] !== null ? obj[key] : defaults[key];
                    });
                    return filtered;
                };

                let result;

                if (isSameWorkshift(lastHistory, shiftData)) {
                    // shift ไม่เปลี่ยน แต่ยังอัปเดตข้อมูลพื้นฐาน
                    result = {
                        ...fillAllowlist(updatedEmp),
                        employname: `${updatedEmp.name || ""} ${updatedEmp.lastname || ""}`.trim(),
                        personal: {
                            ...updatedEmp.personal,
                            // nationalID: updatedEmp.nationalID ?? "",
                            prefix: updatedEmp.prefix ?? "",
                            name: updatedEmp.name ?? "",
                            lastname: updatedEmp.lastname ?? "",
                            nickname: updatedEmp.nickname ?? "",
                        },
                        workshifthistory: currentHistory,
                        username: updatedEmp.username ? updatedEmp.username : updatedEmp.employeecode,
                        password: updatedEmp.password ? updatedEmp.password : "1234567",
                        faceverify: updatedEmp.faceverify ?? ""
                    };
                } else {
                    // shift ใหม่ → เพิ่ม history entry
                    let newStartDate = dayjs();
                    if (lastHistory && lastHistory.DDend !== "now") {
                        const dateString = `${lastHistory.DDend}/${lastHistory.MMend}/${lastHistory.YYYYend}`;
                        newStartDate = dayjs(dateString, "DD/MM/YYYY").add(1, "day");
                    }

                    if (lastHistory) {
                        const newEndDate = newStartDate.subtract(1, "day");
                        currentHistory[lastIndex] = {
                            ...lastHistory,
                            DDend: newEndDate.format("DD"),
                            MMend: newEndDate.format("MM"),
                            YYYYend: newEndDate.format("YYYY"),
                            dateend: newEndDate.format("DD/MM/YYYY"),
                        };
                    }

                    const newHistoryEntry = {
                        start: shiftData?.start || "",
                        stop: shiftData?.stop || "",
                        holiday: shiftData?.holiday || [],
                        DDstart: newStartDate.format("DD"),
                        DDend: "now",
                        MMstart: newStartDate.format("MM"),
                        MMend: "now",
                        YYYYstart: newStartDate.format("YYYY"),
                        YYYYend: "now",
                        datestart: newStartDate.format("DD/MM/YYYY"),
                        dateend: "now",
                    };

                    result = {
                        ...fillAllowlist(updatedEmp),
                        employname: `${updatedEmp.name || ""} ${updatedEmp.lastname || ""}`.trim(),
                        personal: {
                            ...updatedEmp.personal,
                            // nationalID: updatedEmp.nationalID ?? "",
                            prefix: updatedEmp.prefix ?? "",
                            name: updatedEmp.name ?? "",
                            lastname: updatedEmp.lastname ?? "",
                        },
                        workshifthistory: [...currentHistory, newHistoryEntry],
                        username: updatedEmp.username ? updatedEmp.username : updatedEmp.employeecode,
                        password: updatedEmp.password ? updatedEmp.password : "1234567",
                        faceverify: updatedEmp.faceverify ?? ""
                    };
                }

                return result;
            })
        );

        console.log("enrichedEmployees : ", enrichedEmployees);

        // ✅ บันทึก
        set(employeeRef, enrichedEmployees)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                setEditEmployee(false);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
            });
    };

    // const dates = toDateString(workshiftDate);
    // const newStartDate = dayjs(toDateString(workshiftDate), "DD/MM/YYYY");
    // console.log("DD : ",dayjs(workshiftDate.day || new Date).format("DD"));
    // console.log("MM : ",dayjs(workshiftDate.month || new Date).format("MM"));
    // console.log("YYYY : ",dayjs(workshiftDate.year || new Date).format("YYYY"));
    // console.log("Date : ",toDateString(workshiftDate));
    // console.log("Dates : ",dayjs(dates, "DD/MM/YYYY"));
    // console.log("Dates s : ",dayjs(toDateString(workshiftDate), "DD/MM/YYYY"));

    console.log("date : ", toDateString(workshiftDate));
    console.log("opendetail : ", opendetail);
    console.log("opendetail.workshifthistory : ", opendetail.workshifthistory);

    const [workshiftID, setWorkshiftID] = useState("");
    const [workshiftName, setWorkshiftName] = useState("");
    const [workshiftDateStart, setWorkshiftDateStart] = useState(dayjs(new Date).format("DD/MM/YYYY"));
    const [workshiftDateEnd, setWorkshiftDateEnd] = useState(dayjs(new Date).format("DD/MM/YYYY"));

    // const handleUpdateTime = (tm) => {
    //     setWorkshiftID(tm.ID);
    //     setWorkshiftName(tm.workshift);
    //     setWorkshiftDateStart(tm.datestart);
    //     setWorkshiftDateEnd(tm.dateend);
    // }

    const handleUpdateTime = (tm) => {
        // ถ้า attendant ว่าง → ไม่ต้องเช็ค
        if (!opendetail.attendant || Object.keys(opendetail.attendant).length === 0) {
            const startDate = dayjs(`${tm.YYYYstart}-${tm.MMstart}-${tm.DDstart}`, "YYYY-M-D");
            const endDate = tm.DDend && tm.MMend && tm.YYYYend
                ? dayjs(`${tm.YYYYend}-${tm.MMend}-${tm.DDend}`, "YYYY-M-D")
                : null;

            setWorkshiftID(tm.ID);
            setWorkshiftName(tm.workshift);
            setWorkshiftDateStart(startDate);
            setWorkshiftDateEnd(endDate);
            return;
        }

        // แปลง attendant เป็น array ของทุก entry
        let allAttendants = [];
        Object.values(opendetail.attendant).forEach(yearObj => {
            Object.values(yearObj).forEach(monthArr => {
                allAttendants = allAttendants.concat(monthArr || []);
            });
        });

        // ตรวจสอบ overlap และ workshift ตรงกัน
        const hasConflict = allAttendants.some(entry => {
            if (entry.workshift !== tm.workshift) return false;

            const entryStart = dayjs(`${entry.YYYYstart}-${entry.MMstart}-${entry.DDstart}`, "YYYY-M-D");
            const entryEnd = entry.DDend && entry.MMend && entry.YYYYend
                ? dayjs(`${entry.YYYYend}-${entry.MMend}-${entry.DDend}`, "YYYY-M-D")
                : dayjs(); // ถ้ายัง "now" ให้ถือว่าสิ้นสุดวันนี้

            const tmStart = dayjs(`${tm.YYYYstart}-${tm.MMstart}-${tm.DDstart}`, "YYYY-M-D");
            const tmEnd = tm.DDend && tm.MMend && tm.YYYYend
                ? dayjs(`${tm.YYYYend}-${tm.MMend}-${tm.DDend}`, "YYYY-M-D")
                : dayjs();

            // เช็คว่าช่วง tm ทับกับ entry เดิมหรือไม่
            return tmStart.isBetween(entryStart, entryEnd, "day", "[]") ||
                tmEnd.isBetween(entryStart, entryEnd, "day", "[]") ||
                entryStart.isBetween(tmStart, tmEnd, "day", "[]") ||
                entryEnd.isBetween(tmStart, tmEnd, "day", "[]");
        });

        if (hasConflict) {
            ShowWarning(
                "ช่วงวันที่ซ้ำ",
                "ไม่สามารถบันทึกได้ เพราะมีกะการทำงานตรงกันในช่วงเวลาที่เลือก"
            );
            return;
        }

        // ถ้าไม่มี conflict → เซ็ตค่า
        const startDate = dayjs(`${tm.YYYYstart}-${tm.MMstart}-${tm.DDstart}`, "YYYY-M-D");
        const endDate = tm.DDend && tm.MMend && tm.YYYYend
            ? dayjs(`${tm.YYYYend}-${tm.MMend}-${tm.DDend}`, "YYYY-M-D")
            : null;

        setWorkshiftID(tm.ID);
        setWorkshiftName(tm.workshift);
        setWorkshiftDateStart(startDate);
        setWorkshiftDateEnd(endDate);
    };


    // const handleSaveWorkshift = () => {
    //     const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${opendetail.ID}`);

    //     if (!workshift || !workshiftDate || !workshifts?.length) {
    //         ShowWarning("ข้อมูลไม่ครบ", "กรุณาเลือกกะการทำงานและวันที่ให้ครบถ้วนก่อนบันทึก");
    //         return;
    //     }

    //     const shiftID = Number(workshift.ID);
    //     const shiftData = workshifts.find(row => row.ID === shiftID);

    //     if (!shiftData) {
    //         ShowWarning("ไม่พบข้อมูลกะ", "ไม่สามารถค้นหากะที่เลือกได้");
    //         return;
    //     }

    //     const currentHistory = Array.isArray(opendetail.workshifthistory) ? [...opendetail.workshifthistory] : [];
    //     const lastIndex = currentHistory.length - 1;
    //     const lastHistory = currentHistory[lastIndex] || null;

    //     const isSameWorkshift = (historyEntry, shift) => {
    //         if (!historyEntry || !shift) return false;
    //         return historyEntry.start === shift.start && historyEntry.stop === shift.stop;
    //     };

    //     const newStartDate = toDateString(workshiftDate);

    //     // ถ้า shift เหมือนเดิม → update เฉพาะ workshift
    //     if (isSameWorkshift(lastHistory, shiftData)) {
    //         set(companiesRef, {
    //             workshift: `${workshift.ID}-${workshift.name}`,
    //         })
    //             .then(() => {
    //                 setEditWorkshift(false);
    //             })
    //             .catch((error) => {
    //                 ShowError("เกิดข้อผิดพลาดในการบันทึก");
    //                 console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
    //             });
    //         return;
    //     }

    //     // ถ้ามี history อย่างน้อย 1 รายการ → ปรับ end ก่อนเพิ่มใหม่
    //     if (currentHistory.length > 0) {
    //         const newEndDate = newStartDate.subtract(1, "day");
    //         currentHistory[lastIndex] = {
    //             ...lastHistory,
    //             DDend: newEndDate.format("DD"),
    //             MMend: newEndDate.format("MM"),
    //             YYYYend: newEndDate.format("YYYY"),
    //             dateend: newEndDate.format("DD/MM/YYYY"),
    //         };
    //     }

    //     // เพิ่ม entry ใหม่
    //     const newHistoryEntry = {
    //         ID: currentHistory.length,
    //         workshift: `${workshift.ID}-${workshift.name}`,
    //         DDstart: dayjs(workshiftDate.day).format("DD"),
    //         MMstart: dayjs(workshiftDate.month).format("MM"),
    //         YYYYstart: dayjs(workshiftDate.year).format("YYYY"),
    //         datestart: toDateString(workshiftDate),
    //         DDend: "now",
    //         MMend: "now",
    //         YYYYend: "now",
    //         dateend: "now",
    //         start: workshift.start,
    //         stop: workshift.stop,
    //         holiday: workshift.holiday,
    //     };

    //     const updatedEmployee = {
    //         ...opendetail,
    //         workshift: `${workshift.ID}-${workshift.name}`,
    //         workshifthistory: [...currentHistory, newHistoryEntry],
    //     };

    //     set(companiesRef, updatedEmployee)
    //         .then(() => {
    //             setEditWorkshift(false);
    //         })
    //         .catch((error) => {
    //             console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
    //         });
    // };

    const handleSaveWorkshift = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${opendetail.ID}`);

        if (!workshift || !workshiftDate || !workshifts?.length) {
            ShowWarning("ข้อมูลไม่ครบ", "กรุณาเลือกกะการทำงานและวันที่ให้ครบถ้วนก่อนบันทึก");
            return;
        }

        const shiftID = Number(workshift.ID);
        const shiftData = workshifts.find(row => row.ID === shiftID);

        if (!shiftData) {
            ShowWarning("ไม่พบข้อมูลกะ", "ไม่สามารถค้นหากะที่เลือกได้");
            return;
        }

        // เตรียม history เดิม
        const currentHistory = Array.isArray(opendetail.workshifthistory) ? [...opendetail.workshifthistory] : [];
        const lastIndex = currentHistory.length - 1;
        const lastHistory = currentHistory[lastIndex] || null;

        // วันเริ่มกะใหม่
        const newStartDate = dayjs(toDateString(workshiftDate), "DD/MM/YYYY");
        const newStartStr = newStartDate.format("DD/MM/YYYY");

        // 🔍 ตรวจสอบว่าช่วงทับกับ history เดิมหรือไม่
        // const overlap = currentHistory.some(h => {
        //     const start = dayjs(h.datestart, "DD/MM/YYYY");
        //     const end = h.dateend !== "now" ? dayjs(h.dateend, "DD/MM/YYYY") : dayjs("2999-12-31");
        //     return newStartDate.isBetween(start, end, "day", "[]");
        // });

        // if (overlap) {
        //     ShowWarning("ช่วงวันที่ทับกัน", "คุณกำลังเพิ่ม/แก้กะในช่วงที่มีอยู่แล้ว");
        //     return;
        // }

        // ถ้ามี history เดิม → ปิดกะเก่าด้วย end = วันก่อนหน้า
        if (currentHistory.length > 0) {
            const newEndDate = newStartDate.subtract(1, "day");
            currentHistory[lastIndex] = {
                ...lastHistory,
                DDend: newEndDate.format("DD"),
                MMend: newEndDate.format("MM"),
                YYYYend: newEndDate.format("YYYY"),
                dateend: newEndDate.format("DD/MM/YYYY"),
            };

            const lastHistoryStart = dayjs(lastHistory.datestart, "DD/MM/YYYY");

            // ถ้าวันที่เลือก <= วันเริ่ม entry ล่าสุด → ไม่อนุญาต
            if (newStartDate.isSame(lastHistoryStart) || newStartDate.isBefore(lastHistoryStart, "day")) {
                ShowWarning(
                    "วันที่ไม่ถูกต้อง",
                    `คุณไม่สามารถบันทึกวันที่ก่อนหรือเท่ากับวันที่เริ่มของกะล่าสุด (${lastHistory.datestart})`
                );
                return;
            }
        }

        // ✅ สร้าง entry ใหม่
        const newHistoryEntry = {
            ID: currentHistory.length,
            workshift: `${workshift.ID}-${workshift.name}`,
            DDstart: newStartDate.format("DD"),
            MMstart: newStartDate.format("MM"),
            YYYYstart: newStartDate.format("YYYY"),
            datestart: newStartStr,
            DDend: "now",
            MMend: "now",
            YYYYend: "now",
            dateend: "now",
            start: workshift.start,
            stop: workshift.stop,
            holiday: workshift.holiday,
        };

        // ✅ อัปเดตข้อมูลพนักงาน
        const updatedEmployee = {
            ...opendetail,
            workshift: `${workshift.ID}-${workshift.name}`,
            workshifthistory: [...currentHistory, newHistoryEntry],
        };

        set(companiesRef, updatedEmployee)
            .then(() => {
                setOpenDetail({});
                setEditWorkshift(false);
                setWorkshift([]);
                setWorkshiftDate(dayjs(new Date).format("DD/MM/YYYY"));
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleUpdateDate = (row) => {
        const workshifthistoriesref = ref(firebaseDB, `workgroup/company/${companyId}/employee/${opendetail.ID}/workshifthistory/${row.ID}`);

        const updateworkshift = {
            DDstart: workshiftDateStart ? dayjs(workshiftDateStart, "DD/MM/YYYY").format("DD") : "",
            MMstart: workshiftDateStart ? dayjs(workshiftDateStart, "DD/MM/YYYY").format("MM") : "",
            YYYYstart: workshiftDateStart ? dayjs(workshiftDateStart, "DD/MM/YYYY").format("YYYY") : "",
            datestart: workshiftDateStart ? dayjs(workshiftDateStart, "DD/MM/YYYY").format("DD/MM/YYYY") : "",

            DDend: workshiftDateEnd ? dayjs(workshiftDateEnd, "DD/MM/YYYY").format("DD") : "now",
            MMend: workshiftDateEnd ? dayjs(workshiftDateEnd, "DD/MM/YYYY").format("MM") : "now",
            YYYYend: workshiftDateEnd ? dayjs(workshiftDateEnd, "DD/MM/YYYY").format("YYYY") : "now",
            dateend: workshiftDateEnd ? dayjs(workshiftDateEnd, "DD/MM/YYYY").format("DD/MM/YYYY") : "now",
        };

        update(workshifthistoriesref, updateworkshift)
            .then(() => {
                setOpenDetail({});
                setEditWorkshift(false);
                setWorkshift([]);
                setWorkshiftDate(dayjs(new Date()).format("DD/MM/YYYY"));
                setWorkshiftID(null);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleUpdateEmployee = async () => {
        if (opendetail?.ID === undefined || opendetail?.ID === null) {
            return ShowError("ไม่พบข้อมูลพนักงาน");
        }

        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${opendetail.ID}`);
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);
        const groupsRef = ref(firebaseDB, "workgroup");
        const companyRef = ref(firebaseDB, `workgroup/company/${companyId}`);

        let path = "";
        let backendGroupID = "";
        let backendCompanyID = "";

        try {
            const groupSnap = await get(groupsRef);
            if (groupSnap.exists()) {
                backendGroupID = groupSnap.val().backendid;
            } else {
                throw new Error("ไม่พบค่า backenid");
            }

            const companySnap = await get(companyRef);
            if (companySnap.exists()) {
                backendCompanyID = companySnap.val().cpnbackendid;
            } else {
                throw new Error("ไม่พบค่า cpnbackendid");
            }
            const formData = new FormData();
            formData.append("image", opendetail?.faceverify); // key ต้องตรงกับ backend

            const response = await fetch(
                `https://upload.happysoftth.com/humantech/${backendGroupID}/${backendCompanyID}/${opendetail?.empbackendid}/upload`,
                {
                    method: "POST",
                    body: formData, // ✅ ใช้ FormData แทน JSON
                }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Backend error response:", text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            path = data.path;
        } catch (error) {
            console.error("Error post image to backend:", error);
            alert("เกิดข้อผิดพลาดขณะอัปโหลดรูปภาพ");
            return;
        }

        update(companiesRef, {
            date: opendetail?.date ? opendetail?.date : dayjs(new Date).format("DD/MM/YYYY"),
            employeecode: opendetail?.employeecode,
            employname: opendetail?.employname,
            nickname: opendetail?.nickname,
            department: opendetail?.department,
            section: opendetail?.section,
            position: opendetail?.position,
            employmenttype: opendetail?.employmenttype,
            salary: opendetail?.salary,
            taxdeduction: opendetail?.taxdeduction,
            faceverify: `http://${path}`,
            personal: {
                ...opendetail?.personal,
                name: opendetail?.employname,
                lastname: opendetail?.employname,
                nickname: opendetail?.employname,
                prefix: opendetail?.employname,
            }
        })
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                setCheck(false);
                setOpenDetail({});
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error(error);
            });
    }

    const handleCancel = () => {
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val() || [{ ID: 0, name: '', employeenumber: '' }];
            setEmployee(employeeData);
            setEmployees(allEmployees);
            setEditEmployee(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    console.log("openDetail : ", opendetail);
    console.log("positions : ", positions);
    console.log("positionDetail : ", positionDetail);

    return (
        <Container maxWidth="xl" sx={{ p: 5, width: windowWidth - 290 }}>
            <Box sx={{ flexGrow: 1, p: 2, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>พนักงาน (employee)</Typography>
                    </Grid>
                    <Grid item size={12}>
                        <Divider />
                    </Grid>
                    {positions.map((row) => {
                        const count = employees.filter(
                            (emp) => Number(emp.position.split("-")[0]) === row.ID
                        ).length;

                        const isFull = count >= Number(row.max);

                        return (
                            <Grid item size={{ lg: 4, md: 6, sm: 12 }} key={row.ID}>
                                <Paper
                                    sx={{
                                        width: "100%",
                                        height: 50,
                                        borderRadius: 2,
                                        // backgroundColor: isFull
                                        //     ? "#ffcdd2"      // ถ้าเต็ม = สีแดงอ่อน
                                        //     : "#b2dfdb",    // ถ้าไม่เต็ม = สีเขียวอ่อน
                                        backgroundColor: "white",
                                        color: theme.palette.primary.dark
                                    }}
                                    elevation={3}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 1.5 }}>
                                            {`${row.positionname} ( ${count}/${row.max} )`}
                                        </Typography>
                                    </Box>

                                    {
                                        isFull &&
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="bold"
                                            color={theme.palette.error.main}
                                            sx={{ marginTop: -4.5, textAlign: "right", marginRight: 1 }}
                                        >
                                            *
                                        </Typography>
                                    }
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
            <Grid container spacing={2} sx={{ marginTop: 4 }}>
                <Grid item size={1} sx={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginLeft: -2.5 }} gutterBottom>เลือกเมนู</Typography>
                    <Divider />
                    <Box sx={{ marginLeft: -14 }}>
                        {/* <Paper > */}
                        {[
                            'ข้อมูลทั่วไป',
                            'เงินเดือน',
                            'กะการทำงาน',
                            'การศึกษา',
                            'การทำงาน/ฝึกงาน',
                            'การฝึกอบรม',
                            'ภาษา',
                            'อื่นๆ',
                        ].map((text, index) => {
                            const value = `${index}-${text}`;
                            const isSelected = menu === value;

                            return (
                                <Button
                                    key={index}
                                    variant="contained"
                                    color={isSelected ? "primary" : "secondary"}
                                    sx={{
                                        m: 1,
                                        width: "200px",
                                        textAlign: "right",
                                        justifyContent: "flex-end",
                                        fontSize: "13px",
                                        marginLeft: isSelected && 1,
                                        "&:hover": {
                                            backgroundColor: (theme) =>
                                                isSelected
                                                    ? theme.palette.primary.dark // ถ้าเลือกแล้วให้เข้มขึ้นเล็กน้อย
                                                    : theme.palette.primary.main, // ถ้ายังไม่เลือก hover ให้เป็นสี primary
                                            color: "white",
                                            marginLeft: 1
                                        },
                                    }}
                                    onClick={() => setMenu(value)}
                                >
                                    {text}
                                </Button>
                            );
                        })}
                        {/* </Paper> */}
                    </Box>

                </Grid>
                <Grid item size={11}>
                    <Paper sx={{ p: 5, marginTop: -3, borderRadius: 4, height: "85vh" }}>
                        <Box sx={{ width: "100%" }}>
                            {/* <SelectEmployeeGroup
                                department={department}
                                setDepartment={setDepartment}
                                departments={departments}
                                section={section}
                                setSection={setSection}
                                sections={sections}
                                position={position}
                                setPosition={setPosition}
                                positions={positions}
                                employee={employee}
                                setEmployee={setEmployee}
                                employees={employees}
                            /> */}
                            <Grid container spacing={2} sx={{ marginBottom: 1, marginTop: -2 }}>
                                <Grid item size={10}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการตำแหน่งพนักงาน</Typography>
                                </Grid>
                                <Grid item size={2} sx={{ textAlign: "right" }}>
                                    <AddEmployee companyName={company} />
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                            <Grid container spacing={2}>
                                {/* <Grid item size={editEmployee ? 12 : 11}> */}
                                <Grid item size={12}>
                                    {
                                        editEmployee ?
                                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                                <TableExcel
                                                    styles={{ height: "62vh" }} // ✅ ส่งเป็น object
                                                    stylesTable={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}
                                                    columns={columns}
                                                    initialData={employees}
                                                    onDataChange={setEmployees}
                                                // onDataChange={handleEmployeesChange}
                                                />
                                            </Paper>
                                            :
                                            <React.Fragment>
                                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการเปลี่ยนกะการทำงานให้กดชื่อในตารางได้เลย</Typography>
                                                <TableContainer component={Paper} textAlign="center" sx={{ height: "62vh" }}>
                                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                                                        <TableHead
                                                            sx={{
                                                                position: "sticky",
                                                                top: 0,
                                                                zIndex: 2,
                                                            }}
                                                        >
                                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                                <TablecellHeader sx={{ width: 40, borderRight: "2px solid white" }}>ลำดับ</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 100, borderRight: "2px solid white" }}>รหัสพนักงาน</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 250, borderRight: "2px solid white", position: "sticky", left: 0, zIndex: 2, backgroundColor: theme.palette.primary.dark }}>ชื่อ</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 200, borderRight: "2px solid white" }}>ฝ่ายงาน</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 200, borderRight: "2px solid white" }}>ส่วนงาน</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 200, borderRight: "2px solid white" }}>ตำแหน่ง</TablecellHeader>
                                                                <TablecellHeader sx={{ width: 120 }}>ประเภทการจ้าง</TablecellHeader>
                                                                {/* <TablecellHeader sx={{ width: 100 }}>เงินเดือน</TablecellHeader> */}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                employees.length === 0 ?
                                                                    <TableRow>
                                                                        <TablecellNoData colSpan={8}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                                    </TableRow>
                                                                    :
                                                                    employees.map((row, index) => (
                                                                        <TableRow
                                                                            sx={{
                                                                                cursor: hoveredEmpCode === row.employeecode ? 'pointer' : 'default',
                                                                                backgroundColor: hoveredEmpCode === row.employeecode ? theme.palette.primary.light : 'inherit',
                                                                            }}
                                                                            onMouseEnter={() => setHoveredEmpCode(row.employeecode)}
                                                                            onMouseLeave={() => setHoveredEmpCode(null)}
                                                                            onClick={() => setOpenDetail(row)}>
                                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 1, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{index + 1}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "left" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 1, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.employeecode}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "left", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#f5f5f5" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{`${row.employname} ${row.nickname === undefined ? "" : `(${row.nickname})`}`}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "left" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.department?.includes("-") ? row.department.split("-")[1] : row.department}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "left" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.section?.includes("-") ? row.section.split("-")[1] : row.section}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "left" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 2, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.position?.includes("-") ? row.position.split("-")[1] : row.position}</Typography>
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                                <Typography variant="subtitle2" sx={{ fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.employmenttype?.includes("-") ? row.employmenttype.split("-")[1] : row.employmenttype}</Typography>
                                                                            </TableCell>
                                                                            {/* <TableCell sx={{ textAlign: "center" }}>
                                                                                <Typography variant="subtitle2" sx={{ marginLeft: 1, lineHeight: 1, whiteSpace: "nowrap", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{new Intl.NumberFormat("en-US").format(row.salary)}</Typography>
                                                                            </TableCell> */}
                                                                        </TableRow>
                                                                    ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </React.Fragment>
                                    }
                                </Grid>
                                {/* {
                                    !editEmployee &&
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
                                                onClick={() => setEditEmployee(true)}
                                            >
                                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                                แก้ไข
                                            </Button>
                                        </Box>
                                    </Grid>
                                } */}
                                <Grid item size={12}>
                                    {
                                        editEmployee ?
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" fullWidth color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" fullWidth color="success" onClick={handleSave} >บันทึก</Button>
                                            </Box>
                                            :
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                fullWidth
                                                sx={{
                                                    flexDirection: "row",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                                }}
                                                onClick={() => setEditEmployee(true)}
                                                endIcon={<ManageAccountsIcon fontSize="large" />}
                                            >
                                                แก้ไขข้อมูลพนักงาน
                                            </Button>
                                    }
                                </Grid>
                            </Grid>
                            {
                                // employees.map((row, index) => (
                                <Dialog
                                    open={opendetail.ID !== undefined ? true : false}
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
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลพนักงาน</Typography>
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
                                            <Grid item size={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        width: 250,
                                                        height: 250,
                                                        borderRadius: 50,
                                                        backgroundColor: theme.palette.primary.light,
                                                        border: `10px solid ${theme.palette.primary.light}`,
                                                        overflow: "hidden",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {
                                                        (opendetail?.faceverify !== undefined && opendetail?.faceverify !== "") ?
                                                            <img
                                                                src={
                                                                    typeof opendetail?.faceverify === "string"
                                                                        ? opendetail.faceverify
                                                                        : opendetail?.faceverify instanceof File
                                                                            ? URL.createObjectURL(opendetail.faceverify)
                                                                            : undefined
                                                                }
                                                                alt="preview"
                                                                style={{ height: "100%", borderRadius: 8 }}
                                                            />
                                                            :
                                                            <React.Fragment>
                                                                {/* Logo (รูปหลัก) */}
                                                                <Box
                                                                    component="img"
                                                                    src={logo}
                                                                    sx={{
                                                                        width: "80%",
                                                                        height: "80%",
                                                                        objectFit: "contain",
                                                                        opacity: 0.2,
                                                                    }}
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        fontSize: 35,
                                                                        fontWeight: "bold",
                                                                        fontStyle: "italic",
                                                                        color: theme.palette.primary.main,
                                                                        opacity: 0.7,
                                                                        userSelect: "ไม่มีรูปภาพ",
                                                                        transform: "rotate(-30deg)", // เอียงได้ตามต้องการ
                                                                    }}
                                                                >
                                                                    ไม่มีรูปภาพ
                                                                </Box>
                                                            </React.Fragment>
                                                    }
                                                </Box>
                                                {
                                                    check &&
                                                    <Button
                                                        variant="contained"
                                                        component="label"
                                                        size="small"
                                                        sx={{
                                                            height: "35px",
                                                            backgroundColor: "#29b6f6",
                                                            borderRadius: 2,
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            ml: 5
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            fontSize="16px"
                                                            fontWeight="bold"
                                                            color={"white"}
                                                            sx={{ mt: 1 }}
                                                            gutterBottom
                                                        >
                                                            เปลี่ยนรูปภาพ
                                                        </Typography>
                                                        <ImageIcon
                                                            sx={{
                                                                fontSize: 25,
                                                                color: "white",
                                                                marginLeft: 2,
                                                            }}
                                                        />
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const image = e.target.files?.[0];
                                                                if (image) handleDetailChange("faceverify", image);
                                                            }}
                                                        />
                                                    </Button>
                                                }
                                            </Grid>
                                            <Grid item size={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item size={3}>
                                                <Typography variant="subtitle2" fontWeight="bold" >รหัสพนักงาน</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={opendetail?.employeecode}
                                                    onChange={(e) => handleDetailChange("employeecode", e.target.value)}
                                                    disabled={!check}
                                                //onChange={(e) => setNickname(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item size={3}>
                                                <Typography variant="subtitle2" fontWeight="bold" >ชื่อเล่น</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={opendetail?.nickname}
                                                    onChange={(e) => handleDetailChange("nickname", e.target.value)}
                                                    disabled={!check}
                                                //onChange={(e) => setName(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >ชื่อ</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={opendetail?.employname}
                                                    onChange={(e) => handleDetailChange("employname", e.target.value)}
                                                    disabled={!check}
                                                //onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </Grid>
                                            {
                                                !check &&
                                                <React.Fragment>
                                                    <Grid item size={6}>
                                                        <Typography variant="subtitle2" fontWeight="bold">ฝ่ายงาน</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={
                                                                opendetail?.department?.includes("-")
                                                                    ? opendetail.department.split("-")[1]
                                                                    : ""
                                                            }
                                                            disabled={!check}
                                                        />
                                                    </Grid>

                                                    <Grid item size={6}>
                                                        <Typography variant="subtitle2" fontWeight="bold">ส่วนงาน</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={
                                                                opendetail?.section?.includes("-")
                                                                    ? opendetail.section.split("-")[1]
                                                                    : ""
                                                            }
                                                            disabled={!check}
                                                        />
                                                    </Grid>
                                                </React.Fragment>
                                            }
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold">ตำแหน่ง</Typography>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    size="small"
                                                    value={(() => {
                                                        // ดึงตำแหน่งปัจจุบัน เช่น "5-หัวหน้าแผนก"
                                                        if (!opendetail?.position || !opendetail.position.includes("-")) return "";

                                                        const posID = Number(opendetail.position.split("-")[0]);

                                                        // หา object ของตำแหน่งที่ตรงกับชื่อ
                                                        return positions.find(p => p.ID === posID) || "";
                                                    })()}
                                                    onChange={(e) => {
                                                        const data = e.target.value; // data = object ของตำแหน่งที่เลือก

                                                        handleDetailChange("department", data.deptid);
                                                        handleDetailChange("section", data.sectionid);
                                                        handleDetailChange("position", `${data.ID}-${data.positionname}`);
                                                    }}
                                                    disabled={!check}
                                                >
                                                    {positions.map((item, index) => {
                                                        const count = employees.filter(
                                                            (emp) => Number(emp.position.split("-")[0]) === item.ID
                                                        ).length;

                                                        const isFull = count >= Number(item.max);

                                                        return (
                                                            !isFull && (
                                                                <MenuItem key={index} value={item}>
                                                                    {item.positionname}
                                                                </MenuItem>
                                                            )
                                                        );
                                                    })}
                                                </TextField>
                                            </Grid>

                                            {
                                                !check &&
                                                <Grid item size={6}>
                                                    <Typography variant="subtitle2" fontWeight="bold">กะการทำงาน</Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={
                                                            opendetail?.workshift?.includes("-")
                                                                ? opendetail.workshift.split("-")[1]
                                                                : ""
                                                        }
                                                        disabled
                                                    />
                                                </Grid>
                                            }

                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold">ประเภทการจ้างงาน</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={
                                                        opendetail?.employmenttype?.includes("-")
                                                            ? opendetail.employmenttype.split("-")[1]
                                                            : ""
                                                    }
                                                    onChange={(e) => handleDetailChange("employmenttype", e.target.value)}
                                                    disabled={!check}
                                                />
                                            </Grid>

                                            {/* <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold">เงินเดือน</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={opendetail?.salary}
                                                    onChange={(e) => handleDetailChange("salary", e.target.value)}
                                                    disabled={!check}
                                                />
                                            </Grid> */}
                                            <Grid item size={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item size={12}>
                                                {(opendetail?.taxdeduction !== undefined || check) && <Typography variant="subtitle2" fontWeight="bold" marginBottom={-1} gutterBottom>ค่าลดหย่อนภาษี</Typography>}
                                                {taxDeduction.map((tax, index) => {
                                                    const isSelected = opendetail?.taxdeduction ? opendetail?.taxdeduction.some(item => item.taxid === tax.ID) : false;
                                                    const checkdata = check ? true : isSelected;

                                                    return (
                                                        checkdata &&
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                mr: 2, // ระยะห่างขวา
                                                                mt: 1,
                                                                display: "inline-block", // ทำให้กว้างเท่าข้อความ
                                                                border: check ? `1px solid ${theme.palette.primary.main}` : "none",
                                                                borderRadius: 2,
                                                                px: 1.5,   // padding ซ้ายขวาเล็กน้อย
                                                                py: 0.5,
                                                                cursor: check ? "pointer" : "default",
                                                                color: check ? (isSelected ? "#fff" : theme.palette.primary.main) : "gray",
                                                                backgroundColor: check ? (isSelected ? theme.palette.primary.main : "transparent") : "lightgray",
                                                                transition: "0.2s",
                                                                userSelect: "none",
                                                                fontSize: "15px"
                                                            }}
                                                            // onClick={() => handleSelectTax(tax)}
                                                            onClick={() => handleDetailChange("taxdeduction", tax)}
                                                        >
                                                            {tax.title}
                                                        </Box>
                                                    );
                                                })}
                                            </Grid>
                                            {/* <Grid item size={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item size={12} textAlign="center">
                                                {
                                                    !check ?
                                                        <Button variant="outlined" color="warning" size="small" onClick={() => setCheck(true)}>
                                                            แก้ไขข้อมูล
                                                        </Button>
                                                        :
                                                        <React.Fragment>
                                                            <Button variant="contained" color="error" size="small" sx={{ mr: 2 }} onClick={() => setCheck(false)}>
                                                                ยกเลิก
                                                            </Button>
                                                            <Button variant="contained" color="success" size="small" onClick={() => setCheck(false)}>
                                                                บันทึก
                                                            </Button>
                                                        </React.Fragment>
                                                }
                                            </Grid> */}
                                            {/* {
                                                !check && opendetail.workshifthistory !== undefined &&
                                                <Grid item size={12}>
                                                    <Typography variant="subtitle2" fontWeight="bold">ประวัติการเปลี่ยนกะการทำงาน</Typography>
                                                    <TableContainer component={Paper} textAlign="center" sx={{ height: "30vh", width: "100%" }}>
                                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                                                            <TableHead
                                                                sx={{
                                                                    position: "sticky",
                                                                    top: 0,
                                                                    zIndex: 2,
                                                                    backgroundColor: theme.palette.primary.dark,
                                                                }}
                                                            >
                                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                                    <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                                    <TablecellHeader sx={{ width: 120 }}>กะการทำงาน</TablecellHeader>
                                                                    <TablecellHeader sx={{}}>วันที่เริ่ม</TablecellHeader>
                                                                    <TablecellHeader sx={{}}>วันที่สิ้นสุด</TablecellHeader>
                                                                    <TablecellHeader sx={{ width: 70 }} />
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {
                                                                    !Array.isArray(opendetail.workshifthistory) ||
                                                                        opendetail.workshifthistory.length === 0 ?
                                                                        <TableRow>
                                                                            <TablecellNoData colSpan={5}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                                        </TableRow>
                                                                        :
                                                                        opendetail.workshifthistory.map((row, index) => {
                                                                            // สร้าง dayjs object จากค่า DD/MM/YYYY
                                                                            const startDate = dayjs(`${row.DDstart}-${row.MMstart}-${row.YYYYstart}`, "DD/MM/YYYY");
                                                                            const endDate = row.dateend !== "now"
                                                                                ? dayjs(`${row.DDend}-${row.MMend}-${row.YYYYend}`, "DD/MM/YYYY")
                                                                                : null;

                                                                            const attendantS = opendetail.attendant?.[row.YYYYstart]?.[row.MMstart] || [];
                                                                            const attendantE = opendetail.attendant?.[row.YYYYend]?.[row.MMend] || [];

                                                                            const checkS = attendantS.some((time) => {
                                                                                const sameShift = time.shift === row.workshift;
                                                                                const inRange = dayjs(time.datein).isBetween(startDate, endDate || startDate, null, "[]");
                                                                                return sameShift && inRange;
                                                                            });

                                                                            const checkE = attendantE.some((time) => {
                                                                                const sameShift = time.shift === row.workshift;
                                                                                const inRange = endDate ? dayjs(time.dateout).isBetween(startDate, endDate, null, "[]") : false;
                                                                                return sameShift && inRange;
                                                                            });

                                                                            // รวมผลลัพธ์ทั้ง S และ E
                                                                            const check = checkS || checkE;

                                                                            console.log("check :", checkS, checkE, "final:", check);

                                                                            return (
                                                                                <TableRow>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {
                                                                                            workshiftID !== row.ID ?
                                                                                                (row.workshift ? row.workshift.split("-")[1] : row.workshift)
                                                                                                :
                                                                                                <TextField
                                                                                                    select
                                                                                                    fullWidth
                                                                                                    size="small"
                                                                                                    value={workshiftName?.ID || ""}
                                                                                                    onChange={(e) => {
                                                                                                        const selected = workshifts.find(row => row.ID === e.target.value);
                                                                                                        setWorkshiftName(selected);
                                                                                                    }}
                                                                                                    sx={{
                                                                                                        '& .MuiOutlinedInput-root': {
                                                                                                            height: 28,
                                                                                                            borderRadius: 1,
                                                                                                        },
                                                                                                        '& .MuiInputBase-input': {
                                                                                                            fontSize: '14px',
                                                                                                            padding: '2px 6px',
                                                                                                            textAlign: 'center',
                                                                                                            fontFamily: theme.typography.fontFamily,
                                                                                                        },
                                                                                                    }}
                                                                                                    SelectProps={{
                                                                                                        MenuProps: { PaperProps: { style: { maxHeight: 150, } } },
                                                                                                    }}
                                                                                                >
                                                                                                    {workshifts.map((row) => (
                                                                                                        <MenuItem key={row.ID} value={row.ID}>
                                                                                                            {row.name}
                                                                                                        </MenuItem>
                                                                                                    ))}
                                                                                                </TextField>
                                                                                            // <TextField
                                                                                            //     select
                                                                                            //     fullWidth
                                                                                            //     size="small"
                                                                                            //     value={workshiftName}
                                                                                            //     onChange={(e) => setWorkshiftName(e.target.value)}
                                                                                            //     sx={{
                                                                                            //         '& .MuiOutlinedInput-root': {
                                                                                            //             height: 28,
                                                                                            //             borderRadius: 1,
                                                                                            //         },
                                                                                            //         '& .MuiInputBase-input': {
                                                                                            //             fontSize: '14px',
                                                                                            //             padding: '2px 6px',
                                                                                            //             textAlign: 'center',
                                                                                            //             fontFamily: theme.typography.fontFamily,
                                                                                            //         },
                                                                                            //     }}
                                                                                            //     SelectProps={{
                                                                                            //         MenuProps: { PaperProps: { style: { maxHeight: 150, } } },
                                                                                            //     }}
                                                                                            // >
                                                                                            //     <MenuItem value={workshiftName}>{workshiftName ? workshiftName.split("-")[1] : ""}</MenuItem>
                                                                                            //     {
                                                                                            //         workshifts.map((row) => (
                                                                                            //             row.ID !== (workshiftName ? Number(workshiftName.split("-")[0]) : "") &&
                                                                                            //             <MenuItem value={row}>{row.name}</MenuItem>
                                                                                            //         ))
                                                                                            //     }
                                                                                            // </TextField>
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {
                                                                                            workshiftID !== row.ID ?
                                                                                                (formatThaiSlash(dayjs(startDate, "DD/MM/YYYY")))
                                                                                                :
                                                                                                (
                                                                                                    startDate &&
                                                                                                    <Paper sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}>
                                                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                            <DatePicker
                                                                                                                value={workshiftDateStart ? dayjs(workshiftDateStart, "DD/MM/YYYY") : null}
                                                                                                                onChange={(newValue) => {
                                                                                                                    const newDate = newValue ? newValue.format("DD/MM/YYYY") : "";
                                                                                                                    setWorkshiftDateStart(newDate);
                                                                                                                }}
                                                                                                                format="DD/MM/YYYY"
                                                                                                                enableAccessibleFieldDOMStructure={false}
                                                                                                                slotProps={{
                                                                                                                    textField: {
                                                                                                                        size: "small",
                                                                                                                        fullWidth: true,
                                                                                                                        variant: "outlined",
                                                                                                                        sx: {
                                                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                                                height: 28,
                                                                                                                                borderRadius: 1,
                                                                                                                            },
                                                                                                                            '& .MuiInputBase-input': {
                                                                                                                                fontSize: '14px',
                                                                                                                                padding: '2px 6px',
                                                                                                                                textAlign: 'center',
                                                                                                                                fontFamily: theme.typography.fontFamily,
                                                                                                                            },
                                                                                                                        },
                                                                                                                    }
                                                                                                                }}
                                                                                                            />
                                                                                                        </LocalizationProvider>
                                                                                                    </Paper>
                                                                                                )
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {
                                                                                            workshiftID !== row.ID ?
                                                                                                (row.dateend !== "now" ? formatThaiSlash(dayjs(endDate, "DD/MM/YYYY")) : "-")
                                                                                                :
                                                                                                (
                                                                                                    endDate &&
                                                                                                    <Paper sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}>
                                                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                            <DatePicker
                                                                                                                value={workshiftDateEnd ? dayjs(workshiftDateEnd, "DD/MM/YYYY") : null}
                                                                                                                onChange={(newValue) => {
                                                                                                                    const newDate = newValue ? newValue.format("DD/MM/YYYY") : "";
                                                                                                                    setWorkshiftDateEnd(newDate);
                                                                                                                }}
                                                                                                                format="DD/MM/YYYY"
                                                                                                                enableAccessibleFieldDOMStructure={false}
                                                                                                                slotProps={{
                                                                                                                    textField: {
                                                                                                                        size: "small",
                                                                                                                        fullWidth: true,
                                                                                                                        variant: "outlined",
                                                                                                                        sx: {
                                                                                                                            '& .MuiOutlinedInput-root': {
                                                                                                                                height: 28,
                                                                                                                                borderRadius: 1,
                                                                                                                            },
                                                                                                                            '& .MuiInputBase-input': {
                                                                                                                                fontSize: '14px',
                                                                                                                                padding: '2px 6px',
                                                                                                                                textAlign: 'center',
                                                                                                                                fontFamily: theme.typography.fontFamily,
                                                                                                                            },
                                                                                                                        },
                                                                                                                    }
                                                                                                                }}
                                                                                                            />
                                                                                                        </LocalizationProvider>
                                                                                                    </Paper>
                                                                                                )
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }} >
                                                                                        {
                                                                                            check === false && (
                                                                                                workshiftID !== row.ID ?
                                                                                                    <IconButton color="warning" onClick={() => handleUpdateTime(row)} >
                                                                                                        <SettingsIcon fontSize="small" />
                                                                                                    </IconButton>
                                                                                                    :
                                                                                                    <Box display="flex" alignItems="center" justifyContent="center" >
                                                                                                        <IconButton color="error" onClick={() => setWorkshiftID(null)} sx={{ marginRight: -1 }}>
                                                                                                            <DisabledByDefaultIcon fontSize="small" />
                                                                                                        </IconButton>
                                                                                                        <IconButton color="success" onClick={() => handleUpdateDate(row)} >
                                                                                                            <SaveIcon fontSize="small" />
                                                                                                        </IconButton>
                                                                                                    </Box>
                                                                                            )
                                                                                        }
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )
                                                                        })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>
                                            }
                                            {
                                                editWorkshift &&
                                                <React.Fragment>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold" >กะการทำงาน</Typography>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            size="small"
                                                            value={workshift}
                                                            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                                            onChange={(e) => setWorkshift(e.target.value)}
                                                        >
                                                            {
                                                                workshifts.map((row) => (
                                                                    <MenuItem value={row}>{row.name}</MenuItem>
                                                                ))
                                                            }
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item size={12}>
                                                        <ThaiDateSelector
                                                            label="วันที่เริ่มกะ"
                                                            value={workshiftDate}
                                                            onChange={(val) => setWorkshiftDate(val)}
                                                        />
                                                    </Grid>
                                                </React.Fragment>
                                            }
                                            {
                                                !check &&
                                                <React.Fragment>
                                                    <Grid item size={12}>
                                                        <Divider />
                                                    </Grid>
                                                    <Grid item size={12} textAlign="center">
                                                        {
                                                            editWorkshift ?
                                                                <Box display="flex" alignItems="center" justifyContent="center" >
                                                                    <Button variant="contained" color="error" size="small" onClick={() => setEditWorkshift(false)} sx={{ marginRight: 2 }}>
                                                                        ยกเลิก
                                                                    </Button>
                                                                    <Button variant="contained" color="success" size="small" onClick={handleSaveWorkshift}>
                                                                        บันทึก
                                                                    </Button>
                                                                </Box>
                                                                :
                                                                <Button variant="contained" color="warning" size="small" onClick={() => setEditWorkshift(true)}>
                                                                    เปลี่ยนกะการทำงาน
                                                                </Button>
                                                        }
                                                    </Grid>
                                                </React.Fragment>
                                            } */}
                                        </Grid>
                                    </DialogContent>
                                    <DialogActions sx={{ borderTop: `1px solid ${theme.palette.primary.dark}`, display: "flex", alignItems: "center", justifyContent: "center", height: "55px" }}>
                                        {
                                            !check ?
                                                <Button variant="contained" color="warning" size="small" onClick={() => setCheck(true)}>
                                                    แก้ไขข้อมูล
                                                </Button>
                                                :
                                                <React.Fragment>
                                                    <Button variant="contained" color="error" size="small" sx={{ mr: 2 }}
                                                        onClick={
                                                            () => {
                                                                setCheck(false);
                                                                setOpenDetail(employees.find((emp) => emp.ID === opendetail?.ID));
                                                            }
                                                        }
                                                    >
                                                        ยกเลิก
                                                    </Button>
                                                    <Button variant="contained" color="success" size="small" onClick={handleUpdateEmployee}>
                                                        บันทึก
                                                    </Button>
                                                </React.Fragment>
                                        }
                                    </DialogActions>
                                </Dialog>
                                // ))
                            }
                            {/* <TableContainer component={Paper} textAlign="center" sx={{ height: "300px" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: "5%" }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader sx={{ width: "35%" }}>ชื่อ</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ฝ่ายงาน</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ส่วนงาน</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ตำแหน่ง</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            employees.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                employees.map((row, index) => (
                                                    <TableRow
                                                        onClick={() => setCheckEmployee(row)}
                                                        sx={{
                                                            backgroundColor: row.employeeid === checkEmployee.employeeid && "#e0f2f1"
                                                        }}
                                                    >
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.employname}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.department.split("-")[1]}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.section.split("-")[1]}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.position.split("-")[1]}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {
                                employees.map((row, index) => (
                                    row.employeeid === checkEmployee.employeeid &&
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 2, }} gutterBottom>ข้อมูลของ {checkEmployee?.employname}</Typography>
                                        <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                                        <Grid container spacing={2}>
                                            <Grid item size={editEmployee ? 12 : 11}>
                                                {
                                                    editEmployee ?
                                                        <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                                            <TableExcel
                                                                columns={columns}
                                                                initialData={employee}
                                                                onDataChange={setEmployee}
                                                            />
                                                        </Paper>
                                                        :
                                                        <TableContainer component={Paper} textAlign="center">
                                                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                                                <TableHead>
                                                                    <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                                        <TablecellHeader sx={{ width: "5%" }}>ลำดับ</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "35%" }}>ชื่อ</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ฝ่ายงาน</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ส่วนงาน</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ตำแหน่ง</TablecellHeader>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {
                                                                        employees.length === 0 ?
                                                                            <TableRow>
                                                                                <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                                            </TableRow>
                                                                            :
                                                                            employees.map((row, index) => (
                                                                                <TableRow>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.department.split("-")[1]}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.section.split("-")[1]}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.position.split("-")[1]}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                }
                                            </Grid>
                                            {
                                                !editEmployee &&
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
                                                            onClick={() => setEditEmployee(true)}
                                                        >
                                                            <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                                            แก้ไข
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            }
                                        </Grid>
                                        {
                                            editEmployee &&
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                                            </Box>
                                        }
                                    </Box>
                                ))
                            }
                        </Box> */}
                        </Box>
                    </Paper>
                    <Paper ref={paperRef} sx={{ p: 5, width: "100%", marginTop: 5, borderRadius: 4 }}>
                        <Box sx={{ marginTop: -5 }} width="100%" >
                            {renderComponentByMenu(menu)}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container >
    )
}

export default Employee