const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const compiler = require("compilex");

const app = express();
const options = { stats: true };
compiler.init(options);

// ✅ Enable CORS (Vercel ke liye zaroori)
app.use(cors({
    origin: function(origin, callback){
      // Bypass the requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  }));
  
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
