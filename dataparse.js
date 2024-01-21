const fs = require("fs");

// Read the data from the input file
fs.readFile("input.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const parameterSets = data.split("end=\n").filter(Boolean);
  const parsedData = [];

  for (const parameterSet of parameterSets) {
    const lines = parameterSet.trim().split("\n");
    const parameters = {
      name: "",
      alpha: 0,
      betha: 0,
      gamma: 0,
      delta: 0,
      omega: 0,
      lambda: 0,
      degree: 0,
      npdegree: 0,
      scale: 0,
      paletteData: [],
    };

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);

      console.log("parts", parts);

      if (parts.length === 4) {
        const position = parseFloat(parts[0]);
        const red = parseInt(parts[1]);
        const green = parseInt(parts[2]);
        const blue = parseInt(parts[3]);

        parameters.paletteData.push({ position, red, green, blue });
      } else {
        const partsSecond = parts[0].trim().split('=');
       if (partsSecond[0] === "Parameterset") {
          parameters.name = partsSecond[1];
        } else if (partsSecond[0] === "alpha") {
          parameters.alpha = parseFloat(partsSecond[1]);
        } else if ( partsSecond[0] === "betha") {
          parameters.betha = parseFloat( partsSecond[1]);
        } else if ( partsSecond[0] === "gamma") {
          parameters.gamma = parseFloat(partsSecond[1]);
        } else if (partsSecond[0] === "delta") {
          parameters.delta = parseFloat(partsSecond[1]);
        } else if (partsSecond[0] === "omega") {
          parameters.omega = parseFloat(partsSecond[1]);
        } else if (partsSecond[0] === "lambda") {
          parameters.lambda = parseFloat(partsSecond[1]);
        } else if (partsSecond[0] === "partsSecond") {
          parameters.degree = parseInt(partsSecond[1]);
        } else if (partsSecond[0] === "npdegree") {
          parameters.npdegree = parseInt(partsSecond[1]);
        } else if (partsSecond[0] === "scale") {
          parameters.scale = parseFloat(partsSecond[1]);
        } 
      }
    }

    parsedData.push(parameters);
  }

  // Write the parsed data to an output JSON file
  fs.writeFile("output.json", JSON.stringify(parsedData, null, 2), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Parsed data has been written to output.json");
    }
  });
});
