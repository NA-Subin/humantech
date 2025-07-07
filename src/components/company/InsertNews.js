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
import { Box, CardActionArea, CardContent, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import theme from '../../theme/theme';
import { IconButtonError } from '../../theme/style';
import { useFirebase } from '../../server/ProjectFirebaseContext';

export default function InsertNews() {
    const { firebaseDB, domainKey } = useFirebase();
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [text, setText] = React.useState("");
    const [picture, setPicture] = React.useState(null); // เก็บไฟล์
    const [previewUrl, setPreviewUrl] = React.useState(""); // ใช้แสดงตัวอย่างรูป

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPicture(file);
            setPreviewUrl(URL.createObjectURL(file)); // สร้าง preview url
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleNews = async () => {
        const companiesRef = ref(firebaseDB, "workgroup/information");

        try {
            const snapshot = await get(companiesRef);
            const companiesData = snapshot.exists() ? snapshot.val() : {};
            const nextIndex = Object.keys(companiesData).length;

            await set(child(companiesRef, String(nextIndex)), {
                title: title,
                text: text,
                date: new Date().toISOString(),
            });

            setTitle("");
            setText("");
            setOpen(false);
        } catch (error) {
            console.error("Error adding company:", error);
        }
    };


    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen(true)} >เพิ่มข่าวสาร</Button>
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                หัวข้อ :
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
                                rows={15}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                ประกาศ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item size={12}>
                            <TextField
                                size="small"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                                                รูปภาพ :
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button component="label" variant="contained" size="small">
                                                เลือกรูป
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={handleFileChange}
                                                />
                                            </Button>
                                        </InputAdornment>
                                    ),
                                    readOnly: true, // ไม่ให้พิมพ์ลง TextField
                                }}
                                value={picture ? picture.name : ""}
                            />

                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ marginTop: 10, height: 100 }}
                                />
                            )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleNews} autoFocus>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
