class AEstrella {

    isDrawing;
    timeOut;
    openList;

    colors = []

    //list of paths found by A*
    paths = [];

    constructor(n_caminos) {
        this.openList = new Heap(function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        });

        for (var i = 0; i < n_caminos; i++){
            this.colors.push({r:Math.random()*255, g:Math.random()*255, b:Math.random()*255});
        }
    }

    async encontrarCamino(pintarProcedimiento, n_caminos, peso) {
        
        var abs = Math.abs, SQRT2 = Math.SQRT2,
        weight = peso;

        // the first node to check is the initial one
        var nodoIni = grid.nodo_ini;
        nodoIni.g = 0;
        nodoIni.f = 0;
        
        this.openList.push(nodoIni);
        
        while(!this.openList.empty()) {
            var nodo = this.openList.pop();
            nodo.closed = true;

            if (pintarProcedimiento){
                await this.sleep(10);
            }

            // If you are at the end, return the path
            if (nodo.pos_x == grid.nodo_fin.pos_x && nodo.pos_y == grid.nodo_fin.pos_y) {
                this.camino(nodo);
                if (!(this.paths.length == n_caminos)) {
                    this.resetOpenList();
                    grid.resetGridPath();
                    grid.bloquearCamino();
                    grid.render_casillas();
                    await this.encontrarCamino(pintarProcedimiento, n_caminos, peso/2);
                    return;
                }
                else
                {
                    return;
                }
            }

            // 
            var vecinos = grid.casillasVecinas(nodo);
            for (var i = 0, l = vecinos.length; i < l; ++i) {
                var vecino = vecinos[i];

                if (vecino.closed) {
                    continue;
                }

                var ng = nodo.g + 1;
                var nh = weight * this.heuristica(abs(vecino.pos_x - grid.nodo_fin.pos_x), abs(vecino.pos_y - grid.nodo_fin.pos_y));

                if (!vecino.opened || ng < vecino.g || nh < vecino.h) {
                    vecino.g = ng;
                    vecino.h = vecino.h || weight * this.heuristica(abs(vecino.pos_x - grid.nodo_fin.pos_x), abs(vecino.pos_y - grid.nodo_fin.pos_y));
                    vecino.f = vecino.g + vecino.h;
                    vecino.parent = nodo;
    
                    if (!vecino.opened) {
                        this.openList.push(vecino);

                        // the eligible neighbor is painted
                        if (pintarProcedimiento){
                            await this.sleep(10);
                        }

                        vecino.opened = true;
                    } else {
                        this.openList.updateItem(vecino);
                    }
                }
            }
        }

        return [];
    }

    heuristica(dx, dy) {
        return dx + dy;
    }

    camino(node) {
        var path = [node];
        while (node.parent) {
            node = node.parent;

            path.push(node);
        }

        var camino = path.reverse();
        this.paths.push(camino);

        return;
    }

    async printPath(n) {
        for (var e of this.path[n]){
            await this.sleep(20);

            // paint the boxes
            fill(255,0,255);
            rect(e.pos_x*grid.tam_casilla, e.pos_y*grid.tam_casilla, grid.tam_casilla,grid.tam_casilla);
        }
    }

    linePaths() {
        var b = (grid.tam_casilla/2);
        var cont = 0;
        for (var path of this.paths) {
            for (var i = 1; i < path.length; i++) {
                stroke(this.colors[cont].r,this.colors[cont].g,this.colors[cont].b);
                line(b+path[i-1].pos_x*grid.tam_casilla, b+path[i-1].pos_y*grid.tam_casilla, b+path[i].pos_x*grid.tam_casilla, b+path[i].pos_y*grid.tam_casilla);
            }
            cont++;
        }
    }

    resetOpenList() {
        this.openList.clear();
    }

    // stop code function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}