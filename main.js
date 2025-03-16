document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const fileName = document.getElementById('fileName');
    const originalImage = document.getElementById('originalImage');
    const originalImageContainer = document.querySelector('.original-image');
    const gridHeader = document.getElementById('gridHeader');
    const gridContent = document.getElementById('gridContent');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const brushColorPicker = document.getElementById('brushColor');
    const thresholdInput = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    
    const modeRadios = document.querySelectorAll('input[name="colorMode"]');

    let currentColor = '#000000';
    const gridSize = 16;
    let pixelData = [];
    let grayscaleMode = false;
    let threshold = 128; // Valor inicial do slider

    // Ocultar a imagem original no início
    originalImageContainer.style.display = 'none';

    function initGrid() {
        gridHeader.innerHTML = '';
        gridContent.innerHTML = '';
        pixelData = [];

        for (let i = 0; i < gridSize; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-cell-header';
            headerCell.textContent = i + 1;
            gridHeader.appendChild(headerCell);
        }

        for (let y = 0; y < gridSize; y++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            const rowHeader = document.createElement('div');
            rowHeader.className = 'grid-row-header';
            rowHeader.textContent = y + 1;
            row.appendChild(rowHeader);
            pixelData[y] = [];

            for (let x = 0; x < gridSize; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.dataset.x = x;
                pixel.dataset.y = y;
                pixel.style.backgroundColor = 'white';
                pixelData[y][x] = 'white';

                pixel.addEventListener('click', function() {
                    this.style.backgroundColor = currentColor;
                    pixelData[y][x] = currentColor;
                });

                pixel.addEventListener('dblclick', function() {
                    this.style.backgroundColor = 'white';
                    pixelData[y][x] = 'white';
                });

                row.appendChild(pixel);
            }
            gridContent.appendChild(row);
        }
    }

    function convertImage() {
        if (!originalImage.src || originalImage.src.includes('placeholder')) {
            alert('Por favor, selecione uma imagem primeiro!');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = gridSize;
        canvas.height = gridSize;
        ctx.drawImage(originalImage, 0, 0, gridSize, gridSize);
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const data = imageData.data;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const index = (y * gridSize + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                let color;
                if (grayscaleMode) {
                    const gray = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
                    color = gray >= threshold ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
                } else {
                    color = `rgb(${r}, ${g}, ${b})`;
                }

                const pixel = gridContent.children[y].children[x + 1];
                pixel.style.backgroundColor = color;
                pixelData[y][x] = color;
            }
        }
    }

    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            grayscaleMode = this.value === "bw";
            convertImage();
        });
    });

    thresholdInput.addEventListener('input', function() {
        threshold = parseInt(this.value, 10);
        thresholdValue.textContent = threshold;
        if (grayscaleMode) {
            convertImage();
        }
    });

    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            fileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(event) {
                originalImage.src = event.target.result;
                originalImageContainer.style.display = 'block'; // Exibe a imagem original
            };
            reader.readAsDataURL(file);
        }
    });

    convertBtn.addEventListener('click', convertImage);
    
    clearBtn.addEventListener('click', initGrid);
    
    downloadBtn.addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const pixelSize = 20;
        canvas.width = gridSize * pixelSize;
        canvas.height = gridSize * pixelSize;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                ctx.fillStyle = pixelData[y][x];
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }

        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    brushColorPicker.addEventListener('change', function(e) {
        currentColor = e.target.value;
    });

    initGrid();
});

