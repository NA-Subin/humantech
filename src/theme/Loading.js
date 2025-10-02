import { LinearProgress, Box } from "@mui/material";
import Logo from "../img/HumantechGreen.png";
import theme from "./theme";


const FullPageLoading = () => (
    <Box
        sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "white",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column", // ✅ เรียงแนวตั้ง
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        {/* โลโก้อยู่ตรงกลางบน */}
        <img src={Logo} width="400" style={{ marginBottom: 24 }} />

        {/* แถบโหลดอยู่ด้านล่างโลโก้ */}
        <Box sx={{ width: "50%" }}>
            <LinearProgress
                variant="indeterminate"
                sx={{
                    height: 15,
                    borderRadius: 5,
                    backgroundColor: theme.palette.primary.light,
                    "& .MuiLinearProgress-bar": {
                        background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                    },
                }}
            />
        </Box>
    </Box>

);

export default FullPageLoading;