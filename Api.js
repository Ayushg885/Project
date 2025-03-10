const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const compiler = require("compilex");

const app = express();
const options = { stats: true };
compiler.init(options);

app.use(bodyParser.json());

// ✅ Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// ✅ Serve the HTML file
app.get("/", (req, res) => {
    compiler.flush(function(){
        console.log("deleted");
    })
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/compile", function (req, res) {
    var code = req.body.code
    var input = req.body.input
    var lang = req.body.lang
    var envData = { OS: "windows", cmd: "g++" };
    try {
        if (lang == "cpp") {
            if (!input) {
                var envData = { OS: "windows", cmd: "g++",options:{timeout:2000}};
                compiler.compileCPP(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" });
                    }
                    //data.error = error message 
                    //data.output = output value
                });
            }
            else {
                var envData = { OS: "windows", cmd: "g++",options:{timeout:2000}};
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" });
                    }
                });
            }
        }
        if (lang == "java") {
                if (!input) {
                    var envData = { OS: "windows" };
                    compiler.compileJava(envData, code, function (data) {
                        if (data.output) {
                            res.send(data);
                        }
                        else {
                            res.send({ output: "error" });
                        }
                        //data.error = error message 
                        //data.output = output value
                    });
                }
                else {
                    var envData = { OS: "windows" };
                    compiler.compileJavaWithInput(envData, code, input, function (data) {
                        if (data.output) {
                            res.send(data);
                        }
                        else {
                            res.send({ output: "error" });
                        }
                    });
                }
            }
        if (lang == "py") {
            if (!input) {
                var envData = { OS: "windows" };
                compiler.compilePython(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" });
                    }
                    //data.error = error message 
                    //data.output = output value
                });
            }
            else {
                var envData = { OS: "windows" };
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" });
                    }
                });
            }
        }
        compiler.flush(function () {
            console.log("Temporary files deleted.");
        });
    }

    catch (e) {
        console.error("Compilation Error:", e);
    }    
})

app.listen(3365, () => {
    console.log("Server is running on http://localhost:3365");
});
