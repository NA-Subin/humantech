import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import theme from '../../theme/theme';
import { Item, ItemReport } from '../../theme/style';

export default function CompanyDeshboard() {
  return (
    <Container maxWidth="xl" sx={{ p: 5 }} >
        <Box sx={{ flexGrow: 1, marginTop: 10}}>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <Item sx={{ textAlign:"center" }}>
                        <img src={Logo} width={400}/>
                        <Typography variant="h6" sx={{ opacity: 0.7,color: theme.palette.primary.dark,marginTop:-3 }} fontWeight="bold" gutterBottom>( ระบบการจัดการบริษัท )</Typography>
                    </Item>
                </Grid>
            </Grid>
        </Box>
        <Grid container spacing={2} marginTop={1} marginBottom={1}>
            <Grid item size={3}>
                <Item>
                    <PhoneIcon fontSize="large" />
                </Item>
            </Grid>
            <Grid item size={3}>
                <Item>
                    <StoreIcon fontSize="large" />
                </Item>
            </Grid>
            <Grid item size={3}>
                <Item>
                    <FacebookIcon fontSize="large" />
                </Item>
            </Grid>
            <Grid item size={3}>
                <Item>
                    <EmailIcon fontSize="large" />
                </Item>
            </Grid>
        </Grid>
        <Grid container spacing={2} marginTop={1} marginBottom={1}>
            <Grid item size={12}>
                <Item sx={{ height: 400 }}>
                    <Typography variant='h6' gutterBottom>ประกาศ</Typography>
                </Item>
            </Grid>
        </Grid>
        <Box sx={{ marginTop: 2,flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item size={6}>
                    <Item>
                        <Typography variant="subtitle1" gutterBottom>บทความ</Typography>
                        <Divider />
                        <Grid container spacing={2} marginTop={2} marginBottom={2}>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                        </Grid>
                        <Stack spacing={2} alignItems="center">
                            <Pagination count={10} variant="outlined" shape="rounded" />
                        </Stack>
                    </Item>
                </Grid>
                <Grid item size={6}>
                    <Item>
                        <Typography variant="subtitle1" gutterBottom>ข่าวสาร</Typography>
                        <Divider />
                        <Grid container spacing={2} marginTop={2} marginBottom={2}>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                            <Grid item size={3}>
                                <ItemReport>

                                </ItemReport>
                            </Grid>
                        </Grid>
                        <Stack spacing={2} alignItems="center">
                            <Pagination count={10} variant="outlined" shape="rounded" />
                        </Stack>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    </Container>
  );
}