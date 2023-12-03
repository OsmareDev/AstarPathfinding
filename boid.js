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
        // Refrescar velocidad
        this.velocity.add(this.acceleration);
        // Limitar velocidad
        this.velocity.limit(this.maxspeed);

        this.position.add(this.velocity);
        // Resetear acceleración a 0 en cada ciclo
        this.acceleration.mult(0);
    }

    seek() {
        var target = createVector(grid.disp_center + this.target.pos_x * grid.tam_casilla, grid.disp_center + this.target.pos_y * grid.tam_casilla);
        let desired = p5.Vector.sub(target, this.position);  // Un vector apuntando desde la ubicación hacia el objetivo
        // Normalizar deseado y escalar según velocidad máxima
        
        desired.normalize();
        desired.mult(this.maxspeed);

        // Viraje = Deseado - Velocidad
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);  // Limita al máximo de fuerza de viraje
        return steer;
    }

    flee(target) {
        let desired = p5.Vector.sub(this.position, target);  // Un vector apuntando desde la ubicación hacia el objetivo
        // Normalizar deseado y escalar según velocidad máxima
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
      // Dibuja un triángulo rotado en la dirección de la velocidad
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
        let sep = this.separate(boids);   // Separación
        let ali = this.align(boids);      // Alineamiento
        let coh = this.cohesion(boids);   // Cohesión
        // Dar un peso arbitrario a cada fuerza
        sep.mult(this.separationForce);
        ali.mult(this.alignForce);
        coh.mult(this.cohesionForce);
        // Suma los vectores de fuerza a la aceleración
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        // Por cada boid en el sistema, revisa si está muy cerca
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position, boids[i].position);
          // Si la distancia es mayor a 0 y menor que una cantidad arbitraria (0 cuando eres tú mismo)
          if ((d > 0) && (d < this.separation)) {
            // Calcular el vector apuntando a alejarse del vecino
            let diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d);        // Peso por distancia
            steer.add(diff);
            count++;            // Mantener registro de cantidad
          }
        }
        // Promedio -- divide por la cantidad
        if (count > 0) {
          steer.div(count);
        }
      
        // Mientras el vector sea mayor a 0
        if (steer.mag() > 0) {
          // Implementa Reynolds: Viraje = Deseado - Velocidad
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
        let sum = createVector(0, 0);   // Empieza con un vector vacío para acumular todas las posiciones
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].position); // Añada posición
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          return this.seek(sum);  // Vira hacia la posición
        } else {
          return createVector(0, 0);
        }
    }

    follow(p) {

      // Predict the vehicle future location
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
    
        // Instead of d = ap.mag() * cos(theta)
        // See file explanation.js or page 290
        let d = ap.dot(ab);
    
        ab.mult(d);

        let normalPoint = p5.Vector.add(a, ab);
        return normalPoint;
    }
}