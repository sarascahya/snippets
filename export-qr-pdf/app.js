const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello, this is sample app for export QR to PDF!");
});

app.listen(port, () => {
  console.log(`Export QR to PDF app listening at http://localhost:${port}`);
});
