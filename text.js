document.querySelector('.button').addEventListener("click", function () {
    const fileInput = document.querySelector('#image');
    const urlInput = document.querySelector('#image-url');
    const displayDiv = document.querySelector('#displayinput');
    const resultsTextarea = document.querySelector('#results');
    document.querySelector('textarea').style.visibility='visible';
    document.querySelector('textarea').addEventListener('mouseover',()=>{
        document.querySelector('#run').style.visibility='visible';
    })

    // Clear previous content
    displayDiv.innerHTML = '';
    resultsTextarea.value = '';

    // Handle case when no file is selected but a URL is provided
    if (!fileInput.files || fileInput.files.length === 0) {
        const imageUrl = urlInput.value.trim();
        if (!imageUrl) {
            resultsTextarea.value = "Please upload an image or provide a valid image URL!";
            return;
        }
        // Display image from URL
        displayDiv.innerHTML = `<img src="${imageUrl}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
        analyzeImageUrl(imageUrl, resultsTextarea);
        return;
    }

    // Handle file input
    const file = fileInput.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
        resultsTextarea.value = "The selected file is not an image!";
        return;
    }

    // Read and display the selected image file
    const reader = new FileReader();
    reader.onload = function (e) {
        displayDiv.innerHTML = `<img src="${e.target.result}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
        analyzeImageFile(file, resultsTextarea);
    };
    reader.readAsDataURL(file);
});

// Function to process an uploaded image file
function analyzeImageFile(imageFile, resultsTextarea) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('apikey', 'K88542020488957'); // Replace with your OCR.Space API key
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('OCREngine', '2');

    $.ajax({
        url: 'https://api.ocr.space/parse/image',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            handleOCRSuccess(response, resultsTextarea);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            resultsTextarea.value = `Request failed: ${textStatus} - ${errorThrown}`;
        }
    });
}

// Function to process an image from a URL
function analyzeImageUrl(imageUrl, resultsTextarea) {
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('apikey', 'K88542020488957'); // Replace with your OCR.Space API key
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('OCREngine', '2');

    $.ajax({
        url: 'https://api.ocr.space/parse/image',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            handleOCRSuccess(response, resultsTextarea);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            resultsTextarea.value = `Request failed: ${textStatus} - ${errorThrown}`;
        }
    });
}

// Function to handle successful OCR response
function handleOCRSuccess(response, resultsTextarea) {
    if (response.OCRExitCode === 1) {
        const extractedText = response.ParsedResults.map(result => result.ParsedText).join('\n');
        resultsTextarea.value = extractedText; // Set the extracted text in the textarea
    } else {
        resultsTextarea.value = `Error: ${response.ErrorMessage || "Failed to process the image."}`;
    }
}

