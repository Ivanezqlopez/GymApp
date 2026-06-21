// ============================================================================
//  app.js — Lógica de ejercicios-en-casa
//  Sin dependencias. Funciona con file:// (sin fetch, sin módulos).
// ============================================================================
(function () {
  "use strict";

  var R = window.RUTINA;
  if (!R) { alert("No se cargó rutina.js"); return; }

  // ---------- Atajos DOM ----------
  function $(id) { return document.getElementById(id); }
  function show(el) { el.classList.remove("oculto"); }
  function hide(el) { el.classList.add("oculto"); }

  var DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

  // ==========================================================================
  //  ESTADO + PERSISTENCIA (localStorage)
  // ==========================================================================
  var CLAVE = "eec_state";
  var estado = cargarEstado();
  // Fecha de inicio: se fija la primera vez y no se toca más. La semana se cuenta sola.
  if (!estado.inicio) { estado.inicio = claveHoy(); guardarEstado(); }

  function cargarEstado() {
    var def = { inicio: "", tema: "oscuro", silenciado: false, completados: {} };
    try {
      var raw = localStorage.getItem(CLAVE);
      if (!raw) return def;
      var s = JSON.parse(raw);
      return {
        inicio: s.inicio || "",
        tema: s.tema === "claro" ? "claro" : "oscuro",
        silenciado: !!s.silenciado,
        completados: s.completados || {}
      };
    } catch (e) { return def; }
  }
  function guardarEstado() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
  }

  function claveHoy() {
    return fechaClave(new Date());
  }
  function fechaClave(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dd;
  }

  // Semana de progresión, calculada por tiempo real desde la fecha de inicio.
  // No se puede saltear: avanza sola cada 7 días.
  function semanaProgresion() {
    if (!estado.inicio) return 1;
    var inicio = new Date(estado.inicio + "T00:00:00");
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var dias = Math.floor((hoy - inicio) / 86400000);
    if (dias < 0) dias = 0;
    return Math.floor(dias / 7) + 1;
  }

  function notaProgresion(semana) {
    if (semana <= 2) {
      return "Semana " + semana + ": priorizá la técnica, que no duela. La forma primero.";
    }
    return "Semana " + semana + ": si venís cómodo, sumá 2 reps por ejercicio o 3-5 min de marcha. " +
           "Es una sugerencia, no cambies las reps de golpe.";
  }

  // ==========================================================================
  //  AUDIO (Web Audio API — beeps, sin archivos)
  // ==========================================================================
  var actx = null;
  function asegurarAudio() {
    if (estado.silenciado) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
    } catch (e) { actx = null; }
  }
  function beep(freq, ms) {
    if (estado.silenciado || !actx) return;
    try {
      var osc = actx.createOscillator();
      var g = actx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.35, actx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + ms / 1000);
      osc.connect(g); g.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + ms / 1000 + 0.02);
    } catch (e) {}
  }
  function beepCuenta() { beep(660, 150); }   // últimos 3 segundos
  function beepFin()    { beep(880, 450); }   // fin de un timer

  function refrescarBotonesSilencio() {
    var icon = estado.silenciado ? "🔇" : "🔊";
    $("btn-silencio").textContent = icon;
    $("btn-silencio-2").textContent = icon;
  }

  // ==========================================================================
  //  AGENDA DEL DÍA
  // ==========================================================================
  function tipoDeHoy() {
    var dia = new Date().getDay();          // 0..6
    var t = R.agenda[dia];
    return t || null;                       // "fuerza" | "cardio" | null(descanso)
  }

  function descripcionSesion(tipoSesion) {
    var s = R.sesiones[tipoSesion];
    return s ? s.titulo : "";
  }

  // ==========================================================================
  //  CONSTRUCCIÓN DE LA SECUENCIA (núcleo)
  //  Devuelve un array plano de "pasos" ordenados.
  // ==========================================================================
  function pasoDeEjercicio(ej, etiqueta) {
    return {
      etiqueta: etiqueta,
      nombre: ej.nombre,
      modo: ej.tipo === "tiempo" ? "tiempo" : "reps",
      objetivo: ej.objetivo || "",
      segundos: ej.segundos || 0,
      nota: ej.nota || "",
      video: ej.video || "",
      proximo: ""
    };
  }

  // Extrae el ID de un link de YouTube (o del propio ID). Devuelve "" si no hay.
  function videoId(v) {
    if (!v) return "";
    v = String(v).trim();
    if (!v) return "";
    var m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,15})/);
    if (m) return m[1];
    if (/^[\w-]{6,15}$/.test(v)) return v; // vino solo el ID
    return "";
  }
  // URL para incrustar (iframe), o null si no hay video.
  function videoEmbed(v) {
    var id = videoId(v);
    return id ? "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1" : null;
  }
  // URL para abrir en YouTube en una pestaña nueva.
  function videoWatch(v) {
    var id = videoId(v);
    return id ? "https://www.youtube.com/watch?v=" + id : null;
  }

  // Caja de video: miniatura + botón de play (carga el iframe al tocar) y enlace a YouTube.
  function crearFacadeVideo(id, nombre) {
    var wrap = document.createElement("div");
    wrap.className = "yt-facade";
    wrap.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')";

    var play = document.createElement("button");
    play.className = "yt-play";
    play.type = "button";
    play.setAttribute("aria-label", "Reproducir " + nombre);
    play.textContent = "▶";
    play.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube.com/embed/" + id +
              "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = "Demostración: " + nombre;
      f.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
      f.setAttribute("allowfullscreen", "");
      wrap.classList.add("activo");
      wrap.style.backgroundImage = "none";
      wrap.innerHTML = "";
      wrap.appendChild(f);
    });
    wrap.appendChild(play);

    var ext = document.createElement("a");
    ext.className = "yt-ext";
    ext.href = "https://www.youtube.com/watch?v=" + id;
    ext.target = "_blank";
    ext.rel = "noopener";
    ext.textContent = "YouTube ↗";
    wrap.appendChild(ext);

    return wrap;
  }
  function pasoDescanso(seg, proximo) {
    return {
      etiqueta: "Descanso",
      nombre: "Descanso",
      modo: "descanso",
      objetivo: "",
      segundos: seg,
      nota: "",
      proximo: proximo || ""
    };
  }

  function construirSecuencia(tipoSesion) {
    var sesion = R.sesiones[tipoSesion];
    var pasos = [];

    // 1) Calentamiento (siempre primero)
    (R.calentamiento || []).forEach(function (ej) {
      pasos.push(pasoDeEjercicio(ej, "Calentamiento"));
    });

    // 2) Bloque del día
    if (sesion.circuito) {
      var c = sesion.circuito;
      var rondas = c.rondas || 1;
      var descanso = c.descanso || R.descansoFuerza || 70;
      for (var r = 1; r <= rondas; r++) {
        var etq = "Ronda " + r + " de " + rondas;
        for (var i = 0; i < c.ejercicios.length; i++) {
          pasos.push(pasoDeEjercicio(c.ejercicios[i], etq));
          // descanso entre ejercicios, salvo después del último de la última ronda
          var esUltimoDeTodo = (r === rondas && i === c.ejercicios.length - 1);
          if (!esUltimoDeTodo) {
            var prox = (i < c.ejercicios.length - 1)
              ? c.ejercicios[i + 1].nombre
              : c.ejercicios[0].nombre; // arranca la próxima ronda
            pasos.push(pasoDescanso(descanso, prox));
          }
        }
      }
    } else if (sesion.ejercicios) {
      sesion.ejercicios.forEach(function (ej) {
        pasos.push(pasoDeEjercicio(ej, sesion.titulo));
      });
    }

    // 3) Cierre (siempre al final)
    (sesion.cierre || []).forEach(function (ej) {
      pasos.push(pasoDeEjercicio(ej, "Cierre"));
    });

    // Completar "proximo" para todos los pasos no-descanso
    for (var k = 0; k < pasos.length; k++) {
      if (pasos[k].modo !== "descanso") {
        pasos[k].proximo = (k + 1 < pasos.length) ? pasos[k + 1].nombre : "";
      }
    }
    return pasos;
  }

  // ==========================================================================
  //  PANTALLA DE INICIO
  // ==========================================================================
  var sesionElegida = null; // en descanso, la que el usuario elija a mano

  function formatoMeta(ej) {
    if (ej.tipo === "tiempo") return fmtTiempo(ej.segundos);
    return ej.objetivo || "";
  }

  function renderInicio() {
    document.documentElement.setAttribute("data-tema", estado.tema);
    refrescarBotonesSilencio();
    var semana = semanaProgresion();
    $("badge-semana").textContent = "Semana " + semana;
    $("nota-progresion").textContent = notaProgresion(semana);

    var hoy = new Date();
    $("saludo-dia").textContent = "Hoy es " + DIAS[hoy.getDay()];

    var tipoHoy = tipoDeHoy();
    var bloqueDesc = $("bloque-descanso");
    var sesionParaMostrar;

    if (tipoHoy) {
      // Día con sesión asignada
      sesionElegida = tipoHoy;
      sesionParaMostrar = tipoHoy;
      hide(bloqueDesc);
      $("tipo-sesion").textContent = descripcionSesion(tipoHoy);
    } else {
      // Día de descanso
      $("tipo-sesion").textContent = "Descanso";
      $("msg-descanso").textContent = "Hoy toca descanso. Recuperar también es entrenar. 💤";
      show(bloqueDesc);
      sesionParaMostrar = sesionElegida; // null hasta que elija
      marcarSelector();
    }

    renderListaEjercicios(sesionParaMostrar);
    actualizarBotonEmpezar();
    renderEstadoHoy();
  }

  function marcarSelector() {
    var botones = document.querySelectorAll(".sel-btn");
    for (var i = 0; i < botones.length; i++) {
      botones[i].classList.toggle("activo", botones[i].dataset.sesion === sesionElegida);
    }
  }

  function renderListaEjercicios(tipoSesion) {
    var cont = $("lista-ejercicios");
    var detalle = $("detalle-ejercicios");
    cont.innerHTML = "";

    if (!tipoSesion) {
      // descanso sin elección: ocultamos el desplegable entero
      hide(detalle);
      return;
    }
    show(detalle);
    detalle.open = false; // arranca colapsado cada vez que cambia la sesión

    var sesion = R.sesiones[tipoSesion];

    agregarGrupo(cont, "Calentamiento", R.calentamiento);

    if (sesion.circuito) {
      var c = sesion.circuito;
      agregarGrupo(cont, c.rondas + " rondas · descanso " + c.descanso + "s", c.ejercicios);
    } else if (sesion.ejercicios) {
      agregarGrupo(cont, sesion.titulo, sesion.ejercicios);
    }

    if (sesion.cierre && sesion.cierre.length) {
      agregarGrupo(cont, "Cierre", sesion.cierre);
    }
  }

  function agregarGrupo(cont, titulo, ejercicios) {
    var h = document.createElement("p");
    h.className = "grupo-titulo";
    h.textContent = titulo;
    cont.appendChild(h);

    ejercicios.forEach(function (ej) {
      var item = document.createElement("div");
      item.className = "ej-item";

      var izq = document.createElement("div");
      var nom = document.createElement("span");
      nom.className = "ej-nombre";
      nom.textContent = ej.nombre;
      izq.appendChild(nom);
      if (ej.nota) {
        var nota = document.createElement("span");
        nota.className = "ej-nota";
        nota.textContent = ej.nota;
        izq.appendChild(nota);
      }

      var der = document.createElement("div");
      der.className = "ej-der";

      var meta = document.createElement("span");
      meta.className = "ej-meta";
      meta.textContent = formatoMeta(ej);
      der.appendChild(meta);

      var watch = videoWatch(ej.video);
      if (watch) {
        var link = document.createElement("a");
        link.className = "ej-video-link";
        link.href = watch;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "▶ video";
        der.appendChild(link);
      }

      item.appendChild(izq);
      item.appendChild(der);
      cont.appendChild(item);
    });
  }

  function actualizarBotonEmpezar() {
    var btn = $("btn-empezar");
    if (sesionElegida) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.textContent = "Empezar";
    } else {
      btn.disabled = true;
      btn.style.opacity = ".4";
      btn.textContent = "Elegí una sesión arriba";
    }
  }

  function renderEstadoHoy() {
    var el = $("estado-hoy");
    el.textContent = estado.completados[claveHoy()] ? "✓ Ya completaste una sesión hoy" : "";
  }

  // ==========================================================================
  //  MOTOR DE TIMER
  // ==========================================================================
  var seq = [];        // secuencia de pasos
  var idx = 0;         // paso actual
  var restante = 0;    // segundos restantes (pasos de tiempo/descanso)
  var tick = null;     // setInterval
  var pausado = false;

  function iniciarSesion(tipoSesion) {
    if (!tipoSesion) return;
    asegurarAudio();
    seq = construirSecuencia(tipoSesion);
    idx = 0;
    mostrarVista("timer");
    renderProgreso();
    cargarPaso();
  }

  function mostrarVista(cual) {
    hide($("inicio")); hide($("timer")); hide($("fin"));
    show($(cual));
  }

  function renderProgreso() {
    var cont = $("timer-progreso");
    cont.innerHTML = "";
    for (var i = 0; i < seq.length; i++) {
      if (seq[i].modo === "descanso") continue; // los descansos no cuentan como puntos
      var p = document.createElement("span");
      p.className = "punto";
      if (i < idx) p.classList.add("hecho");
      else if (i === idx) p.classList.add("actual");
      cont.appendChild(p);
    }
  }

  function detenerTick() {
    if (tick) { clearInterval(tick); tick = null; }
  }

  function cargarPaso() {
    detenerTick();
    pausado = false;

    if (idx >= seq.length) { finalizar(); return; }
    var paso = seq[idx];

    $("timer-etiqueta").textContent = paso.etiqueta;
    $("timer-modo").textContent = paso.modo === "descanso" ? "Descanso" : paso.etiqueta;
    $("timer-nombre").textContent = paso.nombre;
    renderProgreso();

    var objEl = $("timer-objetivo");
    var cuentaEl = $("timer-cuenta");
    var notaEl = $("timer-nota");
    var proxEl = $("timer-proximo");
    var mas10 = $("btn-mas10");
    var principal = $("btn-principal");

    // video (YouTube). Miniatura con clic-para-reproducir + enlace a YouTube de respaldo.
    // (El embebido directo falla con "Error 153" al abrir desde file://, por eso este modo.)
    var vid = $("timer-video");
    vid.innerHTML = "";
    var vidId = videoId(paso.video);
    if (vidId) {
      vid.appendChild(crearFacadeVideo(vidId, paso.nombre));
      show(vid);
      document.querySelector(".timer-main").classList.add("con-video");
    } else {
      hide(vid);
      document.querySelector(".timer-main").classList.remove("con-video");
    }

    // nota
    if (paso.nota) { notaEl.textContent = paso.nota; show(notaEl); }
    else hide(notaEl);

    // próximo
    if (paso.proximo) { proxEl.textContent = "Próximo: " + paso.proximo; show(proxEl); }
    else hide(proxEl);

    cuentaEl.classList.remove("alerta", "pausado");

    if (paso.modo === "reps") {
      // Ejercicio por reps: muestra objetivo, avanza con "Hecho"
      objEl.textContent = paso.objetivo;
      show(objEl); hide(cuentaEl); hide(mas10);
      principal.textContent = "Hecho";
      principal.classList.remove("is-pausar");
    } else {
      // Ejercicio/descanso por tiempo: cuenta regresiva
      hide(objEl); show(cuentaEl);
      restante = paso.segundos;
      pintarCuenta();
      if (paso.modo === "descanso") show(mas10); else hide(mas10);
      principal.textContent = "Pausar";
      principal.classList.add("is-pausar");
      arrancarCuenta();
    }
  }

  function pintarCuenta() {
    $("timer-cuenta").textContent = fmtTiempo(restante);
  }

  function arrancarCuenta() {
    detenerTick();
    tick = setInterval(function () {
      if (pausado) return;
      restante--;
      if (restante <= 3 && restante > 0) {
        beepCuenta();
        $("timer-cuenta").classList.add("alerta");
      }
      if (restante <= 0) {
        pintarCuenta();
        detenerTick();
        beepFin();
        avanzar();
        return;
      }
      pintarCuenta();
    }, 1000);
  }

  function togglePausa() {
    var paso = seq[idx];
    if (!paso || paso.modo === "reps") return;
    pausado = !pausado;
    var principal = $("btn-principal");
    var cuentaEl = $("timer-cuenta");
    principal.textContent = pausado ? "Reanudar" : "Pausar";
    cuentaEl.classList.toggle("pausado", pausado);
  }

  function accionPrincipal() {
    var paso = seq[idx];
    if (!paso) return;
    asegurarAudio();
    if (paso.modo === "reps") avanzar();   // "Hecho"
    else togglePausa();                     // "Pausar/Reanudar"
  }

  function avanzar()  { idx++; cargarPaso(); }
  function retroceder() {
    if (idx > 0) { idx--; cargarPaso(); }
  }
  function saltar() { avanzar(); }

  function mas10s() {
    var paso = seq[idx];
    if (paso && paso.modo === "descanso") {
      restante += 10;
      $("timer-cuenta").classList.remove("alerta");
      pintarCuenta();
    }
  }

  function pararVideo() {
    var vid = $("timer-video");
    if (vid) { vid.innerHTML = ""; hide(vid); }
  }

  function finalizar() {
    detenerTick();
    pararVideo();
    estado.completados[claveHoy()] = true;
    guardarEstado();
    var dia = DIAS[new Date().getDay()];
    $("fin-sub").textContent = "Buen trabajo. Sesión de " + dia + " registrada.";
    mostrarVista("fin");
  }

  function salirAlInicio() {
    detenerTick();
    pararVideo();
    mostrarVista("inicio");
    renderInicio();
  }

  // ==========================================================================
  //  UTIL
  // ==========================================================================
  function fmtTiempo(seg) {
    seg = Math.max(0, Math.round(seg));
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    if (m === 0) return s + "s";
    return m + ":" + String(s).padStart(2, "0");
  }

  // ==========================================================================
  //  EVENTOS
  // ==========================================================================
  function bindEventos() {
    // Tema
    $("btn-tema").addEventListener("click", function () {
      estado.tema = estado.tema === "oscuro" ? "claro" : "oscuro";
      document.documentElement.setAttribute("data-tema", estado.tema);
      guardarEstado();
    });

    // Silencio (los dos botones)
    function toggleSilencio() {
      estado.silenciado = !estado.silenciado;
      if (!estado.silenciado) asegurarAudio();
      refrescarBotonesSilencio();
      guardarEstado();
    }
    $("btn-silencio").addEventListener("click", toggleSilencio);
    $("btn-silencio-2").addEventListener("click", toggleSilencio);

    // Selector de sesión (en descanso)
    var sels = document.querySelectorAll(".sel-btn");
    for (var i = 0; i < sels.length; i++) {
      sels[i].addEventListener("click", function () {
        sesionElegida = this.dataset.sesion;
        marcarSelector();
        renderListaEjercicios(sesionElegida);
        actualizarBotonEmpezar();
      });
    }

    // Empezar
    $("btn-empezar").addEventListener("click", function () {
      if (sesionElegida) iniciarSesion(sesionElegida);
    });

    // Controles del timer
    $("btn-principal").addEventListener("click", accionPrincipal);
    $("btn-anterior").addEventListener("click", retroceder);
    $("btn-saltar").addEventListener("click", saltar);
    $("btn-mas10").addEventListener("click", mas10s);
    $("btn-salir").addEventListener("click", salirAlInicio);
    $("btn-fin-inicio").addEventListener("click", salirAlInicio);

    // Barra espaciadora = acción principal (en desktop)
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space" && !$("timer").classList.contains("oculto")) {
        e.preventDefault();
        accionPrincipal();
      }
    });
  }

  // ==========================================================================
  //  ARRANQUE
  // ==========================================================================
  bindEventos();
  renderInicio();
})();
