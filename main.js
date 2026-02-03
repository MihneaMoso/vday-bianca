const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
updateCanvasSize();
// Event handler to resize the canvas when the document view is changed
window.addEventListener('resize', updateCanvasSize, false);


context.fillStyle = "#ad5c79";
context.fillRect(0, 0, canvas.width, canvas.height);

// svg
const img = new Image();
img.onload = function () {
    context.save()
    
    context.translate(200, 200);
    context.rotate(45 * Math.PI / 180);
    
    // Draw SVG at position (x=100, y=150)
    context.drawImage(img, 50, 75, 100, 150);
    
    context.restore()
};
img.src = './assets/heart.svg';