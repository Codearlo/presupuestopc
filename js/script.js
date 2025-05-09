// Variables globales
let components = [];
let subtotal = 0;
let igvIncluded = true; // Por defecto, el IGV está incluido en los precios

// Función para agregar un componente al presupuesto
function addComponent() {
  // Obtener valores del formulario
  const category = document.getElementById("componentCategory").value;
  const name = document.getElementById("componentName").value;
  const priceInput = document.getElementById("componentPrice").value;
  const price = parseFloat(priceInput);

  console.log("Agregando componente:", { category, name, price });

  // Validar entrada
  if (!name || name.trim() === "") {
    alert("Por favor ingresa un nombre válido para el componente");
    return;
  }

  if (isNaN(price) || price <= 0) {
    alert("Por favor ingresa un precio válido mayor a 0");
    return;
  }

  // Agregar componente a la lista
  components.push({ category, name, price });
  
  // Actualizar interfaz
  updateSummary();
  renderComponentList();
  
  // Limpiar formulario
  document.getElementById("componentName").value = "";
  document.getElementById("componentPrice").value = "";
  
  console.log("Componente agregado. Total componentes:", components.length);
}

// Función para actualizar el resumen del presupuesto
function updateSummary() {
  // Calcular el subtotal
  subtotal = 0;
  components.forEach(component => {
    subtotal += component.price;
  });

  // Obtener el estado del interruptor de IGV
  igvIncluded = document.getElementById("igvIncluded").checked;
  
  let igvAmount, total;
  
  if (igvIncluded) {
    // Si el IGV está incluido en los precios
    igvAmount = subtotal - (subtotal / 1.18);
    total = subtotal;
    document.getElementById("igv").innerText = `S/ ${igvAmount.toFixed(2)} (incluido)`;
  } else {
    // Si el IGV no está incluido y debe calcularse aparte
    igvAmount = subtotal * 0.18;
    total = subtotal + igvAmount;
    document.getElementById("igv").innerText = `S/ ${igvAmount.toFixed(2)} (adicional)`;
  }

  document.getElementById("subtotal").innerText = `S/ ${subtotal.toFixed(2)}`;
  document.getElementById("total").innerText = `S/ ${total.toFixed(2)}`;
}

// Función para mostrar la lista de componentes
function renderComponentList() {
  const list = document.getElementById("componentList");
  list.innerHTML = "";

  components.forEach((component, index) => {
    const li = document.createElement("li");
    li.className = "component-item";
    li.innerHTML = `
      <span>${component.category}: ${component.name} - S/ ${component.price.toFixed(2)}</span>
      <button onclick="removeComponent(${index})">Eliminar</button>
    `;
    list.appendChild(li);
  });
}

// Función para eliminar un componente
function removeComponent(index) {
  components.splice(index, 1);
  updateSummary();
  renderComponentList();
}

// Función para generar PDF
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const printable = document.getElementById("printable");
    
    // Verificar si el IGV está incluido o no
    const igvStatus = document.getElementById("igvIncluded").checked ? 
      "Precios incluyen IGV" : 
      "IGV calculado adicionalmente";
    
    printable.innerHTML = `
      <h1>Presupuesto de PC</h1>
      <p><strong>Subtotal:</strong> S/ ${subtotal.toFixed(2)}</p>
      <p><strong>IGV (18%):</strong> S/ ${(igvIncluded ? (subtotal - (subtotal / 1.18)) : (subtotal * 0.18)).toFixed(2)} (${igvIncluded ? 'incluido' : 'adicional'})</p>
      <p><strong>Total:</strong> S/ ${(igvIncluded ? subtotal : subtotal * 1.18).toFixed(2)}</p>
      <p><strong>Nota:</strong> ${igvStatus}</p>
      <h2>Componentes Seleccionados</h2>
      <ul>
        ${components.map(component => `<li>${component.category}: ${component.name} - S/ ${component.price.toFixed(2)}</li>`).join("")}
      </ul>
    `;

    doc.html(printable, {
      callback: function () {
        doc.save("presupuesto_pc.pdf");
        printable.innerHTML = "";
      },
      x: 10,
      y: 10,
      width: 180
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Hubo un error al generar el PDF. Por favor intente nuevamente.");
  }
}

// Función para guardar presupuesto en localStorage
function savePresupuesto() {
  try {
    const presupuestoData = {
      components: components,
      igvIncluded: igvIncluded
    };
    
    localStorage.setItem("pcPresupuesto", JSON.stringify(presupuestoData));
    
    alert("Presupuesto guardado correctamente");
  } catch (error) {
    console.error("Error al guardar presupuesto:", error);
    alert("Hubo un error al guardar el presupuesto. Por favor intente nuevamente.");
  }
}

// Función para cargar presupuesto desde localStorage
function loadPresupuesto() {
  try {
    const savedData = localStorage.getItem("pcPresupuesto");
    
    if (savedData) {
      const presupuestoData = JSON.parse(savedData);
      
      // Restaurar componentes
      components = presupuestoData.components || [];
      
      // Restaurar estado de IGV
      igvIncluded = presupuestoData.igvIncluded;
      if (document.getElementById("igvIncluded")) {
        document.getElementById("igvIncluded").checked = igvIncluded;
      }
      
      // Actualizar interfaz
      updateSummary();
      renderComponentList();
    }
  } catch (error) {
    console.error("Error al cargar presupuesto:", error);
  }
}

// Función para limpiar todo el presupuesto
function clearPresupuesto() {
  if (confirm("¿Estás seguro de que deseas eliminar todos los componentes?")) {
    components = [];
    updateSummary();
    renderComponentList();
  }
}

// Inicializar la página cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("Inicializando aplicación...");
  
  // Añadir listener para el interruptor de IGV
  const igvSwitch = document.getElementById("igvIncluded");
  if (igvSwitch) {
    igvSwitch.addEventListener("change", updateSummary);
  }
  
  // Crear botones de acciones
  const actions = document.createElement("div");
  actions.className = "actions";

  const clearButton = document.createElement("button");
  clearButton.className = "red";
  clearButton.innerText = "Limpiar Todo";
  clearButton.onclick = clearPresupuesto;

  const saveButton = document.createElement("button");
  saveButton.className = "green";
  saveButton.innerText = "Guardar Presupuesto";
  saveButton.onclick = savePresupuesto;

  const exportButton = document.createElement("button");
  exportButton.className = "blue";
  exportButton.innerText = "Exportar a PDF";
  exportButton.onclick = generatePDF;

  actions.appendChild(clearButton);
  actions.appendChild(saveButton);
  actions.appendChild(exportButton);

  const rightSection = document.querySelector(".right-section");
  if (rightSection) {
    rightSection.appendChild(actions);
  }
  
  // Cargar presupuesto guardado si existe
  loadPresupuesto();
  
  console.log("Aplicación inicializada correctamente");
});