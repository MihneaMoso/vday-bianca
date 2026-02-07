import confetti from 'canvas-confetti';

const BACKGROUND_COLOR = "#ad5c79";
const HEART_COLOR_RANGE_START = "#FF0000";
const HEART_COLOR_RANGE_END = "#e2378d";
const HEARTS_NUMBER = 40;
const HEART_SIZE = 200;
const BUTTONS_DISTANCE = 120;
const SHIMMER_WIDTH = 100;
const SHIMMER_OFFSET_CENTER = 60;

const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");

function calculateDistance(centerX, centerY, mouseX, mouseY) {
    return Math.hypot(mouseX - centerX, mouseY - centerY);
}

function getRandomPosition(maxWidth, maxHeight) {
    // Ensure button stays within canvas bounds with some padding
    const padding = 10;
    return {
        x:
            padding +
            Math.random() * (maxWidth - noButton.offsetWidth - padding * 2),
        y:
            padding +
            Math.random() * (maxHeight - noButton.offsetHeight - padding * 2),
    };
}

function randomColorInRange(start, end) {
    const s = parseInt(start.slice(1), 16);
    const e = parseInt(end.slice(1), 16);
    const r = Math.floor(
        ((s >> 16) & 0xff) +
            Math.random() * (((e >> 16) & 0xff) - ((s >> 16) & 0xff)),
    );
    const g = Math.floor(
        ((s >> 8) & 0xff) +
            Math.random() * (((e >> 8) & 0xff) - ((s >> 8) & 0xff)),
    );
    const b = Math.floor(
        (s & 0xff) + Math.random() * ((e & 0xff) - (s & 0xff)),
    );
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function randomCoords(width, height) {
    return [Math.random() * width, Math.random() * height];
}

function launchConfetti() {
    confetti({
        particleCount: 100,
        spread: 180,
        origin: { y: 0.6 },
    });
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let loadedImages = [];
let heartPositions = []; // Store positions so they stay consistent on resize

function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}

function redraw() {
    // Draw background
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw hearts if loaded
    if (loadedImages.length > 0) {
        drawAllImages();
    }

    drawButtons();

    // Draw text
    context.font = '40px "Playwrite CU"';
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText("Bianca...", canvas.width / 2, canvas.height / 2 - 30);
    context.fillText(
        "Will you be my Valentine this year?",
        canvas.width / 2,
        canvas.height / 2 + 20,
    );

    const grad = context.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.8)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = grad;
    context.globalCompositeOperation = "overlay"; // Blends to create sparkle
    context.fillRect(
        0,
        canvas.height / 2 - SHIMMER_OFFSET_CENTER,
        canvas.width,
        SHIMMER_WIDTH,
    ); // Overlay shimmer
    context.globalCompositeOperation = "source-over"; // Reset
}

function drawButtons() {
    yesButton.style.top = canvas.height / 2 + SHIMMER_OFFSET_CENTER + "px";
    yesButton.style.left = canvas.width / 2 - BUTTONS_DISTANCE + "px";

    noButton.style.top = canvas.height / 2 + SHIMMER_OFFSET_CENTER + "px";
    noButton.style.left = canvas.width / 2 + BUTTONS_DISTANCE / 2 + "px";
}

function drawAllImages() {
    heartPositions.forEach((pos, index) => {
        context.save();

        // Use percentage-based positions for responsive layout
        // Add padding to prevent hearts from clustering at edges
        const padding = HEART_SIZE / 2;
        let x = padding + pos.xPercent * (canvas.width - HEART_SIZE);
        let y = padding + pos.yPercent * (canvas.height - HEART_SIZE);

        context.translate(x, y);
        context.rotate((pos.angle * Math.PI) / 180);
        context.drawImage(
            loadedImages[index],
            -HEART_SIZE / 2,
            -HEART_SIZE / 2,
            HEART_SIZE,
            HEART_SIZE,
        );
        context.restore();
    });
}

updateCanvasSize();
// Event handler to resize the canvas when the document view is changed
window.addEventListener("resize", updateCanvasSize, false);

// play with stroke xml property
let svgData;
let svgDatas = [];
fetch("./assets/heart.svg")
    .then((res) => res.text())
    .then((data) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, "image/svg+xml");
        for (let i = 0; i < HEARTS_NUMBER; i++) {
            const svg = svgDoc.querySelector("svg");
            svg.setAttribute(
                "stroke",
                randomColorInRange(
                    HEART_COLOR_RANGE_START,
                    HEART_COLOR_RANGE_END,
                ),
            );

            svgData = new XMLSerializer().serializeToString(svgDoc);
            svgDatas.push(svgData);

            // Store random position and angle for each heart
            heartPositions.push({
                xPercent: Math.random(),
                yPercent: Math.random(),
                angle: Math.random() * 65,
            });
        }

        let loadedCount = 0;
        svgDatas.forEach((svgData) => {
            const img = new Image();

            img.onload = function () {
                loadedCount++;
                loadedImages.push(img);
                if (loadedCount === svgDatas.length) {
                    redraw();
                }
            };

            img.src = "data:image/svg+xml," + encodeURIComponent(svgData);
        });
    });

// No button behaviour
document.addEventListener("mousemove", (e) => {
    const rect = noButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = calculateDistance(centerX, centerY, e.clientX, e.clientY);
    // let deltaX = e.clientX - centerX;
    // let deltaY = e.clientY - centerY;
    // console.log(distance);

    // let distance_to_move = distance / ((canvas.width + canvas.height) / 2 / 240);

    // console.log(distanceX, distanceY)
    if (distance < 50) {
        // Move element using absolute positioning instead of transform
        const pos = getRandomPosition(canvas.width, canvas.height);

        // Reset transform and use absolute left/top positioning
        noButton.style.transform = "none";
        noButton.style.left = pos.x + "px";
        noButton.style.top = pos.y + "px";
        // Make the yes button get bigger every time the user tries to press the no button
        const currentSize = parseInt(yesButton.style.fontSize) || 32;
        yesButton.style.fontSize = `${currentSize + 1}px`;
    }
});

yesButton.onclick = () => {
    console.log("I love youuuuuuuu!!!!!");

    // Hide both buttons
    yesButton.style.display = "none";
    noButton.style.display = "none";

    const container = document.getElementById("container");
    const gif = document.createElement("img");
    gif.src = "./assets/happy-cat.gif"; // Path to GIF on disk
    gif.alt = "Animation";
    gif.style.position = "absolute";
    gif.style.left = "50%";
    gif.style.top = "70%";
    gif.style.transform = "translate(-50%, -50%)";
    gif.style.width = "200px";
    gif.style.zIndex = "10";

    container.appendChild(gif);

    //  confetiiiii
    // Fire every 1.5 seconds
    launchConfetti();
    setInterval(launchConfetti, 1500);
    let overlayColor = 'purple';
    setInterval(() => {
        // Redraw original background first
        redraw();
        // Then overlay a semi-transparent color on top
        overlayColor = overlayColor === 'purple' ? 'black' : 'purple';
        context.globalAlpha = 0.3;
        context.fillStyle = overlayColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;
    }, 200);

    const audio = new Audio("./assets/happy-sound.mp3");
    audio.loop = true;
    audio.volume = 1.0;
    audio.play();
};
