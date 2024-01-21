import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import ColorBar from "../components/colorbar";
import { Canvas } from "../../model-controller/Attractor/canvas";
import { CliffordIterator, Iterator, SymmetricIconIterator } from "../../model-controller/Attractor/iterator";
import { Grid } from "../../model-controller/Attractor/grid";
import { Palette } from "../../model-controller/Attractor/pallette";

let grid: Grid;
// A=-1.7 B=1.3 C=-0.1 D=-1.21
let iterator: Iterator = new CliffordIterator(-1.7, 1.3, -0.1, -1.21);
//let iterator: Iterator = new SymmetricIconIterator(5, 1.5, 1, 0, 0, -2.7, 6, 0);
let palette: Palette = new Palette(
  [
    { position: 0, red: 0, green: 0, blue: 0 },
    { position: 0, red: 133, green: 51, blue: 18 },
    { position: 0.0189474, red: 206, green: 230, blue: 201 },
    { position: 0.0378947, red: 38, green: 38, blue: 68 },
    { position: 0.0589474, red: 255, green: 115, blue: 0 },
    { position: 0.0778947, red: 255, green: 255, blue: 0 },
    { position: 0.128421, red: 255, green: 255, blue: 255 },
    { position: 0.157895, red: 0, green: 255, blue: 0 },
    { position: 0.210526, red: 248, green: 8, blue: 0 },
    { position: 1, red: 255, green: 0, blue: 0 },
  ],
  () => {}
);
let c: Canvas;

function Home(props) {
  const canvasRef = useRef(null);
  let canvas: any = undefined;
  useEffect(() => {
    canvas = canvasRef.current;
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;

    grid = new Grid(canvas.width, 1);
    c = new Canvas(0.001, 0.001, 0.2, iterator, grid);

    setInterval(() => {
      c.iterate();
      /*
      const { x, y } = c.iterate1();
      grid.setValue(x,y)
      drawxy(x, y);
      */
      draw();
    }, 1);
  }, []);

  const draw = () => {
    if (canvas) {
      let size = canvas.width;
      const context = canvas.getContext("2d");
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const hitRatio = grid.getValue(i, j);
          context.fillStyle = palette.getColorHex(hitRatio); //"#000000";
          context.fillRect(i, j, 1, 1);
        }
      }
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

const Text1 = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  color: #121212;
  font-size: 40px;
  margin-top: 183px;
  margin-left: 359px;
  text-align: center;
  align-self: center;
`;

const Text2 = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  color: #121212;
  font-size: 200px;
  margin-top: 37px;
  margin-left: 511px;
  text-align: center;
  align-self: center;
`;

export default Home;

/*
<ColorBar
        colorsArray={[
            { color: '#000000', percentage: 0 },   // Red
            { color: '#FF00F0', percentage: 10 },   // Red
            { color: '#00FF0F', percentage: 30 },   // Green
            { color: '#0F00FF', percentage: 60 },   // Blue
            { color: '#FFFFFF', percentage: 100 },   // Blue
          ]}
      />
      */
