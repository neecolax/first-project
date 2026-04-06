document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const filters = document.querySelectorAll('.filter-btn');
  const emptyState = document.getElementById('empty-state');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';

  // Save to local storage
  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Create Todo Element
  const createTodoElement = (todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="checkbox-wrapper">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Toggle completed state">
        <div class="custom-checkbox"></div>
      </div>
      <span class="todo-text">${escapeHTML(todo.text)}</span>
      <button class="delete-btn" aria-label="Delete task">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    `;

    // Event listeners for checklist and delete
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      li.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => deleteTodo(todo.id), 300); // Wait for animation
    });

    return li;
  };

  // Utility to prevent XSS
  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag])
    );
  };

  // Render list
  const renderTodos = () => {
    list.innerHTML = '';
    
    let filteredTodos = todos;
    if (currentFilter === 'active') {
      filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTodos = todos.filter(t => t.completed);
    }

    if (filteredTodos.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
      filteredTodos.forEach(todo => {
        list.appendChild(createTodoElement(todo));
      });
    }
  };

  // Add Todo
  const addTodo = (text) => {
    if (!text.trim()) return;
    
    const newTodo = {
      id: generateId(),
      text: text.trim(),
      completed: false
    };
    
    todos.unshift(newTodo); // Add to beginning
    saveTodos();
    renderTodos();
  };

  // Toggle Todo Completed State
  const toggleTodo = (id) => {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  };

  // Delete Todo
  const deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
  };

  // Event Listeners
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state class
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      // Update current filter and render
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Initial render
  renderTodos();
});
