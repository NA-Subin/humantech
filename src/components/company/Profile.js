import React, { useState } from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ButtonGroup from '@mui/material/ButtonGroup';
import Slider from '@mui/material/Slider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import theme from "../../theme/theme";
import { Item } from "../../theme/style";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

function createData(EmployeeID, FingerprintID, Prefix, Name, Surname, Nickname, Sex, Nationality , Department, Departments, Agency, Position, Status_id, BirthDay, Phone, Email, ID) {
  return {
      EmployeeID,
      FingerprintID,
      Prefix,
      Name,
      Surname,
      Nickname,
      Sex,
      Nationality,
      Department,
      Departments,
      Agency,
      Position,
      Status_id,
      BirthDay,
      Phone,
      Email,
      ID,
  };
}

const data = [
  createData('651138', '651138', 'นางสาว', 'จารุวรรณ', 'ศรีเสนา', 'แอม', 'หญิง', 'ไทย', 'คลังสินค้า', '-', '-', 'เจ้าหน้าที่ขายหน้าปั้ม (หน้าลาน)', 4, '27-09-1976', '098-869-7943', '-', '3400900482797'),
  createData('621101', '621101', 'นางสาว', 'สุภัสสร', 'เทียบศรี', '-', 'หญิง', 'ไทย', 'คลังสินค้า', '-', '-', 'เจ้าหน้าที่ขายหน้าปั้ม (หน้าลาน)', 1, '-', '-', '-', '-'),
  createData('641122', '641122', 'นางสาว', 'จิราภา', 'พินิจมนตรี', '-', 'หญิง', 'ไทย', 'คลังสินค้า', '-', '-', 'เจ้าหน้าที่ขายหน้าปั้ม (หน้าลาน)', 1, '-', '-', '-', '-'),
  createData('651107', '651107', 'นาย', 'พัชรมัย', 'นวลมีศรี', '-', 'ชาย', 'ไทย', 'คลังสินค้า', '-', '-', 'เจ้าหน้าที่ขายหน้าปั้ม (หน้าลาน)',2, '-', '-', '-', '-'),
];

function Profile() {
    const [openProfile, setOpenProfile] = React.useState(false);
    const [openEmail, setOpenEmail] = React.useState(false);
    const [openPassword, setOpenPassword] = React.useState(false);
    const [openPhone, setOpenPhone] = React.useState(false);
    const [openPicture, setOpenPicture] = React.useState(false);
    const [checked, setChecked] = React.useState(true);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleClickOpenPicture = () => {
      setOpenPicture(true);
    };
  
    const handleClosePicture = () => {
      setOpenPicture(false);
    };

    const handleClickOpenProfile = () => {
      setOpenProfile(true);
    };
  
    const handleCloseProfile = () => {
      setOpenProfile(false);
    };

    const handleClickOpenEmail = () => {
      setOpenEmail(true);
    };
  
    const handleCloseEmail = () => {
      setOpenEmail(false);
    };

    const handleClickOpenPassword = () => {
      setOpenPassword(true);
    };
  
    const handleClosePassword = () => {
      setOpenPassword(false);
    };

    const handleClickOpenPhone = () => {
      setOpenPhone(true);
    };
  
    const handleClosePhone = () => {
      setOpenPhone(false);
    };

  return (
    <Container maxWidth="xl" sx={{ p: 5}}>
        <Box sx={{ flexGrow: 1, p:5}}>
          <Grid container spacing={2}>
            <Grid item size={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ข้อมูลส่วนตัว</Typography>
            </Grid>
          </Grid>
        </Box>
        <Item>
            <Typography variant="subtitle1" gutterBottom>ข้อมูลส่วนตัว</Typography>
            <Divider />
            <Box marginTop={2} p={4}>
                <Grid container spacing={4}>
                    <Grid item size={4} sx={{ textAlign: "center", alignItems: "center" }}>
                        <Box alignItems="center" justifyContent="center" display="flex" marginBottom={1}>
                            <Avatar src="/broken-image.jpg" sx={{ width: 200 , height: 200 }}/>
                        </Box>
                        <Button variant="text" onClick={handleClickOpenPicture}>เลือกรูปผู้ใช้</Button>
                    </Grid>
                    <Grid item size={6}>
                        <Stack direction="row" spacing={2}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>ชื่อ : </Typography>
                            <Button variant="text" onClick={handleClickOpenProfile} >แก้ไขข้อมูลส่วนตัว</Button>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Role : </Typography>
                        <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>อีเมล : </Typography>
                            <Button variant="text" onClick={handleClickOpenEmail} >แก้ไขอีเมล</Button>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เบอร์โทรศัพท์ : </Typography>
                            <Button variant="text" onClick={handleClickOpenPhone} >แก้ไขเบอร์โทรศัพท์</Button>
                        </Stack>
                    </Grid>
                    <Grid item size={2}>
                        <Button variant="contained" fullWidth onClick={handleClickOpenPassword}>เปลี่ยนรหัสผ่าน</Button>
                    </Grid>
                </Grid>
                <Dialog
                        maxWidth="md"
                        open={openPicture}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePicture}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนรูปภาพ"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <Box justifyContent="center" alignItems="center" display="flex">
                                <IconButton size="large" aria-label="เลือกรูปภาพ" color="inherit" component="label" tabIndex={-1} role={undefined}>
                                    <AddPhotoAlternateRoundedIcon />
                                    <input
                                        type="file"
                                        hidden
                                    />
                                </IconButton>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePicture}>ยกเลิก</Button>
                            <Button onClick={handleClosePicture}>บันทึก</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openProfile}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleCloseProfile}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนชื่อ"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="ชื่อ" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <ManageAccountsRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="นามสกุล" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <ManageAccountsRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseProfile}>ยกเลิก</Button>
                            <Button onClick={handleCloseProfile}>บันทึก</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openEmail}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleCloseEmail}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนอีเมล"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="อีเมลเดิม" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <EmailRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="อีเมลใหม่" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <MarkEmailUnreadRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEmail}>ยกเลิก</Button>
                            <Button onClick={handleCloseEmail}>เปลี่ยนอีเมล</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openPassword}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePassword}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนรหัสผ่าน"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="รหัสผ่านเดิม" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <PasswordRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                            <Divider sx={{ marginTop:1 ,marginBottom:1 }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="รหัสผ่านใหม่" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <PasswordRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="ยืนยันรหัสผ่านใหม่อีกครั้ง" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <PasswordRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePassword}>ยกเลิก</Button>
                            <Button onClick={handleClosePassword}>เปลี่ยนรหัสผ่าน</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openPhone}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePhone}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนเบอร์โทร"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="เบอร์โทรเดิม" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIphoneRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="เบอร์โทรใหม่" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <InstallMobileRoundedIcon />
                                </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePhone}>ยกเลิก</Button>
                            <Button onClick={handleClosePhone}>เปลี่ยนเบอร์โทร</Button>
                        </DialogActions>
                    </Dialog>
            </Box>
        </Item>
        <Item sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" gutterBottom>การแจ้งเตือนผ่านอีเมล</Typography>
            <Divider />
            <Grid container spacing={2} p={4}>
                <Grid item size={10}>
                    <Typography variant="subtitle2" gutterBottom>รับการแจ้งเตือนข่าวสารผ่านทางอีเมล์</Typography>
                    <Typography variant="subtitle2" gutterBottom>เลือกเปิด เพื่อรับข่าวสารจาก HumanSoft ผ่านทางอีเมล เลือกปิด เพื่อปิดการรับข่าวสารจากทาง HumanSoft ผ่านทางอีเมล</Typography>
                </Grid>
                <Grid item size={2}>
                    <Switch
                        checked={checked}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                        />
                </Grid>
            </Grid>
        </Item>
    </Container>
  )
}

export default Profile