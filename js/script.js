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
      // Si los precios incluyen IGV, calculamos qué porción corresponde al IGV
      return subtotal - (subtotal / 1.18);
    } else {
      // Si los precios no incluyen IGV, calculamos el IGV adicional
      return subtotal * 0.18;
    }
  }
  
  getTotal() {
    const subtotal = this.getSubtotal();
    
    if (this.igvIncluded) {
      // Si los precios incluyen IGV, el total es igual al subtotal
      return subtotal;
    } else {
      // Si los precios no incluyen IGV, sumamos el IGV al subtotal
      return subtotal * 1.18;
    }
  }
  
  getCategoryDistribution() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return [];
    
    const categories = {};
    
    // Agrupar por categoría
    this.components.forEach(comp => {
      if (!categories[comp.category]) {
        categories[comp.category] = 0;
      }
      categories[comp.category] += comp.price;
    });
    
    // Convertir a array para gráficos
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / subtotal) * 100
    }));
  }
}

// Clase para mostrar notificaciones
class NotificationManager {
  constructor() {
    this.createNotificationContainer();
  }
  
  createNotificationContainer() {
    // Crear contenedor de notificaciones si no existe
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '1000';
      document.body.appendChild(container);
    }
  }
  
  show(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    // Crear elemento de notificación
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
    
    // Agregar ícono según el tipo
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i> ';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i> ';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i> ';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i> ';
    }
    
    // Contenido de la notificación
    notification.innerHTML = `
      <div>${icon} ${message}</div>
      <button style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Añadir al contenedor
    container.appendChild(notification);
    
    // Configurar el botón de cierre
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', () => {
      this.remove(notification);
    });
    
    // Agregar estilos para la animación
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
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
      this.remove(notification);
    }, 5000);
    
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
  
  success(message) {
    return this.show(message, 'success');
  }
  
  error(message) {
    return this.show(message, 'error');
  }
  
  warning(message) {
    return this.show(message, 'warning');
  }
  
  info(message) {
    return this.show(message, 'info');
  }
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
      
      const components = this.componentManager.getComponents();
      const subtotal = this.budgetCalculator.getSubtotal();
      const igvAmount = this.budgetCalculator.getIgvAmount();
      const total = this.budgetCalculator.getTotal();
      const igvIncluded = this.budgetCalculator.igvIncluded;
      
      // Crear contenido HTML para el PDF
      const printable = document.getElementById("printable");
      
      // Verificar si el IGV está incluido o no
      const igvStatus = igvIncluded ? 
        "Precios incluyen IGV" : 
        "IGV calculado adicionalmente";
        
      // Obtener componentes por categoría para mostrarlos organizados
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
      
      // Fecha actual
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
        callback: function () {
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
      return { 
        success: false, 
        message: "Hubo un error al generar el PDF. Por favor intente nuevamente."
      };
    }
  }
  
  saveMultiplePresupuestos(name) {
    try {
      // Verificar que el nombre no esté vacío
      if (!name || name.trim() === "") {
        return { 
          success: false, 
          message: "Por favor ingresa un nombre para el presupuesto" 
        };
      }
      
      // Obtener presupuestos guardados
      let savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      
      // Crear nuevo presupuesto
      const newPresupuesto = {
        id: Date.now(), // ID único basado en timestamp
        name: name,
        date: new Date().toISOString(),
        components: this.componentManager.getComponents(),
        igvIncluded: this.budgetCalculator.igvIncluded,
        subtotal: this.budgetCalculator.getSubtotal(),
        total: this.budgetCalculator.getTotal()
      };
      
      // Añadir a la lista
      savedPresupuestos.push(newPresupuesto);
      
      // Guardar en localStorage
      localStorage.setItem("savedPresupuestos", JSON.stringify(savedPresupuestos));
      
      return { 
        success: true, 
        message: `Presupuesto "${name}" guardado correctamente` 
      };
    } catch (error) {
      console.error("Error al guardar presupuesto:", error);
      return { 
        success: false, 
        message: "Hubo un error al guardar el presupuesto." 
      };
    }
  }
  
  loadPresupuesto(id) {
    try {
      // Obtener presupuestos guardados
      const savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      
      // Buscar el presupuesto con el ID especificado
      const presupuesto = savedPresupuestos.find(p => p.id === id);
      
      if (!presupuesto) {
        return { 
          success: false, 
          message: "Presupuesto no encontrado" 
        };
      }
      
      // Cargar los componentes
      this.componentManager.components = [...presupuesto.components];
      
      // Actualizar el estado del IGV
      this.budgetCalculator.setIgvIncluded(presupuesto.igvIncluded);
      
      return { 
        success: true, 
        message: `Presupuesto "${presupuesto.name}" cargado correctamente` 
      };
    } catch (error) {
      console.error("Error al cargar presupuesto:", error);
      return { 
        success: false, 
        message: "Hubo un error al cargar el presupuesto." 
      };
    }
  }
  
  getAllSavedPresupuestos() {
    try {
      const savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      return { 
        success: true, 
        presupuestos: savedPresupuestos 
      };
    } catch (error) {
      console.error("Error al obtener presupuestos guardados:", error);
      return { 
        success: false, 
        message: "Error al obtener presupuestos guardados" 
      };
    }
  }
  
  deletePresupuesto(id) {
    try {
      // Obtener presupuestos guardados
      let savedPresupuestos = JSON.parse(localStorage.getItem("savedPresupuestos") || "[]");
      
      // Filtrar el presupuesto a eliminar
      const filtered = savedPresupuestos.filter(p => p.id !== id);
      
      if (filtered.length === savedPresupuestos.length) {
        return { 
          success: false, 
          message: "Presupuesto no encontrado" 
        };
      }
      
      // Guardar la lista actualizada
      localStorage.setItem("savedPresupuestos", JSON.stringify(filtered));
      
      return { 
        success: true, 
        message: "Presupuesto eliminado correctamente" 
      };
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error);
      return { 
        success: false, 
        message: "Hubo un error al eliminar el presupuesto." 
      };
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
    // Botón de agregar componente
    const addComponentBtn = document.getElementById("addComponentButton");
    if (addComponentBtn) {
      addComponentBtn.addEventListener("click", () => this.handleAddComponent());
    }
    
    // Interruptor de IGV
    const igvSwitch = document.getElementById("igvIncluded");
    if (igvSwitch) {
      igvSwitch.addEventListener("change", () => {
        this.budgetCalculator.setIgvIncluded(igvSwitch.checked);
        this.updateSummary();
      });
    }
    
    // Crear los botones de acciones
    this.createActionButtons();
  }
  
  handleAddComponent() {
    const category = document.getElementById("componentCategory").value;
    const name = document.getElementById("componentName").value;
    const priceInput = document.getElementById("componentPrice").value;
    const price = parseFloat(priceInput);
    const addButton = document.getElementById("addComponentButton");
    const editIndex = addButton.dataset.editIndex;
    
    let result;
    
    // Si estamos editando un componente existente
    if (editIndex !== undefined) {
      result = this.componentManager.updateComponent(
        parseInt(editIndex),
        category,
        name,
        price
      );
      
      // Restaurar el botón a su estado original
      addButton.textContent = "Agregar Componente";
      delete addButton.dataset.editIndex;
    } else {
      // Agregar nuevo componente
      result = this.componentManager.addComponent(category, name, price);
    }
    
    // Manejar el resultado
    if (result.success) {
      // Actualizar la calculadora con los componentes actualizados
      this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
      this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
      
      // Actualizar interfaz
      this.updateUI();
      
      // Limpiar formulario
      document.getElementById("componentName").value = "";
      document.getElementById("componentPrice").value = "";
      
      // Mostrar notificación
      this.notificationManager.success(
        editIndex !== undefined ? "Componente actualizado" : "Componente agregado"
      );
    } else {
      // Mostrar error
      this.notificationManager.error(result.message);
    }
  }
  
  updateUI() {
    this.updateSummary();
    this.renderComponentList();
    
    // Actualizar gráfico de distribución si existe
    if (document.getElementById('budgetChart')) {
      this.renderBudgetChart();
    }
  }
  
  updateSummary() {
    // Actualizar el estado del IGV en la calculadora
    const igvIncluded = document.getElementById("igvIncluded").checked;
    this.budgetCalculator.setIgvIncluded(igvIncluded);
    
    // Obtener valores calculados
    const subtotal = this.budgetCalculator.getSubtotal();
    const igvAmount = this.budgetCalculator.getIgvAmount();
    const total = this.budgetCalculator.getTotal();
    
    // Actualizar la interfaz
    document.getElementById("subtotal").innerText = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById("igv").innerText = `S/ ${igvAmount.toFixed(2)} (${igvIncluded ? 'incluido' : 'adicional'})`;
    document.getElementById("total").innerText = `S/ ${total.toFixed(2)}`;
  }
  
  renderComponentList() {
    const componentsContainer = document.getElementById("componentsContainer");
    const list = document.getElementById("componentList");
    const emptyState = document.getElementById("emptyState");
    
    // Limpiar la lista actual
    list.innerHTML = "";
    
    const components = this.componentManager.getComponents();
    
    // Si no hay componentes, mostrar el estado vacío
    if (components.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      if (list) list.style.display = "none";
      return;
    }
    
    // Si hay componentes, ocultar el estado vacío y mostrar la lista
    if (emptyState) emptyState.style.display = "none";
    if (list) list.style.display = "block";
    
    // Obtener componentes agrupados por categoría
    const categorizedComponents = this.componentManager.getComponentsByCategory();
    
    // Crear secciones para cada categoría
    Object.entries(categorizedComponents).forEach(([category, comps]) => {
      // Crear encabezado de categoría
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "component-category-header";
      
      // Calcular el total de la categoría
      const categoryTotal = this.componentManager.getCategoryTotal(category);
      
      categoryHeader.innerHTML = `
        <h3 class="component-category">${category}</h3>
        <span class="category-total">Total categoría: S/ ${categoryTotal.toFixed(2)}</span>
      `;
      list.appendChild(categoryHeader);
      
      // Agregar componentes de esta categoría
      comps.forEach(component => {
        // Encontrar el índice global del componente
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
        
        // Agregar event listeners a los botones
        const editBtn = li.querySelector(".edit-btn");
        const deleteBtn = li.querySelector(".delete-btn");
        
        editBtn.addEventListener("click", () => this.editComponent(globalIndex));
        deleteBtn.addEventListener("click", () => this.removeComponent(globalIndex));
      });
    });
  }
  
  editComponent(index) {
    const components = this.componentManager.getComponents();
    const component = components[index];
    
    if (!component) {
      this.notificationManager.error("Componente no encontrado");
      return;
    }
    
    // Llenar el formulario con los datos del componente
    document.getElementById("componentCategory").value = component.category;
    document.getElementById("componentName").value = component.name;
    document.getElementById("componentPrice").value = component.price;
    
    // Cambiar el botón de agregar a actualizar
    const addButton = document.getElementById("addComponentButton");
    addButton.textContent = "Actualizar Componente";
    addButton.dataset.editIndex = index;
    
    // Scroll al formulario
    document.querySelector(".left-section").scrollIntoView({ behavior: "smooth" });
  }
  
  removeComponent(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este componente?")) {
      const result = this.componentManager.removeComponent(index);
      
      if (result.success) {
        // Actualizar la calculadora con los componentes actualizados
        this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
        this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
        
        // Actualizar interfaz
        this.updateUI();
        
        // Mostrar notificación
        this.notificationManager.success("Componente eliminado");
      } else {
        // Mostrar error
        this.notificationManager.error(result.message);
      }
    }
  }
  
  clearPresupuesto() {
    if (confirm("¿Estás seguro de que deseas eliminar todos los componentes?")) {
      const result = this.componentManager.clearAll();
      
      if (result.success) {
        // Actualizar la calculadora con los componentes actualizados
        this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
        
        // Actualizar interfaz
        this.updateUI();
        
        // Mostrar notificación
        this.notificationManager.success("Presupuesto limpiado correctamente");
      }
    }
  }
  
  createActionButtons() {
    // Crear botones de acciones
    const actions = document.createElement("div");
    actions.className = "actions";

    const clearButton = document.createElement("button");
    clearButton.className = "red";
    clearButton.innerHTML = '<i class="fas fa-trash"></i> Limpiar Todo';
    clearButton.onclick = () => this.clearPresupuesto();

    const saveButton = document.createElement("button");
    saveButton.className = "green";
    saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar';
    saveButton.onclick = () => this.showSaveDialog();

    const exportButton = document.createElement("button");
    exportButton.className = "blue";
    exportButton.innerHTML = '<i class="fas fa-file-export"></i> Exportar a PDF';
    exportButton.onclick = () => this.exportToPDF();
    
    const loadButton = document.createElement("button");
    loadButton.className = "orange";
    loadButton.innerHTML = '<i class="fas fa-folder-open"></i> Cargar';
    loadButton.onclick = () => this.showLoadDialog();
    
    actions.appendChild(clearButton);
    actions.appendChild(loadButton);
    actions.appendChild(saveButton);
    actions.appendChild(exportButton);

    const rightSection = document.querySelector(".right-section");
    if (rightSection) {
      rightSection.appendChild(actions);
    }
    
    // Añadir también gráfico de distribución después de los botones
    this.createBudgetChart();
  }
  
  showSaveDialog() {
    // Crear un diálogo modal para guardar el presupuesto
    const components = this.componentManager.getComponents();
    
    if (components.length === 0) {
      this.notificationManager.warning("No hay componentes para guardar");
      return;
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.width = '400px';
    modalContent.style.backgroundColor = 'var(--glass-bg)';
    modalContent.style.backdropFilter = 'blur(12px)';
    modalContent.style.WebkitBackdropFilter = 'blur(12px)';
    modalContent.style.borderRadius = '12px';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    modalContent.style.border = '1px solid var(--glass-border)';
    
    // Título del modal
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Guardar Presupuesto';
    modalTitle.style.marginTop = '0';
    modalTitle.style.color = 'var(--text-color)';
    
    // Campo para el nombre del presupuesto
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nombre del presupuesto';
    nameInput.style.width = '100%';
    nameInput.style.marginBottom = '20px';
    nameInput.style.padding = '12px 16px';
    nameInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
    nameInput.style.color = 'var(--text-color)';
    nameInput.style.border = '1px solid var(--glass-border)';
    nameInput.style.borderRadius = '8px';
    nameInput.style.fontSize = '1rem';
    
    // Botones
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '10px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
    cancelButton.style.border = 'none';
    cancelButton.style.color = 'white';
    cancelButton.style.padding = '10px 15px';
    cancelButton.style.borderRadius = '8px';
    cancelButton.style.cursor = 'pointer';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.style.backgroundColor = 'var(--accent-color)';
    saveButton.style.border = 'none';
    saveButton.style.color = 'white';
    saveButton.style.padding = '10px 15px';
    saveButton.style.borderRadius = '8px';
    saveButton.style.cursor = 'pointer';
    
    // Agregar event listeners
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    saveButton.addEventListener('click', () => {
      const name = nameInput.value;
      const result = this.budgetExporter.saveMultiplePresupuestos(name);
      
      if (result.success) {
        this.notificationManager.success(result.message);
        document.body.removeChild(modal);
      } else {
        this.notificationManager.error(result.message);
      }
    });
    
    // Ensamblar el modal
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(nameInput);
    modalContent.appendChild(buttonContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Enfocar el input
    nameInput.focus();
  }
  
  showLoadDialog() {
    // Obtener presupuestos guardados
    const result = this.budgetExporter.getAllSavedPresupuestos();
    
    if (!result.success) {
      this.notificationManager.error(result.message);
      return;
    }
    
    if (result.presupuestos.length === 0) {
      this.notificationManager.warning("No hay presupuestos guardados");
      return;
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.width = '500px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.backgroundColor = 'var(--glass-bg)';
    modalContent.style.backdropFilter = 'blur(12px)';
    modalContent.style.WebkitBackdropFilter = 'blur(12px)';
    modalContent.style.borderRadius = '12px';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    modalContent.style.border = '1px solid var(--glass-border)';
    
    // Título del modal
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Cargar Presupuesto';
    modalTitle.style.marginTop = '0';
    modalTitle.style.color = 'var(--text-color)';
    
    // Lista de presupuestos
    const presupuestosList = document.createElement('div');
    presupuestosList.style.marginBottom = '20px';
    
    result.presupuestos.forEach(presupuesto => {
      const item = document.createElement('div');
      item.className = 'presupuesto-item';
      item.style.padding = '15px';
      item.style.marginBottom = '10px';
      item.style.backgroundColor = 'rgba(50, 50, 50, 0.4)';
      item.style.borderRadius = '8px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.transition = 'all 0.2s ease';
      item.style.cursor = 'pointer';
      
      // Formato de fecha
      const date = new Date(presupuesto.date);
      const dateStr = `${date.toLocaleDateString('es-PE')} ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
      
      const itemInfo = document.createElement('div');
      itemInfo.innerHTML = `
        <div style="font-weight: 500;">${presupuesto.name}</div>
        <div style="font-size: 0.9rem; color: var(--text-secondary);">
          ${dateStr} - S/ ${presupuesto.total.toFixed(2)}
        </div>
      `;
      
      const itemActions = document.createElement('div');
      itemActions.style.display = 'flex';
      itemActions.style.gap = '10px';
      
      const loadBtn = document.createElement('button');
      loadBtn.innerHTML = '<i class="fas fa-check"></i>';
      loadBtn.title = 'Cargar presupuesto';
      loadBtn.style.backgroundColor = 'var(--accent-color)';
      loadBtn.style.border = 'none';
      loadBtn.style.color = 'white';
      loadBtn.style.width = '36px';
      loadBtn.style.height = '36px';
      loadBtn.style.borderRadius = '8px';
      loadBtn.style.cursor = 'pointer';
      loadBtn.style.display = 'flex';
      loadBtn.style.alignItems = 'center';
      loadBtn.style.justifyContent = 'center';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.title = 'Eliminar presupuesto';
      deleteBtn.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
      deleteBtn.style.border = 'none';
      deleteBtn.style.color = 'white';
      deleteBtn.style.width = '36px';
      deleteBtn.style.height = '36px';
      deleteBtn.style.borderRadius = '8px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.display = 'flex';
      deleteBtn.style.alignItems = 'center';
      deleteBtn.style.justifyContent = 'center';
      
      loadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const loadResult = this.budgetExporter.loadPresupuesto(presupuesto.id);
        
        if (loadResult.success) {
          this.notificationManager.success(loadResult.message);
          document.body.removeChild(modal);
          
          // Actualizar la calculadora con los componentes cargados
          this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
          this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
          
          // Actualizar interfaz
          this.updateUI();
        } else {
          this.notificationManager.error(loadResult.message);
        }
      });
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Estás seguro de que deseas eliminar el presupuesto "${presupuesto.name}"?`)) {
          const deleteResult = this.budgetExporter.deletePresupuesto(presupuesto.id);
          
          if (deleteResult.success) {
            this.notificationManager.success(deleteResult.message);
            item.remove();
            
            // Si no quedan presupuestos, cerrar el modal
            if (presupuestosList.children.length === 0) {
              document.body.removeChild(modal);
            }
          } else {
            this.notificationManager.error(deleteResult.message);
          }
        }
      });
      
      // Cargar presupuesto al hacer clic en el item
      item.addEventListener('click', () => {
        const loadResult = this.budgetExporter.loadPresupuesto(presupuesto.id);
        
        if (loadResult.success) {
          this.notificationManager.success(loadResult.message);
          document.body.removeChild(modal);
          
          // Actualizar la calculadora con los componentes cargados
          this.budgetCalculator = new BudgetCalculator(this.componentManager.getComponents());
          this.budgetCalculator.setIgvIncluded(document.getElementById("igvIncluded").checked);
          
          // Actualizar interfaz
          this.updateUI();
        } else {
          this.notificationManager.error(loadResult.message);
        }
      });
      
      itemActions.appendChild(loadBtn);
      itemActions.appendChild(deleteBtn);
      
      item.appendChild(itemInfo);
      item.appendChild(itemActions);
      
      presupuestosList.appendChild(item);
    });
    
    // Botón para cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.padding = '10px 15px';
    closeButton.style.borderRadius = '8px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.width = '100%';
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Ensamblar el modal
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(presupuestosList);
    modalContent.appendChild(closeButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
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
  
  createBudgetChart() {
    // Crear contenedor para el gráfico
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.marginTop = '30px';
    chartContainer.style.backgroundColor = 'rgba(50, 50, 50, 0.4)';
    chartContainer.style.borderRadius = '12px';
    chartContainer.style.padding = '20px';
    chartContainer.style.height = '300px';
    
    // Título del gráfico
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = 'Distribución del Presupuesto';
    chartTitle.style.marginTop = '0';
    chartTitle.style.marginBottom = '20px';
    chartTitle.style.color = 'var(--text-color)';
    
    // Canvas para el gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'budgetChart';
    canvas.style.width = '100%';
    canvas.style.height = '220px';
    
    chartContainer.appendChild(chartTitle);
    chartContainer.appendChild(canvas);
    
    const rightSection = document.querySelector(".right-section");
    if (rightSection) {
      rightSection.appendChild(chartContainer);
    }
    
    // Renderizar gráfico inicial
    this.renderBudgetChart();
  }
  
  renderBudgetChart() {
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;
    
    // Obtener la distribución del presupuesto
    const distribution = this.budgetCalculator.getCategoryDistribution();
    
    if (distribution.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Poppins, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Agrega componentes para ver la distribución', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Preparar datos para el gráfico
    const categoryLabels = distribution.map(item => item.category);
    const categoryValues = distribution.map(item => item.amount);
    
    // Asignar colores a las categorías
    const backgroundColors = [
      'rgba(138, 67, 255, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 205, 86, 0.7)',
      'rgba(201, 203, 207, 0.7)',
      'rgba(255, 99, 71, 0.7)'
    ];
    
    // Crear o actualizar el gráfico
    if (window.budgetPieChart) {
      window.budgetPieChart.data.labels = categoryLabels;
      window.budgetPieChart.data.datasets[0].data = categoryValues;
      window.budgetPieChart.update();
    } else {
      // Cargar Chart.js dinámicamente
      if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js';
        script.onload = () => {
          this.createPieChart(canvas, categoryLabels, categoryValues, backgroundColors);
        };
        document.head.appendChild(script);
      } else {
        this.createPieChart(canvas, categoryLabels, categoryValues, backgroundColors);
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
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Poppins, sans-serif',
                size: 12
              },
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(20, 20, 20, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            bodyFont: {
              family: 'Poppins, sans-serif'
            },
            titleFont: {
              family: 'Poppins, sans-serif',
              weight: 'bold'
            },
            displayColors: true,
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `S/ ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    });
  }
}

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("Inicializando aplicación mejorada...");
  
  // Crear instancia de la aplicación
  window.app = new PCBudgetBuilder();
  
  console.log("Aplicación mejorada inicializada correctamente");
});