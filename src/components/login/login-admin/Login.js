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
import { saveEncryptedCookie } from "../../../server/cookieUtils";
import { ShowAccessLogin } from "../../../sweetalert/sweetalert";

const DomainLoginAdmin = () => {
    const [domain, setDomain] = useState("");
    const [domainData, setDomainData] = useState(null);
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();  // ใช้ useNavigate แทน useRouter

    // สร้าง secret key แบบสุ่ม 32 ตัว
    // const generateSecret = () => {
    //     return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    //         .map(b => b.toString(16).padStart(2, '0'))
    //         .join('');
    // };

    // console.log(generateSecret());

    const handleLogin = async () => {
        setError("");

        if (!userID || !password) {
            setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
            return;
        }

        try {
            const adminRef = ref(database, "admin");
            const snapshot = await get(adminRef);

            if (!snapshot.exists()) {
                setError("ไม่พบข้อมูลผู้ดูแลระบบ");
                return;
            }

            const adminData = snapshot.val();
            const adminList = Object.values(adminData);

            const matchedAdmin = adminList.find(
                (admin) => admin.user === userID && admin.password === password
            );

            if (!matchedAdmin) {
                setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องสำหรับผู้ดูแลระบบ");
                return;
            }

            const email = `${userID}@humantech.com`;
            await signInWithEmailAndPassword(auth, email, password);

            // ✅ ใช้ cookie แบบเข้ารหัส พร้อม role
            saveEncryptedCookie({
                role: "admin",
                user: userID,
                loginTime: Date.now(),
                randomSession: Math.random().toString(36).slice(2),
            });

            navigate("/config-domain");
            setTimeout(() => {
                window.location.reload();
            }, 50);
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
                    <Typography variant="h5" fontWeight="bold" gutterBottom>เข้าสู่ระบบแอดมิน</Typography>
                    <Box sx={{ width: "80%" }}>
                        <Divider sx={{ marginTop: 2 }} />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item size={12}>
                                    <TextField
                                        type="text"
                                        size="small"
                                        fullWidth
                                        placeholder="กรุณากรอก user"
                                        value={userID}
                                        onChange={(e) => setUserID(e.target.value)}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                        UserID :
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
                                        placeholder="กรุณากรอกรหัสผ่าน"
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
                                variant="contained"
                                color="primary"
                                onClick={handleLogin} // ✅ เรียกตรง
                                fullWidth
                                sx={{
                                    marginTop: 2,
                                    borderRadius: 15,
                                }}
                            >
                                เข้าสู่ระบบ
                            </Button>

                            <Divider sx={{ marginTop: 2 }} />
                            <Button variant="contained" color="error" onClick={() => navigate("/")} fullWidth sx={{
                                marginTop: 2,
                                borderRadius: 15,
                            }}>
                                ย้อนกลับ
                            </Button>
                        </CardContent>
                    </Box>
                </Box>
            </Card>
        </Container>
    );
};

export default DomainLoginAdmin;