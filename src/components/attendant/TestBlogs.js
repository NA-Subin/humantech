import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button, Grid, Card, CardMedia, CardContent, Link } from "@mui/material";
import { Helmet } from "react-helmet";

// ตัว component สำหรับ render JSON content
const RenderComponent = ({ item }) => {
  const { type, props } = item;

  switch (type) {
    case "Typography":
      return <Typography {...props}>{props.children}</Typography>;
    case "Box":
      return (
        <Box {...props}>
          {props.children &&
            props.children.map((child, idx) => <RenderComponent key={idx} item={child} />)}
        </Box>
      );
    case "Image":
      return <Box component="img" {...props} />;
    case "CardArticle":
      return (
        <Card sx={props.sx}>
          <CardMedia
            component="img"
            height={props.height}
            image={props.image}
            alt={props.title}
            loading="lazy"
            decoding="async"
            sx={props.imageSx}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={props.titleSx}>
              {props.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={props.descSx}>
              {props.desc.length > 100 ? props.desc.slice(0, 100) + "..." : props.desc}
            </Typography>
          </CardContent>
          <Box textAlign="center" pb={2}>
            <Button
              component={Link}
              href={props.link}
              target="_blank"
              variant="outlined"
              size="small"
              sx={props.buttonSx}
            >
              อ่านเพิ่มเติม
            </Button>
          </Box>
        </Card>
      );
    default:
      return null;
  }
};

export default function FullBlogEditor() {
  const [blogJSON, setBlogJSON] = useState({
    helmet: {
      title: "ไขข้อสงสัย HRBP กับ HRM คืออะไร? และต่างกันอย่างไรบ้าง?",
      meta: [
        {
          name: "description",
          content:
            "การบริหารทรัพยากรบุคคลในองค์กรไม่ได้มีเพียงหน้าที่ดูแลเอกสารหรือจัดการเงินเดือนเท่านั้น แต่ยังมีบทบาทเชิงกลยุทธ์ที่ช่วยให้องค์กรเติบโตอย่างยั่งยืน ซึ่งในปัจจุบัน หลายคนอาจสงสัยว่า HRM (Human Resource Management) และ HRBP (Human Resource Business Partner) แตกต่างกันอย่างไร ทั้งสองตำแหน่งต่างมีความสำคัญต่อการพัฒนาองค์กร",
        },
        {
          name: "keywords",
          content:
            "ไขข้อสงสัย HRBP กับ HRM ,HRM คืออะไร,โปรแกรม HR,โปรแกรม HR ที่ตอบโจทย์ธุรกิจ SME,โปรแกรม HR สำหรับ SME,โปรแกรม HR ออนไลน์,โปรแกรมจัดการงานสำหรับฝ่ายบุคคล,โปรแกรมบริหารทรัพยากรบุคคล",
        },
      ],
      link: [
        { rel: "canonical", href: "https://www.humantech.asia/new-80" },
        // preload image ตัวอย่าง
      ],
    },
    body: [
      {
        type: "Image",
        props: {
          src: "https://via.placeholder.com/800x400", // news72 placeholder
          alt: "เปรียบเทียบHRM และ HRBP",
          sx: { width: "100%", backgroundColor: "#fff", mb: 2 },
        },
      },
      {
        type: "Box",
        props: {
          sx: { p: 3, backgroundColor: "#fff", borderRadius: 1, boxShadow: 1 },
          children: [
            {
              type: "Typography",
              props: {
                variant: "h5",
                fontWeight: "bold",
                gutterBottom: true,
                sx: { color: "#212121" },
                children:
                  "ไขข้อสงสัย HRBP กับ HRM คืออะไร? และต่างกันอย่างไรบ้าง?",
              },
            },
            {
              type: "Typography",
              props: {
                variant: "body1",
                paragraph: true,
                sx: { color: "#212121" },
                children:
                  "การบริหารทรัพยากรบุคคลในองค์กรไม่ได้มีเพียงหน้าที่ดูแลเอกสารหรือจัดการเงินเดือนเท่านั้น แต่ยังมีบทบาทเชิงกลยุทธ์ที่ช่วยให้องค์กรเติบโตอย่างยั่งยืน ซึ่งในปัจจุบัน หลายคนอาจสงสัยว่า HRM (Human Resource Management) และ HRBP (Human Resource Business Partner) แตกต่างกันอย่างไร ทั้งสองตำแหน่งต่างมีความสำคัญต่อการพัฒนาองค์กร แต่บทบาทและขอบเขตงานกลับไม่เหมือนกัน บทความนี้จะพาคุณมาทำความเข้าใจให้ชัดเจน",
              },
            },
            // เพิ่มส่วน HRM, HRBP, bullet list, สรุป ตามตัวอย่าง
            {
              type: "Typography",
              props: {
                variant: "h6",
                fontWeight: "bold",
                gutterBottom: true,
                sx: { mt: 3, color: "#212121" },
                children: "HRM คืออะไร",
              },
            },
            {
              type: "Typography",
              props: {
                variant: "body1",
                paragraph: true,
                sx: { color: "#212121" },
                children:
                  "HRM (Human Resource Management) คือการจัดการทรัพยากรบุคคลในเชิงปฏิบัติ (Operational) โดยเน้นกระบวนการพื้นฐาน เช่น การสรรหาพนักงาน การจัดทำเงินเดือน สวัสดิการ การบันทึกเวลา การลางาน รวมถึงการพัฒนาและฝึกอบรมบุคลากร HRM เปรียบเสมือน “ฝ่ายงานสนับสนุน” ที่ช่วยให้องค์กรดำเนินงานได้ราบรื่น",
              },
            },
            {
              type: "Typography",
              props: {
                variant: "body1",
                paragraph: true,
                sx: { color: "#1976d2", textDecoration: "none" },
                children:
                  "อ่านเพิ่มเติมเกี่ยวกับ HRM ได้ที่ https://www.humantech.asia/new-80",
              },
            },
          ],
        },
      },
      // สามารถต่อ body เพิ่มทุกส่วนเหมือนตัวอย่างได้
    ],
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Helmet */}
      <Helmet>
        <title>{blogJSON.helmet.title}</title>
        {blogJSON.helmet.meta.map((m, i) => (
          <meta key={i} name={m.name} content={m.content} />
        ))}
        {blogJSON.helmet.link.map((l, i) => (
          <link key={i} {...l} />
        ))}
      </Helmet>

      <Typography variant="h4" gutterBottom>
        Blog Editor (Live Preview)
      </Typography>

      {/* JSON Editor */}
      <Box sx={{ mb: 4 }}>
        <TextField
          multiline
          minRows={10}
          fullWidth
          value={JSON.stringify(blogJSON, null, 2)}
          onChange={(e) => {
            try {
              setBlogJSON(JSON.parse(e.target.value));
            } catch (err) {
              console.error("JSON parse error", err);
            }
          }}
        />
      </Box>

      {/* Live Preview */}
      <Box sx={{ border: "1px solid #ddd", p: 3 }}>
        {blogJSON.body.map((item, idx) => (
          <RenderComponent key={idx} item={item} />
        ))}
      </Box>
    </Container>
  );
}
