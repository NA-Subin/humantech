import { Box, Card, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material";

const PlanCard = ({
  name,
  price,
  features,
  employees,
  isSelected,
  onSelect,
  tag,
  highlight,
  theme
}) => {
  return (
    <Box sx={{ minWidth: 300, flex: "0 0 auto", position: "relative" }}>
      <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
        <CardActionArea
          onClick={onSelect}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            border: isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
            backgroundColor: isSelected ? theme.palette.action.hover : "transparent",
          }}
        >
          {isSelected && (
            <Box
              sx={{
                position: "absolute",
                bottom: 35,
                left: -65,
                backgroundColor: theme.palette.warning.main,
                color: "white",
                px: 2,
                py: 0.5,
                transform: "rotate(45deg)",
                fontWeight: "bold",
                fontSize: 15,
                zIndex: 1,
                width: 200,
                textAlign: "center",
              }}
            >
              เลือกแพ็กเกจนี้
            </Box>
          )}
          <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: "100%", height: "3vh" }}>
            <Grid container>
              <Grid item size={6}>
                <Box display="flex" alignItems="center">
                  <Typography variant="h5" color="white" fontWeight="bold">
                    {name}
                  </Typography>
                  {highlight && (
                    <Box
                      sx={{
                        backgroundColor: "white",
                        ml: 1,
                        mt: -0.5,
                        px: 1,
                        borderRadius: 5,
                        height: 20,
                      }}
                    >
                      <Typography fontSize="12px" fontWeight="bold" color="red">
                        {tag}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item size={6}>
                <Typography
                  variant="h6"
                  color="white"
                  fontWeight="bold"
                  textAlign="right"
                  sx={{ mr: 3 }}
                >
                  {price === 0 ? "ทดสอบฟรี" : `฿${price}/เดือน` }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>

          <CardContent>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
                color: "text.secondary",
              }}
            >
              <Box>
                {features}
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, border: `1px solid ${theme.palette.primary.dark}` }}
              />

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color={theme.palette.primary.dark}
                >
                  {name === "Attendant" ? "ภายใน" : "เหมาะสำหรับ"}
                  <br />
                  {name === "Attendant" ? "ระยะเวลา" : "พนักงาน"}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={theme.palette.primary.dark}
                  sx={{ lineHeight: 1.4 }}
                >
                  {name === "Attendant" ? "1" : employees}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.dark}>
                  {name === "Attendant" ? "เดือน" : "คน"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default PlanCard;