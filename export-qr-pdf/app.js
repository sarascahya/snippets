const express = require("express");
const app = express();
const port = 3000;
const { chunk } = require("lodash"); // for separate array data
const { format } = require("date-fns"); // for date formating
// import font from `font` folder
const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};
let PdfPrinter = require("pdfmake");
let printer = new PdfPrinter(fonts);
const maxColumn = 4; // column for QR Code

// sample data on array
const exportedData = [
  { code: "Book-1" },
  { code: "Book-2" },
  { code: "Book-3" },
  { code: "Book-4" },
  { code: "Book-5" },
];

// can access on http://localhost:3000/
app.get("/", (req, res) => {
  res.send("Hello, this is sample app for export QR to PDF!");
});

// can access on http://localhost:3000/export/
app.get("/export", (req, res) => {
  // variable for save array data
  let qr = [];
  let text = [];
  let templates = [];

  // separate data
  let pagedData = chunk(exportedData, [maxColumn]);

  pagedData.map((data) => {
    data.forEach((stock) => {
      qr.push({ qr: stock.code, style: ["center"], fit: "100" });
      text.push({
        text: stock.code,
        margin: [0, 4, 0, 20],
        style: ["center"],
      });
    });

    if (qr.length < maxColumn) {
      const blank = maxColumn - qr.length;
      for (let index = 0; index < blank; index++) {
        qr.push("");
        text.push("");
      }
    }
    templates.push(qr);
    templates.push(text);
    qr = [];
    text = [];
  });

  // write to pdf
  const docDefinition = {
    content: [
      {
        text: "Books Stock",
        style: "header",
      },
      {
        text: `${format(new Date(), "d MMMM yyyy")}`,
        style: "subheader",
      },
      {
        layout: "noBorders",
        table: {
          widths: [...Array(maxColumn)].map(() => "*"),
          body: [...templates],
        },
      },
    ],

    // styling for PDF, check the documentation for more detail
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 2],
      },
      subheader: {
        fontSize: 10,
        alignment: "center",
        margin: [0, 0, 0, 15],
      },
      center: {
        alignment: "center",
      },
    },
  };

  // creating the PDF file
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(res);
  pdfDoc.end();

  // download file
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=books-stock-${new Date().getTime()}.pdf`,
  });

  res.on("finish", resolve);
});

app.listen(port, () => {
  console.log(`Export QR to PDF app listening at http://localhost:${port}`);
});
