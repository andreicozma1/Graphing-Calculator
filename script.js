var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var parsedEquationTextAreaE = document.getElementById("computedEquationId");
var resizeSeparatorE = document.getElementById("resizeSeparatorID");
var cellWidthE = document.getElementById("cellWidthId");
cellWidthE.value = window.innerWidth / 80;
var cellHeightE = document.getElementById("cellHeightId");
var aspectRatioE = document.getElementById("checkBoxId");
var menuE = document.getElementById("menu");
var mainTableE = document.getElementById("mainTable");
var xCoordE = document.getElementById("xCoord");
var yCoordE = document.getElementById("yCoord");
// ^^ sets up variables for each element that
// we'll be using from our HTML document

var translateX = 0;
var translateY = 0;
//^^ used to move the graph left, right, up, and down;
//^ Default centered at (0,0)
var newWidth = mainTableE.offsetWidth / 1.5;
//^^ Variable used for manipulating the width of the canvas
var canResize = false;
// Gets set to true whene clicking on the resizeSeparator Element
var canMove = false;
//^^ Whether you can move the graph around
// When set to true, the graph follows the mouse position

var originalEquations = [];
var redoneEquations = [];
// ^^ used to keep track of the equations and their
// computed JavaScript equivalents that the user inputs

var gridWidth;
var gridHeight;
//^^ Defines how many cells we have horizintally and vertically

var cellWidth;
var cellHeight;
//^^ computed width and height of each cell, in pixels

var focusElem;
//^^ Used to determine which function input box has focus, to display the right JS equation for it
onResize();
//^^ Initial function call to set up the right sizes for all the variables
window.addEventListener("resize", onResize);

function onResize() {
  resize();
  onChange();
}
//^^ Sets up the onResize listener to redraw the canvas whenever the user resizes the browser window

function redrawCells() {
  //console.log("Redrawing GRID")
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //^^ Clears canvas
  drawCells();
  drawAxes();
  drawCrossHair();
  //^^ Redraws all elements of the graph
}

function resize() {
  //console.log("Adjusting size variables")
  if (canvas.width != newWidth) {
    canvas.width = newWidth;
    canvContainer.width = canvas.width;
  }
  var newHeight = window.innerHeight * 0.96;
  if (canvas.height != newHeight) {
    canvas.height = newHeight;
  }
  canvas.aspectRatio = canvas.width / canvas.height;
} // ^^ Sets the width and the height of the canvas element to the new computed values

document.addEventListener("mousemove", function (e) {
  //console.log("Moved mouse");
  if (canResize) {
    //console.log("& resizing");
    var nextWidth = mainTableE.offsetWidth - e.clientX - 10;
    if (
      (newWidth >= 50 || nextWidth > newWidth) &&
      (newWidth + menu.offsetWidth <= window.innerWidth - 35 ||
        nextWidth < newWidth)
    ) {
      newWidth = nextWidth;
      onResize();
    }
  }
  if (canMove) {
    //console.log("& moving");
    translateX += e.movementX;
    xCoordE.value = -translateX / cellWidth;
    translateY += e.movementY;
    yCoordE.value = translateY / cellHeight;
    onResize();
  }
});
//^^ Adds a mouse move event handler to be able to handle resizing
// the canvas with the resize separator as well as moving the graph left, right, up, and down when clicking and dragging

function moveX() {
  if (xCoordE.value != "") {
    translateX = -xCoordE.value * cellWidth;
    onResize();
  }
}

function moveY() {
  if (yCoordE.value != "") {
    translateY = yCoordE.value * cellHeight;
    onResize();
  }
}
//^^ Used to move the graph to a specific point when the user inputs values into the corresponding HTML elements

canvas.addEventListener("mousedown", function (e) {
  canMove = true;
  // When the user clicks  they can move the canvas around with the mouse
});
resizeSeparatorE.addEventListener("mousedown", function (e) {
  event.preventDefault();
  canResize = true;
  document.body.style.cursor = "ew-resize";
  // When the user clicks the resize separator they can resize the canvas.
  // Also changes cursor to resize
});
document.addEventListener("mouseup", function (e) {
  canResize = false;
  canMove = false;
  // When mouseup cant resize or move anymore
  document.body.style.cursor = "auto";
  // sets cursor back to default
  if (focusElem != null) {
    var textInBox = document.getElementById(focusElem).value;
    if (textInBox != "") {
      parsedEquationTextAreaE.value = redoneEquations[parseInt(focusElem[3])];
    } else {
      parsedEquationTextAreaE.value = "";
    }
  }
  // Sets the JS Equation box to the parsed equation in the input element that has focus.
  // ^^ Used for debugging
});
var timeout;
document.addEventListener("keyup", function (e) {
  if (e.keyCode == 13) {
    onResize();
    //When clicking RETURN, redraw everything;
  }
  timeout = setTimeout(checkInputBoxes, 200);
  // Wait 200ms before drawing to save some performance
});
document.addEventListener("keydown", function (e) {
  clearTimeout(timeout);
  // Used together with keyup and setTimeout. If the user clicks again within those 200ms then cancel call
});
var lastChanged;
canvas.addEventListener("mousewheel", function f(e) {
  e.preventDefault();
  var multiplier = e.deltaY / 100;
  zoom(multiplier);
  // Zooming in and out when pinching touchpad or moving mouse wheel
});

function zoom(amt = 1) {
  var nextWidthVal = parseFloat(cellWidthE.value) + amt;
  var nextHeightVal = parseFloat(cellHeightE.value) + amt;
  if (nextWidthVal > 0) {
    cellWidthE.value = nextWidthVal;
  }
  if (nextHeightVal > 0) {
    cellHeightE.value = nextHeightVal;
  }
  onChange();
  //Increments the dimensions of the grid by a specific amount
}

function onChange(e) {
  // Recalculates cell dimensions (W and H) and translations based on the grid dimensions
  if (e == 1 || lastChanged == null) {
    lastChanged = 1;
  }
  if (e == 2) {
    lastChanged = 2;
  }

  var newCellWidth = canvas.width / parseFloat(cellWidthE.value);
  var newCellHeight = canvas.height / parseFloat(cellHeightE.value);
  if (aspectRatioE.checked) {
    if (e == 1 || (e == null && (lastChanged == 1 || lastChanged == null))) {
      cellWidth = newCellWidth;
      cellHeight = cellWidth;
      cellHeightE.value = canvas.height / cellHeight;
    }
    if (e == 2 || (e == null && (lastChanged == 2 || lastChanged == null))) {
      cellHeight = newCellHeight;
      cellWidth = cellHeight;
      cellWidthE.value = canvas.width / cellWidth;
    }
  } else {
    cellWidth = newCellWidth;
    cellHeight = newCellHeight;
  }
  //^^ Takes care of aspect ratio logic and calculating one dimension based on another

  translateX = -parseFloat(xCoordE.value) * cellWidth;
  translateY = parseFloat(yCoordE.value) * cellHeight;
  //^^ Also translates canvas so it zooms about the crosshair
  redrawCells();
  // Draws graph
  checkInputBoxes();
  // CHecks and draws functions
}

function checkInputBoxes() {
  for (var i = 1; i <= 5; i++) {
    //Iterates through all 5 HTML input elements.
    var textInBox = document.getElementById("equ" + i).value;
    // The 5 HTML elements have IDs "equ1" through "equ5"
    // The text inside the box is stored inside the textInBox variable
    if (originalEquations[i] == null && textInBox != "") {
      originalEquations[i] = textInBox;
      redoneEquations[i] = parseEquation(textInBox);
      drawFunction(i);
      // This block of code just draws the function over eveything else; without clearing and redrawing
      parsedEquationTextAreaE.value = redoneEquations[i];
      // Updates a textbox with the parsed equation for debugging purposes.
    } else if (
      originalEquations[i] != textInBox &&
      originalEquations[i] != null
    ) {
      originalEquations = [];
      redoneEquations = [];
      onResize(); // Clears the canvas and redraws everything
      // If the current equation is different, it resets everything and tries to redraw/reparse if necessary
      if (textInBox != "") {
        parsedEquationTextAreaE.value = redoneEquations[i];
        // Updates a textbox with the parsed equation for debugging purposes.
      }
      break; // can exit this loop since onResize() ends up calling this whole function again.
    } else if (redoneEquations[i] != null) {
      drawFunction(i);
      // If the function has already been parsed, just reuse it.
    }
  }
}

function parseEquation(givenEquation) {
  var newEquation = givenEquation.toLowerCase();
  //^^ converts the user input to lower case for consistency
  newEquation = newEquation.split("[").join("(");
  newEquation = newEquation.split("]").join(")");
  newEquation = newEquation.split("{").join("(");
  newEquation = newEquation.split("}").join(")");
  newEquation = newEquation.split("x").join("(x)");
  newEquation = newEquation.split("pi").join("(Math.PI)");
  newEquation = newEquation.split(")(").join(")*(");
  newEquation = newEquation.split("math.").join("");
  newEquation = newEquation.split("ln").join("log");
  //^^replaces common math signs, constants, and functions with equivalents that would help when parsing

  var startIndex = 0; // holds the index of the beginning of a function whenever one is found
  var unmatchedParenthesisCount = 0; // holds the number of parentheses that haven't been closed. Used to close any missing parentheses
  for (var i = 0; i < newEquation.length; i++) {
    //^^ Iterates through each character of the string
    //^^ this time only used to perform certain changes that need to be performed before everything else
    if (newEquation[i] == ".") {
      if (
        isNumber(newEquation[i + 1]) &&
        (i == 0 || !isNumber(newEquation[i - 1]))
      ) {
        newEquation = newEquation.replace(
          "." + newEquation[i + 1],
          "0." + newEquation[i + 1]
        );
        // Replaces instances such as ".01" with "0.01" and so on for consistency
      }
    }
  }
  for (var i = 0; i < newEquation.length; i++) {
    //^^ Iterates through each character of the string
    if (isLetter(newEquation[i]) && (i < 1 || !isLetter(newEquation[i - 1]))) {
      startIndex = i;
      if (newEquation[i - 1] == "." && isLetter(newEquation[i - 2])) {
        startIndex = null;
      }
    }
    //^^ Determines when a function such as sin, sqrt, tan and so on starts and keeps track of the index
    try {
      // Try statement used to avoid errors at invalid indices when checking before and after
      if (
        newEquation[i] == "e" &&
        !isLetter(newEquation[i - 1]) &&
        !isLetter(newEquation[i + 1])
      ) {
        newEquation = newEquation.replace("e", "(Math.E)");
        //^^ Replaces the e constant to its JS equivalent.
      }
    } catch (e) {}
    if (isNumber(newEquation[i])) {
      if (isLetter(newEquation[i + 1]) || newEquation[i + 1] == "(") {
        newEquation = addMultiplication(newEquation, i + 1);
      }
      if (newEquation[i - 1] == ")") {
        newEquation = addMultiplication(newEquation, i);
      }
      //^^ Adds multiplication signs to be readable by JS
      // Ex: 22x becomes 22*x and (x)2 becomes (x)*2
    }
    if (isLetter(newEquation[i])) {
      if (
        (isLetter(newEquation[i - 1]) &&
          (isNumber(newEquation[i + 1]) || newEquation[i + 1] == "(")) ||
        newEquation[i + 1] == "|"
      ) {
        if (startIndex != null) {
          var functionFound = newEquation.slice(startIndex, i + 1);
          newEquation = newEquation.replace(
            functionFound,
            "Math." +
            functionFound +
            (isNumber(newEquation[i + 1]) || newEquation[i + 1] == "|" ?
              "(" :
              "")
          );
        }
      }
      //^^ Uses the startIndex found earlier to replace the found function with its JS equivalent using Math.
    }
    if (
      newEquation[i] == "^" &&
      !isOperator(newEquation[i + 1]) &&
      !isOperator(newEquation[i - 1])
    ) {
      // Parses powers
      var base;
      var power;
      //^^ Holds the found base and the power of the function
      var closedParenthesesCount = 0;
      var openParenthesesCount = 0;
      var hasBase = false;
      var baseStart = 0; // keeps track of the beginning index of the base
      for (var k = 1; k <= i; k++) {
        if (newEquation[i - 1] == ")") {
          if (newEquation[i - k] == ")") {
            closedParenthesesCount++;
          }
          if (newEquation[i - k] == "(") {
            openParenthesesCount++;
          }
          if (
            closedParenthesesCount != 0 &&
            closedParenthesesCount != 0 &&
            closedParenthesesCount == openParenthesesCount
          ) {
            base = newEquation.slice(i - k, i);
            break;
          }
        } else if (isNumber(newEquation[i - k])) {
          hasBase = true;
          baseStart = i - k;
        }
      }
      if (hasBase) {
        base = newEquation.slice(baseStart, i);
      }
      //^^ Computes the base before the "^" sign

      var powerEnd = 0; // keeps track of the end index of the power
      var hasPower = false;
      for (var k = i + 1; k < newEquation.length; k++) {
        if (newEquation[i + 1] == "(") {
          if (newEquation[k] == ")") {
            closedParenthesesCount++;
          }
          if (newEquation[k] == "(") {
            openParenthesesCount++;
          }
          if (
            closedParenthesesCount != 0 &&
            closedParenthesesCount != 0 &&
            closedParenthesesCount == openParenthesesCount
          ) {
            power = newEquation.slice(i + 1, k + 1);
            break;
          }
        } else if (
           isNumber(newEquation[k]) ||
          isLetter(newEquation[k]) ||
          newEquation[k] != "("
        ) {
          hasPower = true;
          powerEnd = k;
        }
      }
      if (hasPower) {
        power = newEquation.slice(i + 1, powerEnd + 1);
      }
      //^^ Computes the power after the "^" sign

      var origPowExpression = base + "^" + power;
      var newPowExpression = "Math.pow(" + base + "," + power + ")";
      newEquation = newEquation.split(origPowExpression).join(newPowExpression);
      //^^ Replaces the original power expression into one that JS can compute
    }
    if (newEquation[i] == "(") {
      if (
        isLetter(newEquation[i - 1]) &&
        (newEquation.substring(i - 2, i) == ".E" ||
          newEquation.substring(i - 3, i) == ".PI")
      ) {
        newEquation = addMultiplication(newEquation, i);
      } else {
        unmatchedParenthesisCount++;
      }
    }
    if (newEquation[i] == ")") {
      unmatchedParenthesisCount--;
    }
    if (newEquation[i] == "|") {
      if (!isOperator(newEquation[i + 1]) &&
        (isNumber(newEquation[i + 1]) ||
          isLetter(newEquation[i + 1]) ||
          newEquation[i + 1] == "(" ||
          newEquation[i + 1] == "|")
      ) {
        newEquation = newEquation.replace(
          "|",
          (isNumber(newEquation[i - 1]) || newEquation[i - 1] == ")" ?
            "*" :
            "") + "Math.abs("
        );
      } else {
        newEquation = newEquation.replace("|", ")");
        // Replaces the second absolute value sign with closed parentheses to close the JS function Math.abs( where it needs to be closed
        unmatchedParenthesisCount--;
      }
    }
    //^^ Resolves abosolute value signs and converts them into Math.abs();
  }
  newEquation = newEquation.split("math").join("Math");
  //Capitalizes Math
  newEquation = newEquation.split("arc").join("a");
  //Inverse trig functions that are written as arcsin() are converted into asin() since that's their JS equivalent
  while (unmatchedParenthesisCount > 0) {
    newEquation += ")";
    unmatchedParenthesisCount--;
  }
  //^^ Adds parentheses at the very end if any are missing

  return newEquation;
}

function addMultiplication(givenEq, index) {
  var firstPart = givenEq.substring(0, index);
  var secondPart = givenEq.substring(index, givenEq.length);
  return firstPart + "*" + secondPart;
  //Adds a multiplication symbol in the equation at a specific index
}

function isNumber(n) {
  if (n != null) {
    return n.match(/[0-9]/i);
  }
  //Checks whether argument is a number. Returns boolean
}

function isLetter(n) {
  if (n != null) {
    return n.match(/[a-zA-Z]/i);
  }
  //Checks whether argument is a letter. Returns boolean
}

function isOperator(n) {
  if (n != null) {
    var result = false;
    if (n == "*" || n == "/" || n == "|" || n == "+" || n == "-" || n == "^") {
      result = true;
    }
    return result;
  }
  //Cheks whether argument is a math operator. Returns boolean
}

function drawCells(color = "#000000", thickness = 1) {
  ctx.strokeStyle = color;
  //^^ Sets the grid color to black
  ctx.lineWidth = thickness;
  //^^ Thinner lines than X and Y axes
  ctx.beginPath();
  var rangeHorizontal =
    canvas.width / 2 + (translateX < 0 ? -translateX : translateX);
  for (var i = 0; i < rangeHorizontal; i += cellWidth) {
    ctx.moveTo(Math.floor(canvas.width / 2 + i + translateX), 0);
    ctx.lineTo(Math.floor(canvas.width / 2 + i + translateX), canvas.height);
    ctx.moveTo(Math.floor(canvas.width / 2 - i + translateX), 0);
    ctx.lineTo(Math.floor(canvas.width / 2 - i + translateX), canvas.height);
  }
  //^^ Draws the vertical lines starting from the origin;
  var rangeVertical =
    canvas.height / 2 + (translateY < 0 ? -translateY : translateY);
  for (var i = 0; i < rangeVertical; i += cellHeight) {
    ctx.moveTo(0, Math.floor(canvas.height / 2.0 - i + translateY));
    ctx.lineTo(canvas.width, Math.floor(canvas.height / 2.0 - i + translateY));
    ctx.moveTo(0, Math.floor(canvas.height / 2.0 + i + translateY));
    ctx.lineTo(canvas.width, Math.floor(canvas.height / 2.0 + i + translateY));
  }
  //^^ Draws the horizontal lines starting from the origin
  ctx.stroke();
}

function drawAxes(color = "#000000", thickness = 3) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.moveTo(0, Math.floor(canvas.height / 2.0 + translateY));
  ctx.lineTo(canvas.width, Math.floor(canvas.height / 2.0 + translateY));
  ctx.moveTo(Math.floor(canvas.width / 2.0 + translateX), 0);
  ctx.lineTo(Math.floor(canvas.width / 2.0 + translateX), canvas.height);
  ctx.stroke();
  // Draws the X and the Y axes with the given color and thickness
}

function drawFunction(eqNum) {
  var equation = redoneEquations[eqNum];
  var lineColorE = document.getElementById("colorPickerId");
  var lineWidthE = document.getElementById("thicknessId");
  ctx.strokeStyle = colorPickerId.value;
  ctx.fillStyle = colorPickerId.value;
  ctx.lineWidth = lineWidthE.value;

  var begin = -cellWidthE.value / 2 - translateX / cellWidth;
  var end = cellWidthE.value / 2 - translateX / cellWidth;
  var bottom = -cellHeightE.value / 2 + translateY / cellHeight;
  var top = cellHeightE.value / 2 + translateY / cellHeight;
  // Variable for limits where function should be drawn
  ctx.beginPath();
  console.log(cellWidthE.value / 100.0);
  for (var xVal = begin; xVal < end; xVal += cellWidthE.value / 500.0) {
    // Loops through the width of the canvas to find a Y value for each X
    try {
      var x = xVal;
      var y = eval(equation);
      ctx.moveTo(
        canvas.width / 2 + translateX + x * cellWidth,
        canvas.height / 2 + translateY - y * cellHeight
      );
      x += cellWidthE.value / 500.0;
      y1 = eval(equation);
      if (Math.abs(y1 - y) < cellHeightE.value * 2) {
        ctx.lineTo(
          canvas.width / 2 + translateX + x * cellWidth,
          canvas.height / 2 + translateY - y1 * cellHeight
        );
      }
      // Draws a small line from one point to the next
    } catch (e) {}
  }
  ctx.stroke();
}

function drawCrossHair() {
  ctx.beginPath();
  ctx.moveTo(Math.floor(canvas.width / 2 - 5), Math.floor(canvas.height / 2));
  ctx.lineTo(Math.floor(canvas.width / 2 + 5), Math.floor(canvas.height / 2));
  ctx.moveTo(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2 - 5));
  ctx.lineTo(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2 + 5));
  ctx.stroke();
  // Draws middle marker crosshair
}

function clearAll() {
  for (var i = 1; i <= 5; i++) {
    document.getElementById("equ" + i).value = "";
    onResize();
  }
  // Clears all input boxes and redraws
}
Math.csc = function (x) {
  return 1 / Math.sin(x);
};
Math.sec = function (x) {
  return 1 / Math.cos(x);
};
Math.cot = function (x) {
  return 1 / Math.tan(x);
};