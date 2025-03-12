const run = document.querySelector('#run');
const output = document.querySelector('#output');
const explain = document.querySelector('#explain');
const explainCode = document.querySelector('#explainCode');
var editorElement = document.getElementById('results'); // Ensure it's an input or textarea
var input = document.getElementById('cbox'); // Corrected input selector
var inputs = document.getElementById('inputs'); // Corrected input selector
var langType = document.querySelector('#langType');

var code;

run.addEventListener('click', async function () {
    console.log("Run button clicked!"); // Debugging log
    document.querySelector('.displayRun').style.visibility = 'visible';
    // Check if Monaco Editor is available
    var codeText = window.cppEditor ? window.cppEditor.getValue() : editorElement.value;
    var inputValue = window.cppEditor2 ? window.cppEditor2.getValue().trim() : "";

    // Ensure empty input is handled correctly
    if (inputValue === "//inputs") {
        inputValue = "";
    }


    code = {
        code: codeText,
        input: input.checked ? inputValue : "",
        lang: langType.value
    };

    console.log("Sending code to API:", code); // Debugging log

    try {
        var oData = await fetch("http://localhost:3600/compile", {
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
        console.log(`${d}`);
        output.textContent = d.output || "Error: No output received";
    } catch (error) {
        output.textContent = "Error parsing response: " + error.message;
        console.error("Fetch error:", error);
    }
});
const API_KEY = "AIzaSyC9vvHFK3wfn7oaSMBGgrAYerSR15aD51Q";//Gemini api key

explain.addEventListener("click", async () => {
    var codeText = window.cppEditor ? window.cppEditor.getValue() : editorElement.value;
    var inputValue = window.cppEditor2 ? window.cppEditor2.getValue().trim() : "";
    let fixedCode = await explainthecode(output, codeText, inputValue);
    if (fixedCode !== "Error in AI response!") {
        explainCode.value = fixedCode;
    } else {
        console.error("AI correction failed, keeping manual changes.");
    }
})
async function explainthecode(output, codeText, inputValue) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            {
                                "text": `Bhai, ek kaam karna hai.

                                            Agar koi error nahi hai, toh yeh batao:  
                                            1 **Dry Run:** Code "${codeText}" ka dry run karke batao kaise execute hoga, aur output kaise aayega.  
                                            2 **Time Complexity:** Code ki time complexity kya hai? Justify karke samjhao.  
                                            3 **Optimization Tips:** Code aur fast ya efficient kaise ban sakta hai? Koi better approach ho toh suggest karo.  

                                            🛠 **Tips:** Agar code "${codeText}" C++ hai toh using namespace std; ka use zaroor dekho, aur Python ke case mein indentation aur efficiency ka dhyan do.  
                                            Bhai-lang mein simple aur friendly tareeke se samjhao! 
                                            text ko short rakho time waste mt krna` }
                        ]
                    }
                ]
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Error in AI response!";

    } catch (error) {
        console.error("Error:", error.message);
        return "Error in AI response!";
    }

}

