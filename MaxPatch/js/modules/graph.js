class Graph {
    constructor(arr) {
        this.steps = 0;
        this.nodes = [];
        this.numNodes = arr.length + 1;
        this.adjacencyList = []; // an array of arrays that stores each node's neighbors
        //this.createRandomGraph(); 								// use this function instead for a random graph
        this.createGraph(arr);
    }

    createRandomGraph() {
        // Some setup:
        let probabilityOfEdge = random(minProbabilityOfEdge, maxProbabilityOfEdge);

        // Initialize the adjacency list for the graph:
        for (let i = 0; i < this.numNodes; i++) {
            let newList = [];
            this.adjacencyList.push(newList);
        }

        // Decide on edges:
        for (let i = 1; i < this.numNodes; i++) {
            this.adjacencyList[i].push({
                index: 0,
                edgeLength: EdgeLength[i]
            });
            this.adjacencyList[0].push({
                index: i,
                edgeLength: EdgeLength[i]
            });
        }
        // Create nodes:
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes.push(new Node(i, this.adjacencyList[i], {}));
        }
    }

    createGraph(arr) {
        if (!arr || arr.length == 0) {
            return;
        }
        // Initialize the adjacency list for the graph:
        for (let i = 0; i < this.numNodes; i++) {
            let newList = [];
            this.adjacencyList.push(newList);
        }

        // Create the nodes:
        for (let i = 0; i < arr.length; i++) {
            this.adjacencyList[i + 1].push({
                index: 0,
                edgeLength: arr[i].delay
            });
            this.adjacencyList[0].push({
                index: i + 1,
                edgeLength: arr[i].delay
            });
        }

        // Create the nodes:
        this.nodes.push(new Node(0, this.adjacencyList[0], {
            name: ' ',
            color: '#000',
            x: arr[0].x,
            y: arr[0].y
        }));
        for (let i = 1; i < this.numNodes; i++) {
            this.nodes.push(new Node(i, this.adjacencyList[i], arr[i - 1]));
        }
    }

    display() {
        if (this.numNodes === 1) {
            return;
        }
        // Display the edges:
        for (let i = 1; i < this.numNodes; i++) {
            strokeWeight(nodeOutlineWeight);
            stroke(nodeOutlineColor);
            let neighbors = this.adjacencyList[i];
            //for (let j = 0; j < neighbors.length; j++) {
            line(this.nodes[0].center.x, this.nodes[0].center.y,
                this.nodes[i].center.x, this.nodes[i].center.y);
            //}
        }
        // Display the nodes:
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes[i].display();
        }
    }

    update() {
        if (this.numNodes === 1) {
            return;
        }
        // The edges want to have length desiredEdgeLength:
        //for (let i = 0; i < this.numNodes; i++) {
        let thisNode = this.nodes[0];
        let neighbors = this.adjacencyList[0];
        for (let j = 1; j < this.numNodes; j++) {
            let thatNode = this.nodes[j];
            let edgeLength = p5.Vector.dist(thisNode.center, thatNode.center);
            let desiredEdgeLength = neighbors[j - 1].edgeLength;
            if (abs(edgeLength - desiredEdgeLength) > desiredEdgeLengthThreshold) {
                let differenceVector = p5.Vector.sub(thisNode.center, thatNode.center);
                let tooShort = (edgeLength - desiredEdgeLength < 0);
                if (tooShort) {
                    thisNode.center.x = thisNode.center.x + differenceVector.x * pullStrength;
                    thisNode.center.y = thisNode.center.y + differenceVector.y * pullStrength;
                    thatNode.center.x = thatNode.center.x - differenceVector.x * pullStrength;
                    thatNode.center.y = thatNode.center.y - differenceVector.y * pullStrength;
                } else {
                    thisNode.center.x = thisNode.center.x - differenceVector.x * pullStrength;
                    thisNode.center.y = thisNode.center.y - differenceVector.y * pullStrength;
                    thatNode.center.x = thatNode.center.x + differenceVector.x * pullStrength;
                    thatNode.center.y = thatNode.center.y + differenceVector.y * pullStrength;
                }
            }
        }
        //}

        // The nodes repel each other:
        for (let i = 0; i < this.numNodes - 1; i++) {
            for (let j = i + 1; j < this.numNodes; j++) {
                let differenceVector = p5.Vector.sub(this.nodes[i].center, this.nodes[j].center);
                let pushForce = pushStrength / pow(differenceVector.mag(), 2);
                if (pushForce > pushThreshold) {
                    this.nodes[i].center.x = this.nodes[i].center.x + differenceVector.x * pushForce;
                    this.nodes[i].center.y = this.nodes[i].center.y + differenceVector.y * pushForce;
                    this.nodes[j].center.x = this.nodes[j].center.x - differenceVector.x * pushForce;
                    this.nodes[j].center.y = this.nodes[j].center.y - differenceVector.y * pushForce;
                }
            }
        }

        // Attract a selected node to the pressed mouse:
        for (let i = 0; i < this.numNodes; i++) {
            if (this.nodes[i].selected) {
                this.nodes[i].center.x = mouseX;
                this.nodes[i].center.y = mouseY;
            }
        }
    }

    setSelectedNode() {
        if (this.numNodes === 1) {
            return;
        }
        for (let i = 0; i < this.numNodes; i++) {
            let mouseLocation = createVector(mouseX, mouseY);
            if (p5.Vector.dist(mouseLocation, this.nodes[i].center) < (nodeDiameter / 2)) {
                this.nodes[i].selected = true;
                this.steps = maxSteps/2;
                return;
            }
        }
    }

    deselectAllNodes() {
        if (this.numNodes === 1) {
            return;
        }
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes[i].selected = false;
        }
    }
}