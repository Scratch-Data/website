const express = require("express");
const serveIndex = require("serve-index");
const glob = require("glob");
const JSZip = require("jszip");
const zip = new JSZip();
const path = require("path");
const app = express();
const fs = require("fs");
const fetch = require("node-fetch");
const cors = require("cors");
const comments = require("./comments.json");
const index = require("./index.json");

app.use(
  "/data/",
  express.static("users"),
  serveIndex("users", { icons: true })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Nothing to see here, move along.");
});

app.get("/comments", cors(), (req, res) => {
  res.setHeader(
    "Cache-Control",
    "public; only-if-cached; max-age=600000; s-maxage=600000"
  );
  res.json(comments);
});

app.get("/comments/lunr", cors(), (req, res) => {
  res.setHeader(
    "Cache-Control",
    "public; only-if-cached; max-age=600000; s-maxage=600000"
  );
  res.json(index);
});

app.get("/search/autocomplete/:query", (req, res) => {
  fetch(
    `https://www.google.com/complete/search?q=${encodeURIComponent(
      req.params.query
    )}&client=gws-wiz&xssi=t`,
    {
      headers: {
        "User-Agent": "Mozilla 5.0 (ScratchData)",
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        res.status(500);
        res.json({
          data: null,
          error: `Google API responded with ${response.status}.`,
        });
      }
    })
    .then((data) => {
      data = JSON.parse(data.slice(4).trim())[0].map((e) => e[0]);
      res.status(200);
      res.json({
        data: data,
        error: null,
      });
    });
});

app.listen(3000, () => {
  console.log("Server started");
});

createZip();
setInterval(createZip, 30 * 60 * 1000);

function createZip() {
  glob("users/*.json", async (err, files) => {
    if (err) return console.error(err);
    for (let file of files) {
      zip.file(path.basename(file), await fs.promises.readFile(file));
    }
    zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
      fs.promises.writeFile("public/comments.zip", content);
    });
  });
}
