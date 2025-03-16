const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const compiler = require("compilex");

const app = express();
const options = { stats: true };
compiler.init(options);

// ✅ Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Home Route
app.get("/", (req, res) => {
    res.send("Compiler API is running...");
});

// ✅ Compilation Route
app.post("/api/compile", async (req, res) => {
    var { code, input, lang } = req.body;
    var envData = { OS: "linux", cmd: "g++" }; // Linux support for Vercel

    try {
        if (lang === "cpp") {
            if (!input) {
                compiler.compileCPP(envData, code, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            } else {
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            }
        } else if (lang === "java") {
            if (!input) {
                compiler.compileJava(envData, code, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            } else {
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            }
        } else if (lang === "py") {
            if (!input) {
                compiler.compilePython(envData, code, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            } else {
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    res.send(data.output ? data : { output: "error" });
                });
            }
        }

        // ✅ Cleanup temporary files
        setTimeout(() => {
            compiler.flush(() => {
                console.log("Temporary files deleted.");
            });
        }, 5000);
    } catch (e) {
        console.error("Compilation Error:", e);
        res.status(500).send({ output: "Server Compilation Error", error: e.toString() });
    }
});

// ✅ Server listening for Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Vercel ke liye zaroori
