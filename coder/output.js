const run = document.querySelector('#run');
const output = document.querySelector('#output');
const explain = document.querySelector('#explain');
const explainCode = document.querySelector('#explainCode');
var editorElement = document.getElementById('results'); // Ensure it's an input or textarea
var input = document.getElementById('cbox'); // Corrected input selector
var inputs = document.getElementById('inputs'); // Corrected input selector
var langType = document.querySelector('#langType');

const menubtn = document.querySelector(".menu-btn");
const drawMenu = document.querySelector("#draw-menu"); // ✅ FIX
let check = false;

menubtn.addEventListener("click", function () {
    check = !check;
    drawMenu.style.display = check ? "block" : "none";
});


run.addEventListener('click', async function () {
    console.log(`🚀 Run button clicked!:${langType.value} `);

    // Show the output area
    document.querySelector('.displayRun').style.visibility = 'visible';

    // Get code from Monaco Editor or fallback input
    const codeText = window.cppEditor ? window.cppEditor.getValue() : editorElement.value;

    // Get input
    let inputValue = window.cppEditor2 ? window.cppEditor2.getValue().trim() : "";

    if (inputValue === "//inputs") {
        inputValue = "";
    }

    const lang = langType.value;

    const codePayload = {
        language: lang,                // e.g. "cpp", "python", "java"
        version: "*",                  // "*" uses latest version
        files: [
            {
                name: `main.${lang}`,
                content: codeText
            }
        ],
        stdin: input.checked ? inputValue : "",
    };

    console.log("📤 Sending code to Piston:", codePayload);

    try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(codePayload)
        });

        if (!response.ok) {
            throw new Error(`❌ Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Piston Response:", data);

        output.textContent = data.run?.stdout || data.run?.stderr || "⚠️ No output received.";
    } catch (error) {
        console.error("🚨 Fetch Error:", error);
        output.textContent = "Error: " + error.message;
    }
});

const API_KEY = "AIzaSyC9vvHFK3wfn7oaSMBGgrAYerSR15aD51Q";//Gemini api key


explain.addEventListener("click", async () => {
    var codeText = window.cppEditor ? window.cppEditor.getValue() : editorElement.value;
    var inputValue = window.cppEditor2 ? window.cppEditor2.getValue().trim() : "";
    let explanation = await explainthecode(output.textContent, codeText, inputValue);
    if (explanation !== "Error in AI response!") {
        console.log(explanation);
        explainCode.innerHTML= `${explanation}`;
        if (window.mermaid) {
            mermaid.init(undefined, explainCode);
        }
    } else {
        console.error("AI correction failed, keeping manual changes.");
    }
})
async function explainthecode(output, codeText, inputValue) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
                                "text": `Bhai, niche ek kaam karna hai:

                                1. **Dry Run:** "${codeText}" code ko input "${inputValue}" ke sath dry run karo (use proper color for most visibility and dark backgrounds), line-by-line batao kya ho raha hai. step-by step krke bhi dikhao , simple aur samajhne layak tareeke se (jaise bhai samjha raha ho bhai ko).

                                2. **Flow Chart:** Code ka ek <u>HTML-only flowchart</u> banao (no images, no JS). 
                                        Just use <b>HTML body content</b> with <b>inline CSS</b> to style boxes, arrows and layout. Guidelines:
                                        - Structure: Start → Input → Loop/Condition → Processing → Output → End  (vertical)
                                        - Har step ek <div> ho — rounded corners, padding, background (dark), light text
                                        - Arrows with emojis: ⬇️ ➡️ 🔁 ✅ — use them smartly
                                        - Bhai-lang tone ho — thoda chill + fun + understandable
                                        - Center-aligned layout, readable font-size, avoid spacing clutter


                                3. **Time and Space Complexity:** Code ki time and space complexity kya hai? Simple bhasha mein, justify karo with reasoning.

                                4. **Optimization Tips:** Agar koi better tarika ho ya kuch optimize karna ho toh suggest karo with logic. Performance friendly solutions batao.

                                5. **Error Check:** Agar output mein koi error ya issue dikhe jaise "${output}", toh uska reason batao aur exact solution do. Line ya logic point out karo. agar na ho to isse avoid kro.

                                🛠 IMPORTANT Tips:
                                - sirf body ke andar ka hi dena innercss use kr sakte ho
                                - Code agar C++ ka ho toh "using namespace std;" ka check zarur karo. 
                                - Python code ho toh indentation aur variable handling pe focus karo.
                                - Dry Run aur Explanation **hinglish bhai-lang** mein ho, simple aur mast style mein.
                                - Sab kuch **HTML body** format mein likhna — use "<b>", "<i>", "<u>" and "<span style="">" jaise tags for styling.
                                - Use inline CSS (color, font-size, padding etc.) for better UI.
                                - Font zyada bada na ho, layout clean aur readable ho.
                                - Avoid extra spacing or boring language — bhai-log ko pasand aaye aisa likhna.
                                - use proper size and tag for heading also.

                                Reply should be **short, interactive, and stylish** — like a smart coder bhai explaining to his younger bro in hinglish.` }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Error in AI response!";
        
        // ✅ Remove triple backticks and mermaid/html tags
        let cleanedText = rawText
            .replace(/```(mermaid|html|[\s]*)/g, '')
            .replace(/```/g, '');

        return cleanedText;

    } catch (error) {
        console.error("Error:", error.message);
        return "Error in AI response!";
    }
}
