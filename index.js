document.querySelector('.button').addEventListener("click", function () {
    const fileInput = document.querySelector('#image');
    const urlInput = document.querySelector('#text-url'); // Ensure this field exists in your HTML
    const displayDiv = document.querySelector('#displayinput');

    // Clear previous content
    displayDiv.innerHTML = '';

    // Handle case when no file is selected but a URL is provided
    if (!fileInput.files || fileInput.files.length === 0) {
        const imageUrl = urlInput.value.trim();
        if (!imageUrl) {
            alert("Please upload an image or provide a valid image URL!");
            return;
        }
        // Display image from URL
        displayDiv.innerHTML = `<img src="${imageUrl}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
        return;
    }

    // Handle file input
    const file = fileInput.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert("The selected file is not an image!");
        return;
    }

    // Read and display the selected image file
    const reader = new FileReader();
    reader.onload = function (e) {
        displayDiv.innerHTML = `<img src="${e.target.result}" alt="Selected Image" style="width: 300px; height: 200px;" />`;
    };
    reader.readAsDataURL(file);
});
