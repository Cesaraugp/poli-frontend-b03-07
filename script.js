/**
 * Supermercado La Economía — lógica de página.
 * Requiere jQuery (cargado en index.html antes de este archivo).
 */

// Esperamos a que el DOM esté listo; jQuery encapsula el equivalente a DOMContentLoaded.
$(function () {
  // --- Formulario de contacto (validación básica y mensaje al usuario) ---
  const $formulario = $("#formulario-contacto");
  const $nombre = $("#nombre");
  const $correo = $("#correo");
  const $mensaje = $("#mensaje");

  // Interceptamos el envío para validar en el cliente sin recargar la página.
  $formulario.on("submit", function (event) {
    event.preventDefault();

    const nombreValor = $.trim($nombre.val());
    const correoValor = $.trim($correo.val());

    if (nombreValor === "" || correoValor === "") {
      $mensaje.text("Por favor, completa todos los campos.");
      $mensaje.css("color", "red");
      return;
    }

    $mensaje.text(
      "Formulario enviado correctamente. Gracias, " + nombreValor + ".",
    );
    $mensaje.css("color", "green");
    $formulario.trigger("reset");
  });

  // --- Estado del carrito: mapa id → { nombre, precioUnitario, cantidad } ---
  const carrito = {};

  // Referencias jQuery a nodos del carrito para no repetir selectores.
  const $overlay = $("#carrito-overlay");
  const $panel = $("#carrito-panel");
  const $btnAbrir = $("#btn-abrir-carrito");
  const $btnCerrar = $("#btn-cerrar-carrito");
  const $contador = $("#carrito-contador");
  const $listaLineas = $("#carrito-lineas");
  const $mensajeVacio = $("#carrito-mensaje-vacio");
  const $totalMonto = $("#carrito-total-monto");
  const $btnVaciar = $("#btn-vaciar-carrito");
  const $body = $("body");

  // Devuelve la suma de unidades en el carrito (para el badge del header).
  function totalUnidades() {
    return Object.keys(carrito).reduce(function (acc, id) {
      return acc + carrito[id].cantidad;
    }, 0);
  }

  // Suma precio * cantidad de todas las líneas.
  function totalPrecio() {
    return Object.keys(carrito).reduce(function (acc, id) {
      const linea = carrito[id];
      return acc + linea.precioUnitario * linea.cantidad;
    }, 0);
  }

  // Actualiza el número del badge y dispara una animación breve al incrementar.
  function actualizarBadge(antes) {
    const ahora = totalUnidades();
    $contador.text(ahora);
    if (ahora > antes) {
      $contador.addClass("btn-carrito-cabecera_badge--pulso");
      window.setTimeout(function () {
        $contador.removeClass("btn-carrito-cabecera_badge--pulso");
      }, 500);
    }
  }

  // Construye o vacía la lista HTML según el objeto `carrito`.
  function pintarLineas() {
    $listaLineas.empty();
    const ids = Object.keys(carrito);

    if (ids.length === 0) {
      $mensajeVacio.removeClass("carrito-vacio--oculto");
      $totalMonto.text("0.00");
      return;
    }

    $mensajeVacio.addClass("carrito-vacio--oculto");

    ids.forEach(function (id) {
      const linea = carrito[id];
      const subtotal = (linea.precioUnitario * linea.cantidad).toFixed(2);

      const $li = $("<li/>", {
        class: "carrito-linea",
        "data-producto-id": id,
      });

      $li.append(
        $("<span/>", { class: "carrito-linea_nombre", text: linea.nombre }),
        $("<span/>", {
          class: "carrito-linea_precio",
          text:
            "$" +
            linea.precioUnitario.toFixed(2) +
            " × " +
            linea.cantidad +
            " = $" +
            subtotal,
        }),
      );

      const $acciones = $("<div/>", { class: "carrito-linea_acciones" });
      // Botones − / + para ajustar cantidad sin volver al catálogo.
      $acciones.append(
        $("<button/>", {
          type: "button",
          class: "btn-carrito-menos",
          text: "−",
          "aria-label": "Reducir cantidad de " + linea.nombre,
        }),
        $("<span/>", { text: linea.cantidad, "aria-hidden": "true" }),
        $("<button/>", {
          type: "button",
          class: "btn-carrito-mas",
          text: "+",
          "aria-label": "Aumentar cantidad de " + linea.nombre,
        }),
        $("<button/>", {
          type: "button",
          class: "btn-quitar-linea",
          text: "Eliminar",
          "aria-label": "Eliminar " + linea.nombre + " del carrito",
        }),
      );

      $li.append($acciones);
      $listaLineas.append($li);
    });

    $totalMonto.text(totalPrecio().toFixed(2));
  }

  // Abre o cierra overlay + panel y sincroniza atributos de accesibilidad.
  function setCarritoAbierto(abierto) {
    $overlay.toggleClass("carrito-overlay--visible", abierto);
    $panel.toggleClass("carrito-panel--visible", abierto);
    $body.toggleClass("carrito-abierto", abierto);
    $btnAbrir.attr("aria-expanded", abierto ? "true" : "false");
    $panel.attr("aria-hidden", abierto ? "false" : "true");
    $overlay.attr("aria-hidden", abierto ? "false" : "true");
  }

  // Delegación en la lista: un solo listener para −, + y quitar.
  $listaLineas.on("click", ".btn-carrito-menos", function () {
    const id = $(this).closest(".carrito-linea").data("producto-id");
    if (!carrito[id]) return;
    carrito[id].cantidad -= 1;
    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
    }
    const antes = totalUnidades();
    pintarLineas();
    actualizarBadge(antes + 1);
  });

  $listaLineas.on("click", ".btn-carrito-mas", function () {
    const id = $(this).closest(".carrito-linea").data("producto-id");
    if (!carrito[id]) return;
    carrito[id].cantidad += 1;
    const antes = totalUnidades() - 1;
    pintarLineas();
    actualizarBadge(antes);
  });

  $listaLineas.on("click", ".btn-quitar-linea", function () {
    const id = $(this).closest(".carrito-linea").data("producto-id");
    delete carrito[id];
    const antes = totalUnidades();
    pintarLineas();
    actualizarBadge(antes + 1);
  });

  // Clic en "Agregar al carrito": lee data-* del botón y fusiona con la línea existente.
  $(".lista-productos").on("click", ".btn-agregar-carrito", function () {
    const $btn = $(this);
    const id = $btn.data("producto-id");
    const nombre = $btn.data("nombre");
    const precio = Number($btn.data("precio"));

    if (!id || !nombre || Number.isNaN(precio)) {
      return;
    }

    const unidadesAntes = totalUnidades();

    if (!carrito[id]) {
      carrito[id] = { nombre: nombre, precioUnitario: precio, cantidad: 0 };
    }
    carrito[id].cantidad += 1;

    pintarLineas();
    actualizarBadge(unidadesAntes);

    // Feedback visual momentáneo en la tarjeta (confirma el clic al usuario).
    $btn.addClass("btn-agregar-carrito--feedback");
    window.setTimeout(function () {
      $btn.removeClass("btn-agregar-carrito--feedback");
    }, 350);
  });

  $btnAbrir.on("click", function () {
    setCarritoAbierto(true);
  });

  $btnCerrar.on("click", function () {
    setCarritoAbierto(false);
  });

  // Clic en el fondo oscuro cierra el panel (patrón típico de drawer).
  $overlay.on("click", function () {
    setCarritoAbierto(false);
  });

  // Evita que un clic dentro del panel burbujee y cierre el carrito.
  $panel.on("click", function (event) {
    event.stopPropagation();
  });

  // Vacía el modelo y refresca la vista.
  $btnVaciar.on("click", function () {
    Object.keys(carrito).forEach(function (k) {
      delete carrito[k];
    });
    pintarLineas();
    // Forzamos refresco del badge sin animación de “aumento” (el total bajó a cero).
    $contador.text(totalUnidades());
  });

  // Tecla Escape cierra el carrito si está abierto (mejora de teclado).
  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && $panel.hasClass("carrito-panel--visible")) {
      setCarritoAbierto(false);
    }
  });

  // Estado inicial del listado y del contador.
  pintarLineas();
  $contador.text(totalUnidades());
});
