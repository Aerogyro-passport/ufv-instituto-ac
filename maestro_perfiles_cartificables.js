/* =========================================================
   RITA© · UFV INSTITUTO
   MAESTRO DE PERFILES CERTIFICABLES
   Fuente única:
   /03_UFV_INSTITUTO/99_datos_Rita/maestro_perfiles_certificables.json
   ========================================================= */

const RUTA_PERFILES="/03_UFV_INSTITUTO/99_datos_Rita/maestro_perfiles_certificables.json";

let PERFILES_CERTIFICABLES=[];
let PERFILES_CARGADOS=false;

/* =========================================================
   UTILIDADES
   ========================================================= */

function normalizarPerfil(txt){
return(txt||"")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim()
.toLowerCase();
}

function clonarPerfil(obj){
return JSON.parse(JSON.stringify(obj));
}

function fechaISO(){
return new Date().toISOString().slice(0,10);
}

function generarId(prefijo,lista){
let max=0;

(lista||[]).forEach(x=>{
const n=parseInt(String(x.id||"").replace(/\D/g,""),10);
if(!isNaN(n)&&n>max)max=n;
});

return prefijo+"-"+String(max+1).padStart(3,"0");
}

/* =========================================================
   DROPBOX
   ========================================================= */

async function cargarPerfilesCertificables(){
const datos=await leerDropbox(RUTA_PERFILES);

if(!Array.isArray(datos)){
throw new Error(
"maestro_perfiles_certificables.json no contiene un Maestro válido."
);
}

PERFILES_CERTIFICABLES=datos;
PERFILES_CARGADOS=true;

return PERFILES_CERTIFICABLES;
}

async function guardarPerfilesCertificables(){
if(!Array.isArray(PERFILES_CERTIFICABLES)){
throw new Error(
"El Maestro de Perfiles Certificables no es válido."
);
}

await escribirDropbox(
RUTA_PERFILES,
PERFILES_CERTIFICABLES
);

return true;
}

async function obtenerPerfilesCertificables(){
if(!PERFILES_CARGADOS){
await cargarPerfilesCertificables();
}

return PERFILES_CERTIFICABLES;
}

/* =========================================================
   PERFIL VACÍO
   ========================================================= */

function nuevoPerfilCertificable(){
let siguiente=1;

while(
PERFILES_CERTIFICABLES.some(
p=>p.codigo==="PER-"+String(siguiente).padStart(3,"0")
)
){
siguiente++;
}

return{
codigo:"PER-"+String(siguiente).padStart(3,"0"),
nombre:"",
version:"01",
estado:"BORRADOR",
fecha_alta:fechaISO(),

alcance:"",

funciones_tareas:[],

competencias:[],

requisitos:{
educacion:[],
formacion:[],
experiencia:[],
examenes:[],
otros:[]
},

riesgos:[],

certificacion_inicial:{
criterios:[],
metodos_evaluacion:[]
},

vigilancia:{
aplica:false,
criterios:[]
},

recertificacion:{
aplica:false,
periodicidad_meses:0,
criterios:[],
metodos_evaluacion:[]
},

suspension_retirada:{
criterios:[]
},

codigo_conducta:{
aplica:false,
contenido:""
},

validacion:{
estado:"PENDIENTE",
fecha:"",
responsable:"",
observaciones:""
}
};
}

/* =========================================================
   ALTA DE PERFIL
   ========================================================= */

async function altaPerfilCertificable(datos){
if(!PERFILES_CARGADOS){
await cargarPerfilesCertificables();
}

const perfil=nuevoPerfilCertificable();

if(datos.codigo){
perfil.codigo=String(datos.codigo).trim().toUpperCase();
}

if(!datos.nombre||!String(datos.nombre).trim()){
throw new Error(
"Debe indicar la denominación del perfil certificable."
);
}

if(
PERFILES_CERTIFICABLES.some(
p=>normalizarPerfil(p.nombre)===normalizarPerfil(datos.nombre)
)
){
throw new Error(
"Ya existe un perfil certificable con esa denominación."
);
}

if(
PERFILES_CERTIFICABLES.some(
p=>normalizarPerfil(p.codigo)===normalizarPerfil(perfil.codigo)
)
){
throw new Error(
"Ya existe un perfil certificable con ese código."
);
}

perfil.nombre=String(datos.nombre).trim();

if(datos.alcance!==undefined){
perfil.alcance=String(datos.alcance||"").trim();
}

PERFILES_CERTIFICABLES.push(perfil);

await guardarPerfilesCertificables();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria(
"A1",
"ALTA DE PERFIL CERTIFICABLE",
perfil.codigo+" · "+perfil.nombre
);
}

return perfil;
}

/* =========================================================
   EDICIÓN GENERAL
   ========================================================= */

async function modificarPerfilCertificable(codigo,cambios){
if(!PERFILES_CARGADOS){
await cargarPerfilesCertificables();
}

const perfil=PERFILES_CERTIFICABLES.find(
p=>p.codigo===codigo
);

if(!perfil){
throw new Error(
"No se encuentra el perfil certificable "+codigo+"."
);
}

Object.keys(cambios||{}).forEach(k=>{
if(k!=="codigo"){
perfil[k]=clonarPerfil(cambios[k]);
}
});

await guardarPerfilesCertificables();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria(
"A1",
"MODIFICACIÓN DE PERFIL CERTIFICABLE",
perfil.codigo+" · "+perfil.nombre
);
}

return perfil;
}

function buscarPerfilCertificable(codigo){
return PERFILES_CERTIFICABLES.find(
p=>p.codigo===codigo
)||null;
}

/* =========================================================
   FUNCIONES Y TAREAS
   ========================================================= */

async function añadirFuncionTarea(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.funciones_tareas=
perfil.funciones_tareas||[];

const item={
id:generarId(
"FT",
perfil.funciones_tareas
),
titulo:String(
datos.titulo||""
).trim(),
descripcion:String(
datos.descripcion||""
).trim()
};

if(!item.titulo){
throw new Error(
"Debe indicar la función o tarea."
);
}

perfil.funciones_tareas.push(item);

await guardarPerfilesCertificables();

return item;
}

/* =========================================================
   COMPETENCIAS
   ========================================================= */

async function añadirCompetencia(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.competencias=
perfil.competencias||[];

const item={
id:generarId(
"COM",
perfil.competencias
),
nombre:String(
datos.nombre||""
).trim(),
descripcion:String(
datos.descripcion||""
).trim(),
criterios:Array.isArray(datos.criterios)
?datos.criterios
:[]
};

if(!item.nombre){
throw new Error(
"Debe indicar la competencia."
);
}

perfil.competencias.push(item);

await guardarPerfilesCertificables();

return item;
}

/* =========================================================
   ESTRUCTURA GENERAL DE REQUISITOS
   ========================================================= */

function crearRequisito(tipo,datos,lista){
const prefijos={
educacion:"REQ-EDU",
formacion:"REQ-FOR",
experiencia:"REQ-EXP",
otros:"REQ-OTR"
};

return{
id:generarId(
prefijos[tipo]||"REQ",
lista
),

titulo:String(
datos.titulo||""
).trim(),

descripcion:String(
datos.descripcion||""
).trim(),

obligatorio:
datos.obligatorio!==false,

alternativa:String(
datos.alternativa||""
).trim(),

metodo_comprobacion:String(
datos.metodo_comprobacion||""
).trim(),

evidencias:Array.isArray(datos.evidencias)
?datos.evidencias
:[],

documentos:Array.isArray(datos.documentos)
?datos.documentos
:[],

riesgos:Array.isArray(datos.riesgos)
?datos.riesgos
:[]
};
}

async function añadirRequisito(codigoPerfil,tipo,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

const permitidos=[
"educacion",
"formacion",
"experiencia",
"otros"
];

if(!permitidos.includes(tipo)){
throw new Error(
"Tipo de requisito no válido."
);
}

const lista=
perfil.requisitos[tipo]||[];

const requisito=
crearRequisito(
tipo,
datos,
lista
);

if(!requisito.titulo){
throw new Error(
"Debe indicar el requisito."
);
}

if(!requisito.metodo_comprobacion){
throw new Error(
"Todo requisito debe tener MÉTODO DE COMPROBACIÓN."
);
}

lista.push(requisito);

perfil.requisitos[tipo]=lista;

await guardarPerfilesCertificables();

return requisito;
}

/* =========================================================
   FORMACIÓN
   ========================================================= */

async function añadirFormacion(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.requisitos.formacion=
perfil.requisitos.formacion||[];

const curso=
crearRequisito(
"formacion",
datos,
perfil.requisitos.formacion
);

curso.denominacion=
String(
datos.denominacion||
datos.titulo||
""
).trim();

curso.duracion_horas=
Number(
datos.duracion_horas||0
);

curso.caracteristicas=
String(
datos.caracteristicas||""
).trim();

curso.temario_texto=
String(
datos.temario_texto||""
).trim();

curso.temario_archivo=
datos.temario_archivo||null;

if(!curso.denominacion){
throw new Error(
"Debe indicar la denominación del curso."
);
}

if(!curso.metodo_comprobacion){
throw new Error(
"Debe indicar el método de comprobación de la formación."
);
}

perfil.requisitos.formacion.push(curso);

await guardarPerfilesCertificables();

return curso;
}

/* =========================================================
   EXPERIENCIA
   ========================================================= */

async function añadirExperiencia(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.requisitos.experiencia=
perfil.requisitos.experiencia||[];

const experiencia=
crearRequisito(
"experiencia",
datos,
perfil.requisitos.experiencia
);

experiencia.tipo=
datos.tipo||"LABORAL";

experiencia.duracion_meses=
Number(
datos.duracion_meses||0
);

experiencia.horas=
Number(
datos.horas||0
);

experiencia.tutelada=
!!datos.tutelada;

experiencia.requisitos_tutor=
String(
datos.requisitos_tutor||""
).trim();

experiencia.evidencias_tutela=
Array.isArray(
datos.evidencias_tutela
)
?datos.evidencias_tutela
:[];

if(!experiencia.metodo_comprobacion){
throw new Error(
"Debe indicar el método de comprobación de la experiencia."
);
}

perfil.requisitos.experiencia.push(
experiencia
);

await guardarPerfilesCertificables();

return experiencia;
}

/* =========================================================
   EXAMEN / PRUEBA
   ========================================================= */

async function añadirExamen(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.requisitos.examenes=
perfil.requisitos.examenes||[];

const examen={
id:generarId(
"EXA",
perfil.requisitos.examenes
),

nombre:String(
datos.nombre||""
).trim(),

descripcion:String(
datos.descripcion||""
).trim(),

metodo_comprobacion:String(
datos.metodo_comprobacion||""
).trim(),

tipo_prueba:
datos.tipo_prueba||
"CONOCIMIENTOS",

metrica:{
tipo:
datos.metrica?.tipo||
"PUNTUACIÓN",

maximo:Number(
datos.metrica?.maximo||100
),

minimo_apto:Number(
datos.metrica?.minimo_apto||0
)
},

rubrica:Array.isArray(datos.rubrica)
?datos.rubrica
:[],

criterio_resultado:
String(
datos.criterio_resultado||
"APTO / NO APTO"
),

evidencias:Array.isArray(datos.evidencias)
?datos.evidencias
:[],

documentos:Array.isArray(datos.documentos)
?datos.documentos
:[],

riesgos:Array.isArray(datos.riesgos)
?datos.riesgos
:[]
};

if(!examen.nombre){
throw new Error(
"Debe indicar la denominación de la prueba."
);
}

if(!examen.metodo_comprobacion){
throw new Error(
"Debe indicar el MÉTODO DE COMPROBACIÓN de la prueba."
);
}

if(
!examen.rubrica.length &&
!examen.metrica.minimo_apto
){
throw new Error(
"Debe definir la MÉTRICA o RÚBRICA DE EVALUACIÓN."
);
}

perfil.requisitos.examenes.push(
examen
);

await guardarPerfilesCertificables();

return examen;
}

/* =========================================================
   RIESGOS
   ========================================================= */

async function añadirRiesgoPerfil(codigoPerfil,datos){
const perfil=buscarPerfilCertificable(codigoPerfil);

if(!perfil){
throw new Error("Perfil no encontrado.");
}

perfil.riesgos=
perfil.riesgos||[];

const riesgo={
id:generarId(
"RIE",
perfil.riesgos
),

riesgo:String(
datos.riesgo||""
).trim(),

causa:String(
datos.causa||""
).trim(),

consecuencia:String(
datos.consecuencia||""
).trim(),

probabilidad:
Number(
datos.probabilidad||1
),

impacto:
Number(
datos.impacto||1
),

nivel:0,

aceptable:true,

controles:String(
datos.controles||""
).trim(),

accion:String(
datos.accion||""
).trim(),

responsable:String(
datos.responsable||""
).trim(),

riesgo_residual:
Number(
datos.riesgo_residual||0
)
};

riesgo.nivel=
riesgo.probabilidad*
riesgo.impacto;

riesgo.aceptable=
riesgo.nivel<=6;

if(!riesgo.riesgo){
throw new Error(
"Debe identificar el riesgo."
);
}

perfil.riesgos.push(riesgo);

await guardarPerfilesCertificables();

return riesgo;
}

/* =========================================================
   VALIDACIÓN
   ========================================================= */

function tieneRiesgosNoAceptables(perfil){
return(perfil.riesgos||[]).some(
r=>
r.aceptable===false &&
!String(r.accion||"").trim()
);
}

function validarPerfilCertificable(perfil){
const errores=[];

if(!perfil.nombre){
errores.push(
"Falta denominación."
);
}

if(!perfil.alcance){
errores.push(
"Falta definir el alcance."
);
}

if(
!(perfil.funciones_tareas||[]).length
){
errores.push(
"No se han definido funciones o tareas."
);
}

if(
!(perfil.competencias||[]).length
){
errores.push(
"No se han definido competencias."
);
}

const grupos=[
"educacion",
"formacion",
"experiencia",
"examenes",
"otros"
];

grupos.forEach(g=>{
(perfil.requisitos?.[g]||[])
.forEach(r=>{
if(!r.metodo_comprobacion){
errores.push(
"Existe un requisito de "+
g+
" sin método de comprobación."
);
}
});
});

(perfil.requisitos?.examenes||[])
.forEach(e=>{
if(
!(e.rubrica||[]).length &&
!Number(e.metrica?.minimo_apto)
){
errores.push(
"El examen "+
e.nombre+
" no tiene métrica o rúbrica."
);
}
});

if(
tieneRiesgosNoAceptables(perfil)
){
errores.push(
"Existen riesgos NO ACEPTABLES sin tratamiento definido."
);
}

return{
valido:errores.length===0,
errores
};
}

/* =========================================================
   APROBACIÓN
   ========================================================= */

async function aprobarPerfilCertificable(
codigo,
responsable,
observaciones=""
){
const perfil=
buscarPerfilCertificable(codigo);

if(!perfil){
throw new Error(
"Perfil no encontrado."
);
}

const validacion=
validarPerfilCertificable(perfil);

if(!validacion.valido){
throw new Error(
"No puede aprobarse el perfil:\n\n"+
validacion.errores.join("\n")
);
}

perfil.estado="APROBADO";

perfil.validacion={
estado:"APROBADO",
fecha:fechaISO(),
responsable:
String(
responsable||""
).trim(),
observaciones:
String(
observaciones||""
).trim()
};

await guardarPerfilesCertificables();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria(
"A1",
"APROBACIÓN DE PERFIL CERTIFICABLE",
perfil.codigo+" · "+perfil.nombre
);
}

return perfil;
}
