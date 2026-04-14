// Esperamos a que cargue todo el documento
document.addEventListener("DOMContentLoaded", function () {
    // Seleccionamos el formulario y los elementos necesarios
    const formulario = document.getElementById("formulario-contacto");
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const mensaje = document.getElementById("mensaje");
  
    // Agregamos funcionalidad al enviar el formulario
    formulario.addEventListener("submit", function (event) {
      event.preventDefault();
  
      // Quitamos espacios vacíos al inicio y final
      const nombreValor = nombre.value.trim();
      const correoValor = correo.value.trim();
  
      // Validación de campos obligatorios
      if (nombreValor === "" || correoValor === "") {
        mensaje.textContent = "Por favor, completa todos los campos.";
        mensaje.style.color = "red";
        return;
      }
  
      // Mensaje de éxito
      mensaje.textContent = "Formulario enviado correctamente. Gracias, " + nombreValor + ".";
      mensaje.style.color = "green";
  
      // Limpiamos el formulario
      formulario.reset();
    });
  });