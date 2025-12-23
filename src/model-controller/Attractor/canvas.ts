import { Iterator, Point } from "./iterator";
import { Palette } from "./palette";

export class Canvas {
  public readonly iterator_size: number;

  private hits = [];
  maxHits: number;

  private iterating: boolean = true;
  private currentPosition = { xpos: 0, ypos: 0 };
  private iterationPerRun = 10000000;

  constructor(
    initial_position: Point,
    public readonly canvas_size: number,
    private readonly alias: number,
    private readonly scale: number,
    private iterator: Iterator,
    public palette: Palette
  ) {
    this.currentPosition.xpos = initial_position.xpos;
    this.currentPosition.ypos = initial_position.ypos;
    this.scale = scale;

    this.iterator_size = this.canvas_size * this.alias;
    this.maxHits = 0;

    /*
    let l = this.iterator_size * this.iterator_size;
    for (let i = 0; i < l; i++) {
      this.hits[i] = 0;
    }
    */
    for( let i = 0; i < this.iterator_size; i++ ) {
      this.hits[i] = [this.iterator_size]
      for ( let j = 0; j < this.iterator_size; j++ ) {
        this.hits[i][j] = 0

      }
    }
  }

  startIteration() {
    this.iterating = true;
  };
  stopIteration() {
    this.iterating = false;
  };

  iterate() {
    if (!this.iterating) return;
    let it = this.iterationPerRun;
    while (it > 0) {
      this.iterate1();
      it--;
      //this.iterating = false;
    }
  }

  getHits() {
    return this.hits;
  }

  getColorXY(x: number, y: number): any {
    let red = 0;
    let green = 0;
    let blue = 0;

    let startX = x * this.alias
    let endX = startX + this.alias
    
    let startY = y * this.alias
    let endY = startY + this.alias

    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        let c = this.hits[j][i] / this.maxHits;

        const col = this.palette.color(c * 12);
        red += col.red;
        green += col.green;
        blue += col.blue;
      }
    }

    red = Math.round(red / (this.alias * this.alias));
    green = Math.round(green / (this.alias * this.alias));
    blue = Math.round(blue / (this.alias * this.alias));

    return this.toHex(red, green, blue);
  }

  getColor(arg: number): any {
    let pos = arg;
    let red = 0;
    let green = 0;
    let blue = 0;

    for (let i = 0; i < this.alias; i++) {
      for (let j = 0; j < this.alias; j++) {
        let c = this.hits[pos] / this.maxHits;

        const col = this.palette.color(c * 12);
        red += col.red;
        green += col.green;
        blue += col.blue;

        pos++;
      }

      pos += this.iterator_size - this.alias;
    }

    red = Math.round(red / (this.alias * this.alias));
    green = Math.round(green / (this.alias * this.alias));
    blue = Math.round(blue / (this.alias * this.alias));

    return this.toHex(red, green, blue);
  }

  getColorSecond(arg: number): any {
    let pos = arg;
    let hitRatio = 0;

    for (let i = 0; i < this.alias; i++) {
      for (let j = 0; j < this.alias; j++) {
        hitRatio += this.hits[pos] / this.maxHits;
        pos++;
      }

      pos += this.iterator_size - this.alias;
    }

    hitRatio /= this.alias * this.alias

    let color = this.palette.color(hitRatio * 12)

    return this.toHex(color.red, color.green, color.blue);
  }

  private iterate1(): { x: number; y: number } {
    this.currentPosition = this.iterator.iterate(this.currentPosition);
    //console.log('cunenu', this.currentPosition)

    const yp = Math.round(
      this.currentPosition.ypos * this.scale * this.iterator_size +
        this.iterator_size / 2
    );
    const xp = Math.round(
      this.currentPosition.xpos * this.scale * this.iterator_size +
        this.iterator_size / 2
    );

    /*
    if (yp < this.iterator_size && xp < this.iterator_size) {
      let hi = ++this.hits[yp * this.iterator_size + xp];
      if (hi > this.maxHits) this.maxHits = hi;
    }
    */
    if (yp < this.iterator_size && xp < this.iterator_size) {
      let hi = ++this.hits[xp][yp]
      if (hi > this.maxHits) this.maxHits = hi;
    }
    

    return { x: xp, y: yp };
  }

  private toHex(red: number, green: number, blue: number): string {
    const redHex = red.toString(16).padStart(2, "0");
    const greenHex = green.toString(16).padStart(2, "0");
    const blueHex = blue.toString(16).padStart(2, "0");
    return `#${redHex}${greenHex}${blueHex}`;
  }
}
