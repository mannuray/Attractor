export class Color {
  position: number;
  red: number;
  green: number;
  blue: number;
}

export class Palette {
  private colors: Color[] = [];
  private paletteChanged: any;

  constructor(palette: Color[] | undefined, paletteChanged: any) {
    if (!palette) {
      this.colors.push({ position: 0, red: 0, green: 0, blue: 0 });
      this.colors.push({ position: 1, red: 255, green: 255, blue: 255 });
    } else {
      this.colors = palette;
    }

    this.paletteChanged = paletteChanged;
  }

  color(val: number): Color {
    let i = 0;
    let verh: number;

    if (val >= 0 && val <= 1) {
      while (this.colors[i + 1].position < val) i++;

      if (this.colors[i + 1].position === this.colors[i].position) verh = 0;
      else
        verh =
          (val - this.colors[i].position) /
          (this.colors[i + 1].position - this.colors[i].position);

      const red = Math.round(
        verh * (this.colors[i + 1].red - this.colors[i].red) +
          this.colors[i].red
      );
      const green = Math.round(
        verh * (this.colors[i + 1].green - this.colors[i].green) +
          this.colors[i].green
      );
      const blue = Math.round(
        verh * (this.colors[i + 1].blue - this.colors[i].blue) +
          this.colors[i].blue
      );

      return { position: 0, red, green, blue };
    }

    return { position: 0, red: 0, green: 0, blue: 0 };
  }

  getColorHex(val: number): String {
    if( val == 0 ) return '#FFFFFF'
    let i = 0;
    let verh: number;

    if (val >= 0 && val <= 1) {
      while (this.colors[i + 1].position < val) i++;

      if (this.colors[i + 1].position === this.colors[i].position) verh = 0;
      else
        verh =
          (val - this.colors[i].position) /
          (this.colors[i + 1].position - this.colors[i].position);

      const red = Math.round(
        verh * (this.colors[i + 1].red - this.colors[i].red) +
          this.colors[i].red
      ).toString(16);
      const green = Math.round(
        verh * (this.colors[i + 1].green - this.colors[i].green) +
          this.colors[i].green
      ).toString(16);
      const blue = Math.round(
        verh * (this.colors[i + 1].blue - this.colors[i].blue) +
          this.colors[i].blue
      ).toString(16);

      return '#' + red + green + blue;
    }

    return '#FFFFFF';
  }

  

  addPosition(pos: number): number {
    if (pos >= 1 || pos <= 0) return -1;

    let insertIndex = 0;
    const newColor: Color = { position: pos, red: 225, green: 255, blue: 255 };
    for (let i = 0; i < this.colors.length; i++) {
      if (newColor.position < this.colors[i].position) {
        insertIndex = i;
        break;
      }
    }

    // Insert the new color at the found index
    this.colors.splice(insertIndex, 0, newColor);
    this.paletteChanged();

    return insertIndex;
  }

  delPosition(nr: number): void {
    if (nr > 0 && nr < this.colors.length - 1) {
      this.colors.splice(nr, 1);
      this.paletteChanged();
    }
  }

  movePosition(nr: number, target: number): void {
    if (nr > 0 && nr < this.colors.length - 1) {
      if (target > this.colors[nr + 1].position)
        target = this.colors[nr + 1].position;
      if (target < this.colors[nr - 1].position)
        target = this.colors[nr - 1].position;

      this.colors[nr].position = target;
      this.paletteChanged();
    }
  }

  getPositionCount(): number {
    return this.colors.length;
  }

  getColor(nr: number): Color {
    return this.colors[nr];
  }

  setColor(nr: number, r: number, g: number, b: number): void {
    this.color[nr].red = r;
    this.colors[nr].green = g;
    this.colors[nr].blue = b;
    this.paletteChanged();
  }

  getPosition(nr: number): number {
    return this.colors[nr].position;
  }
}