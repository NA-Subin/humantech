import React from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Divider
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";

export default function FileUploadCard({
  file,
  onFileChange,
  label = "แนบไฟล์",
  type = false, // true = image, false = pdf
  onTypeChange,
}) {
  return (
    <React.Fragment>
      <Grid item size={12}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginBottom: -1 }}>{label}</Typography>
      </Grid>

      {!file ? (
        <>
          <Grid item size={5.5}>
            <Button
              variant="contained"
              component="label"
              size="small"
              fullWidth
              sx={{
                height: "70px",
                backgroundColor: !type ? "#ff5252" : "#eeeeee",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => onTypeChange(false)}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color={!type ? "white" : "textDisabled"}
                gutterBottom
              >
                เอกสาร
              </Typography>
              <PictureAsPdfIcon
                sx={{
                  fontSize: 50,
                  color: !type ? "white" : "lightgray",
                  marginLeft: 2,
                }}
              />
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                }}
              />
            </Button>
          </Grid>
          <Grid item size={1} display="flex" justifyContent="center" alignItems="center" >
            <Typography variant="h6" fontWeight="bold" gutterBottom>หรือ</Typography>
          </Grid>
          <Grid item size={5.5}>
            <Button
              variant="contained"
              component="label"
              size="small"
              fullWidth
              sx={{
                height: "70px",
                backgroundColor: type ? "#29b6f6" : "#eeeeee",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => onTypeChange(true)}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color={type ? "white" : "textDisabled"}
                gutterBottom
              >
                รูปภาพ
              </Typography>
              <ImageIcon
                sx={{
                  fontSize: 50,
                  color: type ? "white" : "lightgray",
                  marginLeft: 2,
                }}
              />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                }}
              />
            </Button>
          </Grid>
        </>
      ) : (
        <>
          <Grid item size={12} textAlign="center">
            <Box display="flex" justifyContent="center" alignItems="center">
              {file?.type.startsWith("image/") ? (
                <Box
                  sx={{
                    width: "50%",
                    height: 200,
                    borderRadius: 5,
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #29b6f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ height: "100%", borderRadius: 8 }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "50%",
                    height: 200,
                    borderRadius: 5,
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ff5252",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box>
                    <Typography color="error" variant="h3" gutterBottom>
                      PDF
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {file.name}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item size={12} textAlign="center">
            <Button
              variant="outlined"
              color="error"
              onClick={() => onFileChange(null)}
            >
              ลบไฟล์
            </Button>
          </Grid>

        </>
      )}
      <Grid item size={12}><Divider sx={{ mt: 1 }} /></Grid>
    </React.Fragment>
  );
}
