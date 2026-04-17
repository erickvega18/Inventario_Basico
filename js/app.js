let productos = JSON.parse(localStorage.getItem('inventario')) || [];

function guardarProducto() {
  const nombre   = document.getElementById('nombre').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const precio   = parseFloat(document.getElementById('precio').value);
  const index    = parseInt(document.getElementById('productoIndex').value);

  if (!nombre || isNaN(cantidad) || isNaN(precio)) {
    alert('Por favor completa todos los campos correctamente.');
    return;
  }

  if (index === -1) {
    // FUNCIÓN: AGREGAR PRODUCTO
    productos.push({ nombre, cantidad, precio });
  } else {
    // FUNCIÓN: ACTUALIZAR STOCK
    productos[index] = { nombre, cantidad, precio };
  }

  guardarEnStorage();
  limpiarFormulario();
  renderTabla();
}
// FUNCIÓN: ELIMINAR PRODUCTO
function eliminarProducto(i) {
  if (confirm(`¿Eliminar "${productos[i].nombre}"?`)) {
    productos.splice(i, 1);
    guardarEnStorage();
    renderTabla();
  }
}

function editarProducto(i) {
  document.getElementById('nombre').value   = productos[i].nombre;
  document.getElementById('cantidad').value = productos[i].cantidad;
  document.getElementById('precio').value   = productos[i].precio;
  document.getElementById('productoIndex').value = i;
}

function limpiarFormulario() {
  document.getElementById('nombre').value   = '';
  document.getElementById('cantidad').value = '';
  document.getElementById('precio').value   = '';
  document.getElementById('productoIndex').value = -1;
}
// FUNCIÓN: FILTRO Y BUSQUEDA

function filtrarProductos() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );
  renderTabla(filtrados);
}

function renderTabla(lista = productos) {
  const tbody = document.getElementById('cuerpoTabla');
  tbody.innerHTML = '';

  let totalGeneral = 0;

  lista.forEach((p, i) => {
    const total = p.cantidad * p.precio;
    totalGeneral += total;
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio.toLocaleString('es-CO')}</td>
        <td>$${total.toLocaleString('es-CO')}</td>
       <td><div class="td-acciones">
  <button class="btn-sm btn-editar" onclick="editarProducto(${i})">✏️ Editar</button>
  <button class="btn-sm btn-eliminar" onclick="eliminarProducto(${i})">🗑️ Eliminar</button>
</div></td> 
      </tr>`;
  });

  document.getElementById('totalGeneral').textContent =
    `💰 Total inventario: $${totalGeneral.toLocaleString('es-CO')}`;
}

function guardarEnStorage() {
  localStorage.setItem('inventario', JSON.stringify(productos));
}

// Cargar al iniciar
renderTabla();
// ══════════════════════════════
//   SISTEMA DE CLIENTES
// ══════════════════════════════

let carrito = []; // { index, nombre, precio, cantidad }
let historial = JSON.parse(localStorage.getItem('historial')) || [];

// ── Cambiar pestaña ──
function cambiarTab(tab) {
  document.getElementById('tab-inventario').style.display =
    tab === 'inventario' ? '' : 'none';
  document.getElementById('tab-clientes').style.display =
    tab === 'clientes' ? '' : 'none';

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active',
      (tab === 'inventario' && i === 0) ||
      (tab === 'clientes'   && i === 1));
  });

  if (tab === 'clientes') {
    renderCatalogo();
    renderHistorial();
  }
}

// ── Catálogo ──
function renderCatalogo(lista = productos) {
  const grid = document.getElementById('catalogo');
  if (lista.length === 0) {
    grid.innerHTML = '<p class="vacio">No hay productos disponibles.</p>';
    return;
  }

  grid.innerHTML = lista.map((p, i) => {
    const agotado = p.cantidad === 0;
    return `
    <div class="producto-card">
      <div class="prod-nombre">${p.nombre}</div>
      <div class="prod-precio">$${p.precio.toLocaleString('es-CO')}</div>
      <div class="prod-stock ${agotado ? 'agotado' : ''}">
        ${agotado
          ? '❌ Agotado'
          : `Stock disponible: <strong>${p.cantidad}</strong>
             ${p.cantidad <= 5 ? '<span class="badge-bajo">Stock bajo</span>' : ''}`
        }
      </div>
      ${agotado ? '' : `
      <div class="prod-cantidad-wrap">
        <input type="number" id="cant-${i}" value="1" min="1" max="${p.cantidad}" />
        <button class="btn-agregar-carrito"
          onclick="agregarAlCarrito(${i})">
          🛒 Agregar
        </button>
      </div>`}
    </div>`;
  }).join('');
}

function filtrarCatalogo() {
  const texto = document.getElementById('buscadorCliente').value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );
  renderCatalogo(filtrados);
}

// ── Carrito ──
function agregarAlCarrito(index) {
  const cantInput = document.getElementById(`cant-${index}`);
  const cant = parseInt(cantInput.value);

  if (isNaN(cant) || cant < 1) {
    alert('Ingresa una cantidad válida.'); return;
  }
  if (cant > productos[index].cantidad) {
    alert(`Solo hay ${productos[index].cantidad} unidades disponibles.`); return;
  }

  const existe = carrito.findIndex(c => c.index === index);
  if (existe >= 0) {
    const nuevaCant = carrito[existe].cantidad + cant;
    if (nuevaCant > productos[index].cantidad) {
      alert(`No puedes agregar más de ${productos[index].cantidad} unidades.`); return;
    }
    carrito[existe].cantidad = nuevaCant;
  } else {
    carrito.push({
      index,
      nombre: productos[index].nombre,
      precio: productos[index].precio,
      cantidad: cant
    });
  }

  renderCarrito();
}

function renderCarrito() {
  const tbody   = document.getElementById('cuerpoCarrito');
  const tabla   = document.getElementById('tablaCarrito');
  const vacio   = document.getElementById('carritoVacio');
  const totalEl = document.getElementById('totalCarrito');
  const btnCom  = document.getElementById('btnComprar');

  if (carrito.length === 0) {
    tabla.style.display  = 'none';
    vacio.style.display  = '';
    totalEl.style.display = 'none';
    btnCom.style.display  = 'none';
    return;
  }

  tabla.style.display   = '';
  vacio.style.display   = 'none';
  totalEl.style.display = '';
  btnCom.style.display  = '';

  let total = 0;
  tbody.innerHTML = carrito.map((item, i) => {
    const sub = item.precio * item.cantidad;
    total += sub;
    return `
    <tr>
      <td>${item.nombre}</td>
      <td>$${item.precio.toLocaleString('es-CO')}</td>
      <td>${item.cantidad}</td>
      <td>$${sub.toLocaleString('es-CO')}</td>
      <td>
        <button class="btn-sm btn-eliminar"
          onclick="quitarDelCarrito(${i})">🗑️</button>
      </td>
    </tr>`;
  }).join('');

  totalEl.textContent = `💰 Total: $${total.toLocaleString('es-CO')}`;
}

function quitarDelCarrito(i) {
  carrito.splice(i, 1);
  renderCarrito();
}

// ── Finalizar compra ──
function finalizarCompra() {
  if (carrito.length === 0) return;

  // Descontar del inventario
  carrito.forEach(item => {
    productos[item.index].cantidad -= item.cantidad;
  });

  // Guardar en historial
  const fecha = new Date().toLocaleString('es-CO');
  const resumen = carrito.map(c => `${c.nombre} x${c.cantidad}`).join(', ');
  const total = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);

  historial.unshift({ fecha, resumen, total });

  // Guardar y limpiar
  guardarEnStorage();
  localStorage.setItem('historial', JSON.stringify(historial));
  carrito = [];

  renderCarrito();
  renderCatalogo();
  renderTabla();
  renderHistorial();

  alert('✅ ¡Compra realizada con éxito! El inventario ha sido actualizado.');
}

// ── Historial ──
function renderHistorial() {
  const tbody = document.getElementById('cuerpoHistorial');
  const tabla = document.getElementById('tablaHistorial');
  const vacio = document.getElementById('historialVacio');

  if (historial.length === 0) {
    tabla.style.display = 'none';
    vacio.style.display = '';
    return;
  }

  tabla.style.display = '';
  vacio.style.display = 'none';

  tbody.innerHTML = historial.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${h.fecha}</td>
      <td style="text-align:left">${h.resumen}</td>
      <td>$${h.total.toLocaleString('es-CO')}</td>
    </tr>`).join('');
}