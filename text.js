document.querySelector('.button').addEventListener('click', async function () {
    const fileInput = document.querySelector('#image');
    const urlInput = document.querySelector('#image-url');
    const displayDiv = document.querySelector('#displayinput');
    const resultsTextarea = document.querySelector('#results');
    
    resultsTextarea.style.visibility = 'visible';
    
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
        
        const reader = new FileReader();
        reader.onload = async function (e) {
            displayDiv.innerHTML = `<img src="${e.target.result}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
            await analyzeImageFile(file, resultsTextarea);
        };
        reader.readAsDataURL(file);
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
        formData.append('apikey', 'K86680526588957');
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
        formData.append('apikey', 'K86680526588957');
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
        resultsTextarea.value = extractedText;
    } else {
        resultsTextarea.value = `Error: ${response.ErrorMessage || "Failed to process the image."}`;
    }
}

document.getElementById("run").addEventListener("click", async () => {
    let codeInput = document.getElementById("results").value;
    let correctedCode = await correctCode(codeInput);
    document.getElementById("results").value = correctedCode;
    document.getElementById("output").innerText = correctedCode;
});

async function correctCode(codeText) {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch('https://api.openai.com/v1/completions', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                prompt: `Correct the following programming code:\n\n${codeText}`,
                max_tokens: 300,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.text.trim() || "Error in AI response!";
    } catch (error) {
        console.error("Error:", error);
        return "Error in AI response!";
    }
}

window.onload = function () {
    let textarea = document.querySelector('#results');
    textarea.addEventListener('keydown', function (e) {
        if (!textarea.classList.contains('initialized') && e.key==='Alt') {
            textarea.classList.add('initialized');
            
            let editor = CodeMirror.fromTextArea(textarea, {
                mode: "text/x-c++src",
                theme: "dracula",
                lineNumbers: true,
                readOnly: false,
                gutters: ["CodeMirror-lint-markers"],
                lint: true,
                extraKeys: { "Ctrl-Space": "autocomplete" }
            });
            var width=window.innerWidth;
            editor.setSize(0.8*width, "200px");
            
            editor.on("change", function() {
                textarea.value = editor.getValue();
            });
        }
    });
};
