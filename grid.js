class Grid {
    n_casillas;
    n_casillas_largo;
    n_casillas_alto;
    tam_casilla;
    disp_center;

    nodo_ini;
    nodo_fin;

    grid;

    constructor (n_casillas_largo) {
        this.n_casillas_largo = n_casillas_largo;
        this.n_casillas_alto = n_casillas_largo;
        this.n_casillas = n_casillas_largo*n_casillas_largo;

        if (windowHeight > windowWidth){
            this.tam_casilla = windowWidth / n_casillas_largo;
        } else {
            this.tam_casilla = windowHeight / n_casillas_largo;
        }

        this.disp_center = this.tam_casilla/2;

        this.grid = this.buildGrid();

        this.setNodoIni(int(n_casillas_largo/4), int(n_casillas_largo/4));
        this.setNodoFin(int(3*n_casillas_largo/4), int(3*n_casillas_largo/4));
    }
    
    render() {
        stroke(190);
        fill(190);
        // drawn vertical lines
        for (var i = 0; i <= this.n_casillas_largo; i++) {
            var pos_x = i*this.tam_casilla;
            line(pos_x, 0, pos_x, windowHeight);
        }
        // drawn horizontal lines
        for (var i = 0; i <= this.n_casillas_alto; i++) {
            var pos_y = i*this.tam_casilla;
            line(0, pos_y, windowWidth, pos_y);
        }
    }

    render_casillas() {
        for (var i = 0; i < this.n_casillas_largo; i++) {
            for (var j = 0; j < this.n_casillas_alto; j++) {
                this.grid[i][j].render();
            }
        }
    }

    buildGrid() {
        var casillas = new Array(this.n_casillas_largo);

        for (var i = 0; i < this.n_casillas_largo; i++) {
            casillas[i] = new Array(this.n_casillas_alto);
            for (var j = 0; j < this.n_casillas_alto; j++){
                casillas[i][j] = new casilla(i, j);
            }
        }

        return casillas;
    }

    nuevas_casillas(n) {
        this.n_casillas_largo = n;
        this.n_casillas_alto = n;

        this.setNodoIni(int(n/4), int(n/4));
        this.setNodoFin(int(3*n/4), int(3*n/4));
    }

    recalculateGrid() {
        if (windowHeight > windowWidth){
            this.tam_casilla = windowWidth / this.n_casillas_largo;
        } else {
            this.tam_casilla = windowHeight / this.n_casillas_largo;
        }

        this.disp_center = this.tam_casilla/2;
        this.render_casillas();
    }

    getCasilla(pos_x, pos_y) {
        var n_x = (int)(pos_x/this.tam_casilla);
        var n_y = (int)(pos_y/this.tam_casilla);

        return {x:n_x, y:n_y};
    }

    getCasillaEn(x,y) {
        return this.grid[x][y];
    }

    isInside(x,y) {
        return (x >= 0 && x < this.n_casillas_largo && y >= 0 && y < this.n_casillas_alto);
    }

    getLibre(x,y) {
        if (this.isInside(x,y))
            return this.grid[x][y].libre;
        else
            return false;
    }

    setLibre(x,y, libertad) {
        if (this.nodo_ini != undefined && (x == this.nodo_ini.pos_x && y == this.nodo_ini.pos_y))
            return;

        if (this.nodo_fin != undefined && (x == this.nodo_fin.pos_x && y == this.nodo_fin.pos_y))
            return;

        this.grid[x][y].libre = libertad;

        stroke(190);

        if (this.grid[x][y].libre)
            fill(10);
        else
            fill(190);

        rect(x*this.tam_casilla, y*this.tam_casilla, this.tam_casilla, this.tam_casilla);
    }

    casillasVecinas(casilla) {

        var vecinos = [];

        if (this.getLibre(casilla.pos_x,casilla.pos_y-1)){
            vecinos.push(this.grid[casilla.pos_x][casilla.pos_y-1]);
        }
        if (this.getLibre(casilla.pos_x+1,casilla.pos_y)){
            vecinos.push(this.grid[casilla.pos_x+1][casilla.pos_y]);
        }
        if (this.getLibre(casilla.pos_x,casilla.pos_y+1)){
            vecinos.push(this.grid[casilla.pos_x][casilla.pos_y+1]);
        }
        if (this.getLibre(casilla.pos_x-1,casilla.pos_y)){
            vecinos.push(this.grid[casilla.pos_x-1][casilla.pos_y]);
        }

        return vecinos;

        // diagonal movement can be done here
    }

    setNodoIni(x,y) {

        if (this.nodo_ini != undefined){
            this.nodo_ini.is_ini = false;
            stroke(190);
            fill(10);
            rect(this.nodo_ini.pos_x*this.tam_casilla, this.nodo_ini.pos_y*this.tam_casilla, this.tam_casilla, this.tam_casilla);
        }

        fill(0,255,0);

        this.nodo_ini = this.grid[x][y];
        this.nodo_ini.is_ini = true;

        rect(x*this.tam_casilla, y*this.tam_casilla, this.tam_casilla-1, this.tam_casilla-1);
    }

    setNodoFin(x,y) {
        if (this.nodo_fin != undefined){
            this.nodo_fin.is_fin = false
            stroke(190);
            fill(10);
            rect(this.nodo_fin.pos_x*this.tam_casilla, this.nodo_fin.pos_y*this.tam_casilla, this.tam_casilla, this.tam_casilla);
        }
        
        fill(255,0,0);

        this.nodo_fin = this.grid[x][y];
        this.nodo_fin.is_fin = true;

        rect(x*this.tam_casilla, y*this.tam_casilla, this.tam_casilla, this.tam_casilla);
    }

    randomLayout(porcentaje) {
        this.cleanLayout();

        for (var i = 0; i < this.n_casillas_largo; i++) {
            for (var j = 0; j < this.n_casillas_alto; j++) {
                if (Math.random() < porcentaje)
                    this.setLibre(i,j, false);
            }
        }
    }

    cleanLayout() {
        for (var i = 0; i < this.n_casillas_largo; i++) {
            for (var j = 0; j < this.n_casillas_alto; j++) {
                this.setLibre(i,j, true);
            }
        }
    }

    resetGridPath() {
        for (var i = 0; i < this.n_casillas_largo; i++) {
            for (var j = 0; j < this.n_casillas_alto; j++) {
                this.grid[i][j].opened = undefined;
                this.grid[i][j].closed = undefined;
                this.grid[i][j].g = undefined;
                this.grid[i][j].h = undefined;
                this.grid[i][j].f = undefined;
            }
        }
    }

    bloquearCamino() {
        var cont = 3;
        for (var path of a.paths) {
            for (var i = cont; i < path.length-cont; i++) {
                path[i].closed = true;
            }
            cont++;
        }
    }
}