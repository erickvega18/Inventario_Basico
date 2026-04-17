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