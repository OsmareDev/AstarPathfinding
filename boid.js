class Boid {
    acceleration;
    velocity;
    position;
    target;
    p_target;
    r;
    maxspeed;
    maxforce;
    color;

    //flock variables
    separation;
    neighbordist;

    separationForce;
    alignForce;
    cohesionForce;

    path;

    constructor(x, y, tam, path) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1),random(-1, 1));
        this.position = createVector(x,y);
        this.r = tam;
        this.maxspeed = grid.tam_casilla/20;
        this.maxforce = 0.05;

        this.separation = 4;
        this.neighbordist = 4;
        this.separationForce = 0.5;
        this.alignForce = 0.5;
        this.cohesionForce = 0.5;

        if (path != undefined) {
            this.path = path;
            this.target = path[0];
            this.p_target = 0;
        }
    }

    run(boids) {
        if (this.path === undefined){
            this.target = boids[0].position;
            this.Mseek(this.target);
        }
        else
        {
            this.followPoints(this.path);
        }

        this.flock(boids);
        this.update();
        this.render();
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    // update function
    update() {
        // Refresh speed
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);

        this.position.add(this.velocity);
        // Reset acceleration to 0 in each cycle
        this.acceleration.mult(0);
    }

    seek() {
        var target = createVector(grid.disp_center + this.target.pos_x * grid.tam_casilla, grid.disp_center + this.target.pos_y * grid.tam_casilla);
        let desired = p5.Vector.sub(target, this.position);  // A vector pointing from the location towards the target
        // Normalize desired and scale according to maximum speed
        
        desired.normalize();
        desired.mult(this.maxspeed);

        // Steer = Desired - Speed
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);  // Limits maximum steering force
        return steer;
    }

    flee(target) {
        let desired = p5.Vector.sub(this.position, target);  // A vector pointing from the location towards the target
        // Normalize desired and scale according to maximum speed
        if (desired.mag() > 100)
            return;

        desired.normalize();
        desired.mult(this.maxspeed*2);

        
        this.velocity = desired;
    }

    arrive() {
        let desired = p5.Vector.sub(this.target,this.position);

        var d = desired.mag();
        desired.normalize();

        if (d < 100) {
        var m = map(d,0,100,0,this.maxspeed);
        desired.mult(m);
        //[end]
        } else {
        // Otherwise, proceed at maximum speed.
        desired.mult(this.maxspeed);
        }

        // The usual steering = desired - velocity
        let steer = p5.Vector.sub(desired,this.velocity);
        steer.limit(this.maxforce);

        return steer;
    }

    render() {
      // Draw a triangle rotated in the direction of velocity
      let theta = this.velocity.heading() + radians(90);
      fill(127);
      stroke(200);
      push();
      translate(this.position.x, this.position.y);
      rotate(theta);
      beginShape();
      vertex(0, -this.r * 2);
      vertex(-this.r, this.r * 2);
      vertex(this.r, this.r * 2);
      endShape(CLOSE);
      pop();
    }

    // flock management
    flock(boids) {
        let sep = this.separate(boids);   // Separation
        let ali = this.align(boids);      // Alignment
        let coh = this.cohesion(boids);   // Cohesion
        // Give an arbitrary weight to each force
        sep.mult(this.separationForce);
        ali.mult(this.alignForce);
        coh.mult(this.cohesionForce);
        // Add the force vectors to the acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        // For each boid in the system, check if it is too close
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position, boids[i].position);
          // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
          if ((d > 0) && (d < this.separation)) {
            // Calculate the vector pointing away from the neighbor
            let diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d);        // Weight per distance
            steer.add(diff);
            count++;            // Maintain quantity record
          }
        }
        // Average -- divide by the amount
        if (count > 0) {
          steer.div(count);
        }
      
        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
          // Implements Reynolds: Steer = Desired - Speed
          steer.normalize();
          steer.mult(this.maxspeed);
          steer.sub(this.velocity);
          steer.limit(this.maxforce);
        }
        return steer;
    }

    align(boids) {
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          sum.normalize();
          sum.mult(this.maxspeed);
          let steer = p5.Vector.sub(sum, this.velocity);
          steer.limit(this.maxforce);
          return steer;
        } else {
          return createVector(0, 0);
        }
    }

    cohesion(boids) {
        let sum = createVector(0, 0);   // Start with an empty vector to accumulate all positions
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].position); // Add position
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          return this.seek(sum);  // Steer to position
        } else {
          return createVector(0, 0);
        }
    }

    follow(p) {

      // Predict the boid future location
      let predict = this.velocity.copy();
      predict.normalize();
      // 25 pixels ahead in current velocity direction
      predict.mult(25);
      // Get the predicted point
      let predictLoc = p5.Vector.add(this.position, predict);
  
      // Find the normal point along the path
      let target = 0;
      let worldRecord = 1000000;
  
      for (let i = 0; i < p.length - 1; i++) {
        let a = createVector(grid.disp_center+p[i].pos_x*grid.tam_casilla, grid.disp_center+p[i].pos_y*grid.tam_casilla); // i = 3
        let b = createVector(grid.disp_center+p[i+1].pos_x*grid.tam_casilla, grid.disp_center+p[i+1].pos_y*grid.tam_casilla); // i+1= 4 (last point)
        let normalPoint = this.getNormalPoint(predictLoc, a, b);
  
        // Check if the normal point is outside the line segment
        if (normalPoint.x < a.x || normalPoint.x > b.x) {
          normalPoint = b.copy();
        }
  
        // Length of normal from precictLoc to normalPoint
        let distance = p5.Vector.dist(predictLoc, normalPoint);
  
        // Check if this normalPoint is nearest to the predictLoc
        if (distance < worldRecord) {
          worldRecord = distance;
          // Move a little further along the path and set a target
          // let dir = p5.Vector.sub(a, b);
          // dir.normalize();
          // dir.mult(10);
          // let target = p5.Vector.add(normalPoint, dir);
  
          // or let the target be the normal point
          target = normalPoint.copy();
        }
      }
  
      // seek the target...
      
      this.Mseek(target);
  
      // ... or check if we are off the path:
      // if (distance > p.radius) {
      //    this.seek(target);
      // }
    }

    followPoints(p) {
        var target = createVector(grid.disp_center + this.target.pos_x * grid.tam_casilla, grid.disp_center + this.target.pos_y * grid.tam_casilla);

        if ((p5.Vector.sub(this.position, target)).mag() < grid.tam_casilla/1.5 && this.p_target < this.path.length - 1)
        {
            this.p_target++;
            this.target = this.path[this.p_target];
        }
        
        this.Mseek(target);
    }

    Mseek(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxspeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
    }

    getNormalPoint(p, a, b) {

        let ap = p5.Vector.sub(p, a);
        let ab = p5.Vector.sub(b, a);
        ab.normalize();
        let d = ap.dot(ab);
    
        ab.mult(d);

        let normalPoint = p5.Vector.add(a, ab);
        return normalPoint;
    }
}