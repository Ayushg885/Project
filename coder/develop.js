document.addEventListener("DOMContentLoaded", function () {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

    require(["vs/editor/editor.main"], function () {
        if (typeof monaco === "undefined") {
            console.error("❌ Error: Monaco Editor failed to load!");
            return;
        }

        const htmlContainer = document.getElementById("HTMLcode");
        const cssContainer = document.getElementById("CSScode");
        const jsContainer = document.getElementById("JScode");
        const livePreview = document.getElementById("livePreview");
        const consoleContainer = document.getElementById("console-container");
        const consoleOutput = document.getElementById("console-output");
        
        if (!htmlContainer || !cssContainer || !jsContainer || !livePreview || !consoleContainer || !consoleOutput) {
            console.error("❌ Error: Missing required elements.");
            return;
        }
        function getSavedCode(key, defaultValue) {
            return localStorage.getItem(key) || defaultValue;
        }

        window.monaco = monaco;

        window.editors = {
            html: monaco.editor.create(htmlContainer, {
                value: getSavedCode("htmlCode", "<!-- Write your HTML here -->"),
                language: "html",
                theme: "vs-dark",
                automaticLayout: true
            }),
            css: monaco.editor.create(cssContainer, {
                value: getSavedCode("cssCode", "/* Write your CSS here */"),
                language: "css",
                theme: "vs-dark",
                automaticLayout: true
            }),
            js: monaco.editor.create(jsContainer, {
                value: getSavedCode("jsCode", "// Write your JavaScript here"),
                language: "javascript",
                theme: "vs-dark",
                automaticLayout: true
            })
        };

        function autoSaveCode() {
            localStorage.setItem("htmlCode", editors.html.getValue());
            localStorage.setItem("cssCode", editors.css.getValue());
            localStorage.setItem("jsCode", editors.js.getValue());
        }

        function detectDangerousCode(js) {
            const riskyPatterns = [
                /while\s*\(\s*true\s*\)/gi,
                /for\s*\(\s*;\s*;\s*\)/gi,
                /setInterval\s*\(/gi,
                /setTimeout\s*\(\s*function\s*\(\)\s*{\s*while\s*\(/gi,
                /document\.write\s*\(/gi,
                /while\s*\(\s*[a-zA-Z_$][\w$]*\s*[<>=!]/gi  // NEW: detects like while(i<3), while(flag==true)
            ];
            return riskyPatterns.some(pattern => pattern.test(js));
        }
        
        
        
        function updateOutput() {
            const htmlCode = editors.html.getValue();
            const cssCode = editors.css.getValue();
            const jsCode = editors.js.getValue();
        
            const livePreview = document.getElementById("livePreview");
            const consoleOutput = document.getElementById("console-output");
        
            // 🔒 Check for dangerous/infinite patterns
            const riskyPatterns = [
                /while\s*\(\s*true\s*\)/gi,
                /for\s*\(\s*;\s*;\s*\)/gi,
                /setInterval\s*\(/gi,
                /setTimeout\s*\(\s*function\s*\(\)\s*{\s*while\s*\(/gi,
                /document\.write\s*\(/gi
            ];
            if (riskyPatterns.some(p => p.test(jsCode))) {
                consoleOutput.innerHTML += "<p style='color:orange;'>⚠️ Potential infinite loop or dangerous code. Execution skipped!</p>";
                return;
            }
        
            // 🧹 Clear console before each run
            consoleOutput.innerHTML = "";
        
            // 🧠 Full safe HTML + JS code
            const fullCode = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${cssCode}</style>
                </head>
                <body>
                    ${htmlCode}
                </body>
                <script>
                    (function() {
                        var oldLog = console.log;
                        var oldError = console.error;
                        var oldWarn = console.warn;
                        var consoleOutput = window.parent.document.getElementById("console-output");
        
                        console.log = function(message) {
                            oldLog.apply(console, arguments);
                            consoleOutput.innerHTML += '<p style="color:white;">[LOG] ' + message + '</p>';
                            consoleOutput.scrollTop = consoleOutput.scrollHeight;
                        };
        
                        console.error = function(message) {
                            oldError.apply(console, arguments);
                            consoleOutput.innerHTML += '<p style="color:red;">[ERROR] ' + message + '</p>';
                            consoleOutput.scrollTop = consoleOutput.scrollHeight;
                        };
        
                        console.warn = function(message) {
                            oldWarn.apply(console, arguments);
                            consoleOutput.innerHTML += '<p style="color:yellow;">[WARN] ' + message + '</p>';
                            consoleOutput.scrollTop = consoleOutput.scrollHeight;
                        };
                    })();
        
                    // 🛡️ Safe delayed execution to avoid blocking
                    setTimeout(() => {
                        try {
                            ${jsCode}
                        } catch (e) {
                            console.error("Runtime Error:", e);
                        }
                    }, 0);
                <\/script>
                </html>
            `;
        
            // ✅ Inject safe code into iframe
            livePreview.srcdoc = fullCode;
        
            // ⏱ Kill iframe if it doesn't respond in 4s
            setTimeout(() => {
                const iframeDoc = livePreview.contentDocument || livePreview.contentWindow?.document;
                if (!iframeDoc || iframeDoc.readyState !== "complete") {
                    livePreview.srcdoc = `<p style='color:red;padding:1em;'>⛔ Code execution stopped: possible infinite loop.</p>`;
                    consoleOutput.innerHTML += "<p style='color:red;'>⚠️ Auto-killed due to long-running or unsafe script.</p>";
                }
            }, 4000); // You can tweak timeout (ms)
        }        

        function debounce(func, delay) {
            let timeout;
            return function () {
                clearTimeout(timeout);
                timeout = setTimeout(func, delay);
            };
        }

        const debouncedUpdate = debounce(() => {
            updateOutput();
            autoSaveCode();
        }, 100);

        Object.values(editors).forEach(editor => {
            editor.onDidChangeModelContent(debouncedUpdate);
        });

        
        updateOutput();

        document.getElementById("downloadCode").addEventListener("click", function () {
            const codeData = {
                html: editors.html.getValue(),
                css: editors.css.getValue(),
                js: editors.js.getValue(),
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(codeData));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "codeBackup.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        });

        document.getElementById("uploadCode").addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const uploadedData = JSON.parse(e.target.result);
                    editors.html.setValue(uploadedData.html || "");
                    editors.css.setValue(uploadedData.css || "");
                    editors.js.setValue(uploadedData.js || "");
                    updateOutput();
                } catch (error) {
                    console.error("Error loading file:", error);
                }
            };
            reader.readAsText(file);
        });

        document.querySelector('.menu-btn').addEventListener('click', function () {
            document.getElementById('draw-menu').classList.toggle('active');
        });

        document.getElementById("clear-console").addEventListener("click", function () {
            consoleOutput.innerHTML = "";
        });
    });
});
