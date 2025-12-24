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

  // Binary search to find the color index for a given position - O(log n) instead of O(n)
  private findColorIndex(position: number): number {
    let low = 0;
    let high = this.colors.length - 2; // -2 because we need i and i+1

    while (low < high) {
      const mid = (low + high + 1) >> 1; // Use bit shift for faster division
      if (this.colors[mid].position <= position) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return low;
  }

  color(position: number): Color {
    // Note: position 0 now uses the palette's first color
    // Background pixels (0 hits) are handled separately in rendering
    if (position >= 0 && position <= 1) {
      // Use binary search instead of linear search
      const i = this.findColorIndex(position);

      const c1 = this.colors[i];
      const c2 = this.colors[i + 1];

      // Calculate interpolation ratio
      const range = c2.position - c1.position;
      const t = range === 0 ? 0 : (position - c1.position) / range;

      return {
        position,
        red: Math.round(t * (c2.red - c1.red) + c1.red),
        green: Math.round(t * (c2.green - c1.green) + c1.green),
        blue: Math.round(t * (c2.blue - c1.blue) + c1.blue),
      };
    }

    return { position, red: 255, green: 255, blue: 255 };
  }

  getColorHex(val: number): string {
    // Reuse color() method to avoid duplication
    const c = this.color(val);
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(c.red)}${toHex(c.green)}${toHex(c.blue)}`;
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

  getPalette(): Color[] {
    return this.colors;
  }

  setPalette(palette: Color[]): void {
    this.colors = palette;
  }

  setColor(nr: number, r: number, g: number, b: number): void {
    this.colors[nr].red = r;
    this.colors[nr].green = g;
    this.colors[nr].blue = b;
    this.paletteChanged();
  }

  getPosition(nr: number): number {
    return this.colors[nr].position;
  }
}