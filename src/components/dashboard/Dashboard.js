import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { Box, Button, Card, CardContent, Container, Grid, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { useFirebase } from "../../server/ProjectFirebaseContext";
import theme from "../../theme/theme";
import Logo from '../../img/Humantech.png';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const Dashboard = () => {
    const { firebaseDB, domainKey } = useFirebase();
    // const { domain } = useParams();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const [companyName, setCompanyName] = useState("");
    const [open, setOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [companies, setCompanies] = useState([]);
    const [company, setCompany] = useState("");

    const navigate = useNavigate();  // ใช้ useNavigate แทน useRouter

    console.log("Domain Key:", domainKey);
    console.log("company : ", companies);

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
        });

        return () => unsubscribe();
    }, [firebaseDB]);

    const handleAddCompany = async () => {
        if (!companyName.trim() || !firebaseDB) return;

        await push(ref(firebaseDB, "workgroup/company"), {
            name: companyName,
            createdAt: new Date().toISOString(),
        });

        setCompanyName("");
        setOpen(false);
    };

    return (
        <Container maxWidth="md" sx={{ marginTop: 3 }}>
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
                    <Typography variant="h5" fontWeight="bold" gutterBottom>ยินดีต้อนรับ: {domainKey}</Typography>
                    <Box sx={{ width: "80%" }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" sx={{ color: "red", textAlign: "center", marginBottom: -2 }}>
                                        *เลือกบริษัทในเครือ*
                                    </Typography>
                                </Grid>
                                <Grid item size={9.5}>
                                    {
                                        open ? (
                                            <TextField
                                                size="small"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                                ชื่อบริษัทในเครือ :
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )
                                            :
                                            (
                                                <TextField
                                                    select
                                                    size="small"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                                    เลือกบริษัทในเครือ :
                                                                </Typography>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                >
                                                    {/* {Object.keys(requests).map((key) => {
                                                        const originalDomain = requests[key].originalDomain || key.replaceAll("_", ".");
                                                        return (
                                                            <MenuItem key={key} value={originalDomain}>
                                                                {originalDomain}
                                                            </MenuItem>
                                                        );
                                                    })} */}
                                                    {companies.map((c) => (
                                                        <MenuItem key={c.id}>{c.companyname}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )
                                    }
                                    {/* {Object.keys(requests).map((key) => {
                                            const originalDomain = requests[key].originalDomain || key.replaceAll("_", ".");
                                            return (
                                                <MenuItem key={key} value={originalDomain}>
                                                    {originalDomain}
                                                </MenuItem>
                                            );
                                        })} */}
                                </Grid>
                                <Grid item size={2.5}>
                                    {
                                        open ? (
                                            <Box display="flex" justifyContent="center" alignItems="center">
                                                <Button variant="contained" color="error"
                                                    onClick={() => setOpen(false)}
                                                    sx={{ marginRight: 1 }}
                                                    fullWidth
                                                >
                                                    ยกเลิก
                                                </Button>
                                                <Button variant="contained" color="success"
                                                    onClick={handleAddCompany}
                                                    fullWidth
                                                >
                                                    บันทึก
                                                </Button>
                                            </Box>
                                        )
                                            :
                                            <Button variant="contained" color="primary"
                                                onClick={() => setOpen(true)}
                                                fullWidth
                                            >
                                                เพิ่มบริษัท
                                            </Button>
                                    }
                                </Grid>
                            </Grid>
                            <Grid container spacing={1}>
                                <Grid item size={12}>
                                    <TextField
                                        type="text"
                                        size="small"
                                        fullWidth
                                        placeholder="กรุณากรอก username"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                        UserName :
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
                                        placeholder="yourdomain.humantech.com"
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
                            <Button variant="contained" color="primary"
                                //onClick={handleLogin}
                                fullWidth sx={{
                                    marginTop: 2,
                                    borderRadius: 15,
                                }}>
                                เข้าสู่ระบบ
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    window.location.href = `/?domain=${domain}&page=dashboard`;
                                }}
                                fullWidth
                                sx={{ marginTop: 2, borderRadius: 15 }}
                            >
                                เข้าสู่ระบบจัดการบริษัท
                            </Button>

                        </CardContent>
                    </Box>
                </Box>
            </Card>
            {/* <div style={{ maxWidth: 600, margin: "auto" }}>
                <h2>ยินดีต้อนรับ: {domainKey}</h2>

                <div>
                    <label>ชื่อบริษัทในเครือ:</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <button onClick={handleAddCompany}>➕ เพิ่มบริษัท</button>
                </div>
            </div> */}
        </Container >
    );
};

export default Dashboard;
