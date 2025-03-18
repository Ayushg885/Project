const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const compiler = require("compilex");

const app = express();
const options = { stats: true };
compiler.init(options);

// ✅ Enable CORS (Vercel ke liye zaroori)
app.use(cors());
  
app.use(bodyParser.json());

// ✅ Serve the HTML file (for debugging)
app.get("/", (req, res) => {
    res.send("Compiler API is running...");
});



// ✅ FIX: Correct API Route
app.post("/api/compile", async (req, res) => {
    const { code, input, lang } = req.body;
    const envData = { OS: "linux", cmd: "g++" }; // ✅ Linux support for Vercel

    try {
        if (lang === "cpp") {
            compiler.compileCPPWithInput(envData, code, input || "", (data) => {
                res.send(data.output ? data : { output: "error" });
            });
        } else if (lang === "java") {
            compiler.compileJavaWithInput(envData, code, input || "", (data) => {
                res.send(data.output ? data : { output: "error" });
            });
        } else if (lang === "py") {
            compiler.compilePythonWithInput(envData, code, input || "", (data) => {
                res.send(data.output ? data : { output: "error" });
            });
        } else {
            res.status(400).send({ output: "Invalid Language" });
        }

        // ✅ Cleanup temporary files
        setTimeout(() => compiler.flush(() => console.log("Temporary files deleted.")), 5000);
    } catch (e) {
        console.error("Compilation Error:", e);
        res.status(500).send({ output: "Server Compilation Error", error: e.toString() });
    }
});

// ✅ Serverless Function Export for Vercel
module.exports = app;
