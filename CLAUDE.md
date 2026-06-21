# ejercicios-en-casa

Web app local (sin backend, offline) de rutina de ejercicios con timers encadenados 
estilo pomodoro. Se abre con doble clic en index.html y funciona desde el teléfono.

## Reglas de negocio

- El día de la semana determina la sesión:
  - Lunes y Miércoles → Fuerza
  - Viernes → Cardio + Movilidad
  - Martes, Jueves, Sábado, Domingo → Descanso (permitir elegir una sesión manualmente)
- El calentamiento va SIEMPRE al inicio de cualquier sesión.
- El cierre va SIEMPRE al final.
- Progreso y semana de progresión se guardan en localStorage (single user, sin login).

## Estructura de la rutina

### Calentamiento fijo (6–8 min, todos los días)
- Marcha en el lugar — 2–3 min
- Movilidad de hombros — 10 + 10
- Gato-vaca — 8–10
- Rotación de cadera en silla — 10 por lado
- Respiración profunda — ×10

### Días de fuerza (Lun y Mié)
Circuito: 3 rondas, descanso 60–75 s entre ejercicios.
1. Puente de glúteos — 12–15
2. Sentadilla asistida a silla — 10–12
3. Remo con banda/toalla — 12–15
4. Bird-Dog — 8–10 por lado
5. Dead Bug — 8–10 por lado
6. Flexiones en pared o rodillas — 8–12

Cierre: marcha con brazos, 8–12 min en Zona 2.

Opciones sin bandas (para el remo):
- Remo invertido con toalla en picaporte, o
- Apretar escápulas 10–12 ×3

### Día de cardio + movilidad (Vie)
- Marcha o caminata por casa — 20–30 min en Zona 2
- Flujo de movilidad (10 min):
  - Gato-vaca — ×10
  - Estiramiento de pecho — 30 s ×2
  - Rotación de tronco sentado — 8 por lado
  - Isquiotibiales sentado — 30 s por lado
  - Respiración 4-7-8 — ×5

## Progresión (cada 3 semanas)
- Semana 1–2: foco en forma, que no duela. Nota visible: "priorizá técnica".
- Semana 3+: sumar 2 reps por ejercicio o 3–5 min de marcha (mostrar como sugerencia).
- Cuando esté cómodo: pasar de 3 a 4 días por semana.
- El avance de semana es manual (botón), no automático.

## Modelo de datos sugerido

Cada ejercicio: