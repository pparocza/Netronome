var socket = io.connect($OP.getEchoServerURL(2312556));

let g, g1; // the graph
let inputEdges; // stores the edges from an input file
let nodeDiameter = 50;
let textScalar = 0.7; // adjusts the relative size of the node keys
let textColor = '#933';
let colorList = new Array('#d9ed92', '#b5e48c', '#99d98c', '#76c893', '#52b69a','#34a0a4','#168aad','#1a759f','#1e6091','#184e77','#305078','#783630');
let nodeOutlineColor = 'gray';
let nodeOutlineWeight = nodeDiameter * 0.05;
//let desiredEdgeLength = nodeDiameter * 1.2;
let EdgeLength = [0];
let desiredEdgeLengthThreshold = 10.0; // allows the edges to stop stretching when close to happy
let pushStrength = 110; // increase to make nodes push each other harder
let pullStrength = 0.01; // increase to make edges desire their natural length more
let pushThreshold = 0.005; // allows the nodes to stop pushing when close to happy
let minProbabilityOfEdge = 0.15;
let maxProbabilityOfEdge = 0.25;
const maxSteps = 200;
let metronome;
let players = [], players1 = [];

function keyPressed() {
    // F2 turns metronome on
    if (keyCode === 113) {
        metronome.beatToggle();
    } else if (keyCode === UP_ARROW) {
        metronome.inc();
        socket.emit('changeMetronome', metronome.bpm);
    } else if (keyCode === DOWN_ARROW) {
        metronome.dec();
        socket.emit('changeMetronome', metronome.bpm);
    } else if (keyCode === 32) {
        socket.emit('ding', uuid, new Date().getTime());
    }
}
function mouseClicked(e){
	if(mouseX>=680&&mouseX<=760&&mouseY>=90&&mouseY<=170){
		let input = createInput(metronome.bpm+'', 'number');
    input.position(680, 180);
    input.size(80, 24);
		input.addClass('metronome');
		setTimeout(function(){
			let inp = document.getElementsByClassName('metronome');
			inp[0].addEventListener('blur', function(event) {
				metronome.bpm = +input.value();
        socket.emit('changeMetronome', metronome.bpm);
				inp[0].remove();
			});
		},500);
	}
}
function mousePressed() {
    if (g)
      g.setSelectedNode();
	
    if (g1){
      g1.setSelectedNode();
		}
}

function mouseReleased() {
    if (g)
      g.deselectAllNodes();
    if (g1)
      g1.deselectAllNodes();
}
let uuid = '';

function setup() {

    uuid = random() + "";
    socket.on('joinIn', someoneJoined);
    socket.on('ding', ding);
    socket.on('dingBackfeed', dingBackfeed);
    // initialize canvas
    createCanvas(windowWidth, windowHeight);

    // initialize metronome
    metronome = new Metronome(60);

    // initialize nodes
    let s1 = createSpan('Node');
    s1.position(100, 100);
    s1.style('color:#f0f0f0;font-size:14px;');
    let s2 = createSpan('NetDelay');
    s2.position(200, 100);
    s2.style('color:#f0f0f0;font-size:14px;');
    let s3 = createSpan('AdjDelay');
    s3.position(300, 100);
    s3.style('color:#f0f0f0;font-size:14px;');
    let s4 = createSpan('Meter');
    s4.position(400, 100);
    s4.style('color:#f0f0f0;font-size:14px;');
    let nodeInput = createInput();
    nodeInput.position(100, 130);
    nodeInput.size(90, 24);
    let input2 = createInput('300', 'number');
    input2.position(200, 130);
    input2.size(90, 24);
    let input3 = createInput('300', 'number');
    input3.position(300, 130);
    input3.size(90, 24);		
    let input4 = createInput('3/4');
    input4.position(400, 130);
    input4.size(90, 24);
    let button = createButton('OK');
    button.position(500, 130);
    button.style('height:30px;text-align:center');
    button.mousePressed(() => {
			let isExisted=false;			
			let info = {
					name: nodeInput.value(),
					meter: input4.value(),
					id: uuid
			};
			for(let i in players){
				if(players[i].name===info.name){
					players[i].delay=+input2.value();
					players[i].meter=input4.value();
					players1[i].delay=+input3.value();
					
					info.color=players[i].color;
					isExisted=true;
					break;
				}
			}
			if(!isExisted){				
				let c = random(colorList);
				info.color=c;
        players.push({
          ...info,
          delay: +input2.value(),
          x: width / 4,
          y: height / 2
        });
        players1.push({
          ...info,
          delay: +input3.value(),
          x: width * 3 / 4,
          y: height / 2
        });
			}
			socket.emit("joinIn", {
				...info,
				netDelay: +input2.value(),
				adjDelay: +input3.value(),
				x: width * 3 / 4,
				y: height / 2
			});
      g = new Graph(players);
      g1 = new Graph(players1);
    });
    g = new Graph(players);
    g1 = new Graph(players1);
}

function draw() {
    if (!g) {
        return;
    }
    background(0);
    push();
    for (let i in players) {
        fill(players[i].color);
        stroke('#99c');
        strokeWeight(1);
        rect(50, 175 + i * 30, 30, 20);
        fill('#fff');
        noStroke();
        textSize(16);
        textAlign(LEFT, TOP);
        text(players[i].name, 100, 180 + i * 30);
        text(players[i].delay, 200, 180 + i * 30);
        text(players1[i].delay, 300, 180 + i * 30);
        text(players[i].meter, 400, 180 + i * 30);
    }
    pop();
    g.display();
    if (++g.steps < maxSteps) {
        g.update();
    } else {
        for (let i = 0; i < players.length; ++i) {
            push();
            textSize(17);
            noStroke();
            translate((g.nodes[0].center.x + g.nodes[i + 1].center.x) / 2,
                (g.nodes[0].center.y + g.nodes[i + 1].center.y) / 2);
            rotate(atan((g.nodes[0].center.y - g.nodes[i + 1].center.y) / (g.nodes[0].center.x - g.nodes[i + 1].center.x)));
            fill('#808080');
            rect(-25, -12, 50, 23, 3, 3, 3, 3);
            fill('#ff0')
            text(players[i].delay, 0, 0);
            pop();
        }
    }
	  g1.display();
    if (++g1.steps < maxSteps) {
        g1.update();
    } else {
        for (let i = 0; i < players1.length; ++i) {
            push();
            textSize(17);
            noStroke();
            translate((g1.nodes[0].center.x + g1.nodes[i + 1].center.x) / 2,
                (g1.nodes[0].center.y + g1.nodes[i + 1].center.y) / 2);
            rotate(atan((g1.nodes[0].center.y - g1.nodes[i + 1].center.y) / (g1.nodes[0].center.x - g1.nodes[i + 1].center.x)));
            fill('#808080');
            rect(-25, -12, 50, 23, 3, 3, 3, 3);
            fill('#ff0')
            text(players1[i].delay, 0, 0);
            pop();
        }
    }

    metronome.beat();
    //noLoop();
}

function someoneJoined(info) {
	let isExisted = false;
	for(let i in players){
		if(players[i].name===info.name){
			players[i].delay=info.netDelay;
			players[i].meter=info.meter;
			players1[i].delay=info.adjDelay;
			isExisted=true;
			break;
		}
	}
	if(!isExisted){
    players.push({
      ...info,
			delay: info.netDelay,
      x: width / 4,
      y: height / 2
    });
    players1.push({
      ...info,
			delay: info.adjDelay,
      x: width * 3 / 4,
      y: height / 2
    });
	}
	g = new Graph(players);
	g1 = new Graph(players1);
}

function ding(id, t) {
	let delta=new Date().getTime() - t;
    for (let i in players1) {
        if (players1[i].id === id) {
            players1[i].delay = delta;
            g1 = new Graph(players1);
					  socket.emit('dingBackfeed',id,delta);
            break;
        }
    }
}

function dingBackfeed(id,d){
	for (let i in players1) {
        if (players1[i].id === id) {
            players1[i].delay = d;
            g1 = new Graph(players1);
            break;
        }
    }
}