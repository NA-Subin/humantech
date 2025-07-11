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
import theme from '../../../theme/theme';
import { IconButtonError } from '../../../theme/style';
import { useFirebase } from '../../../server/ProjectFirebaseContext';

export default function UpdateDatOff(props) {
    const { open, index, month } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [openPopUp, setOpenPopUp] = React.useState(open);

    console.log("Open PopUp : ", openPopUp);

    const handleClickOpen = () => {
        setOpenPopUp(true);
    };

    const handleClose = () => {
        setOpenPopUp(false);
    };

    return (
        <React.Fragment>
            <Dialog
                open={openPopUp}
                keepMounted
                maxWidth="md"
                onClose={handleClose}
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

                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
