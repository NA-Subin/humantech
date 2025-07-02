import * as React from 'react';
import { ref, get, set, child } from "firebase/database";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { CardActionArea, CardContent, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import theme from '../../theme/theme';
import { IconButtonError } from '../../theme/style';
import { useFirebase } from '../../server/ProjectFirebaseContext';

export default function InsertCompany() {
    const { firebaseDB, domainKey } = useFirebase();
    const [open, setOpen] = React.useState(false);
    const [shortName, setShortName] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("")

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddCompany = async () => {
        if (!companyName.trim() || !firebaseDB) return;

        const companiesRef = ref(firebaseDB, "workgroup/company");

        try {
            const snapshot = await get(companiesRef);
            const companiesData = snapshot.exists() ? snapshot.val() : {};
            const nextIndex = Object.keys(companiesData).length;

            await set(child(companiesRef, String(nextIndex)), {
                companyserial: shortName.trim(),
                companyname: companyName,
                companyaddress: address,
                email: email,
                companytel: phone,
                createdAt: new Date().toISOString(),
                companyid: nextIndex
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
                    <AddIcon fontSize="inherit" sx={{ fontSize: 64 }} />
                </CardContent>
            </CardActionArea>
            <Dialog
                open={open}
                onClose={handleClose}
                keepMounted
                maxWidth="md"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.dark }}>
                    <Grid container spacing={2}>
                        <Grid size={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มบริษัท</Typography>
                        </Grid>
                        <Grid size={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid size={4}>
                            <TextField
                                size="small"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ชื่อย่อ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={8}>
                            <TextField
                                size="small"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ชื่อบริษัท :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                size="small"
                                type="text"
                                multiline
                                rows={5}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ที่อยู่ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                Email :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                เบอร์โทร :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleAddCompany} autoFocus>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
