const fs = require("fs");
const filePath = "./static/file/example.pdf";

module.exports = {
  devServer: {
    // host: 'localhost',
    port: 5020,
    before: (app) => {
      app.get("/api/pdf", (req, res) => {
        let size = fs.statSync(filePath).size;
        let file = fs.createReadStream(filePath);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=" + "pdfDemo.pdf", //告诉浏览器这是一个需要下载的文件
          "Content-Length": size,
        });
        file.pipe(res);
      });
    },
  },
};
