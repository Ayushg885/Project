const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");
const compiler = require("compilex");

const app = express();
const options = { stats: true };
compiler.init(options);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(5578, () => console.log("Server running on port 5578"));
