const canvas = document.querySelector('#canvas1');
const ctx = canvas.getContext('2d');

const image1 = new Image();
image1.src = based64img[0];

var generateTxtAscii = '';
var based64 = '';

const inputSlider = document.querySelector('#resolution');
const inputLabel = document.querySelector('#resolutionLabel');
const output = document.querySelector('#outputtxt');
const gen = document.querySelector('#gen');
const based64copy = document.querySelector('#based64copy');
const bright = document.querySelector('#brightInput');
const brightLabel = document.querySelector('#brightLabel');

inputSlider.onchange = handleSlider;

class Cell {
    constructor (x,y,symbol,color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }
    draw (ctx) {
        ctx.fillStyle = this.color;
        // ctx.fillStyle = 'white';
        ctx.fillText(this.symbol, this.x +.4,this.y+.4);
        ctx.fillStyle = 'black'//'rgba(10,10,10,.8)';
        // ctx.fillText(this.symbol, this.x, this.y);
    }
}

class AsciiEffect {
    #imageCellArray = [];
    #pixels = [];
    #ctx;
    #width;
    #height;

    constructor (ctx, width, height) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;        
        this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0,0, this.#width, this.#height);
        console.log(this.#pixels.data)
    }

    #convertToSymbol (g) {
        '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`\'.';
        if (g > 250) return '$';
        else if (g > 240) return '@';
        else if (g > 230) return 'B';
        else if (g > 220) return '%';
        else if (g > 210) return '8';
        else if (g > 200) return '&';
        else if (g > 190) return 'W';
        else if (g > 180) return 'M';
        else if (g > 170) return '#';
        else if (g > 160) return '*';
        else if (g > 150) return 'f';
        else if (g > 140) return 't';
        else if (g > 130) return '/';
        else if (g > 120) return '\\';
        else if (g > 110) return '|';
        else if (g > 100) return '(';
        else if (g > 90) return ')';
        else if (g > 80) return '1';
        else if (g > 70) return '_';
        else if (g > 60) return '-';
        else if (g > 50) return '?';
        else if (g > 40) return '[';
        else if (g > 30) return ']';
        else if (g > 20) return '}';
        else if (g > 10) return '{';
        else return ' ';
    }

    #scanImage (cellSize) {
        this.#imageCellArray = [];
        let s_ = {}, row = -1;
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            row++;
            s_[row] = [];
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos],
                          green = this.#pixels.data[pos + 1],
                          blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue;
                    const averageColorVal = total/3;
                    const color = `rgb(${red + +bright.value}, ${green + +bright.value}, ${blue + +bright.value})`;
                    const symbol = this.#convertToSymbol(averageColorVal )
                    s_[row].push(symbol)
                    if (total > 100) 
                        this.#imageCellArray.push(new Cell(x, y, symbol, color));
                } else s_[row].push(' ')
            }
        }

        generateTxtAscii = Object.entries(s_).map(e => e[1].join``).join`\n`;
        console.log(
            generateTxtAscii
        );

    }

    #drawAscii () {
        this.#ctx.clearRect (0, 0, this.#width, this.#height);
        this.#ctx.fillRect (0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx);
        }
        based64 = canvas.toDataURL();
    }

    draw (cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();
    }
}

var effect;

function handleSlider () {
    based64copy.innerText = 'Copy Base64';
    if (inputSlider.value == 1) {
        inputLabel.innerHTML = 'Original Image';
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    } else {
        inputLabel.innerHTML = 'Resolution ' + inputSlider.value + ' px';
        brightLabel.innerText = 'Bright: ' + bright.value;
        ctx.font = (+inputSlider.value) + 'px Kolibri'
        effect.draw(+inputSlider.value);
    }
}

function generate() {
    let newWindow = window.open('', 'Ascii Art', 'width=' + image1.width, 'height=' + image1.height)

    let ops = [
        `<style>
            #outputtxt {
                color: white;
                font-size: 4px;
                text-align: justify;
                line-height: 4px;
                letter-spacing: 2px;
                max-width: 1000px;
            }
            body {
                background: black;
            }
        </style>
        `,
        `<body>
            <pre id="outputtxt">${generateTxtAscii}</pre>
        </body>
        `
    ]

    newWindow.document.write(ops.join``)
}

function copyBased64 () {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = based64;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    based64copy.innerText = 'Copied!';
}

image1.onload = function initialize() {
    canvas.width = image1.width;
    canvas.height = image1.height;
    effect = new AsciiEffect(ctx, image1.width, image1.height)
    inputLabel.innerText = 'Resolution ' + inputSlider.value + ' px.'
    brightLabel.innerText = 'Bright: ' + bright.value;
    ctx.font = +inputSlider.value + 'px Kolibri'
    effect.draw(+inputSlider.value);

    based64copy.onclick  = copyBased64;

    bright.onchange = handleSlider;

    gen.onclick = generate;
}