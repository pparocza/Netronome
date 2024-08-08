var socket = io.connect($OP.getEchoServerURL(2312556));
let metronome;
var showOuterRing = true;
var showTopText = true;
const outerRingTextArray = "1&2&3&4&1&2&3&4&1&2&3&4&1&2&3&4&".split('');
// Animation indicator variables
let indicatorSize = 10;
let indicatorStrokeWeight = 1;
let indicatorX, indicatorY;

let nodes=[];

// Define button properties
const buttonWidth = 20;
const buttonHeight = 20;
const buttonGap = 10;

function setup() {
    createCanvas(1280, 1000);

    // initialize metronome
    metronome = new Metronome(60, 100, 100);

    // Set the initial position of the indicator in the top right corner
    indicatorX = width - indicatorSize - 10;
    indicatorY = 10;

    socket.on('refreshCircle', refreshCircle);
    socket.on('joinIn', someoneJoined);
    socket.on('changeMetronome', changeMetronome);
}

function draw() {
    background(0); // Refresh the background in each frame

    let diameter = 200;
    let centerX = width / 2;
    let centerY = diameter * 2;
    let lineColor = color(200,100); // Light gray color

    let ringWidth = diameter * 0.5 * (3.6 - 1) / nodes.length;
    // Add Node X and it's beats
    for(let i = 0; i < nodes.length; ++i){
        let y = height - buttonHeight * (i+1) -10; // Adjust the row position
        // Draw buttons for Node transparency
        for (let j = 0; j < 32; ++j) {
            let x = j * (buttonWidth + buttonGap);
            drawButton(x, y, buttonWidth, buttonHeight, nodes[nodes.length - 1 - i].alpha, j);
        }
        drawShiftButton((buttonWidth + buttonGap)*33, y, buttonWidth, buttonHeight, nodes[nodes.length - 1 - i].alpha, true);
        drawShiftButton((buttonWidth + buttonGap)*34, y, buttonWidth, buttonHeight, nodes[nodes.length - 1 - i].alpha, false);
        let sf=map(i,0,nodes.length,3.6,1);
        drawNode(centerX, centerY, diameter, nodes[i].color, sf);
        drawBeats(centerX, centerY, 32, nodes[i].beatColor, nodes[i].alpha, diameter*sf*0.5, ringWidth);
    }
    // Draw the top text if the visibility is toggled on
    if (showTopText) {
        for (let i = 0; i < 32; i++) {
            let x = (i + 0.35) * (buttonWidth + buttonGap);
            drawTopText(x, height - buttonHeight * nodes.length - 20, outerRingTextArray[i]);
        }
    }

    // Add center hole
    drawCenter(centerX, centerY, diameter);

    // Draw the whole circle
    noFill();
    stroke(lineColor);
    circle(centerX, centerY, diameter * 3.6);

    // Draw the lines and rectangles
    for (let i = 0; i < 32; i++) {
        let angle = map(i, 0, 32, 0, TWO_PI); // Calculate angle based on the number of lines
        let x = centerX + cos(angle) * diameter*1.8;
        let y = centerY + sin(angle) * diameter*1.8;

        // Make every other line dashed
        if (i % 2 === 0) {
            line(centerX, centerY, x, y);
        } else {
            dashedLine(centerX, centerY, x, y, 8); // Call the dashedLine function
        }
    }

    // Draw the outer ring and its text if the visibility is toggled on
    if (showOuterRing) {
        for (let i = 0; i < 32; i++) {
            let angle = map(i, 0, 32, 0, TWO_PI);
            drawOuterRing(centerX, centerY, diameter * 3.7);
            drawOuterRingText(centerX, centerY, diameter * 3.7, i, angle, outerRingTextArray[i]);
        }
    }

    metronome.beat();
}

// Custom function to draw a dashed line
function dashedLine(x1, y1, x2, y2, dashLength) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let distance = sqrt(dx * dx + dy * dy);
    let dashCount = distance / dashLength;
    let dashX = dx / dashCount;
    let dashY = dy / dashCount;

    let draw = true;
    for (let i = 0; i < dashCount - 1; i++) {
        if (draw) {
            line(x1, y1, x1 + dashX, y1 + dashY);
        }
        x1 += dashX;
        y1 += dashY;
        draw = !draw;
    }
    // avoid dashline outing the circle
    if(draw){
        if((dx>0&&x1+dashX>x2)||(dx<0&&x1+dashX<x2)){
            line(x1,y1,x2,y2);
        }else{
            line(x1, y1, x1 + dashX, y1 + dashY);
        }
    }
}

// Custom function to draw the additional node's rings
function drawNode(x, y, d, nodeColor, scaleFactor) {
    let c=color(nodeColor);
    c.setAlpha(200);
    fill(c); // 50% transparent
    noStroke();
    circle(x, y, d * scaleFactor);
}

// Custom function to draw the center
function drawCenter(x, y, d) {
    let centerHoleColor = color('#000000');
    fill(centerHoleColor.levels[0], centerHoleColor.levels[1], centerHoleColor.levels[2], 255); // 50% transparent
    noStroke();
    circle(x, y, d);
}

// Custom function to draw a clickable button
function drawButton(x, y, w, h, transparencyArray, index) {
    // Set the fill color based on transparency
    let fillColor = color(255, 255, 255, transparencyArray[index] * 255);
    fill(fillColor);
    stroke(200,100);

    rect(x, y, w, h);
}

// Custom function to draw buttons for shifting the beats
function drawShiftButton(x, y, w, h, transparencyArray, isForward) {
    // Check if the mouse is over the button
    let isMouseOver = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

    // Set the fill color based on mouse hover
    let fillColor = isMouseOver ? color(80) : color(50);
    fill(fillColor);
    stroke(200,100);

    rect(x, y, w, h);
    fill(255);
    textAlign(CENTER, CENTER);
    text(isForward?'+1':'-1', x + w / 2, y + h / 2);
}
function keyPressed() {
    if (keyCode === 113) { //F2
        metronome.beatToggle();
    }
}
// Custom function to toggle transparency on click
function mouseClicked() {
    let rowIndex = floor(map(mouseY, height - 10 - buttonHeight * nodes.length, height - 10, 0, nodes.length));
    let index = floor(map(mouseX, 0, (buttonWidth+buttonGap)*32, 0, 32));
    if(rowIndex >= 0 && rowIndex < nodes.length){
        if (index >= 0 && index < 32) {
            nodes[rowIndex].alpha[index] = 1 - nodes[rowIndex].alpha[index];
        }else if(mouseX >= (buttonWidth + buttonGap)*33 && mouseX <= (buttonWidth + buttonGap)*33 + buttonWidth){
            //shift beats forward
            nodes[rowIndex].alpha.unshift(nodes[rowIndex].alpha.pop());
        }else if(mouseX >= (buttonWidth + buttonGap)*34 && mouseX <= (buttonWidth + buttonGap)*34 + buttonWidth){
            //shift beats backward
            nodes[rowIndex].alpha.push(nodes[rowIndex].alpha.shift());
        }
        socket.emit('refreshCircle',{i:rowIndex,alpha:nodes[rowIndex].alpha});
    }
}

function refreshCircle(e){
    try{
        if(nodes[e.i]){
            nodes[e.i].alpha=e.alpha
        }
    }catch(ee){
        console.error(ee);
    }
}

// Custom function to draw the beats
function drawBeats(centerX, centerY, numBeats, nColor, transparencyArray, outerRingRadius, rectWidth) {
    for (let i = 0; i < numBeats; i++) {
        drawBeatFunction(centerX, centerY, outerRingRadius, i, nColor, transparencyArray[i], rectWidth);
    }
}

// Custom function to position and color beat rectangles
function drawBeatFunction(centerX, centerY, circleRadius, index, nColor, transparency, rectWidth) {
    let startingAngle = -HALF_PI; // Start at the top of the circle
    let angleIncrement = TWO_PI / 32; // Evenly distribute rectangles around the circle
    let angle = startingAngle + index * angleIncrement; // Calculate angle based on the number of rectangles
    let x = centerX + cos(angle) * circleRadius;
    let y = centerY + sin(angle) * circleRadius;

    let rectHeight = 20
    let rectColor = color(nColor);
    rectColor.setAlpha(transparency*255);
    push(); // Save the current transformation matrix
    translate(x, y); // Move the origin to the rectangle's position
    rotate(angle + PI); // Rotate the rectangle to align with the lines

    // Set rectangle color and transparency
    fill(rectColor);
    stroke(rectColor);
    rectMode(CORNER); // Set the rectangle mode to center
    rect(0, (0-(rectHeight/2)), rectWidth, rectHeight); // Draw the rectangle aligned over the center of the line
    pop(); // Restore the original transformation matrix
}

// Custom function to draw the outer ring
function drawOuterRing(x, y, d) {
    noFill();
    stroke(40); // Adjust the color of the outer ring
    circle(x, y, d);
}

// Custom function to draw text on the outer ring
function drawOuterRingText(x, y, d, index, angle, textValue) {
    let textDistance = d * 0.5 + 15; // Adjust the distance from the outer ring
    let textX = x + cos(angle) * textDistance;
    let textY = y + sin(angle) * textDistance;

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(textValue, textX, textY);
}

// Custom function to draw the text above the beat buttons
function drawTopText(x, y, textValue) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(textValue, x, y);
}

function someoneJoined(e){
    for(let i in nodes){
        if(nodes[i].name===e.name){
            //exist
            return;
        }
    }
    let c=color(e.color);
    let beatColor=[c.levels[0],c.levels[1],c.levels[2],0],
        maxPipe=max(beatColor),
        lamda=255/maxPipe;
    for(let i=0;i<3;++i){
        if(c.levels[i]===maxPipe){
            beatColor[i]=255;
        }else{
            beatColor[i]=floor(beatColor[i]*lamda);
        }
    }
    beatColor[3]=255;
    nodes.push({
        ...e,
        beatColor:beatColor,
        alpha:new Array(32).fill(0.1)
    })
}

function changeMetronome(e){
    metronome.setBpm(e);
}