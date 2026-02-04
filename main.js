const BACKGROUND_COLOR = "#ad5c79";
const HEART_COLOR_RANGE_START = "#FF0000";
const HEART_COLOR_RANGE_END = "#e2378d";
const HEARTS_NUMBER = 30;
const HEART_SIZE = 200;

function randomColorInRange(start, end) {
  const s = parseInt(start.slice(1), 16);
  const e = parseInt(end.slice(1), 16);
  const r = Math.floor(((s >> 16) & 0xff) + Math.random() * (((e >> 16) & 0xff) - ((s >> 16) & 0xff)));
  const g = Math.floor(((s >> 8) & 0xff) + Math.random() * (((e >> 8) & 0xff) - ((s >> 8) & 0xff)));
  const b = Math.floor((s & 0xff) + Math.random() * ((e & 0xff) - (s & 0xff)));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function randomCoords(width, height) {
    return [Math.random() * width, Math.random() * height];
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
    
    // Draw text
    context.font = '40px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText("Bianca...", canvas.width / 2, canvas.height / 2 - 30);
    context.fillText("Will you be my Valentine this year?", canvas.width / 2, canvas.height / 2 + 20);
}

function drawAllImages() {
    heartPositions.forEach((pos, index) => {
        context.save();
        
        // Use percentage-based positions for responsive layout
        let x = pos.xPercent * canvas.width;
        let y = pos.yPercent * canvas.height;
        
        context.translate(x + HEART_SIZE / 2, y + HEART_SIZE / 2);
        context.rotate((pos.angle * Math.PI) / 180);
        context.drawImage(loadedImages[index], -HEART_SIZE / 2, -HEART_SIZE / 2, HEART_SIZE, HEART_SIZE);
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
            svg.setAttribute("stroke", randomColorInRange(HEART_COLOR_RANGE_START, HEART_COLOR_RANGE_END));
    
            svgData = new XMLSerializer().serializeToString(svgDoc);
            svgDatas.push(svgData);
            
            // Store random position and angle for each heart
            heartPositions.push({
                xPercent: Math.random(),
                yPercent: Math.random(),
                angle: Math.random() * 65
            });
        }
        
        let loadedCount = 0;
        svgDatas.forEach(svgData => { 
            const img = new Image();
            
            img.onload = function () {
                loadedCount++;
                loadedImages.push(img);
                if (loadedCount === svgDatas.length) {
                    redraw();
                }
            }
        
            
            img.src = "data:image/svg+xml," + encodeURIComponent(svgData);
        });
    });