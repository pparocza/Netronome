class Metronome {
    constructor(bpm, x=720, y=130, d=80) {
			this.x=x;
			this.y=y;
        this.d = d;
        this.alpha = 255;
        this.bpm = bpm;
        this.t = 60000 / bpm;
        this.next = 0;
        this.isBeat = false;
    }
    reset() {
        this.next = millis() + this.t;
    }
    beat() {
        if (millis() >= this.next) {
            this.alpha = 255;
            this.reset();
        } else if (this.isBeat) {
            this.alpha -= 255 * deltaTime / this.t;
        }
        push();
        fill(255, this.alpha);
        noStroke();
        ellipse(this.x, this.y, this.d, this.d);

        fill(255);
        textSize(30);
			textAlign(CENTER);
        text(this.bpm, this.x - 20, this.y - 70);
				fill('#c93');
        textSize(16);
        text('bpm', this.x + 30, this.y - 70);
        pop();
    }
    setBpm(bpm) {
        this.bpm = bpm;
        this.t = 60000 / bpm;
        this.reset();
    }
    /**
     * increase bmp
     */
    inc() {
        if (this.bpm === 200) {
            return;
        }
        this.setBpm(this.bpm + 1);
    }
    /**
     * decrease bmp
     */
    dec() {
        if (this.bpm === 10) {
            return;
        }
        this.setBpm(this.bpm - 1);
    }

    beatToggle() {
        this.isBeat = !this.isBeat;
    }
}