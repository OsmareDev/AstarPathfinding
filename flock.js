class Flock {
    boids;

    constructor() {
        this.boids = [];
    }

    run() {
        this.boids.forEach(e => e.run(this.boids));
    }

    addBoid(b) {
        this.boids.push(b);
    }
}