// --- Configuración ---
const canvas = document.getElementById("tablero");
const ctx = canvas.getContext("2d");
const textoPuntos = document.getElementById("puntos");

const TAMANO_CELDA = 20;                        // píxeles por celda
const CELDAS = canvas.width / TAMANO_CELDA;     // 20 x 20 celdas
const VELOCIDAD_MS = 120;                       // tiempo entre cada paso

// --- Estado del juego ---
let serpiente;   // lista de segmentos {x, y}; el primero es la cabeza
let direccion;   // hacia dónde se mueve {x, y}
let siguienteDireccion;
let comida;
let puntos;
let terminado;

function reiniciar() {
  serpiente = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direccion = { x: 1, y: 0 };
  siguienteDireccion = direccion;
  puntos = 0;
  terminado = false;
  textoPuntos.textContent = puntos;
  colocarComida();
}

// Pone la comida en una celda aleatoria que no esté ocupada por la serpiente
function colocarComida() {
  do {
    comida = {
      x: Math.floor(Math.random() * CELDAS),
      y: Math.floor(Math.random() * CELDAS),
    };
  } while (serpiente.some((s) => s.x === comida.x && s.y === comida.y));
}

// --- Lógica: un "paso" del juego ---
function actualizar() {
  if (terminado) return;

  direccion = siguienteDireccion;
  const cabeza = { x: serpiente[0].x + direccion.x, y: serpiente[0].y + direccion.y };

  // ¿Chocó con una pared o consigo misma?
  const fueraDelTablero = cabeza.x < 0 || cabeza.y < 0 || cabeza.x >= CELDAS || cabeza.y >= CELDAS;
  const choqueConsigo = serpiente.some((s) => s.x === cabeza.x && s.y === cabeza.y);
  if (fueraDelTablero || choqueConsigo) {
    terminado = true;
    return;
  }

  serpiente.unshift(cabeza); // añade la nueva cabeza al inicio

  if (cabeza.x === comida.x && cabeza.y === comida.y) {
    puntos++;
    textoPuntos.textContent = puntos;
    colocarComida(); // no quitamos la cola: la serpiente crece
  } else {
    serpiente.pop(); // quitamos la cola: la serpiente avanza sin crecer
  }
}

// --- Dibujo ---
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f38ba8";
  dibujarCelda(comida);

  serpiente.forEach((segmento, i) => {
    ctx.fillStyle = i === 0 ? "#a6e3a1" : "#40a02b";
    dibujarCelda(segmento);
  });

  if (terminado) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("¡Fin del juego!", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px system-ui";
    ctx.fillText("Pulsa Espacio para reiniciar", canvas.width / 2, canvas.height / 2 + 30);
  }
}

function dibujarCelda({ x, y }) {
  ctx.fillRect(x * TAMANO_CELDA, y * TAMANO_CELDA, TAMANO_CELDA - 1, TAMANO_CELDA - 1);
}

// --- Controles ---
const TECLAS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && terminado) {
    reiniciar();
    return;
  }
  const nueva = TECLAS[e.key];
  if (!nueva) return;
  e.preventDefault();
  // Evita girar 180° (la serpiente chocaría consigo misma)
  if (nueva.x === -direccion.x && nueva.y === -direccion.y) return;
  siguienteDireccion = nueva;
});

// --- Bucle principal ---
reiniciar();
setInterval(() => {
  actualizar();
  dibujar();
}, VELOCIDAD_MS);
