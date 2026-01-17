/**
 * Calculadora Refactorizada
 * 
 * Principales mejoras:
 * 1. Delegación de eventos (un solo listener para todos los botones).
 * 2. Validación de entrada en tiempo real (evita errores de sintaxis).
 * 3. Eliminación de eval() por seguridad.
 * 4. Uso de variables CSS para el tema.
 * 5. Código modular y documentado.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const display = document.getElementById('display');
  const buttonsContainer = document.querySelector('.buttons');
  const themeToggler = document.querySelector('.theme-toggler');
  const calculator = document.querySelector('.calculator');

  // Sonidos (Mantenemos la funcionalidad original)
  // Es buena práctica cargar los audios una sola vez
  const soundButton = new Audio("sound/button__sound.wav");
  const soundTheme = new Audio("sound/Long-Pop.wav");

  /**
   * Función para reproducir sonido sin solapamiento (reinicia si ya está sonando)
   * @param {HTMLAudioElement} audio - El elemento de audio a reproducir
   */
  const playSound = (audio) => {
    if (!audio) return;
    audio.currentTime = 0; // Reinicia el audio
    audio.play().catch(err => console.warn("Audio play failed:", err)); // Catch simple para evitar errores si no hay interacción previa
  };

  /**
   * Lógica del cambio de tema
   * Simplemente alternamos la clase 'light-mode' en el contenedor principal.
   * CSS se encarga de cambiar los colores gracias a las variables.
   */
  themeToggler.addEventListener('click', () => {
    playSound(soundTheme);
    // Alternamos la clase en el contenedor de la calculadora
    // (según nuestro CSS refactorizado, usamos .light-mode)
    calculator.classList.toggle('light-mode');
    themeToggler.classList.toggle('active');
  });

  /**
   * Manejador principal de eventos (Delegación)
   * Escuchamos clicks en el contenedor padre (.buttons) en lugar de en cada botón.
   */
  buttonsContainer.addEventListener('click', (e) => {
    // Verificamos si lo que se clickeó es un botón
    const btn = e.target.closest('button');
    if (!btn) return;

    playSound(soundButton);

    // Obtenemos la acción o el valor del botón desde los atributos data-
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (action) {
      handleAction(action);
    } else if (value) {
      handleInput(value);
    }
  });

  /**
   * Maneja las acciones especiales (Clear, Backspace, Calculate)
   * @param {string} action - La acción a realizar
   */
  const handleAction = (action) => {
    switch (action) {
      case 'clear':
        display.innerText = '';
        break;
      case 'backspace':
        display.innerText = display.innerText.slice(0, -1);
        break;
      case 'calculate':
        calculateResult();
        break;
    }
  };

  /**
   * Maneja la entrada de números y operadores
   * Incluye validación para evitar errores de sintaxis (ej. "++", "* /")
   * @param {string} value - El valor presionado (número u operador)
   */
  const handleInput = (value) => {
    const currentText = display.innerText;
    const lastChar = currentText.slice(-1);
    const isOperator = ['/', '*', '-', '+', '.'].includes(value);

    // Validación 1: Evitar múltiples operadores seguidos
    if (isOperator && ['/', '*', '-', '+', '.'].includes(lastChar)) {
      // Si el último ya es operador, lo reemplazamos por el nuevo
      // Esto evita tener que hacer .replaceAll() masivos después
      display.innerText = currentText.slice(0, -1) + value;
      return;
    }

    // Validación 2: Evitar empezar con un operador (excepto quizás menos?)
    // Por simplicidad, si está vacío y ponen operador (salvo . o -), lo ignoramos o ponemos 0
    if (currentText === '' && isOperator) {
        if (value === '.') {
            display.innerText = '0.';
            return;
        }
        // Permitimos números negativos al inicio si fuera necesario, 
        // pero para calculadora simple a veces es mejor bloquear * / +
        if (value !== '-') return; 
    }

    display.innerText += value;
  };

  /**
   * Realiza el cálculo de forma segura
   * Reemplaza el uso de eval() directo
   */
  const calculateResult = () => {
    let expression = display.innerText;
    
    if (!expression) return;

    // Sanitize: Aseguramos que solo haya números y operadores válidos
    // Esto previene inyección de código
    if (!/^[0-9+\-*/. ]+$/.test(expression)) {
      display.innerText = "Error";
      setTimeout(() => display.innerText = "", 1500);
      return;
    }

    try {
      // new Function es una alternativa más segura a eval() cuando se valida el input,
      // ya que se ejecuta en el scope global y no accede a variables locales.
      const result = new Function('return ' + expression)();
      
      // Manejo de división por cero o resultados infinitos
      if (!isFinite(result) || isNaN(result)) {
        throw new Error("Invalid Calculation");
      }

      display.innerText = result;
    } catch (error) {
      display.innerText = "Error";
      setTimeout(() => display.innerText = "", 1500);
    }
  };
});
