const run = document.querySelector('#run');
const output = document.querySelector('#output');
var editorElement = document.getElementById('results'); // Ensure it's an input or textarea
var input = document.getElementById('cbox'); // Corrected input selector
var langType = document.querySelector('#langType');

var code;

run.addEventListener('click', async function () {
    console.log("Run button clicked!"); // Debugging log

    // Check if Monaco Editor is available
    var codeText = window.cppEditor ? window.cppEditor.getValue() : editorElement.value;

    code = {
        code: codeText,
        input: input.checked ? input.value : "",
        lang: langType.value
    };

    console.log("Sending code to API:", code); // Debugging log

    try {
        var oData = await fetch("http://localhost:3365/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(code)
        });

        if (!oData.ok) {
            throw new Error(`Server responded with status: ${oData.status}`);
        }

        var d = await oData.json();
        output.textContent = d.output || "Error: No output received";
    } catch (error) {
        output.textContent = "Error parsing response: " + error.message;
        console.error("Fetch error:", error);
    }
});
