import { useState } from "react";
import { ref, get, set } from "firebase/database";
import { database } from "../../server/firebase";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Container, Divider, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import Logo from '../../img/Humantech.png';
import theme from "../../theme/theme";

const RequestDomainForm = () => {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState({
    name: "",
    price: 0,
    users: 0
  });

  const handleSelectedPlan = (newName, newPrice, newUsers) => {
    setSelectedPlan({
      name: newName,
      price: newPrice,
      users: newUsers,
    });
  };

  console.log("select Plan : ", selectedPlan);

  const handleRequest = async () => {
    const rawInput = domain.trim().toLowerCase();
    const domainName = rawInput.replace(/\.humantech\.com$/, "");

    if (!/^[a-z0-9\-]+$/.test(domainName)) {
      alert("❌ กรุณากรอกชื่อโดเมนให้ถูกต้อง (ใช้ได้เฉพาะ a-z, 0-9 และ -)");
      return;
    }

    const fullDomain = `${domainName}.humantech.com`;

    try {
      const allRequestsSnap = await get(ref(database, "requests"));
      const allRequests = allRequestsSnap.exists() ? allRequestsSnap.val() : {};

      // ตรวจสอบซ้ำว่า domain ซ้ำหรือยัง
      const isDuplicate = Object.values(allRequests).some(
        (r) => r.DomainKey === domainName || r.Domain === fullDomain
      );
      if (isDuplicate) {
        alert("❌ Domain นี้มีอยู่แล้วหรือรออนุมัติ");
        return;
      }

      // ใช้ length เพื่อหาค่า key ถัดไป
      const nextId = Object.keys(allRequests).length + 1;

      const requestRef = ref(database, `requests/${nextId}`);

      await set(requestRef, {
        id: nextId,
        Domain: fullDomain,
        DomainKey: domainName,
        email,
        selectedPlan,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert("✅ ส่งคำขอเรียบร้อยแล้ว");
      setDomain("");
      setEmail("");
    } catch (e) {
      console.error("เกิดข้อผิดพลาด:", e);
      alert("❌ เกิดข้อผิดพลาดในการส่งคำขอ");
    }
  };


  return (
    <Container maxWidth="md" sx={{ marginTop: 2 }}>
      <Card sx={{
        marginTop: 3,
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
          <Box sx={{ width: "80%" }}>
            <CardContent>
              <Divider sx={{ marginTop: 1, marginBottom: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>สมัครใช้งานระบบ</Typography>
              </Divider>
              <Grid container spacing={1}>
                <Grid item size={12}>
                  <TextField
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="กรุณากรอกชื่อบริษัท"
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
                      )
                    }}
                  />
                </Grid>
                <Grid item size={12} sx={{ marginTop: -2 }}>
                  <Typography variant="subtitle2" color="error" fontWeight="bold" gutterBottom>*กรุณากรอกชื่อโดเมนโดยใช้ชื่อบริษัทภาษาอังกฤษเช่น happysofth</Typography>
                </Grid>

                <Grid item size={12}>
                  <TextField
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="<ชื่ออีเมล>@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Email :
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ marginTop: 1, marginBottom: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ textAlign: 'center' }}>
                  กรุณาเลือก package ที่ต้องการใช้งาน
                </Typography>
              </Divider>
              <Box sx={{ overflowX: 'auto', display: 'flex', gap: 3, mt: 2, paddingBottom: 2 }}>
                <Box sx={{ minWidth: 300, flex: '0 0 auto' }}>
                  <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
                    <CardActionArea
                      onClick={() => handleSelectedPlan('lite', 900, 10)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        border: selectedPlan?.name === 'lite' ? `2px solid ${theme.palette.primary.main}` : 'none',
                        backgroundColor: selectedPlan?.name === 'lite' ? theme.palette.action.hover : 'transparent',
                      }}
                    >
                      <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: '100%', height: '3vh' }}>
                        <Grid container spacing={2}>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h5" component="div" color="white" fontWeight="bold">
                              Lite
                            </Typography>
                          </Grid>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h6" component="div" color="white" fontWeight="bold" textAlign="right" sx={{ marginRight: 3 }}>
                              ฿900/เดือน
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            '& svg': {
                              m: 1,
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            - การลงเวลาเข้าออกงาน <br />
                            - ข้อมูลประวัติพนักงาน <br />
                            - คำนวณเงินเดือนอัตโนมัติ <br />
                            - จัดการกะการทำงาน <br />
                            - ยื่นเอกสาร-อนุมัติเอกสาร <br />
                            - การฝึกอบรม(สูงสุด 1 คอร์ส) <br />
                            - รายงาน HR และ Payroll <br />
                            - ระบบสแกนใบหน้า <br />
                            - ปฏิทินการทำงาน
                          </Typography>
                          <Divider orientation="vertical" variant="middle" flexItem sx={{ marginLeft: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: "bold", color: theme.palette.primary.dark }} >
                                เหมาะสำหรับ <br />
                                พนักงาน
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: theme.palette.primary.dark,
                                  fontWeight: "bold",
                                  lineHeight: 1.4,
                                  marginLeft: 2
                                }}
                              >
                                10 <br />
                                คน
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>

                <Box sx={{ minWidth: 300, flex: '0 0 auto' }}>
                  <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
                    <CardActionArea
                      onClick={() => handleSelectedPlan('basic', 1500, 20)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        border: selectedPlan?.name === 'basic' ? `2px solid ${theme.palette.primary.main}` : 'none',
                        backgroundColor: selectedPlan?.name === 'basic' ? theme.palette.action.hover : 'transparent',
                      }}
                    >
                      <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: '100%', height: '3vh' }}>
                        <Grid container spacing={2}>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h5" component="div" color="white" fontWeight="bold">
                              Basic
                            </Typography>
                          </Grid>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h6" component="div" color="white" fontWeight="bold" textAlign="right" sx={{ marginRight: 3 }}>
                              ฿1,500/เดือน
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            '& svg': {
                              m: 1,
                            },
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ color: 'red' }}>
                              - ทุกฟีเจอร์ในLite และ
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              - การฝึกอบรม(สูงสุด 2 คอร์ส)  <br />
                              - รายงาน HR และ Payroll  <br />
                              - ประกันสังคมและภาษี  <br />
                              - กองทุนสำรองเลี้ยงชีพ  <br />
                              - กำหนดสิทธิ์เข้าถึงข้อมูล  <br />
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" variant="middle" flexItem sx={{ marginLeft: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: "bold", color: theme.palette.primary.dark }} >
                                เหมาะสำหรับ <br />
                                พนักงาน
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: theme.palette.primary.dark,
                                  fontWeight: "bold",
                                  lineHeight: 1.4,
                                  marginLeft: 2
                                }}
                              >
                                20 <br />
                                คน
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>

                <Box sx={{ minWidth: 300, flex: '0 0 auto' }}>
                  <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
                    <CardActionArea
                      onClick={() => handleSelectedPlan('standard', 2900, 50)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        border: selectedPlan?.name === 'standard' ? `2px solid ${theme.palette.primary.main}` : 'none',
                        backgroundColor: selectedPlan?.name === 'standard' ? theme.palette.action.hover : 'transparent',
                      }}
                    >
                      <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: '100%', height: '3vh' }}>
                        <Grid container spacing={2}>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h5" component="div" color="white" fontWeight="bold">
                              Standard
                            </Typography>
                          </Grid>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h6" component="div" color="white" fontWeight="bold" textAlign="right" sx={{ marginRight: 3 }}>
                              ฿2,900/เดือน
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            '& svg': {
                              m: 1,
                            },
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ color: 'red' }}>
                              - ทุกฟีเจอร์ในBasic และ
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              - การฝึกอบรม(สูงสุด 3 คอร์ส) <br />
                              - ระบบรับสมัครพนักงาน <br />
                              - ประกาศข่าวสาร
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" variant="middle" flexItem sx={{ marginLeft: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: "bold", color: theme.palette.primary.dark }} >
                                เหมาะสำหรับ <br />
                                พนักงาน
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: theme.palette.primary.dark,
                                  fontWeight: "bold",
                                  lineHeight: 1.4,
                                  marginLeft: 2
                                }}
                              >
                                50 <br />
                                คน
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>

                <Box sx={{ minWidth: 300, flex: '0 0 auto' }}>
                  <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
                    <CardActionArea
                      onClick={() => handleSelectedPlan('pro', 3900, 100)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        border: selectedPlan?.name === 'pro' ? `2px solid ${theme.palette.primary.main}` : 'none',
                        backgroundColor: selectedPlan?.name === 'pro' ? theme.palette.action.hover : 'transparent',
                      }}
                    >
                      <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: '100%', height: '3vh' }}>
                        <Grid container spacing={2}>
                          <Grid item size={6}>
                            <Box display="flex" alignItems="center" justifyContent="left">
                              <Typography gutterBottom variant="h5" component="div" color="white" fontWeight="bold">
                                Pro
                              </Typography>
                              <Box sx={{
                                backgroundColor: "white",
                                width: 55,
                                height: 20,
                                borderRadius: 5,
                                textAlign: "center",
                                marginLeft: 1,
                                marginTop: -0.5
                              }}>
                                <Typography
                                  gutterBottom
                                  variant="subtitle2"
                                  fontSize="12px"
                                  component="div"
                                  color="red"
                                  fontWeight="bold"
                                >
                                  *ยอดนิยม
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item size={6}>
                            <Typography gutterBottom variant="h6" component="div" color="white" fontWeight="bold" textAlign="right" sx={{ marginRight: 3 }}>
                              ฿3,900/เดือน
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            '& svg': {
                              m: 1,
                            },
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ color: 'red' }}>
                              - ทุกฟีเจอร์ในStandard และ
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              - การฝึกอบรม(สูงสุด 4 คอร์ส) <br />
                              - ระบบรับสมัครพนักงาน <br />
                              - ประกาศข่าวสาร <br />
                              - ที่ปรึกษา
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" variant="middle" flexItem sx={{ marginLeft: 2, border: `1px solid ${theme.palette.primary.dark}` }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: "bold", color: theme.palette.primary.dark }} >
                                เหมาะสำหรับ <br />
                                พนักงาน
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: theme.palette.primary.dark,
                                  fontWeight: "bold",
                                  lineHeight: 1.4,
                                  marginLeft: 2
                                }}
                              >
                                100 <br />
                                คน
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              </Box>

              <Divider sx={{ marginTop: 1.5, marginBottom: 1 }} />
              <Button variant="contained" color="info" fullWidth sx={{
                marginTop: 2,
                borderRadius: 15,
              }}
                onClick={() => {
                  // const trimmedDomain = domain.trim().toLowerCase();

                  // if (!trimmedDomain.endsWith(".humantech.com")) {
                  //   alert("กรุณากรอก domain ให้ลงท้ายด้วย .humantech.com เท่านั้น");
                  //   return;
                  // }

                  handleRequest();
                }}
              >
                ส่งคำขอ
              </Button>
            </CardContent>
          </Box>
        </Box>
      </Card>
      {/* <div>
        <h3>สมัครใช้งานระบบ</h3>

        <div>"Domain (เช่น yoursubdomain.humantech.com)"</div>
        <input
          placeholder="Domain (เช่น yoursubdomain.humantech.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={() => {
            const trimmedDomain = domain.trim().toLowerCase();

            if (!trimmedDomain.endsWith(".humantech.com")) {
              alert("กรุณากรอก domain ให้ลงท้ายด้วย .humantech.com เท่านั้น");
              return;
            }

            handleRequest();
          }}
        >
          ส่งคำขอ
        </button>
      </div> */}
    </Container>

  );
};

export default RequestDomainForm;
