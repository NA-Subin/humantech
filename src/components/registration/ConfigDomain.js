import { useEffect, useState } from "react";
import { ref, get, set, remove } from "firebase/database";
import { auth, database } from "../../server/firebase";
import JSON5 from "json5"; // ✅ ใช้ json5 แทน JSON.parse
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Box, Button, Card, CardContent, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import Logo from '../../img/Humantech.png';
import theme from "../../theme/theme";

const AdminApproveDomainForm = () => {
    const [requests, setRequests] = useState({});
    const [selectedDomain, setSelectedDomain] = useState("");
    const [domainKey, setDomainKey] = useState("");
    const [configRaw, setConfigRaw] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [domainID, setDomainID] = useState("");

    console.log("request : ", requests);
    console.log("select Domain : ", selectedDomain);

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

        try {
            // requestId คือ id ที่เลือกใน select (เลข key ของ requests)
            const requestRef = ref(database, `requests/${domainID}`); // selectedDomain = requestId (string เลข)

            // หาค่า nextId ของ domains เพื่อเก็บ domain ใหม่
            const domainsSnap = await get(ref(database, "workgroupid"));
            const domains = domainsSnap.exists() ? domainsSnap.val() : {};

            const nextDomainId = Object.keys(domains).length + 1;

            const domainRef = ref(database, `workgroupid/${nextDomainId}`);

            const reqSnap = await get(requestRef);
            if (!reqSnap.exists()) {
                alert("ไม่พบ domain นี้ในรายการคำขอ");
                setIsSubmitting(false);
                return;
            }

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

            const requestData = reqSnap.val();
            const startDate = requestData.createdAt;
            const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString();

            // --- POST ข้อมูล group ไปที่ backend ---
            let backendId = null;
            try {
                const response = await fetch("http://upload.happysoftth.com/humantech/group", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ group: domainKey }),
                });

                if (!response.ok) {
                    const text = await response.text(); // อ่านข้อความ error ที่ backend ส่งกลับ
                    console.error("Backend error response:", text);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                backendId = data.id;  // สมมติ response json มี field ชื่อ id
            } catch (error) {
                console.error("Error post group to backend:", error);
                alert("เกิดข้อผิดพลาดขณะส่งข้อมูลไป backend");
                setIsSubmitting(false);
                return;
            }

            await set(domainRef, {
                id: nextDomainId,
                domainKey,       // เก็บ domainKey ไว้ในข้อมูล ไม่ใช่ key ใน path
                config,
                selectedPlan: {
                    ...requestData.selectedPlan,
                    startDate,
                    endDate,
                },
                backendid: backendId,  // เก็บ backend id ที่ได้จาก response
            });

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

            await remove(requestRef);

            alert("✅ เพิ่ม config และสร้างบัญชีผู้ใช้สำเร็จ");

            setSelectedDomain("");
            setDomainKey("");
            setConfigRaw("");

            // โหลด requests ใหม่
            const snap = await get(ref(database, "requests"));
            setRequests(snap.exists() ? snap.val() : {});
        } catch (error) {
            console.error("❌ Error saving config:", error);
            alert("เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
        } finally {
            setIsSubmitting(false);
        }
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
                                        placeholder="yourdomain.humantech.com"
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
                            <Button variant="contained" color="primary" onClick={handleApprove} fullWidth sx={{
                                marginTop: 2,
                                borderRadius: 15,
                            }}>
                                บันทึกข้อมูล
                            </Button>
                        </CardContent>
                    </Box>
                </Box>
            </Card>
        </Container >
    );
};

export default AdminApproveDomainForm;
