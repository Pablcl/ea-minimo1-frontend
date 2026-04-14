Pregunta: Primero quiero asegurarme de que entiendo bien el enunciado antes de tocar código.
Prompt: A que se refiere el enunciado con una nueva colección de preguntas vinculada a un item explícamelo claro.
Incoherencias:Ninguna
Solución: Ninguna

Pregunta: Primero quiero asegurarme de que entiendo bien el enunciado antes de tocar código.
Prompt: Explicame sencillo a que se refiere con vector de objetos llamado "Respuestas".
Incoherencias: Ninguna
Solución: Ninguna

Pregunta: Quería que entender el backend bien y el objetivo del ejercicio en la parte de backend.
Prompt: Chat, dame una propuesta para la parte de 
Incoherencias: La primera propuesta metía tipados extra (ListConsultasQuery, FilterQuery) que no eran del estilo base.
Solución: Lo he cambiado a Request normal y patrón idéntico a usuarios/ofertas/solicitudes.

Pregunta: He dudado entre PATCH y PUT para añadir respuestas.
Prompt: Que diferencias y que implica uno u otro en este contexto ya que, PATCH vs PUT ?.
Incoherencias: No estaba claro si PATCH encajaba o era demasiado extra para el ejercicio.
Solución: Discutimos una solución al final de PATCH + $push porque el enunciado pide añadir al vector existente y es la forma más limpia.

Pregunta: Quiero generar el CSS y editar el HTML manteniendo el estilo del proyecto base.
Prompt: crea el componente con el CSS con el mismo estilo y el html
Incoherencias: la respuesta usaba version antigua de angular: for en vez de ngfor
Solución: lo he cambiado a version nueva de angular.


Pregunta: No hay autenticación, entonces el campo answeredBy era un problema.
Prompt: Oye chat, crees que debería utilizar un selector para seleccionar quien ha respondido a cada pregunta?
Incoherencias: Solución rápida del chat era usar primer usuario visible que era poco robusta.
Solución: Hice el selector explícito de usuario para responder (answeredBy) y así funciona sin inventar auth nueva.