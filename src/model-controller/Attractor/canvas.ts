import { Grid } from "./grid";
import { Iterator, SymmetricIconIterator } from "./iterator";
import { Palette } from "./pallette";

export class Canvas {
  private iterating: boolean = true;
  private currentPosition = { xpos: 0, ypos: 0 };
  private grid_size: number = 0;
  private iterationPerRun = 10000000;

  /*
  alpha = 5;
  betha = 1.5;
  gamma = 1;
  delta = 0;
  omega = 0;
  lambda = -2.7;
  degree = 6;
  npdegree = 0;
  */

  constructor(
    ix: number,
    iy: number,
    private scale: number,
    private iterator: Iterator, 
    private grid: Grid 
  ) {
    this.currentPosition.xpos = ix;
    this.currentPosition.ypos = iy;
    this.scale = scale;
    this.grid_size = grid.gridSize;
  }

  startIteration = () => {
    this.iterating = true;
  };
  stopIteration = () => {
    this.iterating = false;
  };

  iterate() {
    if(!this.iterating) return;
    let it = this.iterationPerRun;
    console.log('run ', it)
    while (it > 0) {
      const { x, y } = this.iterate1();
      this.grid.setValue(x, y);
      it--;
    }
  }

  iterate1(): { x: number; y: number } {
    this.currentPosition = this.iterator.iterate(
      this.currentPosition.xpos,
      this.currentPosition.ypos
    );

    const gridX = Math.round(
      this.currentPosition.xpos * this.scale * this.grid_size +
        this.grid_size / 2
    );
    const gridY = Math.round(
      this.currentPosition.ypos * this.scale * this.grid_size +
        this.grid_size / 2
    );

    return { x: gridX, y: gridY };
  }
}
