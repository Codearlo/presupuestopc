// 1. Modularización del código usando clases ES6

// Clase para gestionar componentes
class ComponentManager {
  constructor() {
    this.components = [];
    this.loadFromLocalStorage();
  }

  addComponent(category, name, price) {
    if (!name || name.trim() === "") {
      return { success: false, message: "Por favor ingresa un nombre válido para el componente" };
    }
    if (isNaN(price) || price <= 0) {
      return { success: false, message: "Por favor ingresa un precio válido mayor a 0" };
    }
    this.components.push({ category, name, price });
    this.saveToLocalStorage();
    return { success: true };
  }

  updateComponent(index, category, name, price) {
    if (index < 0 || index >= this.components.length) {
      return { success: false, message: "El componente no existe" };
    }
    if (!name || name.trim() === "") {
      return { success: false, message: "Por favor ingresa un nombre válido para el componente" };
    }
    if (isNaN(price) || price <= 0) {
      return { success: false, message: "Por favor ingresa un precio válido mayor a 0" };
    }
    this.components[index] = { category, name, price };
    this.saveToLocalStorage();
    return { success: true };
  }

  removeComponent(index) {
    if (index < 0 || index >= this.components.length) {
      return { success: false, message: "El componente no existe" };
    }
    this.components.splice(index, 1);
    this.saveToLocalStorage();
    return { success: true };
  }

  getComponents() {
    return this.components;
  }

  getComponentsByCategory() {
    const categorizedComponents = {};
    this.components.forEach(component => {
      if (!categorizedComponents[component.category]) {
        categorizedComponents[component.category] = [];
      }
      categorizedComponents[component.category].push(component);
    });
    return categorizedComponents;
  }

  getCategoryTotal(category) {
    return this.components
      .filter(comp => comp.category === category)
      .reduce((sum, comp) => sum + comp.price, 0);
  }

  clearAll() {
    this.components = [];
    this.saveToLocalStorage();
    return { success: true };
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem("pcComponents", JSON.stringify(this.components));
      return { success: true };
    } catch (error) {
      console.error("Error al guardar componentes:", error);
      return { success: false, message: "Error al guardar componentes: " + error.message };
    }
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem("pcComponents");
      if (savedData) {
        this.components = JSON.parse(savedData);
      }
      return { success: true };
    } catch (error) {
      console.error("Error al cargar componentes:", error);
      return { success: false, message: "Error al cargar componentes: " + error.message };
    }
  }
}

// Clase para calcular presupuestos
class BudgetCalculator {
  constructor(components) {
    this.components = components;
    this.igvIncluded = true;
  }

  setIgvIncluded(included) {
    this.igvIncluded = included;
  }

  getSubtotal() {
    return this.components.reduce((sum, comp) => sum + comp.price, 0);
  }

  getIgvAmount() {
    const subtotal = this.getSubtotal();
    if (this.igvIncluded) {
      return subtotal - (subtotal / 1.18); // Precio incluye IGV
    } else {
      return subtotal * 0.18; // Precio sin IGV
    }
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    return this.igvIncluded ? subtotal : subtotal * 1.18;
  }

  getCategoryDistribution() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return [];

    const categories = {};
    this.components.forEach(comp => {
      if (!categories[comp.category]) {
        categories[comp.category] = 0;
      }
      categories[comp.category] += comp.price;
    });

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / subtotal) * 100
    }));
  }
}

// Clase para mostrar notificaciones
class NotificationManager {
  constructor(containerId = 'notification-container') {
    this.container = document.getElementById(containerId);
    this.initStyles();
  }

  initStyles() {
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(50px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = this.getBackgroundColor(type);
    notification.style.color = '#fff';
    notification.style.padding = '15px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.transition = 'all 0.3s ease';
    notification.style.animation = 'fadeIn 0.3s ease-out';

    let icon = '';
    switch (type) {
      case 'success': icon = '<i class="fas fa-check-circle"></i> '; break;
      case 'error': icon = '<i class="fas fa-exclamation-circle"></i> '; break;
      case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i> '; break;
      default: icon = '<i class="fas fa-info-circle"></i> ';
    }

    notification.innerHTML = `
      <div>${icon} ${message}</div>
      <button style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">
        <i class="fas fa-times"></i>
      </button>
    `;

    this.container.appendChild(notification);

    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', () => this.remove(notification));

    setTimeout(() => this.remove(notification), 5000);
    return notification;
  }

  remove(notification) {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getBackgroundColor(type) {
    switch (type) {
      case 'success': return 'rgba(40, 167, 69, 0.9)';
      case 'error': return 'rgba(220, 53, 69, 0.9)';
      case 'warning': return 'rgba(255, 193, 7, 0.9)';
      default: return 'rgba(138, 67, 255, 0.9)';
    }
  }

  success(message) { return this.show(message, 'success'); }
  error(message) { return this.show(message, 'error'); }
  warning(message) { return this.show(message, 'warning'); }
  info(message) { return this.show(message, 'info'); }
}

// Clase para exportar el presupuesto
class BudgetExporter {
  constructor(componentManager, budgetCalculator) {
    this.componentManager = componentManager;
    this.budgetCalculator = budgetCalculator;
  }

  generatePDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const printable = document.getElementById("printable");

      const components = this.componentManager.getComponents();
      const subtotal = this.budgetCalculator.getSubtotal();
      const igvAmount = this.budgetCalculator.getIgvAmount();
      const total = this.budgetCalculator.getTotal();
      const igvIncluded = this.budgetCalculator.igvIncluded;

      const igvStatus = igvIncluded 
        ? "Precios incluyen IGV" 
        : "IGV calculado adicionalmente";

      const categorizedComponents = this.componentManager.getComponentsByCategory();
      let componentsHTML = '';

      Object.entries(categorizedComponents).forEach(([category, comps]) => {
        const categoryTotal = comps.reduce((sum, comp) => sum + comp.price, 0);
        componentsHTML += `
          <h3>${category}</h3>
          <ul>
            ${comps.map(comp => `<li>${comp.name} - S/ ${comp.price.toFixed(2)}</li>`).join('')}
          </ul>
          <p><strong>Subtotal ${category}:</strong> S/ ${categoryTotal.toFixed(2)}</p>
        `;
      });

      const now = new Date();
      const dateStr = now.toLocaleDateString('es-PE');

      printable.innerHTML = `
        <h1>Presupuesto de PC</h1>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <h2>Resumen</h2>
        <p><strong>Subtotal:</strong> S/ ${subtotal.toFixed(2)}</p>
        <p><strong>IGV (18%):</strong> S/ ${igvAmount.toFixed(2)} (${igvIncluded ? 'incluido' : 'adicional'})</p>
        <p><strong>Total:</strong> S/ ${total.toFixed(2)}</p>
        <p><strong>Nota:</strong> ${igvStatus}</p>
        <h2>Componentes Seleccionados</h2>
        ${componentsHTML}
      `;

      doc.html(printable, {
        callback: () => {
          doc.save("presupuesto_pc.pdf");
          printable.innerHTML = "";
        },
        x: 10,
        y: 10,
        width: 180
      });

      return { success: true };
    } catch (error) {
      console.error("Error al generar PDF:", error);
      return { success: false, message: "Hubo un error al generar el PDF." };
    }
  }

  saveMultiplePresupuestos(name) {
    try {
      if (!name || name.trim() === "") {
        return { success: false, message: "Por favor ingresa un nombre para el presupuesto" };
      }

      let savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      const newPresupuesto = {
        id: Date.now(),
        name,
        date: new Date().toISOString(),
        components: this.componentManager.getComponents(),
        igvIncluded: this.budgetCalculator.igvIncluded,
        subtotal: this.budgetCalculator.getSubtotal(),
        total: this.budgetCalculator.getTotal()
      };

      savedPresupuestos.push(newPresupuesto);
      localStorage.setItem("savedPresupuestos", JSON.stringify(savedPresupuestos));

      return { success: true, message: `Presupuesto "${name}" guardado correctamente` };
    } catch (error) {
      console.error("Error al guardar presupuesto:", error);
      return { success: false, message: "Hubo un error al guardar el presupuesto." };
    }
  }

  loadPresupuesto(id) {
    try {
      const savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      const presupuesto = savedPresupuestos.find(p => p.id === id);

      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      this.componentManager.components = [...presupuesto.components];
      this.budgetCalculator.setIgvIncluded(presupuesto.igvIncluded);

      return { success: true, message: `Presupuesto "${presupuesto.name}" cargado correctamente` };
    } catch (error) {
      console.error("Error al cargar presupuesto:", error);
      return { success: false, message: "Hubo un error al cargar el presupuesto." };
    }
  }

  getAllSavedPresupuestos() {
    try {
      const savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      return { success: true, presupuestos: savedPresupuestos };
    } catch (error) {
      console.error("Error al obtener presupuestos guardados:", error);
      return { success: false, message: "Error al obtener presupuestos guardados" };
    }
  }

  deletePresupuesto(id) {
    try {
      let savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      const filtered = savedPresupuestos.filter(p => p.id !== id);

      if (filtered.length === savedPresupuestos.length) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      localStorage.setItem("savedPresupuestos", JSON.stringify(filtered));
      return { success: true, message: "Presupuesto eliminado correctamente" };
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error);
      return { success: false, message: "Hubo un error al eliminar el presupuesto." };
    }
  }
}

// Clase principal de la aplicación
class PCBudgetBuilder {
  constructor() {
    this.componentManager = new ComponentManager();
    this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
    this.notificationManager = new NotificationManager();
    this.budgetExporter = new BudgetExporter(this.componentManager, this.budgetCalculator);
    this.initEventListeners();
    this.updateUI();
  }

  initEventListeners() {
    document.getElementById("addComponentButton").addEventListener("click", () => this.handleAddComponent());
    document.getElementById("igvIncluded").addEventListener("change", () => {
      this.budgetCalculator.setIgvIncluded(event.target.checked);
      this.updateSummary();
    });
    document.getElementById("clearButton").addEventListener("click", () => this.clearPresupuesto());
    document.getElementById("saveButton").addEventListener("click", () => this.showSaveDialog());
    document.getElementById("exportButton").addEventListener("click", () => this.exportToPDF());
    document.getElementById("loadButton").addEventListener("click", () => this.showLoadDialog());
  }

  handleAddComponent() {
    const category = document.getElementById("componentCategory").value;
    const name = document.getElementById("componentName").value;
    const priceInput = document.getElementById("componentPrice").value;
    const price = parseFloat(priceInput);
    const addButton = document.getElementById("addComponentButton");
    const editIndex = addButton.dataset.editIndex;

    let result;
    if (editIndex !== undefined) {
      result = this.componentManager.updateComponent(parseInt(editIndex), category, name, price);
      addButton.textContent = "Agregar Componente";
      delete addButton.dataset.editIndex;
    } else {
      result = this.componentManager.addComponent(category, name, price);
    }

    if (result.success) {
      this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
      this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
      this.updateUI();
      document.getElementById("componentName").value = "";
      document.getElementById("componentPrice").value = "";
      this.notificationManager.success(editIndex !== undefined ? "Componente actualizado" : "Componente agregado");
    } else {
      this.notificationManager.error(result.message);
    }
  }

  updateUI() {
    this.updateSummary();
    this.renderComponentList();
    if (document.getElementById('budgetChart')) {
      this.renderBudgetChart();
    }
  }

  updateSummary() {
    const igvIncluded = document.getElementById("igvIncluded").checked;
    this.budgetCalculator.setIgvIncluded(igvIncluded);
    const subtotal = this.budgetCalculator.getSubtotal();
    const igvAmount = this.budgetCalculator.getIgvAmount();
    const total = this.budgetCalculator.getTotal();

    document.getElementById("subtotal").innerText = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById("igv").innerText = `S/ ${igvAmount.toFixed(2)} (${igvIncluded ? 'incluido' : 'adicional'})`;
    document.getElementById("total").innerText = `S/ ${total.toFixed(2)}`;
  }

  renderComponentList() {
    const list = document.getElementById("componentList");
    const emptyState = document.getElementById("emptyState");
    const components = this.componentManager.getComponents();

    list.innerHTML = "";
    if (components.length === 0) {
      emptyState.style.display = "flex";
      list.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    list.style.display = "block";

    const categorizedComponents = this.componentManager.getComponentsByCategory();

    Object.entries(categorizedComponents).forEach(([category, comps]) => {
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "component-category-header";
      const categoryTotal = this.componentManager.getCategoryTotal(category);
      categoryHeader.innerHTML = `
        <h3 class="component-category">${category}</h3>
        <span class="category-total">Total categoría: S/ ${categoryTotal.toFixed(2)}</span>
      `;
      list.appendChild(categoryHeader);

      comps.forEach((component, idx) => {
        const globalIndex = components.findIndex(comp =>
          comp.category === component.category &&
          comp.name === component.name &&
          comp.price === component.price
        );

        const li = document.createElement("div");
        li.className = "component-item";
        li.innerHTML = `
          <div class="component-details">
            <span class="component-name">${component.name}</span>
            <span class="component-price">S/ ${component.price.toFixed(2)}</span>
          </div>
          <div class="component-actions">
            <button class="edit-btn" data-index="${globalIndex}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-index="${globalIndex}"><i class="fas fa-trash"></i></button>
          </div>
        `;
        list.appendChild(li);

        li.querySelector(".edit-btn").addEventListener("click", () => this.editComponent(globalIndex));
        li.querySelector(".delete-btn").addEventListener("click", () => this.removeComponent(globalIndex));
      });
    });
  }

  editComponent(index) {
    const component = this.componentManager.getComponents()[index];
    if (!component) {
      this.notificationManager.error("Componente no encontrado");
      return;
    }

    document.getElementById("componentCategory").value = component.category;
    document.getElementById("componentName").value = component.name;
    document.getElementById("componentPrice").value = component.price;

    const addButton = document.getElementById("addComponentButton");
    addButton.textContent = "Actualizar Componente";
    addButton.dataset.editIndex = index;

    document.querySelector(".left-section").scrollIntoView({ behavior: "smooth" });
  }

  removeComponent(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este componente?")) {
      const result = this.componentManager.removeComponent(index);
      if (result.success) {
        this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
        this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
        this.updateUI();
        this.notificationManager.success("Componente eliminado");
      } else {
        this.notificationManager.error(result.message);
      }
    }
  }

  clearPresupuesto() {
    if (confirm("¿Estás seguro de que deseas eliminar todos los componentes?")) {
      const result = this.componentManager.clearAll();
      if (result.success) {
        this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
        this.updateUI();
        this.notificationManager.success("Presupuesto limpiado correctamente");
      }
    }
  }

  showSaveDialog() {
    const components = this.componentManager.getComponents();
    if (components.length === 0) {
      this.notificationManager.warning("No hay componentes para guardar");
      return;
    }

    const modal = document.getElementById("saveModal");
    const input = document.getElementById("presupuestoNombre");
    const confirmBtn = document.getElementById("guardarPresupuestoBtn");

    input.value = "";
    modal.style.display = "flex";
    input.focus();

    confirmBtn.onclick = () => {
      const name = input.value;
      const result = this.budgetExporter.saveMultiplePresupuestos(name);
      if (result.success) {
        this.notificationManager.success(result.message);
        modal.style.display = "none";
      } else {
        this.notificationManager.error(result.message);
      }
    };

    document.getElementById("cerrarModalBtn").onclick = () => {
      modal.style.display = "none";
    };
    document.getElementById("cerrarModalBtnX").onclick = () => {
      modal.style.display = "none";
    };
  }

  showLoadDialog() {
    const result = this.budgetExporter.getAllSavedPresupuestos();
    if (!result.success) {
      this.notificationManager.error(result.message);
      return;
    }

    if (result.presupuestos.length === 0) {
      this.notificationManager.warning("No hay presupuestos guardados");
      return;
    }

    const modal = document.getElementById("loadModal");
    const listContainer = document.getElementById("presupuestoLista");
    listContainer.innerHTML = "";

    result.presupuestos.forEach(presupuesto => {
      const item = document.createElement("div");
      item.className = "presupuesto-item";
      item.innerHTML = `
        <div class="item-info">
          <strong>${presupuesto.name}</strong> - S/ ${presupuesto.total.toFixed(2)}
        </div>
        <div class="item-actions">
          <button class="btn-load" data-id="${presupuesto.id}">Cargar</button>
          <button class="btn-delete" data-id="${presupuesto.id}">Eliminar</button>
        </div>
      `;
      listContainer.appendChild(item);

      item.querySelector(".btn-load").addEventListener("click", () => {
        const loadResult = this.budgetExporter.loadPresupuesto(presupuesto.id);
        if (loadResult.success) {
          this.notificationManager.success(loadResult.message);
          modal.style.display = "none";
          this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
          this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
          this.updateUI();
        } else {
          this.notificationManager.error(loadResult.message);
        }
      });

      item.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar "${presupuesto.name}"?`)) {
          const deleteResult = this.budgetExporter.deletePresupuesto(presupuesto.id);
          if (deleteResult.success) {
            this.notificationManager.success(deleteResult.message);
            item.remove();
          } else {
            this.notificationManager.error(deleteResult.message);
          }
        }
      });
    });

    modal.style.display = "flex";
    document.getElementById("cerrarLoadModalBtn").onclick = () => {
      modal.style.display = "none";
    };
    document.getElementById("cerrarLoadModalBtnX").onclick = () => {
      modal.style.display = "none";
    };
  }

  exportToPDF() {
    const components = this.componentManager.getComponents();
    if (components.length === 0) {
      this.notificationManager.warning("No hay componentes para exportar");
      return;
    }

    const result = this.budgetExporter.generatePDF();
    if (result.success) {
      this.notificationManager.success("PDF generado correctamente");
    } else {
      this.notificationManager.error(result.message);
    }
  }

  renderBudgetChart() {
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;

    const distribution = this.budgetCalculator.getCategoryDistribution();
    if (distribution.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Agrega componentes para ver la distribución', canvas.width / 2, canvas.height / 2);
      return;
    }

    const labels = distribution.map(i => i.category);
    const values = distribution.map(i => i.amount);

    const backgroundColors = [
      'rgba(138, 67, 255, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 159, 64, 0.7)'
    ];

    if (window.budgetPieChart) {
      window.budgetPieChart.data.labels = labels;
      window.budgetPieChart.data.datasets[0].data = values;
      window.budgetPieChart.update();
    } else {
      if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js ';
        script.onload = () => {
          this.createPieChart(canvas, labels, values, backgroundColors);
        };
        document.head.appendChild(script);
      } else {
        this.createPieChart(canvas, labels, values, backgroundColors);
      }
    }
  }

  createPieChart(canvas, labels, values, backgroundColors) {
    const ctx = canvas.getContext('2d');
    window.budgetPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors.slice(0, values.length),
          borderColor: 'rgba(30, 30, 30, 0.8)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'white'
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `S/ ${ctx.raw.toFixed(2)}`
            }
          }
        }
      }
    });
  }
}

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function () {
  window.app = new PCBudgetBuilder();
});