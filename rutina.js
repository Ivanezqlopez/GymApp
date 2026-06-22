// ============================================================================
//  rutina.js — Datos de la rutina (editable a mano)
// ----------------------------------------------------------------------------
//  Cómo editar:
//   - Cada ejercicio es un objeto. Dos tipos posibles:
//       { nombre: "...", tipo: "reps",   objetivo: "12-15" }   -> avanza con "Hecho"
//       { nombre: "...", tipo: "tiempo", segundos: 60 }        -> cuenta regresiva
//   - Campos opcionales en cualquier ejercicio:
//       porLado: true     -> aclara que las reps son por lado
//       nota: "texto"     -> aparece como nota gris debajo del ejercicio
//       video: "..."      -> VIDEO DE YOUTUBE (ver abajo). Se incrusta en el timer.
//   - "agenda" decide qué sesión toca cada día (0=Domingo ... 6=Sábado).
//     null = día de descanso.
//   - "descansoFuerza" es el descanso por defecto entre ejercicios del circuito.
//
//  >>> VIDEOS DE YOUTUBE <<<
//   Poné el link en el campo "video" de cada ejercicio. Vale cualquiera de estas formas:
//       video: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
//       video: "https://youtu.be/XXXXXXXXXXX"
//       video: "https://www.youtube.com/shorts/XXXXXXXXXXX"
//       video: "XXXXXXXXXXX"   (solo el ID, los 11 caracteres después de "v=")
//   Si lo dejás vacío ("") no aparece ningún video. Los videos necesitan internet.
// ============================================================================

window.RUTINA = {
  descansoFuerza: 70, // segundos de descanso en circuitos de fuerza (60-75 recomendado)

  // Calentamiento: SIEMPRE va primero, en cualquier sesión.
  calentamiento: [
    { nombre: "Marcha en el lugar",            tipo: "tiempo", segundos: 150, video: "https://www.youtube.com/watch?v=0e4251eQAE8&pp=ygUcbWFyY2hhIGVuIGVsIGx1Z2FyIGVqZXJjaWNpb9IHCQk_CwGHKiGM7w%3D%3D" },
    { nombre: "Movilidad de hombros",          tipo: "reps",   objetivo: "10 + 10", video: "https://www.youtube.com/watch?v=bFWrgXEJ3rQ" },
    { nombre: "Gato-vaca",                     tipo: "reps",   objetivo: "8-10", video: "https://www.youtube.com/watch?v=xj6AtZa9UXE" },
    { nombre: "Rotación de cadera en silla",   tipo: "reps",   objetivo: "10 por lado", porLado: true, video: "" },
    { nombre: "Respiración profunda",          tipo: "reps",   objetivo: "x10", video: "" }
  ],

  sesiones: {
    // ----- FUERZA (Lunes y Miércoles) -----
    fuerza: {
      titulo: "Fuerza",
      circuito: {
        rondas: 3,
        descanso: 70, // segundos entre ejercicios del circuito
        ejercicios: [
          { nombre: "Puente de glúteos",            tipo: "reps", objetivo: "12-15", video: "https://www.youtube.com/watch?v=uuiN9NRFMBo&list=PLs1bZHvTLFgg_NxxwaaS2xDuRn64d-boh&index=5" },
          { nombre: "Sentadilla asistida a silla",  tipo: "reps", objetivo: "10-12", video: "https://www.youtube.com/watch?v=I63oel2pBKM&list=PLs1bZHvTLFgg_NxxwaaS2xDuRn64d-boh" },
          { nombre: "Remo con banda/toalla",        tipo: "reps", objetivo: "12-15", video: "https://www.youtube.com/watch?v=zqRiAFTcjCc&list=PLs1bZHvTLFgg_NxxwaaS2xDuRn64d-boh&index=2",
            nota: "Sin banda: remo invertido con toalla en picaporte, o apretar escápulas 10-12" },
          { nombre: "Bird-Dog",                     tipo: "reps", objetivo: "8-10 por lado", porLado: true, video: "https://www.youtube.com/watch?v=hVrAuwakp84&list=PLs1bZHvTLFgg_NxxwaaS2xDuRn64d-boh&index=3" },
          { nombre: "Dead Bug",                     tipo: "reps", objetivo: "8-10 por lado", porLado: true, video: "https://www.youtube.com/watch?v=g_BYB0R-4Ws&list=PLs1bZHvTLFgg_NxxwaaS2xDuRn64d-boh&index=4" },
          { nombre: "Flexiones en pared o rodillas",tipo: "reps", objetivo: "8-12", video: "https://www.youtube.com/watch?v=_ifxX0U-xrM&pp=ygUSZmxleGlvbmVzIGVuIHBhcmVk" }
        ]
      },
      cierre: [
        { nombre: "Marcha con brazos (Zona 2)", tipo: "tiempo", segundos: 600, video: "https://www.youtube.com/watch?v=0e4251eQAE8&pp=ygUcbWFyY2hhIGVuIGVsIGx1Z2FyIGVqZXJjaWNpb9IHCQk_CwGHKiGM7w%3D%3D" }
      ]
    },

    // ----- CARDIO + MOVILIDAD (Viernes) -----
    cardio: {
      titulo: "Cardio + Movilidad",
      ejercicios: [
        { nombre: "Marcha / caminata (Zona 2)",     tipo: "tiempo", segundos: 1500, video: "https://www.youtube.com/watch?v=0e4251eQAE8&pp=ygUcbWFyY2hhIGVuIGVsIGx1Z2FyIGVqZXJjaWNpb9IHCQk_CwGHKiGM7w%3D%3D" },
        { nombre: "Gato-vaca",                      tipo: "reps",   objetivo: "x10", video: "https://www.youtube.com/watch?v=xj6AtZa9UXE" },
        { nombre: "Estiramiento de pecho",          tipo: "tiempo", segundos: 30, nota: "x2 series", video: "" },
        { nombre: "Rotación de tronco sentado",     tipo: "reps",   objetivo: "8 por lado", porLado: true, video: "" },
        { nombre: "Isquiotibiales sentado",         tipo: "tiempo", segundos: 30, nota: "por lado (repetir del otro lado)", video: "" },
        { nombre: "Respiración 4-7-8",              tipo: "reps",   objetivo: "x5", video: "" }
      ]
    }
  },

  // Qué sesión toca cada día. Clave = día (0=Dom ... 6=Sáb). null = descanso.
  agenda: {
    0: null,      // Domingo  -> descanso
    1: "fuerza",  // Lunes
    2: null,      // Martes   -> descanso
    3: "fuerza",  // Miércoles
    4: null,      // Jueves   -> descanso
    5: "cardio",  // Viernes
    6: null       // Sábado   -> descanso
  }
};
