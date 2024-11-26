document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    const coordinatesDisplay = document.getElementById('coordinates');
    let selectedColor = '#000000';
    const pixelSize = 8;
    const columns = canvas.width / pixelSize;
    const rows = canvas.height / pixelSize;
    let scale = 1;

    const initCanvas = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawPixel = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    };

    const updateCoordinates = (event) => {
        const x = Math.floor(event.offsetX / pixelSize);
        const y = Math.floor(event.offsetY / pixelSize);
        coordinatesDisplay.textContent = `X: ${x}, Y: ${y}`;
    };

    canvas.addEventListener('mousemove', updateCoordinates);
    canvas.addEventListener('click', (event) => {
        const x = Math.floor(event.offsetX / pixelSize);
        const y = Math.floor(event.offsetY / pixelSize);
        drawPixel(x, y, selectedColor);
    });

    async function loadPalette() {
        try {
            const response = await fetch('palette.json');
            if (!response.ok) throw new Error(`Failed to load palette.json: ${response.status}`);
            const palette = await response.json();
            const colorPalette = document.getElementById('colorPalette');
            colorPalette.style.backgroundColor = `#${palette.paletteBackgroundColor}`;

            palette.colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = `#${color.value}`;
                colorBox.title = color.name;
                colorPalette.appendChild(colorBox);

                colorBox.addEventListener('click', () => {
                    const allColorBoxes = document.querySelectorAll('.color-box');
                    allColorBoxes.forEach(box => box.classList.remove('selected'));
                    colorBox.classList.add('selected');
                    selectedColor = `#${color.value}`;
                });
            });
        } catch (error) {
            console.error('Error loading the palette:', error);
        }
    }

    canvas.addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
            scale = Math.max(0.5, scale - 0.1);
        } else {
            scale = Math.min(3, scale + 0.1);
        }
        canvas.style.transform = `scale(${scale})`;
    });

    initCanvas();
    loadPalette();
});
