import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";  // เปลี่ยนตรงนี้
import { auth, database } from "../../../server/firebase";
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
import { Card, InputAdornment } from "@mui/material";
import Logo from '../../../img/Humantech.png';
import { ref, get } from "firebase/database";  // ✅ เพิ่ม ref & get จาก modular API

const DomainLogin = () => {
    const [domain, setDomain] = useState("");
    const [domainData, setDomainData] = useState(null);
    const [domainKey, setDomainKey] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();  // ใช้ useNavigate แทน useRouter

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
            localStorage.setItem("domainData", JSON.stringify(domainData));
            alert("✅ เข้าสู่ระบบสำเร็จ");
            // navigate(`/${encodeURIComponent(domainKey)}`)
            navigate(`/?domain=${encodeURIComponent(domainKey)}`);
            //window.location.href = "/dashboard"; // 👈 force reload app
        } catch (e) {
            console.error(e);
            setError("ล็อกอินไม่สำเร็จ กรุณาตรวจสอบรหัสผ่าน");
        }
    };

    const goRegisterDomain = () => {
        navigate("/register-domain");  // เปลี่ยนจาก router.push เป็น navigate
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
                    <Typography variant="h5" fontWeight="bold" gutterBottom>เข้าสู่ระบบโดเมน</Typography>
                    <Box sx={{ width: "80%" }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item size={9}>
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
                                                        Domain :
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                        .humantech.com
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item size={3}>
                                    <Button variant="contained" color="success" fullWidth sx={{ marginTop: 2 }} onClick={handleCheckDomain} disabled={loading}>
                                        ตรวจสอบ
                                    </Button>
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                            {domainData && (
                                <>
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
                                    <Button variant="contained" color="primary" onClick={handleLogin} fullWidth sx={{
                                        marginTop: 2,
                                        borderRadius: 15,
                                    }}>
                                        เข้าสู่ระบบ
                                    </Button>
                                </>
                            )}

                            {error && <Typography variant="subtitle1" sx={{ color: "red", textAlign: "center" }}>{error}</Typography>}

                            <Button variant="contained" color="error" onClick={goRegisterDomain} fullWidth sx={{
                                marginTop: 2,
                                borderRadius: 15,
                            }}>
                                สร้าง Domain ใหม่
                            </Button>
                        </CardContent>
                    </Box>
                </Box>
                <Box textAlign="right">
                    <Typography
                        variant="subtitle2"
                        sx={{ padding: 2, cursor: "pointer", color: "blue", textDecoration: "underline" }}
                        onClick={() => navigate("/config-domain")}
                    >
                        สำหรับ Admin
                    </Typography>
                </Box>
            </Card>
        </Container>
    );
};

export default DomainLogin;