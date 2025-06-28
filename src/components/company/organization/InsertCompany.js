import * as React from 'react';
import { getDatabase, ref, push, onValue } from "firebase/database";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import theme from '../../../theme/theme';
import { IconButtonError } from '../../../theme/style';
import { useFirebase } from '../../../server/ProjectFirebaseContext';

export default function InsertCompany() {
    const { firebaseDB, domainKey } = useFirebase();
    const [open, setOpen] = React.useState(false);
    const [shortName, setShortName] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [professional, setProfessional] = React.useState("");
    const [fullProfessional, setFullProfessional] = React.useState("");
    const [elibrary, setELibrary] = React.useState("");
    const [fullElibrary, setFullELibrary] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddCompany = async () => {
        if (!companyName.trim() || !firebaseDB) return;

        await push(ref(firebaseDB, "companies"), {
            shortName: shortName.trim(),
            name: companyName,
            professional: professional.trim(),
            fullProfessional: fullProfessional.trim(),
            elibrary: elibrary.trim(),
            fullElibrary: fullElibrary.trim(),
            createdAt: new Date().toISOString(),
        });

        setCompanyName("");
        setShortName("");
        setProfessional("");
        setFullProfessional("");
        setELibrary("");
        setFullELibrary("");
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleClickOpen}>
                เพิ่มบริษัท
            </Button>
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
                        <Grid size={12}>
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
                        <Grid size={12}>
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
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={professional}
                                onChange={(e) => setProfessional(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                Full Professional :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={fullProfessional}
                                onChange={(e) => setFullProfessional(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                Professional :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={elibrary}
                                onChange={(e) => setELibrary(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                E-library :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                size="small"
                                value={fullElibrary}
                                onChange={(e) => setFullELibrary(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                Full E-library :
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
