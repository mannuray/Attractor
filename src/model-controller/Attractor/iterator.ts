export interface Iterator {
  iterate(xpos: number, ypos: number): { xpos: number; ypos: number };
}

export class SymmetricIconIterator implements Iterator {
  constructor(
    private alpha: number,
    private betha: number,
    private gamma: number,
    private delta: number,
    private omega: number,
    private lambda: number,
    private degree: number,
    private npdegree: number
  ) {
    console.log(
      "value ",
      this.alpha,
      this.betha,
      this.gamma,
      this.delta,
      this.omega,
      this.degree
    );
  }

  public iterate(xpos: number, ypos: number): { xpos: number; ypos: number } {
    let zzbar: number, zz: number;
    let zreal: number, zimag: number;
    let za: number, zb: number, zn: number, zc: number, zd: number;

    zzbar = xpos * xpos + ypos * ypos;

    if (this.delta !== 0) {
      zz = Math.sqrt(zzbar);
      zc = 1;
      zd = 0;
      zreal = xpos / zz;
      zimag = ypos / zz;

      for (let j = 0; j < this.npdegree * this.degree; j++) {
        za = zc * zreal - zd * zimag;
        zb = zd * zreal + zc * zimag;
        zc = za;
        zd = zb;
      }
    } else {
      zc = 0;
      zz = 0;
    }

    zreal = xpos;
    zimag = ypos;

    for (let i = 0; i < this.degree - 2; i++) {
      za = zreal * xpos - zimag * ypos;
      zb = zimag * xpos + zreal * ypos;
      zreal = za;
      zimag = zb;
    }

    zn = xpos * zreal - ypos * zimag;
    const p =
      this.lambda + this.alpha * zzbar + this.betha * zn + this.delta * zz * zc;

    let nxpos = p * xpos + this.gamma * zreal - this.omega * ypos;
    let nypos = p * ypos - this.gamma * zimag + this.omega * xpos;

    return { xpos: nxpos, ypos: nypos };
  }
}

export class CliffordIterator implements Iterator {
  constructor(
    private a: number,
    private b: number,
    private c: number,
    private d: number
  ) {}
  iterate(xpos: number, ypos: number): { xpos: number; ypos: number } {
    return {
      xpos: Math.sin(this.a * ypos) + this.c * Math.cos(this.a * xpos),
      ypos: Math.sin(this.b * xpos) + this.d * Math.cos(this.b * ypos),
    };
  }
}
