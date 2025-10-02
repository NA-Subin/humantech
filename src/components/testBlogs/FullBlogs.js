import React, { useState } from "react";
import { Container, Box, Typography, TextField, MenuItem } from "@mui/material";
import { Helmet } from "react-helmet";
import RenderComponent from "./RenderComponent";

// ✅ import blogs
import blog1 from "./blogs/Blogs1.json";
import blog2 from "./blogs/Blogs2.json";

const blogs = [
  { id: "blog1", name: "บทความ HRBP vs HRM", data: blog1 },
  { id: "blog2", name: "บทความบริหารทีม", data: blog2 }
];

export default function FullBlogEditor() {
  const [selectedBlog, setSelectedBlog] = useState(blogs[0]);
  const [blogJSON, setBlogJSON] = useState(selectedBlog.data);

  const handleChangeBlog = (id) => {
    const blog = blogs.find(b => b.id === id);
    setSelectedBlog(blog);
    setBlogJSON(blog.data);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Helmet>
        <title>{blogJSON.helmet.title}</title>
        {blogJSON.helmet.meta?.map((m, i) => (
          <meta key={i} name={m.name} content={m.content} />
        ))}
        {blogJSON.helmet.link?.map((l, i) => (
          <link key={i} {...l} />
        ))}
      </Helmet>

      <Typography variant="h4" gutterBottom>
        Blog Editor (Live Preview)
      </Typography>

      {/* ✅ Selector สำหรับเปลี่ยน Blog */}
      <TextField
        select
        fullWidth
        size="small"
        value={selectedBlog.id}
        onChange={(e) => handleChangeBlog(e.target.value)}
        sx={{ mb: 2 }}
      >
        {blogs.map((b) => (
          <MenuItem key={b.id} value={b.id}>
            {b.name}
          </MenuItem>
        ))}
      </TextField>

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
