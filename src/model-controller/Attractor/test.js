/**
 * Created by blackbat on 06.04.2017.
 */
class Attractor {

    constructor(canvasId, valuesNames) {
        this.$canvas = $('#' + canvasId);
        this.canvasId = canvasId;
        this.valuesNames = valuesNames;
    }

    init() {
        this.prepareVariables();
        this.setSliders();
        this.prepareEvents();
        this.clearPixelsArray();
        requestAnimationFrame(this.draw.bind(this));
    }

    prepareVariables() {
        this.sizeX = this.$canvas.width();
        this.sizeX -= $('form').width();
        this.$canvas.width(this.sizeX);
        this.sizeY = this.$canvas.height();
        this.centerX = this.sizeX / 2;
        this.centerY = this.sizeY / 2;
        this.speed = 2000;
        $('#speedInput').val(this.speed);
        this.stop = false;
        this.pixels = [];
        this.percent = 5 / 100;
        this.values = [];
        this.examples = [];
        this.opacity = 0.05;
        this.randomColor = false;
        this.animationModeTime = 0;
        this.animationModeChangeTime = 1000;
        this.setBeginningCoordinates();
        this.prepareColors();
        this.prepareScale();
        this.prepareBeginningValues();
        this.prepareExamples();
        this.populateExamples();
        this.prepareCanvas();
        this.prepareNeonColors();
    }

    prepareColors() {
        this.color = 0xff0000;
        this.backgroundColor = '#ffffff';
        $('#backgroundColorInput').val(this.backgroundColor);
    }

    prepareScale() {
        console.log('Not implemented');
    }

    prepareBeginningValues() {
        console.log('Not implemented');
    }

    setSliders() {
        this.setSlidersValues();
        this.setSlidersLabelsValues();
        this.setFormulaVariables();
    }

    prepareEvents() {
        $('#speedInput').change($.proxy(function () {
            this.speed = $('#speedInput').val();
        }, this));

        $('#colorInput').change($.proxy(function () {
            let tmp = $('#colorInput').val();
            tmp = tmp.replace('#', '');
            tmp = parseInt(tmp, 16);
            this.color = tmp;
            this.animationModeTime = 0;
        }, this));

        $('#backgroundColorInput').change($.proxy(function () {
            this.backgroundColor = $('#backgroundColorInput').val();
            this.clearPixelsArray();
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.sizeX, this.sizeY);
            this.animationModeTime = 0;
        }, this));

        for (let i = 0; i < this.valuesNames.length; ++i) {
            let valueName = this.valuesNames[i];
            $('#' + valueName + 'Input').bind('input', $.proxy(function () {
                this.values[i] = parseFloat($('#' + valueName + 'Input').val());
                $('#' + valueName + 'Value').html(this.values[i]);
                $('.' + valueName + 'Var').html(this.values[i]);
                console.log(this.values[i]);
                this.setBeginningCoordinates();
                this.animationModeTime = 0;
            }, this));
        }

        $('#opacityInput').bind('input', $.proxy(function () {
            this.opacity = $("#opacityInput").val();
            $("#opacityValue").html(this.opacity);
            this.animationModeTime = 0;
        }, this));

        $('#randomColorInput').change($.proxy(function () {
            this.randomColor = !this.randomColor;
        }, this));

        $('#clearButton').click($.proxy(function () {
            this.clearPixelsArray();
            this.clearCanvas();
            this.setBeginningCoordinates();
            this.animationModeTime = 0;
            return false;
        }, this));

        $('#stopButton').click($.proxy(function () {
            this.stop = !this.stop;

            if (this.stop) {
                $('#stopButton').html('Start');
            } else {
                $('#stopButton').html('Stop');
            }

            return false;
        }, this));

        $('#examples').change($.proxy(function () {
            let selectedIndex = $('select[name=examples]').val();
            if (selectedIndex === -1) {
                return;
            }

            this.loadExample(selectedIndex);
            this.animationModeTime = 0;
        }, this));
    }

    loadExample(index) {
        let selectedExample = this.examples[index];
        this.values = selectedExample.values;
        this.opacity = selectedExample.opacity;
        this.setSlidersValues();
        this.setSlidersLabelsValues();
        this.setFormulaVariables();
    }

    setBeginningCoordinates() {
        this.x = 0;
        this.y = 0;
    }

    setFormulaVariables() {
        for (let i = 0; i < this.valuesNames.length; ++i) {
            $('.' + this.valuesNames[i] + 'Var').html(this.values[i]);
        }
    }

    setSlidersLabelsValues() {
        for (let i = 0; i < this.valuesNames.length; ++i) {
            $('#' + this.valuesNames[i] + 'Value').html(this.values[i]);
        }
        $('#opacityValue').html(this.opacity);
    }

    setSlidersValues() {
        for (let i = 0; i < this.valuesNames.length; ++i) {
            $('#' + this.valuesNames[i] + 'Input').val(this.values[i]);
        }
        $('#opacityInput').val(this.opacity);
    }

    clearPixelsArray() {
        for (let i = 0; i <= this.sizeX; ++i) {
            this.pixels[i] = [];
            for (let j = 0; j <= this.sizeY; ++j) {
                this.pixels[i][j] = 0;
            }
        }
    }

    prepareCanvas() {
        this.canvas = document.getElementById(this.canvasId);
        this.canvas.width = this.sizeX;
        this.canvas.height = this.sizeY;
        this.ctx = this.canvas.getContext('2d');
        this.clearCanvas();
    }

    prepareNeonColors() {
        this.neonColors = [0xFF355E, 0xFD5B78, 0xFF6037, 0xFF9966, 0xFF9933, 0xFFCC33, 0xFFFF66, 0xFFFF66, 0xCCFF00, 0x66FF66, 0xAAF0D1, 0x50BFE6, 0xFF6EFF, 0xEE34D2, 0xFF00CC, 0xFF00CC];
        this.neonColorIndex = 0;
    }

    changeNeonColor() {
        this.neonColorIndex += 1;
        this.neonColorIndex %= this.neonColors.length;
        this.color = this.neonColors[this.neonColorIndex];
    }

    clearCanvas() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.sizeX, this.sizeY);
        this.image = this.ctx.getImageData(0, 0, this.sizeX, this.sizeY);
    }

    animationMode() {
        this.animationModeTime += 1;
        if (this.animationModeTime < this.animationModeChangeTime) {
            return;
        }

        this.animationModeTime = 0;
        this.color = this.neonColors[Math.round(Math.random() * this.neonColors.length)];
        $('#colorInput').val(this.hex2str(this.color));
        this.loadExample(Math.round(Math.random() * this.examples.length));
        this.clearPixelsArray();
        this.clearCanvas();
        this.setBeginningCoordinates();
    }

    draw() {
        requestAnimationFrame(this.draw);
    }

    fillPixel(x, y, r, g, b, a) {
        let index = (y * this.sizeX + x) * 4;
        this.image.data[index] = r;
        this.image.data[index + 1] = g;
        this.image.data[index + 2] = b;
        this.image.data[index + 3] = a;
    }

    hex2str(color) {
        if (typeof color === 'number') {
            color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
        }

        return color;
    }

    hex2rgb(hex) {
        let rgb = [];
        rgb[0] = (hex >> 16 & 255) / 255;
        rgb[1] = (hex >> 8 & 255) / 255;
        rgb[2] = (255 & hex) / 255;
        return rgb;
    }

    sgn(a) {
        if (a < 0) {
            return -1;
        } else if (a > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    prepareExamples() {
        console.log('Not implemented');
    }

    populateExamples() {
        for (let i = 0; i < this.examples.length; ++i) {
            $('#examples').append('<option value="' + i + '">' + this.examples[i].name + '</option>');
        }
    }
}

/**
 * Created by blackbat on 06.04.2017.
 */
class SymmetricIconAttractor extends Attractor {
    constructor(canvasId) {
        super(canvasId, ['l', 'a', 'b', 'g', 'o', 'd']);
    }

    prepareBeginningValues() {
        this.values = [-2.5, 5.0, -1.9, 1.0, 0.188, 5.0];
    }

    prepareScale() {
        this.scale = this.sizeX / 3;
    }

    setBeginningCoordinates() {
        this.x = 0.01;
        this.y = 0.01;
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this));
        if (this.stop) {
            return;
        }

        this.animationMode();
        let xn, yn;
        for (let i = 0; i < this.speed; ++i) {
            let zzbar = this.x * this.x + this.y * this.y;
            let p = this.values[1] * zzbar + this.values[0];
            let zreal = this.x;
            let zimag = this.y;
            for (let j = 1; j <= this.values[5] - 2; j++) {
                let za = zreal * this.x - zimag * this.y;
                let zb = zimag * this.x + zreal * this.y;
                zreal = za;
                zimag = zb;
            }

            let zn = this.x * zreal - this.y * zimag;
            p = p + this.values[2] * zn;
            xn = p * this.x + this.values[3] * zreal - this.values[4] * this.y;
            yn = p * this.y - this.values[3] * zimag + this.values[4] * this.x;
            this.x = xn;
            this.y = yn;

            let cx = Math.round(this.centerX + this.x * this.scale),
                cy = Math.round(this.centerY + this.y * this.scale);
            if (cx < 0 || cy < 0 || cx > this.sizeX || cy > this.sizeY) {
                continue;
            }

            let rgb = this.hex2rgb(this.color);

            this.ctx.fillStyle = 'rgba(' + rgb[0] * 255 + ',' + rgb[1] * 255 + ',' + rgb[2] * 255 + ',' + this.opacity + ')';
            this.ctx.fillRect(cx, cy, 1, 1);
        }
    }

    prepareExamples() {
        let n = 0;
        this.examples[n++] = {
            name: n,
            values: [-2.5, 5, -1.9, 1, 0.188, 5],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [1.56, -1, 0.1, -0.82, 0.12, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-1.806, 1.806, 0, 1, 0, 5],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.195, 10, -12, 1, 0, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [2.5, -2.5, 0, 0.9, 0, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.05, 3, -16.79, 1, 0, 9],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.7, 5, 1.5, 1, 0, 6],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [2.409, -2.5, 0, 0.9, 0, 23],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.08, 1, -0.1, 0.167, 0, 7],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.32, 2.32, 0, 0.75, 0, 5],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [2.6, -2, 0, -0.5, 0, 5],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-2.34, 2, 0.2, 0.1, 0, 5],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [-1.86, 2, 0, 1, 0.1, 4],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [1.56, -1, 0.1, -0.82, 0, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [1.5, -1, 0.1, -0.805, 0, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [1.455, -1, 0.03, -0.8, 0, 3],
            opacity: 0.05
        };
        this.examples[n++] = {
            name: n,
            values: [2.39, -2.5, -0.1, 0.9, -0.15, 16],
            opacity: 0.05
        };
    }
}