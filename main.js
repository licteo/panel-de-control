const cards = document.querySelectorAll('.program-card');
const detailSection = document.getElementById('program-detail');
const mainContent = document.getElementById('main-content');
const backBtn = document.getElementById('back-btn');
const programTitle = document.getElementById('program-title');
const programNotes = document.getElementById('program-notes');
const notesToolbar = document.getElementById('notes-toolbar');

// Nuevo: contenedor para actividades
let programActivities = document.getElementById('program-activities');
if (!programActivities) {
  programActivities = document.createElement('div');
  programActivities.id = 'program-activities';
  programActivities.style.marginBottom = '1.5rem';
  detailSection.insertBefore(programActivities, programNotes);
}

let currentProgram = null;
let quill = null;

const defaultActividades = {
  espiritual: [
    {
      actividad: 'Cantar',
      tarea: 'Expresar la fe mediante música',
      acciones: [
        'Elegir canción espiritual',
        'Entonar con emoción',
        'Reflexionar sobre la letra'
      ]
    },
    {
      actividad: 'Orar',
      tarea: 'Conectarse con Dios mediante oración',
      acciones: [
        'Buscar un momento de silencio',
        'Expresar gratitud, petición, reflexión',
        'Finalizar en calma'
      ]
    },
    {
      actividad: 'Estudiar la Biblia',
      tarea: 'Comprender enseñanzas profundas',
      acciones: [
        'Leer un pasaje',
        'Analizar su significado',
        'Aplicarlo a la vida'
      ]
    }
  ],
  cuerpo: [
    {
      actividad: 'Hacer ejercicio físico',
      tarea: 'Fortalecer y cuidar el cuerpo',
      acciones: [
        'Calentar con estiramiento',
        'Realizar rutina específica',
        'Estirar para finalizar'
      ]
    }
  ],
  familia: [
    {
      actividad: 'Compartir tiempo de calidad',
      tarea: 'Fortalecer vínculos familiares',
      acciones: [
        'Conversar con interés',
        'Jugar o hacer algo juntos',
        'Escuchar activamente'
      ]
    }
  ],
  trabajo: [
    {
      actividad: 'Asistencia y organización transporte',
      tarea: 'Control de entradas y salidas',
      acciones: [
        'Observar y anotar tiempos',
        'Organizar parqueo',
        'Coordinar flujos'
      ]
    },
    {
      actividad: 'Contar monedas o pagos',
      tarea: 'Registrar ingresos',
      acciones: [
        'Separar por valor',
        'Registrar en libreta/app',
        'Guardar con seguridad'
      ]
    }
  ],
  estudio: [
    {
      actividad: 'Leer o aprender un tema',
      tarea: 'Adquirir conocimiento nuevo',
      acciones: [
        'Elegir tema',
        'Tomar apuntes',
        'Aplicar lo aprendido'
      ]
    }
  ],
  recreacion: [
    {
      actividad: 'Jugar videojuegos',
      tarea: 'Estimular mente y creatividad',
      acciones: [
        'Escoger juego adecuado',
        'Establecer duración',
        'Reflexionar después'
      ]
    },
    {
      actividad: 'Ver películas',
      tarea: 'Relajarse e inspirarse',
      acciones: [
        'Seleccionar contenido',
        'Disfrutar con atención',
        'Conversar si es en grupo'
      ]
    }
  ],
  casa: [
    {
      actividad: 'Limpiar y ordenar',
      tarea: 'Mantener espacios organizados',
      acciones: [
        'Escoger zona',
        'Recolectar y clasificar objetos',
        'Limpiar superficies'
      ]
    }
  ],
  social: [
    {
      actividad: 'Saludar y mostrar cortesía',
      tarea: 'Generar conexión con los demás',
      acciones: [
        'Saludar con sonrisa',
        'Usar frases como "gracias", "por favor"',
        'Contacto visual amable'
      ]
    }
  ]
};

const nombres = {
  espiritual: '🌟 Espiritual',
  cuerpo: '💪 Cuerpo',
  familia: '👨‍👩‍👧‍👦 Familia',
  trabajo: '🧰 Trabajo',
  estudio: '📚 Estudio',
  recreacion: '🎮 Recreación',
  casa: '🏠 Casa',
  social: '🤝 Social'
};

function getActividades(program) {
  const data = localStorage.getItem('actividades_' + program);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return defaultActividades[program] || [];
    }
  }
  return defaultActividades[program] || [];
}

function setActividades(program, acts) {
  localStorage.setItem('actividades_' + program, JSON.stringify(acts));
}

cards.forEach(card => {
  card.addEventListener('click', () => {
    currentProgram = card.dataset.programa;
    showProgramDetail(currentProgram);
  });
});

backBtn.addEventListener('click', () => {
  detailSection.classList.add('hidden');
  document.querySelector('.programs-grid').style.display = 'grid';
});

// Función para aplicar formato desde el toolbar
if (notesToolbar) {
  notesToolbar.addEventListener('click', function(e) {
    if (e.target.dataset.cmd) {
      document.execCommand(e.target.dataset.cmd, false, null);
    }
  });
}

// Guardar notas como HTML
const programNotesDiv = document.getElementById('program-notes');
if (programNotesDiv) {
  programNotesDiv.addEventListener('input', () => {
    if (currentProgram) {
      localStorage.setItem('notas_' + currentProgram, programNotesDiv.innerHTML);
    }
  });
}

function initQuill() {
  if (quill) return;
  quill = new Quill('#program-notes', {
    modules: {
      toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['clean']
      ]
    },
    theme: 'snow',
    placeholder: 'Escribe tus notas aquí...'
  });
  quill.on('text-change', function() {
    if (currentProgram) {
      localStorage.setItem('notas_' + currentProgram, quill.root.innerHTML);
    }
  });
}

function showProgramDetail(program) {
  programTitle.textContent = nombres[program];
  initQuill();
  if (quill) {
    const saved = localStorage.getItem('notas_' + program) || '';
    quill.root.innerHTML = saved;
  }
  renderActividades(program);
  detailSection.classList.remove('hidden');
  document.querySelector('.programs-grid').style.display = 'none';
}

function renderActividades(program) {
  programActivities.innerHTML = '';
  const acts = getActividades(program);
  acts.forEach((act, idx) => {
    const actDiv = document.createElement('div');
    actDiv.className = 'actividad-bloque';
    actDiv.innerHTML = `
      <strong>Actividad ${idx + 1}:</strong> <span class="actividad-nombre">${act.actividad}</span><br>
      <strong>Tarea:</strong> <span class="actividad-tarea">${act.tarea}</span><br>
      <strong>Acciones:</strong>
      <div class="actividad-acciones">${act.acciones ? act.acciones.join('') : ''}</div>
      <div class="actividad-botones">
        <button class="btn-editar" data-idx="${idx}">Editar</button>
        <button class="btn-eliminar" data-idx="${idx}">Eliminar</button>
      </div>
    `;
    programActivities.appendChild(actDiv);
  });
  // Botón para agregar nueva actividad
  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Agregar actividad';
  addBtn.className = 'btn-agregar';
  addBtn.onclick = () => mostrarFormularioActividad(program);
  programActivities.appendChild(addBtn);

  // Listeners para editar y eliminar
  programActivities.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = () => mostrarFormularioActividad(program, parseInt(btn.dataset.idx));
  });
  programActivities.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.onclick = () => eliminarActividad(program, parseInt(btn.dataset.idx));
  });
}

function mostrarFormularioActividad(program, idx = null) {
  const acts = getActividades(program);
  let act = { actividad: '', tarea: '', acciones: [''] };
  if (idx !== null) act = { ...acts[idx], acciones: [...acts[idx].acciones] };

  // Crear formulario con Quill para tarea y acciones
  const formDiv = document.createElement('div');
  formDiv.className = 'actividad-bloque';
  formDiv.innerHTML = `
    <form class="form-actividad">
      <label>Actividad:<br><input type="text" name="actividad" value="${act.actividad}" required></label><br>
      <label>Tarea:</label>
      <div id="quill-tarea" style="height: 60px;"></div><br>
      <label>Acciones:</label>
      <div id="quill-acciones" style="height: 90px;"></div><br>
      <button type="submit">${idx !== null ? 'Guardar cambios' : 'Agregar actividad'}</button>
      <button type="button" class="btn-cancelar">Cancelar</button>
    </form>
  `;
  programActivities.innerHTML = '';
  programActivities.appendChild(formDiv);

  // Inicializar Quill para tarea y acciones
  const quillTarea = new Quill('#quill-tarea', {
    theme: 'snow',
    modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], [{ 'indent': '-1'}, { 'indent': '+1' }], ['clean']] },
    placeholder: 'Describe la tarea...'
  });
  const quillAcciones = new Quill('#quill-acciones', {
    theme: 'snow',
    modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], [{ 'indent': '-1'}, { 'indent': '+1' }], ['clean']] },
    placeholder: 'Lista de acciones...'
  });
  // Cargar valores si existen
  if (act.tarea) quillTarea.root.innerHTML = act.tarea;
  if (act.acciones && act.acciones.length) quillAcciones.root.innerHTML = act.acciones.join('<br>');

  // Cancelar
  formDiv.querySelector('.btn-cancelar').onclick = () => renderActividades(program);

  // Guardar
  formDiv.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const nuevaActividad = {
      actividad: formDiv.querySelector('input[name="actividad"]').value,
      tarea: quillTarea.root.innerHTML,
      acciones: [quillAcciones.root.innerHTML]
    };
    if (idx !== null) {
      acts[idx] = nuevaActividad;
    } else {
      acts.push(nuevaActividad);
    }
    setActividades(program, acts);
    renderActividades(program);
  };
}

function eliminarActividad(program, idx) {
  if (confirm('¿Seguro que quieres eliminar esta actividad?')) {
    const acts = getActividades(program);
    acts.splice(idx, 1);
    setActividades(program, acts);
    renderActividades(program);
  }
}

// Registro del service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
} 