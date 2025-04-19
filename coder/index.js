const menubtn = document.querySelector(".menu-btn");
const drawMenu = document.querySelector("#draw-menu"); // ✅ FIX
let check = false;

menubtn.addEventListener("click", function () {
    check = !check;
    drawMenu.style.display = check ? "block" : "none";
});

const heading = document.querySelector('.heading');
let s = "Upload Image or Provide Image URL";
let i = 0;
let repeatCount = 0;
let maxRepeat = 3;
let direction = "forward";

function startTyping() {
    const interval = setInterval(() => {
        if (direction === "forward") {
            if (i < s.length) {
                heading.innerHTML += s[i];
                i++;
            } else {
                clearInterval(interval);
                if (repeatCount < maxRepeat) {
                    direction = "reverse";
                    setTimeout(startTyping, 1000);
                }
            }
        } else if (direction === "reverse") {
            if (i > 1) {
                i--;
                heading.innerHTML = s.slice(0, i);
            } else {
                repeatCount++;
                direction = "forward";
                clearInterval(interval);
                setTimeout(startTyping, 250);
            }
        }
    }, 80);
}

// Initial clear and start
heading.innerHTML = "";
startTyping();


const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const res = await fetch('http://localhost:5578/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    alert(data.message);
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('http://localhost:5578/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
    } else {
        alert('Invalid credentials');
    }
});


// ✅ Vercel Serverless Function Export
//module.exports = app;
