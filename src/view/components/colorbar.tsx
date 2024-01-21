import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

function ColorBar({ colorsArray }) {
  const containerRef = useRef(null);
  const [colors, setColors] = useState(colorsArray);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // You can use containerWidth here or set it in your state, depending on your use case
      const width = containerRef.current.getBoundingClientRect().width;
      setContainerWidth(width);
      console.log("containerWidt", containerWidth);
    }
  }, []);

  const gradient = `linear-gradient(to right, ${colors
    .map((stop) => `${stop.color} ${stop.percentage}%`)
    .join(", ")})`;

  const containerStyle = {
    width: "100%",
    height: "20px", // Adjust the height as needed for the color bar
    position: "relative",
  };

  const barStyle = {
    width: "100%",
    height: "100%", // Adjust the height as needed
    background: gradient,
  };

  const handleDrag = (index, data) => {
    const newColorStops = [...colors];
    let percentage = (data.x / containerWidth) * 100;
    console.log("data", data.x, index, (data.x / containerWidth) * 100);

    const prevStop = newColorStops[index - 1];
    const nextStop = newColorStops[index + 1];

    // Check and set boundaries
    if (prevStop && percentage < prevStop.percentage) {
      percentage = prevStop.percentage;
    }
    if (nextStop && percentage > nextStop.percentage) {
      percentage = nextStop.percentage;
    }

    newColorStops[index].percentage = percentage;
    setColors(newColorStops);
  };

  colors.map((color, index) => {
    console.log("percante", (color.percentage / 100) * containerWidth);
  });
  const lines = colors.map((color, index) => (
    <Draggable
      key={index}
      axis="x"
      bounds="parent"
      position={{ x: (color.percentage / 100) * containerWidth, y: 0 }}
      onDrag={(e, data) => handleDrag(index, data)}
    >
      <div
        style={{
          left: `${(color.percentage / 100) * containerWidth}`,
          top: 0,
          height: "100%",
          width: "3px",
          background: "black",
          position: "absolute",
        }}
      ></div>
    </Draggable>
  ));

  return (
    <div style={containerStyle}>
      <div ref={containerRef} style={barStyle}></div>
      {lines}
    </div>
  );
}

export default ColorBar;
