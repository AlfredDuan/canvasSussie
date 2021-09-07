// you can set the defualt canvas by setting true or false
const suisse = new Suisse(false);

function parseCommand(command) {
  let [operator, ...params] = command.split(" ");

  if (!/^[a-zA-Z][a-zA-Z0-9\#]{0,26}$/.test(command.replace(/\s/g, ""))) {
    return alert("invalid format of command parameters: " + command.toString());
  }

  params = params.filter(Boolean);

  switch (operator.toUpperCase()) {
    case "C":
      if (params.length !== 2) {
        return alert("invalid format of parameters: " + params.toString());
      }
      suisse.createCanvas(...params);
      break;
    case "L":
      if (params.length !== 4) {
        return alert("invalid format of parameters: " + params.toString());
      }
      suisse.drawLine(...params);
      break;
    case "R":
      if (params.length !== 4) {
        return alert("invalid format of parameters: " + params.toString());
      }
      suisse.drawRect(...params);
      break;
    case "B":
      if (params.length !== 2 && params.length !== 3) {
        return alert("invalid format of parameters: " + params.toString());
      }
      suisse.fillPath(...params);
      break;
    case "E":
      if (params.length !== 3) {
        return alert("invalid format of parameters: " + params.toString());
      }
      suisse.drawCircle(...params);
      break;
    case "Q":
      suisse.clearCanvas();
      break;
    default:
      break;
  }
}

window.onload = function () {
  const commandIpt = document.getElementById("command");
  commandIpt &&
    commandIpt.addEventListener("keydown", function (ev) {
      const keyCode = ev.keyCode;
      if (keyCode === 13) {
        parseCommand(this.value.trim());
        this.value = "";
      }
    });
};
