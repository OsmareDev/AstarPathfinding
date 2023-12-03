var n_caminos;
var porc_obst;
var pintar_proceso;
var n_casillas = 40;

var miCanvas;
var grid;
var a;
var flocks = [];

var time;

function setup() {

    if (windowHeight > windowWidth)
        miCanvas = createCanvas(windowWidth,windowWidth);
    else
        miCanvas = createCanvas(windowHeight,windowHeight);

    grid = new Grid(n_casillas);
    
    strokeWeight(1);
    stroke(190);

    background(10);
    grid.render();

    n_caminos = 1;
    porc_obst = 0.2;
    pintar_proceso = false;

    time = document.getElementById("time");
}

function draw() {
    grid.render_casillas();
    if (a != undefined /*&& pintar_proceso*/)
        a.linePaths();

    if (flocks.length > 0)
        flocks.forEach(e => e.run());
}

function windowResized() {
    if (windowHeight > windowWidth)
        resizeCanvas(windowWidth, windowWidth);
    else
        resizeCanvas(windowHeight, windowHeight);
    background(10);
    grid.recalculateGrid();
}

function mouseDragged() {
    // block with b
    if (keyCode == 66) {
        var pos = grid.getCasilla(mouseX, mouseY);
        if (grid.isInside(pos.x, pos.y)){
            grid.setLibre(pos.x, pos.y, false);
        }
    }

    // release with the l
    if (keyCode == 76) {
        var pos = grid.getCasilla(mouseX, mouseY);
        console.log(pos);
        if (grid.isInside(pos.x, pos.y)){
            grid.setLibre(pos.x, pos.y, true);
        }
    }
}

function mousePressed() {
    // block with b
    if (keyCode == 66) {
        var pos = grid.getCasilla(mouseX, mouseY);
        if (grid.isInside(pos.x, pos.y)){
            grid.setLibre(pos.x, pos.y, false);
        }
    }

    // release with the l
    if (keyCode == 76) {
        var pos = grid.getCasilla(mouseX, mouseY);
        if (grid.isInside(pos.x, pos.y)){
            grid.setLibre(pos.x, pos.y, true);
        }
    }

    // goal with the g
    if (keyCode == 71) {
        var pos = grid.getCasilla(mouseX, mouseY);
        if (grid.isInside(pos.x, pos.y)){
            grid.setNodoIni(pos.x, pos.y);
        }
    }

    // goal with the f
    if (keyCode == 70) {
        var pos = grid.getCasilla(mouseX, mouseY);
        if (grid.isInside(pos.x, pos.y)){
            grid.setNodoFin(pos.x, pos.y);
        }
    }
}

function keyPressed() {
    if (keyCode == 32) {
        var startTime = performance.now();

        grid.resetGridPath();
        a = new AEstrella(n_caminos);
        a.encontrarCamino(pintar_proceso, n_caminos, n_caminos);

        var endTime = performance.now();

        time.innerHTML = (endTime - startTime) + " ms";
    }

    if (keyCode == 82){
        grid.randomLayout(porc_obst);
    }

    if (keyCode == 76){
        a.linePaths();
    }

    if (keyCode == 81){
        flocks = [];

        for (var i = 0; i < a.paths.length; i++){
            flocks.push(new Flock());
            var boid = new Boid(grid.disp_center+grid.nodo_ini.pos_x*grid.tam_casilla, grid.disp_center+grid.nodo_ini.pos_y*grid.tam_casilla, grid.tam_casilla/10, a.paths[i]);
            flocks[i].addBoid(boid);
            
            for (var j = 0; j < 5; j++) {
                boid = new Boid(grid.disp_center+grid.nodo_ini.pos_x*grid.tam_casilla, grid.disp_center+grid.nodo_ini.pos_y*grid.tam_casilla, grid.tam_casilla/10);
                flocks[i].addBoid(boid);
            }
        }
    }
}

function changeCaminos() {
    n_caminos = document.getElementById("n_caminos").value;
}

function changePorc() {
    porc_obst = document.getElementById("porc_obst").value;
}

function change_pintar() {
    pintar_proceso = document.getElementById("pintar").checked;
}

function nuevas_casillas() {
    n_casillas = document.getElementById("casillas").value;
    grid = new Grid(n_casillas);
}