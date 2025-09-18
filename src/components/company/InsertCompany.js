import * as React from 'react';
import { ref, get, set, child, onValue } from "firebase/database";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import BusinessIcon from '@mui/icons-material/Business';
import { Box, CardActionArea, CardContent, Divider, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import theme from '../../theme/theme';
import { IconButtonError } from '../../theme/style';
import CloseIcon from '@mui/icons-material/Close';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { database } from '../../server/firebase';
import ThaiAddressSelector from '../../theme/ThaiAddressSelector';

export default function InsertCompany() {
    const { firebaseDB, domainKey } = useFirebase();
    const [open, setOpen] = React.useState(false);
    const [shortName, setShortName] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("")
    const [thailand, setThailand] = React.useState([]);
    const [address, setAddress] = React.useState({});
    const [lat, setLat] = React.useState("");
    const [lng, setLng] = React.useState("");
    const [addressAll, setAddressAll] = React.useState("");
    const leave = [
        {
            "ID": 0,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาป่วย",
            "requiresDocument": 1
        },
        {
            "ID": 1,
            "isPaid": 1,
            "maxDaysPerYear": "3",
            "name": "ลากิจได้รับค่าจ้าง"
        },
        {
            "ID": 2,
            "maxDaysPerYear": "3",
            "name": "ลากิจไม่ได้รับค่าจ้าง"
        },
        {
            "ID": 3,
            "isPaid": 1,
            "maxDaysPerYear": "6",
            "name": "ลาหยุดพักผ่อน"
        },
        {
            "ID": 4,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาคลอดบุตร",
            "requiresDocument": 1
        },
        {
            "ID": 5,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาไปช่วยเหลือภรรยาที่คลอดบุตร",
            "requiresDocument": 1
        },
        {
            "ID": 6,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาเพื่อเข้ารับการคัดเลือกทหาร",
            "requiresDocument": 1
        },
        {
            "ID": 7,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาอุปสมบท",
            "requiresDocument": 1
        },
        {
            "ID": 8,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาเพื่อทำหมัน",
            "requiresDocument": 1
        },
        {
            "ID": 9,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาฝึกอบรม"
        },
        {
            "ID": 10,
            "isPaid": 1,
            "maxDaysPerYear": "30",
            "name": "ลาเพื่อจัดการศพ"
        }
    ]

    const sso = [
        {
            "ID": 0,
            "percent": 5,
            "ssomax": 750
        }
    ]

    const holiday = [
        {
            "ID": 0,
            "date": "01/01/2025",
            "holiday": "วันปีใหม่"
        },
        {
            "ID": 1,
            "date": "11/02/2025",
            "holiday": "วันมาฆบูชา"
        },
        {
            "ID": 2,
            "date": "06/04/2025",
            "holiday": "วันจักรี"
        },
        {
            "ID": 3,
            "date": "13/04/2025",
            "holiday": "วันสงกรานต์"
        },
        {
            "ID": 4,
            "date": "14/04/2025",
            "holiday": "วันสงกรานต์"
        },
        {
            "ID": 5,
            "date": "15/04/2025",
            "holiday": "วันสงกรานต์"
        },
        {
            "ID": 6,
            "date": "01/05/2025",
            "holiday": "วันแรงงานแห่งชาติ"
        },
        {
            "ID": 7,
            "date": "05/05/2025",
            "holiday": "วันฉัตรมงคล"
        },
        {
            "ID": 8,
            "date": "09/05/2025",
            "holiday": "วันพืชมงคล"
        },
        {
            "ID": 9,
            "date": "12/05/2025",
            "holiday": "วันวิสาขบูชา"
        },
        {
            "ID": 10,
            "date": "28/07/2025",
            "holiday": "วันเฉลิมพระชนมพรรษา ร.10"
        },
        {
            "ID": 11,
            "date": "12/08/2025",
            "holiday": "วันแม่แห่งชาติ"
        },
        {
            "ID": 12,
            "date": "23/10/2025",
            "holiday": "วันปิยมหาราช"
        },
        {
            "ID": 13,
            "date": "05/12/2025",
            "holiday": "วันพ่อแห่งชาติ"
        },
        {
            "ID": 14,
            "date": "10/12/2025",
            "holiday": "วันรัฐธรรมนูญ"
        },
        {
            "ID": 15,
            "date": "31/12/2025",
            "holiday": "วันสิ้นปี"
        }
    ]

    const workShift = [
        {
            "ID": 0,
            "holiday": [
                {
                    "ID": 0,
                    "name": "อาทิตย์",
                    "zeller": 1
                }
            ],
            "name": "กลางวัน",
            "start": "08:00",
            "status": "active",
            "stop": "17:00"
        },
        {
            "ID": 1,
            "holiday": [
                {
                    "ID": 0,
                    "name": "อาทิตย์",
                    "zeller": 1
                }
            ],
            "name": "กลางคืน",
            "start": "20:00",
            "status": "active",
            "stop": "05:00"
        }
    ]

    const tax = [
        {
            "ID": 0,
            "avgRange": "0",
            "maxRange": "0",
            "note": "ได้รับการยกเว้นภาษี",
            "summaryEnd": "150000",
            "summaryStart": "0",
            "tax": "0",
            "taxRange": "150000"
        },
        {
            "ID": 1,
            "avgRange": "7500",
            "maxRange": "7500",
            "note": "(เงินได้สุทธิ – 150,000) x 5%",
            "summaryEnd": "300000",
            "summaryStart": "150001",
            "tax": "5",
            "taxRange": "150000"
        },
        {
            "ID": 2,
            "avgRange": "27500",
            "maxRange": "20000",
            "note": "(เงินได้สุทธิ – 300,000) x 10%",
            "summaryEnd": "500000",
            "summaryStart": "300001",
            "tax": "10",
            "taxRange": "200000"
        },
        {
            "ID": 3,
            "avgRange": "65000",
            "maxRange": "37500",
            "note": "(เงินได้สุทธิ – 500,000) x 15%",
            "summaryEnd": "750000",
            "summaryStart": "500001",
            "tax": "15",
            "taxRange": "250000"
        },
        {
            "ID": 4,
            "avgRange": "115000",
            "maxRange": "50000",
            "note": "(เงินได้สุทธิ – 750,000) x 20%",
            "summaryEnd": "1000000",
            "summaryStart": "750001",
            "tax": "20",
            "taxRange": "250000"
        },
        {
            "ID": 5,
            "avgRange": "365000",
            "maxRange": "250000",
            "note": "(เงินได้สุทธิ – 1,000,000) x 25%",
            "summaryEnd": "2000000",
            "summaryStart": "1000001",
            "tax": "25",
            "taxRange": "1000000"
        },
        {
            "ID": 6,
            "avgRange": "1265000",
            "maxRange": "900000",
            "note": "(เงินได้สุทธิ – 2,000,000) x 30%",
            "summaryEnd": "5000000",
            "summaryStart": "2000001",
            "tax": "30",
            "taxRange": "3000000"
        },
        {
            "ID": 7,
            "avgRange": "0",
            "maxRange": "0",
            "note": "(เงินได้สุทธิ – 5,000,000) x 35%",
            "summaryEnd": "0",
            "summaryStart": "5000001",
            "tax": "35",
            "taxRange": "0"
        }
    ];

    const deductionData = [
        { "ID": 0, "title": "ค่าลดหย่อนส่วนตัว", "amount": 60000, "unit": "บาท", "detail": "สำหรับผู้มีเงินได้ทุกคน" },
        { "ID": 1, "title": "คู่สมรสไม่มีเงินได้", "amount": 60000, "unit": "บาท", "detail": "หากสมรสและคู่สมรสไม่มีรายได้" },
        { "ID": 2, "title": "บุตร (คนที่ 1-2)", "amount": 30000, "unit": "บาท/คน", "detail": "ลดหย่อนได้สำหรับบุตรชอบด้วยกฎหมาย" },
        { "ID": 3, "title": "บุตรคนที่ 3 ขึ้นไป (เกิดปี 2561 เป็นต้นไป)", "amount": 60000, "unit": "บาท/คน", "detail": "สำหรับบุตรชอบด้วยกฎหมาย คนที่ 3 ขึ้นไป" },
        { "ID": 4, "title": "ค่าอุปการะบิดามารดา", "amount": 30000, "unit": "บาท/คน", "detail": "อายุเกิน 60 ปี และไม่มีรายได้เกิน 30,000 บาทต่อปี" },
        { "ID": 5, "title": "ค่าอุปการะคนพิการ/ทุพพลภาพ", "amount": 60000, "unit": "บาท/คน", "detail": "สำหรับผู้ดูแลบุคคลพิการ" },
        { "ID": 6, "title": "เบี้ยประกันชีวิต", "amount": 100000, "unit": "บาท", "detail": "ตามที่จ่ายจริง สูงสุดไม่เกิน 100,000 บาท" },
        { "ID": 7, "title": "เบี้ยประกันสุขภาพบิดามารดา", "amount": 15000, "unit": "บาท", "detail": "สูงสุดไม่เกิน 15,000 บาท (รวมทุกกรมธรรม์)" },
        { "ID": 8, "title": "กองทุนสำรองเลี้ยงชีพ / กบข. / กองทุนครูเอกชน / RMF", "amount": 500000, "unit": "บาท", "detail": "รวมกันไม่เกิน 500,000 บาท และไม่เกิน 15% ของรายได้" },
        { "ID": 9, "title": "กองทุน SSF", "amount": 200000, "unit": "บาท", "detail": "ไม่เกิน 30% ของเงินได้ที่ต้องเสียภาษี และไม่เกิน 200,000 บาท" },
        { "ID": 10, "title": "ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย", "amount": 100000, "unit": "บาท", "detail": "เฉพาะดอกเบี้ย ไม่รวมเงินต้น" },
        { "ID": 11, "title": "เงินบริจาคเพื่อการศึกษา กีฬา สาธารณประโยชน์", "amount": 0, "unit": "บาท", "detail": "หักได้ไม่เกิน 10% ของเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อน" },
        { "ID": 12, "title": "เงินบริจาคให้พรรคการเมือง", "amount": 10000, "unit": "บาท", "detail": "สูงสุดไม่เกิน 10,000 บาท" },
        { "ID": 13, "title": "ค่าฝึกอบรม/พัฒนาฝีมือ", "amount": 20000, "unit": "บาท", "detail": "ลดหย่อนได้ตามจ่ายจริง ไม่เกิน 20,000 บาท" }
    ];

    console.log("Address : ", address);

    const tambonName = address?.tambon?.split("-")[1] || "";
    const amphureName = address?.amphure?.split("-")[1] || "";
    const provinceName = address?.province?.split("-")[1] || "";
    const zip = address?.zipCode || "";

    const fullAddress = `${addressAll} ตำบล${tambonName} อำเภอ${amphureName} จังหวัด${provinceName} ${zip}`;

    console.log("Leave : ", leave);
    console.log("SSO : ", sso);
    console.log("Holiday : ", holiday);
    console.log("WorkShirft : ", workShift);
    console.log("tax : ", tax);

    React.useEffect(() => {
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddCompany = async () => {
        if (!companyName.trim() || !firebaseDB) return;

        const companiesRef = ref(firebaseDB, "workgroup/company");
        const groupsRef = ref(firebaseDB, "workgroup");

        let backendId = "";
        let databackendID = {};

        try {
            const snapshot = await get(groupsRef);
            if (snapshot.exists()) {
                databackendID = snapshot.val(); // สมมติ backenid เป็น string เช่น "abc123"
            } else {
                throw new Error("ไม่พบค่า backenid ใน Firebase");
            }

            console.log("backend Id : ", databackendID.backendid);

            const response = await fetch(`https://upload.happysoftth.com/humantech/${databackendID.backendid}/company`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ company: companyName }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Backend error response:", text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            backendId = data.id; // สมมติ response json มี field ชื่อ id
        } catch (error) {
            console.error("Error post group to backend:", error);
            alert("เกิดข้อผิดพลาดขณะส่งข้อมูลไป backend");
            return;
        }

        try {
            const snapshot = await get(companiesRef);
            const companiesData = snapshot.exists() ? snapshot.val() : {};
            const nextIndex = Object.keys(companiesData).length;

            await set(child(companiesRef, String(nextIndex)), {
                companyserial: shortName.trim(),
                companyname: companyName,
                companyaddress: fullAddress,
                address: [
                    {
                        ...address,
                        lat: lat,
                        lng: lng,
                        name: "บริษัท",
                        ID: 0
                    }
                ],
                email: email,
                companytel: phone,
                createdAt: new Date().toISOString(),
                companyid: nextIndex,
                leave: leave,
                holiday: holiday,
                sso: sso,
                workshift: workShift,
                tax: tax,
                deduction: deductionData,
                cpnbackendid: backendId
            });

            setCompanyName("");
            setShortName("");
            setAddress("");
            setEmail("");
            setPhone("");
            setOpen(false);
        } catch (error) {
            console.error("Error adding company:", error);
        }
    };


    return (
        <React.Fragment>
            <CardActionArea
                sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: "center"
                }}
                onClick={handleClickOpen}
            >
                <CardContent
                    sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: theme.palette.primary.main,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <DomainAddIcon sx={{ fontSize: 70, color: "white" }} />
                        <Typography variant='subtitle1' fontWeight="bold" color="white" gutterBottom>เพิ่มบริษัท</Typography>
                    </Box>
                    {/* <AddIcon
                        sx={{
                            fontSize: 45,
                            color: "white",          // เอา fill ออก
                            stroke: theme.palette.primary.main,               // กำหนดสีเส้น
                            strokeWidth: 0.5,              // ความหนาเส้น
                            marginTop: 6,
                            marginLeft: -4
                        }}
                    /> */}
                </CardContent>
            </CardActionArea>
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                        width: "600px",
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
                            <Typography variant="h6" fontWeight="bold" gutterBottom>เพิ่มบริษัท</Typography>
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }} onClick={handleClose}>
                                <CloseIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2} marginBottom={2}>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อย่อ</Typography>
                            <TextField
                                type="text"
                                size="small"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={8}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อบริษัท</Typography>
                            <TextField
                                type="text"
                                size="small"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >Email</Typography>
                            <TextField
                                type="text"
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >เบอร์โทรศัพท์</Typography>
                            <TextField
                                type="text"
                                size="small"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                fullWidth
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
                            />
                        </Grid>
                        <Grid item size={12}>
                            <ThaiAddressSelector
                                label="ที่อยู่ปัจจุบัน"
                                thailand={thailand}
                                value={address}
                                placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                onChange={(val) => setAddress(val)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >พิกัดละติจูด (latitude)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >พิกัดลองจิจูด (longitude)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, borderTop: `2px solid ${theme.palette.primary.dark}` }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleAddCompany} autoFocus>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
