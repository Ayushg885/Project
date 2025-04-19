// 🧠 Compress image before sending to OCR API
function compressImage(file, maxSizeKB, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const MAX_WIDTH = 800;
            const scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            let quality = 0.7;
            let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            while (compressedDataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
                quality -= 0.1;
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            fetch(compressedDataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    callback(compressedFile);
                });
        };
    };
    reader.readAsDataURL(file);
}

let check = "0";
document.querySelector('.button').addEventListener('click', async function () {
    const fileInput = document.querySelector('#image');
    const urlInput = document.querySelector('#image-url');
    const displayDiv = document.querySelector('#displayinput');
    const resultsTextarea = document.querySelector('#results');
    const inputsTextarea = document.querySelector('#inputs');
    var langType = document.querySelector('#langType');
    document.querySelector('.display').style.visibility = 'visible';
    check = "1";

    displayDiv.innerHTML = '';
    resultsTextarea.value = '';

    if (fileInput.files.length === 0 && !urlInput.value.trim()) {
        resultsTextarea.value = "Please upload an image or provide a valid image URL!";
        return;
    }

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.type.startsWith('image/')) {
            resultsTextarea.value = "The selected file is not an image!";
            return;
        }

        compressImage(file, 1000, async (compressedFile) => {
            const reader = new FileReader();
            reader.onload = async function (e) {
                displayDiv.innerHTML = `<img src="${e.target.result}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
                await analyzeImageFile(compressedFile, resultsTextarea);
            };
            reader.readAsDataURL(compressedFile);
        });

    } else {
        const imageUrl = urlInput.value.trim();
        displayDiv.innerHTML = `<img src="${imageUrl}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
        await analyzeImageUrl(imageUrl, resultsTextarea);
    }
});

async function analyzeImageFile(imageFile, resultsTextarea) {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('apikey', 'K87229168488957');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        handleOCRSuccess(data, resultsTextarea);
    } catch (error) {
        resultsTextarea.value = `Error: ${error.message}`;
    }
}

async function analyzeImageUrl(imageUrl, resultsTextarea) {
    try {
        const formData = new FormData();
        formData.append('url', imageUrl);
        formData.append('apikey', 'K87229168488957');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        handleOCRSuccess(data, resultsTextarea);
    } catch (error) {
        resultsTextarea.value = `Error: ${error.message}`;
    }
}

function handleOCRSuccess(response, resultsTextarea) {
    if (response.OCRExitCode === 1) {
        const extractedText = response.ParsedResults.map(result => result.ParsedText).join('\n');
        document.getElementById("results").value = extractedText;
        updateEditorContent(extractedText);
    } else {
        updateEditorContent(`Error: ${response.ErrorMessage || "Failed to process the image."}`);
    }
}
//checkAi button
document.getElementById("checkAi").addEventListener("click", async () => {
    let codeInput = window.cppEditor.getValue();
    let langSelector = document.getElementById("langType");
    let selectedLang = langSelector.value;
    console.log(`code in lang :${selectedLang}`);
    let fixedCode = await correctedCode(codeInput,selectedLang);  
    if (fixedCode !== "Error in AI response!") {
        updateEditorContent(fixedCode);
    } else {
        console.error("AI correction failed, keeping manual changes.");
    }
    
});

const API_KEY = "AIzaSyC9vvHFK3wfn7oaSMBGgrAYerSR15aD51Q";//Gemini api key


//code corrector initialisation
async function correctedCode(codeText,langType) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            { "text": `Correct the following programming code in ${langType}):\n\n${codeText}.only correct these codes not give any extra text.make this code ready to give it to compiler.dont add any starting or ending comment in the output.if(${codeText} not contains any text then check for and input prompt to write code in ${langType}) and if ${langType} is cpp always try to use using namespace std other than writting std again and again and also give focus on readablity of code in correct formating in case of python.NOTE[remember dont write any extra text before and after code showing start and end]` }
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


        return cleanedText || "Error in AI response!";
        
    } catch (error) {
        console.error("Error:", error.message);
        return "Error in AI response!";
    }
}



//code mirror implementation
window.onload = function () {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

    require(["vs/editor/editor.main"], function () {
        let langSelector = document.getElementById("langType");
        let selectedLang = langSelector.value ; 
        let editorContainer = document.getElementById("results");
        let editorContainer2 = document.getElementById("inputs");

        setTimeout(() => {
            let langSelector = document.getElementById("langType");
            let selectedLang = langSelector.value;
            if (window.cppEditor) {
                monaco.editor.setModelLanguage(window.cppEditor.getModel(), selectedLang);
            }
        }, 1000);
        

        if (!editorContainer || !editorContainer2) {
            console.error("Editor containers not found!");
            return;
        }

        // ✅ Initialize Monaco Editors
        window.cppEditor = monaco.editor.create(editorContainer, {
            value: "",
            language: selectedLang,
            theme: "vs-dark",
            automaticLayout: true,
        });

        window.cppEditor2 = monaco.editor.create(editorContainer2, {
            value: "//inputs",
            language: selectedLang,
            theme: "vs-dark",
            automaticLayout: true
        });

        // ✅ Update Monaco Editor Language on Dropdown Change
        langSelector.addEventListener("change", function () {
            let newLang = langSelector.value;
            monaco.editor.setModelLanguage(window.cppEditor.getModel(), newLang);
            monaco.editor.setModelLanguage(window.cppEditor2.getModel(), newLang);
            console.log(`Updated Monaco Editor language to: ${newLang}`);
        });
    });
};


// Function to update Monaco Editor after OCR processing
function updateEditorContent(newContent) {
    if (window.cppEditor) {
        window.cppEditor.setValue(newContent);
    } else {
        console.error("Monaco Editor not initialized.");
    }
};
