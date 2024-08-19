var socket;
var myp5;

const s = ( p ) => {

    let x = 100;
    let y = 100;

    p.setup = function() {
        p.createCanvas(700, 410);
        socket = io.connect($OP.getEchoServerURL(2324761));
    };

    p.draw = function() {
        p.background(0);
        p.fill(255);
        p.rect(x,y,50,50);
    };
};

function initializeP5Instance()
{
    myp5 = new p5(s);
}