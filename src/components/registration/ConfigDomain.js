import { useEffect, useState } from "react";
import { ref, get, set, remove, getDatabase } from "firebase/database";
import { auth, database } from "../../server/firebase";
import JSON5 from "json5"; // ✅ ใช้ json5 แทน JSON.parse
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Box, Button, Card, CardContent, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import Logo from '../../img/Humantech.png';
import theme from "../../theme/theme";
import { useFirebase } from "../../server/ProjectFirebaseContext";
import { useNavigate } from "react-router-dom";
import { ShowConfirm } from "../../sweetalert/sweetalert";
import { logout } from "../../server/logoutAuth";
import { getApp, getApps, initializeApp } from "firebase/app";

const AdminApproveDomainForm = () => {
    const { firebaseDB } = useFirebase();  // ✅ ดึง firebaseDB ที่ใช้งานจริง
    const [requests, setRequests] = useState({});
    const [selectedDomain, setSelectedDomain] = useState("");
    const [domainKey, setDomainKey] = useState("");
    const [configRaw, setConfigRaw] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [domainID, setDomainID] = useState("");

    const navigate = useNavigate();  // ใช้ useNavigate แทน useRouter

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const snap = await get(ref(database, "requests")); // ✅ ใช้ ref + get
                setRequests(snap.exists() ? snap.val() : {});
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };
        fetchRequests();
    }, []);

    const handleSelectDomain = (e) => {
        const key = e.target.value; // เช่น "1:example.humantech.com"
        setSelectedDomain(key);

        const domain = key.split(":")[1];
        setDomainID(key.split(":")[0]);
        setDomainKey(domain.replace(/\.humantech\.com$/, ""));
    };

    const handleApprove = async () => {
        if (isSubmitting) return;

        if (!domainID || !selectedDomain || !domainKey || !configRaw.trim()) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        if (!window.confirm(`ยืนยันการอนุมัติ domain: ${domainKey} ?`)) return;

        setIsSubmitting(true);

        // ใช้เพื่อให้ใช้ต่อทั้ง 2 ฐาน
        let nextDomainId = null;
        let requestData = null;
        let startDate = "";
        let endDate = "";
        let backendId = "";

        try {
            // ดึงข้อมูล request
            const requestRef = ref(database, `requests/${domainID}`);
            const reqSnap = await get(requestRef);
            if (!reqSnap.exists()) {
                alert("ไม่พบ domain นี้ในรายการคำขอ");
                setIsSubmitting(false);
                return;
            }

            requestData = reqSnap.val();
            startDate = requestData.createdAt;
            endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString();

            // ตรวจหา nextDomainId
            const domainsSnap = await get(ref(database, "workgroupid"));
            const domains = domainsSnap.exists() ? domainsSnap.val() : {};
            nextDomainId = Object.keys(domains).length + 1;

            // ตรวจและ parse config
            let config;
            try {
                config = JSON5.parse(configRaw);
            } catch (e) {
                console.error("config parse error:", e.message);
                alert(`Config ผิดพลาด: ${e.message}`);
                setIsSubmitting(false);
                return;
            }

            if (!config.apiKey?.trim() || !config.projectId?.trim() || !config.databaseURL?.trim()) {
                alert("config ต้องมี apiKey, projectId และ databaseURL");
                setIsSubmitting(false);
                return;
            }

            // POST ไป backend เพื่อสร้าง group
            try {
                const response = await fetch("http://upload.happysoftth.com/humantech/group", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ group: domainKey }),
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error("Backend error response:", text);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                backendId = data.id;
            } catch (error) {
                console.error("Error post group to backend:", error);
                alert("เกิดข้อผิดพลาดขณะส่งข้อมูลไป backend");
                setIsSubmitting(false);
                return;
            }

            // บันทึกลงฐานข้อมูลหลัก
            const domainRef = ref(database, `workgroupid/${nextDomainId}`);
            await set(domainRef, {
                id: nextDomainId,
                domainKey,
                config,
                selectedPlan: {
                    ...requestData.selectedPlan,
                    startDate,
                    endDate,
                },
                company: {
                    ...requestData.company,
                    startDate,
                    endDate,
                },
                backendid: backendId,
            });

            // สร้าง user
            const email = `${domainKey}@humantech.com`;
            const password = "1234567";
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log(`User created: ${email}`);
            } catch (error) {
                if (error.code === "auth/email-already-in-use") {
                    console.log(`User ${email} มีอยู่แล้วในระบบ`);
                } else {
                    console.error("สร้าง user ผิดพลาด:", error);
                    alert("เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้");
                    setIsSubmitting(false);
                    return;
                }
            }

            // ลบคำขอออก
            await remove(requestRef);

            alert("✅ เพิ่ม config และสร้างบัญชีผู้ใช้สำเร็จ");

            setSelectedDomain("");
            setDomainKey("");
            setConfigRaw("");

            const snap = await get(ref(database, "requests"));
            setRequests(snap.exists() ? snap.val() : {});
        } catch (error) {
            console.error("❌ Error saving to database หลัก:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกฐานข้อมูลหลัก");
            setIsSubmitting(false);
            return;
        }

        // 👇 ส่วนนี้แยกต่างหาก — เขียนไปยัง firebaseDB (ฐานที่ 2)
        try {
            let config;
            try {
                config = JSON5.parse(configRaw);
            } catch (e) {
                console.error("config parse error:", e.message);
                alert(`Config ผิดพลาด: ${e.message}`);
                setIsSubmitting(false);
                return;
            }

            if (!config.apiKey?.trim() || !config.projectId?.trim() || !config.databaseURL?.trim()) {
                alert("config ต้องมี apiKey, projectId และ databaseURL");
                setIsSubmitting(false);
                return;
            }
            // เช็คว่ามีแอปนี้สร้างแล้วหรือยัง เพื่อป้องกันซ้ำ
            const dynamicAppName = `app-${domainKey}`;
            let dynamicApp;

            if (!getApps().some(app => app.name === dynamicAppName)) {
                dynamicApp = initializeApp(config, dynamicAppName);  // ใช้ชื่อแอปเฉพาะ
            } else {
                dynamicApp = getApp().find(app => app.name === dynamicAppName);
            }

            const dynamicDB = getDatabase(dynamicApp);
            const paymentRef = ref(dynamicDB, `workgroup`);

            await set(paymentRef, {
                payment: {
                    ...requestData.selectedPlan,
                    startDate,
                    endDate,
                },
                workgroupname: domainKey,
                backendid: backendId,
            });

            console.log("✅ บันทึก payment ไปยัง Realtime Database ของ domain ใหม่สำเร็จ");
        } catch (error) {
            console.error("❌ Error เขียนลงฐานข้อมูล domain ใหม่โดยใช้ config:", error);
            alert("เกิดข้อผิดพลาดในการเขียนข้อมูลไปยัง domain ใหม่จาก config");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        ShowConfirm(
            "ออกจากระบบ",
            "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
            () => {
                logout(navigate);
            },
            () => {
                console.log("ยกเลิกการออกจากระบบ");
            }
        );
    };


    return (
        <Container maxWidth="md" sx={{ marginTop: 3 }}>
            {/* <div>
                <h3>อนุมัติ domain</h3>

                <label>เลือก Domain ที่รออนุมัติ:</label>
                <select value={selectedDomain} onChange={handleSelectDomain}>
                    <option value="">-- เลือก domain --</option>
                    {Object.keys(requests).map((key) => {
                        const originalDomain = requests[key].originalDomain || key.replaceAll("_", ".");
                        return (
                            <option key={key} value={originalDomain}>
                                {originalDomain}
                            </option>
                        );
                    })}
                </select>

                <br />

                <label>DomainKey:</label>
                <input
                    type="text"
                    value={domainKey}
                    onChange={(e) => setDomainKey(e.target.value)}
                    placeholder="ชื่อย่อของ domain (ใช้ _ แทน .)"
                />

                <br />

                <label>Firebase Config (วางจาก Firebase Console ได้เลย):</label>
                <textarea
                    placeholder={`const firebaseConfig = {\n  apiKey: "xxx",\n  ...\n}`}
                    rows={10}
                    style={{ width: "100%" }}
                    value={configRaw}
                    onChange={(e) => setConfigRaw(e.target.value)}
                />

                <br />

                <button onClick={handleApprove} disabled={isSubmitting}>
                    {isSubmitting ? "กำลังบันทึก..." : "เพิ่มและลบคำขอ"}
                </button>
            </div> */}
            <Card sx={{
                marginTop: 5,
                boxShadow: '2px 2px 5px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: 5,
            }}>
                <Box sx={{ backgroundColor: theme.palette.primary.main, textAlign: "center", }}>
                    <img src={Logo} width={400} />
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2
                }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>จัดการ Domain</Typography>
                    <Box sx={{ width: "80%" }}>
                        <CardContent>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault(); // กันไม่ให้รีเฟรชหน้า
                                    handleApprove();      // เรียกฟังก์ชันเข้าสู่ระบบ
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid item size={12}>
                                        <Typography variant="subtitle2" sx={{ color: "red", textAlign: "center", marginBottom: -2 }}>
                                            *เลือก Domain ที่รออนุมัติ*
                                        </Typography>
                                    </Grid>
                                    <Grid item size={12}>
                                        <TextField
                                            select
                                            size="small"
                                            value={selectedDomain}
                                            onChange={handleSelectDomain}
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                            เลือก domain :
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        >
                                            {Object.keys(requests).map((key) => {
                                                const originalDomain = `${requests[key].id}:${requests[key].Domain}`;
                                                return (
                                                    <MenuItem key={key} value={originalDomain}>
                                                        {originalDomain.split(":")[1]}
                                                    </MenuItem>
                                                );
                                            })}
                                        </TextField>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={1}>
                                    <Grid item size={12}>
                                        <TextField
                                            type="text"
                                            size="small"
                                            fullWidth
                                            placeholder="yourdomain"
                                            value={domainKey}
                                            onChange={(e) => setDomainKey(e.target.value)}
                                            margin="normal"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                            Domain Key :
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item size={12}>
                                        <TextField
                                            type="text"
                                            size="small"
                                            multiline
                                            rows={10}
                                            fullWidth
                                            placeholder={`{\n  apiKey: "xxx",\n  authDomain: "xxx", \n  databaseURL: "xxx"\n  projectId: "xxx"\n  storageBucket: "xxx"\n  messagingSenderId: "xxx"\n  appId: "xxx"\n  measurementId: "xxx"\n}`}
                                            value={configRaw}
                                            onChange={(e) => setConfigRaw(e.target.value)}
                                            margin="normal"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                            เพิ่ม Firebase Config :
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{
                                    marginTop: 2,
                                    borderRadius: 15,
                                }}>
                                    บันทึกข้อมูล
                                </Button>
                            </form>
                            <Divider sx={{ marginTop: 2 }} />
                            <Button variant="contained" color="error" onClick={handleLogout} fullWidth sx={{
                                marginTop: 2,
                                borderRadius: 15,
                            }}>
                                ออกจากระบบ
                            </Button>
                        </CardContent>
                    </Box>
                </Box>
            </Card>
        </Container >
    );
};

export default AdminApproveDomainForm;
