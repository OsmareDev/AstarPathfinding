class casilla {
    libre;
    pos_x;
    pos_y;

    is_ini;
    is_fin;
    
    g;
    h;
    f;

    closed;
    opened;
    parent;


    constructor (x, y, libre) {
        this.pos_x = x;
        this.pos_y = y;

        this.libre = (libre === undefined ? true : libre);
    }

    render() {
        stroke(130);
        fill(10);

        if (!this.libre)
            fill(190);
    
        if (this.opened && pintar_proceso)
            fill(0,0,255);

        if (this.closed && pintar_proceso)
            fill(0,0,150);


        if (this.is_ini)
            fill(0,255,0);
        
        if (this.is_fin)
            fill(255,0,0);
        
        rect(this.pos_x*grid.tam_casilla, this.pos_y*grid.tam_casilla, grid.tam_casilla, grid.tam_casilla);
    }
}