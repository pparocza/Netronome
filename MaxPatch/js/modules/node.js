class Node {
    constructor(newKey, newNeighbors, attrs) {
        this.key = newKey; // a "key" is the numeric label on a node
        this.neighbors = newNeighbors; // an array that stores the keys of this node's neighbors
        this.attrs = attrs;
        this.center = createVector(attrs.x + random(-100, 100), attrs.y + random(-100, 100));
        this.diameter = nodeDiameter;
        this.selected = false; // selected becomes true when the user clicks the node
    }

    display() {
        fill(this.attrs.color);
        stroke(nodeOutlineColor);
        strokeWeight(nodeOutlineWeight);
        ellipse(this.center.x, this.center.y, this.diameter, this.diameter);
        noStroke();
        fill(textColor);
        textSize(nodeDiameter * textScalar);
        textAlign(CENTER, CENTER);
        text(this.attrs.name[0], this.center.x, this.center.y);
    }
}