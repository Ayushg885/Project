document.addEventListener("DOMContentLoaded", function () {
    // ✅ Load Monaco Editor
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

    require(["vs/editor/editor.main"], function () {
        if (typeof monaco === "undefined") {
            console.error("❌ Error: Monaco Editor failed to load!");
            return;
        }
        
        // ✅ Get editor containers
        const htmlContainer = document.getElementById("HTMLcode");
        const cssContainer = document.getElementById("CSScode");
        const jsContainer = document.getElementById("JScode");
        const livePreview = document.getElementById("livePreview");
        
        if (!htmlContainer || !cssContainer || !jsContainer || !livePreview) {
            console.error("❌ Error: One or more required elements are missing from the DOM.");
            return;
        }

        
        
        function getSavedCode(key, defaultValue) {
            return localStorage.getItem(key) || defaultValue;
        }
        
        
        
        window.monaco = monaco;

        // ✅ Initialize Monaco Editors
        window.editors = {
            html: monaco.editor.create(htmlContainer, {
                value: getSavedCode("htmlCode", "<!-- Write your HTML here -->"),
                language: "html",
                theme: "vs-dark",
                automaticLayout: true
            }),
            css: monaco.editor.create(cssContainer, {
                value:  getSavedCode("cssCode", "/* Write your CSS here */"),
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
        console.log("✅ Monaco Editors Initialized:", window.editors);
        function autoSaveCode() {
            localStorage.setItem("htmlCode", editors.html.getValue());
            localStorage.setItem("cssCode", editors.css.getValue());
            localStorage.setItem("jsCode", editors.js.getValue());
        }

        // ✅ Function to debounce frequent calls for performance optimization
        function debounce(func, delay) {
            let timeout;
            return function () {
                clearTimeout(timeout);
                timeout = setTimeout(func, delay);
            };
        }

        // ✅ Function to update the iframe preview
        function updateOutput() {
            const htmlCode = editors.html.getValue();
            const cssCode = editors.css.getValue();
            const jsCode = editors.js.getValue();

            const iframe = document.getElementById("livePreview");
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // Clear previous content safely
            iframeDoc.head.innerHTML = "";
            iframeDoc.body.innerHTML = "";

            // ✅ Add HTML
            iframeDoc.body.innerHTML = htmlCode;

            // ✅ Add CSS dynamically
            const style = document.createElement("style");
            style.innerHTML = cssCode;
            iframeDoc.head.appendChild(style);

            // ✅ Remove old script before adding new one
            const oldScript = iframeDoc.getElementById("liveScript");
            if (oldScript) oldScript.remove();

            // ✅ JavaScript Syntax Check
            try {
                new Function(jsCode); // This will throw an error if jsCode has syntax issues

                // ✅ Create and add JavaScript safely
                const script = document.createElement("script");
                script.id = "liveScript";
                script.textContent = jsCode;
                iframeDoc.body.appendChild(script);
            } catch (error) {
                iframeDoc.body.innerHTML += `<p style="color:red;">JS Error: ${error.message}</p>`;
            }
        }

        // ✅ Debounced version of updateOutput for performance
        const debouncedUpdate = debounce(() => {
            updateOutput();
            autoSaveCode(); // ✅ Auto-Save feature
        }, 100);

        // ✅ Attach Monaco Editor event listeners to update preview
        Object.values(editors).forEach(editor => {
            editor.onDidChangeModelContent(debouncedUpdate);
        });

        // ✅ Initial call to set up everything
        updateOutput();

        // ✅ Fix: Download & Upload Code Inside Monaco Initialization
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
        

    });
});

document.addEventListener("DOMContentLoaded", function () {
    const consoleOutput = document.getElementById("console-output");
    const clearConsoleButton = document.getElementById("clear-console");

    function addToConsole(type, message) {
        const logDiv = document.createElement("div");
        logDiv.innerHTML = message;

        if (type === "error") {
            logDiv.style.color = "red";
        } else if (type === "warn") {
            logDiv.style.color = "yellow";
        } else {
            logDiv.style.color = "white";
        }

        consoleOutput.appendChild(logDiv);
        consoleOutput.scrollTop = consoleOutput.scrollHeight; // Auto-scroll
    }

    // ✅ Override Default Console Methods
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };

    console.log = function (...args) {
        originalConsole.log(...args);
        addToConsole("log", `🟢 LOG: ${args.join(" ")}`);
    };

    console.error = function (...args) {
        originalConsole.error(...args);
        addToConsole("error", `🔴 ERROR: ${args.join(" ")}`);
    };

    console.warn = function (...args) {
        originalConsole.warn(...args);
        addToConsole("warn", `🟡 WARN: ${args.join(" ")}`);
    };

    // ✅ Clear Console Button
    clearConsoleButton.addEventListener("click", function () {
        consoleOutput.innerHTML = "";
    });
    (function() {
        var oldLog = console.log;
        console.log = function(message) {
            oldLog.apply(console, arguments); // ✅ Normal console me dikhayein
            let consoleOutput = document.getElementById("customConsole"); // ✅ Monaco Console Pane
            if (consoleOutput) {
                consoleOutput.innerHTML += `<p style="color: white;">${message}</p>`;
            }
        };
    })();
    console.log("✅ Custom Console Initialized!");
});

