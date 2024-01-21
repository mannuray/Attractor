export class Grid {
  private readonly size: number;
  private readonly alias: number;
  private readonly grid: number[][];
  readonly gridSize: number;
  maxHits: number;

  constructor(size: number, alias: number) {
    this.size = size;
    this.alias = alias;
    this.gridSize = size * alias;
    this.grid = [];
    this.maxHits = 0;

    // Initialize the grid with zeros
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = 0;
      }
    }
  }

  setValue(row: number, col: number): number {
    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      this.grid[row][col] += 1;
      let hits = this.grid[row][col]

      if(hits > this.maxHits) this.maxHits = hits
      return this.grid[row][col];
    }

    return -1
  }

  getValue(row: number, col: number): number {
    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      const sizePerCell = this.alias;
      const startRow = row * sizePerCell;
      const startCol = col * sizePerCell;
      const endRow = startRow + sizePerCell;
      const endCol = startCol + sizePerCell;

      let sum = 0;

      for (let i = startRow; i < endRow; i++) {
        for (let j = startCol; j < endCol; j++) {
          sum += this.grid[i][j];
        }
      }

      return (sum /  (this.alias * this.alias)) / this.maxHits;
    }
    return 0; // Return 0 for out-of-bounds indices
  }
}
