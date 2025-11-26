import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";  // เปลี่ยนตรงนี้
import { auth, database } from "../../../server/firebase";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import theme from "../../../theme/theme";
import { Card, IconButton, InputAdornment, Tooltip } from "@mui/material";
import Logo from '../../../img/Humantech.png';
import { ref, get, set } from "firebase/database";  // ✅ เพิ่ม ref & get จาก modular API
import { saveEncryptedCookie } from "../../../server/cookieUtils";
import { ShowAccessLogin } from "../../../sweetalert/sweetalert";

const DomainLogin = () => {
    const [domain, setDomain] = useState("");
    const [domainData, setDomainData] = useState(null);
    const [domainKey, setDomainKey] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();  // ใช้ useNavigate แทน useRouter
    console.log("domainData : ", domainData);
    console.log("domainKey : ", domainKey);

    const handleCheckDomain = async () => {
        setLoading(true);
        setError("");
        const domainInput = domain.trim().toLowerCase();

        try {
            const domainsSnap = await get(ref(database, "workgroupid"));
            if (!domainsSnap.exists()) {
                setError("❌ ไม่พบโดเมนนี้ในระบบ กรุณาตรวจสอบอีกครั้ง");
                setDomainData(null);
                return;
            }

            const domains = domainsSnap.val();

            // ค้นหา record ที่ domainKey ตรงกับ domainInput
            // domains เป็น object ที่ key เป็น id ตัวเลข
            const foundEntry = Object.values(domains).find(
                (entry) => entry.domainKey?.toLowerCase() === domainInput
            );

            if (foundEntry) {
                setDomainData(foundEntry);
                setDomainKey(foundEntry?.domainKey || "");
            } else {
                setError("❌ ไม่พบโดเมนนี้ในระบบ กรุณาตรวจสอบอีกครั้ง");
                setDomainData(null);
            }
        } catch (e) {
            console.error("🔥 เกิดข้อผิดพลาด:", e);
            setError("เกิดข้อผิดพลาดในการตรวจสอบ domain");
        } finally {
            setLoading(false);
        }
    };

    console.log("Domain Input:", domain);
    console.log("Domain Data:", domainData);
    console.log("Domain Key Input:", domainKey);

    // สร้าง secret key แบบสุ่ม 32 ตัว
    // const generateSecret = () => {
    //     return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    //         .map(b => b.toString(16).padStart(2, '0'))
    //         .join('');
    // };

    // console.log(generateSecret());

    const handleLogin = async () => {
        setError("");

        if (!domainKey || !password) {
            setError("กรุณากรอก Domain Key และ Password");
            return;
        }

        if (!domainData) {
            setError("กรุณาตรวจสอบ Domain ก่อน");
            return;
        }

        if (domainKey !== domainData.domainKey) {
            setError("❌ Domain Key ไม่ถูกต้อง");
            return;
        }

        try {
            const email = `${domainKey}@humantech.com`;
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Domain Data:", domainData);

            // Save to LocalStorage
            localStorage.setItem("domainData", JSON.stringify(domainData));

            // Save to Secure Cookie
            saveEncryptedCookie({
                role: "user", // 👈 เพิ่ม role
                domainKey: domainData.domainKey,
                companyName: domainData.companyName,
                loginTime: Date.now(),
                randomSession: Math.random().toString(36).slice(2),
            });

            ShowAccessLogin("เข้าสู่ระบบ", `ยินดีต้อนรับเข้าสู่ระบบ ${domainData.domainKey}`);
            // if (domainData.grouptype === "attendant") {
            //     navigate(`/?domain=${encodeURIComponent(domainKey)}&page=dashboard`);
            // } else {
            //     navigate(`/?domain=${encodeURIComponent(domainKey)}&page=dashboard`);
            // }
            // navigate(`/?domain=${encodeURIComponent(domainKey)}&page=dashboard`);
            navigate(`/${domainKey}/dashboard`);

            setTimeout(() => {
                window.location.reload();
            }, 50); // delay เล็กน้อยเพื่อให้ navigate สำเร็จก่อน
        } catch (e) {
            console.error(e);
            setError("ล็อกอินไม่สำเร็จ กรุณาตรวจสอบรหัสผ่าน");
        }
    };

    return (
        <Container maxWidth="md" sx={{ marginTop: 13 }}>
            <Card sx={{
                marginTop: 7,
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
                    <Typography variant="h5" fontWeight="bold" gutterBottom>เข้าสู่ระบบ</Typography>
                    <Box sx={{ width: "80%" }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item size={9.5}>
                                    <TextField
                                        type="text"
                                        size="small"
                                        fullWidth
                                        placeholder="กรุณากรอกชื่อ"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                        https://happysoftth.humantech.asia/
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            // endAdornment: (
                                            //     <InputAdornment position="start">
                                            //         <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            //             .humantech.com
                                            //         </Typography>
                                            //     </InputAdornment>
                                            // ),
                                        }}
                                    />
                                </Grid>
                                <Grid item size={2.5}>
                                    <Button variant="contained" color="success" fullWidth sx={{ marginTop: 2 }} onClick={handleCheckDomain} disabled={loading}>
                                        ตรวจสอบ
                                    </Button>
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                            {domainData && (
                                <>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault(); // กันไม่ให้รีเฟรชหน้า
                                            handleLogin();      // เรียกฟังก์ชันเข้าสู่ระบบ
                                        }}
                                    >
                                        <Grid container spacing={1}>
                                            <Grid item size={12}>
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    fullWidth
                                                    placeholder="กรุณากรอก Domain Key"
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
                                                    type="password"
                                                    size="small"
                                                    fullWidth
                                                    placeholder="กรุณากรอกรหัส Domain"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    margin="normal"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                                    Password :
                                                                </Typography>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Button
                                            type="submit"   // เปลี่ยนเป็น submit
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            sx={{
                                                marginTop: 2,
                                                borderRadius: 15,
                                            }}>
                                            เข้าสู่ระบบ
                                        </Button>
                                    </form>
                                </>
                            )}

                            {error && <Typography variant="subtitle1" sx={{ color: "red", textAlign: "center" }}>{error}</Typography>}
                            <Divider sx={{ marginTop: 2 }} />
                            <Button variant="contained" color="error" onClick={() => navigate("/register-domain")} fullWidth sx={{
                                marginTop: 2,
                                borderRadius: 15,
                            }}>
                                สร้าง Domain ใหม่
                            </Button>
                        </CardContent>
                    </Box>
                </Box>
                <Box textAlign="right">
                    {/* <Typography
                        variant="subtitle2"
                        sx={{ padding: 2, cursor: "pointer", color: "blue", textDecoration: "underline" }}
                        onClick={() => navigate("/login-admin")}
                    >
                        สำหรับ Admin
                    </Typography> */}
                    <Tooltip title="สำหรับ Admin" placement="bottom">
                        <IconButton onClick={() => navigate("/login-admin")}>
                            <AdminPanelSettingsIcon sx={{ marginTop: 1 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Card>
        </Container>
    );
};

export default DomainLogin;