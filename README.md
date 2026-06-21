# ejercicios-en-casa

Web app local de rutina de ejercicios con timers encadenados (estilo pomodoro).
Sin backend, sin instalación, **funciona offline**.

## Cómo abrirla

Hacé **doble clic en `index.html`**. Se abre en el navegador. Listo.

Para usarla desde el teléfono: copiá la carpeta entera al teléfono y abrí `index.html`,
o serví la carpeta desde la PC (no hace falta nada de eso para que funcione).

Al abrir, detecta el día de la semana y te muestra qué toca hoy:

- **Lunes y Miércoles** → Fuerza
- **Viernes** → Cardio + Movilidad
- **Martes, Jueves, Sábado, Domingo** → Descanso (igual podés elegir una sesión a mano)

El calentamiento va siempre primero y el cierre siempre al final.

## Cómo funciona el modo timer

- **Ejercicios por reps**: muestra el objetivo (ej. "12-15") y avanzás con **Hecho**.
- **Ejercicios por tiempo**: cuenta regresiva automática; pasa solo al terminar.
- **Descansos**: automáticos entre ejercicios del circuito, con aviso "Próximo: …" y botón **+10s**.
- Controles: **Pausar/Reanudar**, **Anterior**, **Saltar**, **Silenciar**.
- Beep en los últimos 3 segundos y al terminar cada timer (Web Audio, sin archivos).
- En desktop, la **barra espaciadora** equivale al botón principal.

El progreso (día completado, semana de progresión, tema y silencio) se guarda en
`localStorage` del navegador.

## Cómo editar la rutina

Tocá **solo `rutina.js`**. No hace falta tocar nada más.

### Un ejercicio

Dos formas según el tipo:

```js
// Por repeticiones (avanza con "Hecho")
{ nombre: "Puente de glúteos", tipo: "reps", objetivo: "12-15" }

// Por tiempo (cuenta regresiva en segundos)
{ nombre: "Marcha en el lugar", tipo: "tiempo", segundos: 150 }
```

Campos opcionales:

```js
{ nombre: "Bird-Dog", tipo: "reps", objetivo: "8-10 por lado",
  porLado: true,                 // aclaración
  nota: "mantené la espalda neutra",    // texto gris debajo
  video: "https://youtu.be/XXXXXXXXXXX" }   // video de YouTube (ver abajo)
```

### Videos de YouTube

Cada ejercicio tiene un campo `video`. Pegá ahí el link y se incrusta solo en la
pantalla del timer (y aparece un "▶ video" en la lista de inicio). Vale cualquier formato:

```js
video: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
video: "https://youtu.be/XXXXXXXXXXX"
video: "https://www.youtube.com/shorts/XXXXXXXXXXX"
video: "XXXXXXXXXXX"   // solo el ID (los 11 caracteres después de v=)
```

Dejalo en `""` (vacío) si ese ejercicio no tiene video. **Los videos necesitan internet**;
el resto de la app funciona igual offline.

**Cómo se ve:** en el timer aparece la miniatura del video con un botón ▶. Al tocarlo
intenta reproducir ahí mismo, y siempre hay un enlace **YouTube ↗** que abre el video en
YouTube (en el teléfono, en la app a pantalla completa).

> Nota técnica: al abrir la app con doble clic (`file://`), el reproductor incrustado de
> YouTube a veces da "Error 153 / error de configuración". Es una restricción de YouTube
> con páginas locales, no un problema de la rutina. Por eso usamos la miniatura + enlace.
> Si querés reproducción incrustada 100% confiable, serví la carpeta por http (por ejemplo
> `python -m http.server` y entrá a `http://localhost:8000`).

### Cambiar rondas o descanso de un circuito

Dentro de `sesiones.fuerza.circuito`:

```js
circuito: {
  rondas: 3,        // cantidad de vueltas al circuito
  descanso: 70,     // segundos de descanso entre ejercicios
  ejercicios: [ ... ]
}
```

### Cambiar qué día toca qué

En `agenda` (0 = Domingo … 6 = Sábado). `null` = descanso:

```js
agenda: {
  0: null,        // Domingo
  1: "fuerza",    // Lunes
  2: null,        // Martes
  3: "fuerza",    // Miércoles
  4: null,        // Jueves
  5: "cardio",    // Viernes
  6: null         // Sábado
}
```

Los valores deben coincidir con las claves de `sesiones` (`"fuerza"`, `"cardio"`).

### Agregar una sesión nueva

Agregá una entrada en `sesiones` (con `circuito` **o** con `ejercicios`) y referenciala
desde `agenda`. Ejemplo de lista simple:

```js
sesiones: {
  movilidad: {
    titulo: "Movilidad suave",
    ejercicios: [
      { nombre: "Gato-vaca", tipo: "reps", objetivo: "x10" }
    ]
  }
}
```

## Progresión

- **Semana 1-2**: foco en la técnica.
- **Semana 3+**: sugiere sumar 2 reps o 3-5 min de marcha (solo como nota; no cambia las reps).
- El avance de semana es **manual**, con el botón "Avanzar semana de progresión".

## Archivos

| Archivo      | Qué es                                          |
|--------------|-------------------------------------------------|
| `index.html` | Página única                                    |
| `styles.css` | Estilos (mobile-first, tema claro/oscuro)       |
| `rutina.js`  | **La rutina** — editá esto                      |
| `app.js`     | Lógica (agenda, timers, audio, persistencia)    |
| `README.md`  | Este archivo                                    |
