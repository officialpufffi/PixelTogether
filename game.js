document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    const coordinatesDisplay = document.getElementById('coordinates');
    let selectedColor = '#000000';
    const pixelSize = 16;
    const columns = canvas.width / pixelSize;
    const rows = canvas.height / pixelSize;
    let scale = 1;

    let config;
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error(`Failed to load config.json: ${response.status}`);
        config = await response.json();
    } catch (error) {
        console.error('Error loading config.json:', error);
        return;
    }

    const ws = new WebSocket(`ws://${config.ip}:${config.port}`);

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

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ x, y, color: selectedColor }));
        }
    });

    ws.addEventListener('message', (event) => {
        const pixels = JSON.parse(event.data);
        pixels.forEach(pixel => {
            const [x, y] = pixel.coordinate.split(';').map(Number);
            drawPixel(x, y, pixel.color);
        });
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
