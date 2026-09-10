const RUTA_ESQUEMAS="/03_UFV_INSTITUTO/99_datos_Rita/maestro_esquemas_certificacion.json";
let ESQUEMAS_CERTIFICACION=[],ESQUEMAS_CARGADOS=false;

const norm=t=>(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
const fechaHoy=()=>new Date().toISOString().slice(0,10);
const copia=o=>JSON.parse(JSON.stringify(o));

function idEsquema(prefijo,lista){
let n=0;
(lista||[]).forEach(x=>{
const v=parseInt(String(x.id||"").replace(/\D/g,""),10);
if(!isNaN(v)&&v>n)n=v;
});
return prefijo+"-"+String(n+1).padStart(3,"0");
}

async function cargarEsquemasCertificacion(){
const d=await leerDropbox(RUTA_ESQUEMAS);
if(!Array.isArray(d))throw Error("maestro_esquemas_certificacion.json no contiene un Maestro válido.");
ESQUEMAS_CERTIFICACION=d;
ESQUEMAS_CARGADOS=true;
return d;
}

async function guardarEsquemasCertificacion(){
if(!Array.isArray(ESQUEMAS_CERTIFICACION))throw Error("El Maestro de Esquemas no es válido.");
await escribirDropbox(RUTA_ESQUEMAS,ESQUEMAS_CERTIFICACION);
return true;
}

async function obtenerEsquemasCertificacion(){
if(!ESQUEMAS_CARGADOS)await cargarEsquemasCertificacion();
return ESQUEMAS_CERTIFICACION;
}

function buscarEsquemaCertificacion(codigo){
return ESQUEMAS_CERTIFICACION.find(x=>x.codigo===codigo)||null;
}

function nuevoEsquemaBase(){
let n=1;
while(ESQUEMAS_CERTIFICACION.some(x=>x.codigo==="ESC-"+String(n).padStart(3,"0")))n++;

return{
codigo:"ESC-"+String(n).padStart(3,"0"),
nombre:"",
version:"01",
estado:"BORRADOR",
fecha_alta:fechaHoy(),
perfil_codigo:"",
perfil_nombre:"",
objeto:"",
alcance:"",
requisitos_previos:[],
evaluacion:{metodos:[],criterios:[],evidencias:[],condiciones:[],reevaluacion:{aplica:false,criterios:[]}},
examenes:[],
evaluadores:{requisitos:[],criterios_competencia:[],incompatibilidades:[],supervision:[],seguimiento:[],conflictos_interes:[]},
decision_certificacion:{criterios:[],responsable:"",independencia_evaluacion:true,documentos_requeridos:[],resultado_posible:["CONCEDER","NO CONCEDER"]},
certificado:{vigencia_meses:0,contenido_minimo:[],condiciones_uso:[],marca_certificacion:"",numero_certificado_automatico:true},
vigilancia:{aplica:false,periodicidad_meses:0,metodos:[],criterios:[],evidencias:[]},
recertificacion:{aplica:false,periodicidad_meses:0,metodos:[],criterios:[],evidencias:[],examen_requerido:false},
suspension_retirada:{
criterios_suspension:[],
criterios_retirada:[],
reduccion_alcance:{aplica:false,criterios:[]},
restablecimiento:{aplica:true,criterios:[]}
},
reclamaciones_apelaciones:{reclamaciones:[],apelaciones:[],plazos:[],responsables:[]},
imparcialidad:{riesgos:[],conflictos_interes:[],medidas_control:[],revision_periodica:true},
riesgos:[],
seguridad_confidencialidad:{informacion_confidencial:[],controles_acceso:[],integridad_datos:[],seguridad_examenes:[],custodia_evidencias:[]},
control_cambios:{historial:[],revision_periodica_meses:12},
validacion:{estado:"PENDIENTE",fecha:"",responsable:"",observaciones:""}
};
}

async function altaEsquemaCertificacion(datos){
if(!ESQUEMAS_CARGADOS)await cargarEsquemasCertificacion();

const e=nuevoEsquemaBase();

if(!datos.nombre||!String(datos.nombre).trim())throw Error("Debe indicar la denominación del esquema.");
if(!datos.perfil_codigo)throw Error("Debe vincular el esquema a un perfil certificable.");

if(ESQUEMAS_CERTIFICACION.some(x=>norm(x.nombre)===norm(datos.nombre)))throw Error("Ya existe un esquema con esa denominación.");

e.nombre=String(datos.nombre).trim();
e.perfil_codigo=datos.perfil_codigo;
e.perfil_nombre=datos.perfil_nombre||"";
e.objeto=String(datos.objeto||"").trim();
e.alcance=String(datos.alcance||"").trim();

ESQUEMAS_CERTIFICACION.push(e);
await guardarEsquemasCertificacion();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria("A1","ALTA DE ESQUEMA DE CERTIFICACIÓN",e.codigo+" · "+e.nombre);
}

return e;
}

async function modificarEsquemaCertificacion(codigo,cambios){
if(!ESQUEMAS_CARGADOS)await cargarEsquemasCertificacion();

const e=buscarEsquemaCertificacion(codigo);
if(!e)throw Error("Esquema no encontrado.");

Object.keys(cambios||{}).forEach(k=>{
if(k!=="codigo")e[k]=copia(cambios[k]);
});

await guardarEsquemasCertificacion();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria("A1","MODIFICACIÓN DE ESQUEMA DE CERTIFICACIÓN",e.codigo+" · "+e.nombre);
}

return e;
}

async function añadirRequisitoPrevio(codigo,datos){
const e=buscarEsquemaCertificacion(codigo);if(!e)throw Error("Esquema no encontrado.");
e.requisitos_previos=e.requisitos_previos||[];

const x={
id:idEsquema("RPRE",e.requisitos_previos),
titulo:String(datos.titulo||"").trim(),
descripcion:String(datos.descripcion||"").trim(),
metodo_comprobacion:String(datos.metodo_comprobacion||"").trim()
};

if(!x.titulo)throw Error("Debe indicar el requisito previo.");
if(!x.metodo_comprobacion)throw Error("Debe indicar el método de comprobación.");

e.requisitos_previos.push(x);
await guardarEsquemasCertificacion();
return x;
}

async function añadirMetodoEvaluacion(codigo,datos){
const e=buscarEsquemaCertificacion(codigo);if(!e)throw Error("Esquema no encontrado.");
e.evaluacion.metodos=e.evaluacion.metodos||[];

const x={
id:idEsquema("EVA",e.evaluacion.metodos),
nombre:String(datos.nombre||"").trim(),
descripcion:String(datos.descripcion||"").trim(),
evidencias:Array.isArray(datos.evidencias)?datos.evidencias:[],
criterio:String(datos.criterio||"").trim()
};

if(!x.nombre)throw Error("Debe indicar el método de evaluación.");

e.evaluacion.metodos.push(x);
await guardarEsquemasCertificacion();
return x;
}

async function añadirExamenEsquema(codigo,datos){
const e=buscarEsquemaCertificacion(codigo);if(!e)throw Error("Esquema no encontrado.");
e.examenes=e.examenes||[];

const x={
id:idEsquema("EXE",e.examenes),
nombre:String(datos.nombre||"").trim(),
tipo:datos.tipo||"CONOCIMIENTOS",
descripcion:String(datos.descripcion||"").trim(),
duracion_minutos:Number(datos.duracion_minutos||0),
numero_preguntas:Number(datos.numero_preguntas||0),
puntuacion_maxima:Number(datos.puntuacion_maxima||100),
minimo_apto:Number(datos.minimo_apto||0),
rubrica:Array.isArray(datos.rubrica)?datos.rubrica:[],
seguridad:String(datos.seguridad||"").trim(),
metodo_comprobacion:String(datos.metodo_comprobacion||"").trim()
};

if(!x.nombre)throw Error("Debe indicar la prueba.");
if(!x.metodo_comprobacion)throw Error("Debe indicar el método de comprobación.");
if(!x.rubrica.length&&!x.minimo_apto)throw Error("Debe definir una métrica o rúbrica.");

e.examenes.push(x);
await guardarEsquemasCertificacion();
return x;
}

async function añadirRequisitoEvaluador(codigo,datos){
const e=buscarEsquemaCertificacion(codigo);if(!e)throw Error("Esquema no encontrado.");
e.evaluadores.requisitos=e.evaluadores.requisitos||[];

const x={
id:idEsquema("REV",e.evaluadores.requisitos),
titulo:String(datos.titulo||"").trim(),
descripcion:String(datos.descripcion||"").trim(),
metodo_comprobacion:String(datos.metodo_comprobacion||"").trim()
};

if(!x.titulo)throw Error("Debe indicar el requisito del evaluador.");
if(!x.metodo_comprobacion)throw Error("Debe indicar el método de comprobación.");

e.evaluadores.requisitos.push(x);
await guardarEsquemasCertificacion();
return x;
}

async function añadirRiesgoEsquema(codigo,datos){
const e=buscarEsquemaCertificacion(codigo);if(!e)throw Error("Esquema no encontrado.");
e.riesgos=e.riesgos||[];

const x={
id:idEsquema("RIE",e.riesgos),
riesgo:String(datos.riesgo||"").trim(),
causa:String(datos.causa||"").trim(),
consecuencia:String(datos.consecuencia||"").trim(),
probabilidad:Number(datos.probabilidad||1),
impacto:Number(datos.impacto||1),
nivel:0,
aceptable:true,
controles:String(datos.controles||"").trim(),
accion:String(datos.accion||"").trim(),
responsable:String(datos.responsable||"").trim(),
riesgo_residual:Number(datos.riesgo_residual||0)
};

x.nivel=x.probabilidad*x.impacto;
x.aceptable=x.nivel<=6;

if(!x.riesgo)throw Error("Debe identificar el riesgo.");

e.riesgos.push(x);
await guardarEsquemasCertificacion();
return x;
}

function validarEsquemaCertificacion(e){
const errores=[];

if(!e.nombre)errores.push("Falta denominación.");
if(!e.perfil_codigo)errores.push("No está vinculado a un perfil certificable.");
if(!e.objeto)errores.push("Falta definir el objeto.");
if(!e.alcance)errores.push("Falta definir el alcance.");

if(!(e.evaluacion?.metodos||[]).length)errores.push("No se han definido métodos de evaluación.");
if(!(e.decision_certificacion?.criterios||[]).length)errores.push("No se han definido criterios de decisión.");
if(!e.decision_certificacion?.responsable)errores.push("No se ha definido responsable de decisión.");
if(!Number(e.certificado?.vigencia_meses))errores.push("No se ha definido la vigencia de la certificación.");

(e.examenes||[]).forEach(x=>{
if(!x.metodo_comprobacion)errores.push("Existe una prueba sin método de comprobación.");
if(!(x.rubrica||[]).length&&!Number(x.minimo_apto))errores.push("Existe una prueba sin métrica o rúbrica.");
});

if((e.riesgos||[]).some(x=>x.aceptable===false&&!String(x.accion||"").trim())){
errores.push("Existen riesgos NO ACEPTABLES sin tratamiento.");
}

return{valido:errores.length===0,errores};
}

async function aprobarEsquemaCertificacion(codigo,responsable,observaciones=""){
const e=buscarEsquemaCertificacion(codigo);
if(!e)throw Error("Esquema no encontrado.");

const v=validarEsquemaCertificacion(e);

if(!v.valido){
throw Error("No puede aprobarse el esquema:\n\n"+v.errores.join("\n"));
}

e.estado="APROBADO";
e.validacion={
estado:"APROBADO",
fecha:fechaHoy(),
responsable:String(responsable||"").trim(),
observaciones:String(observaciones||"").trim()
};

await guardarEsquemasCertificacion();

if(typeof registrarAuditoria==="function"){
await registrarAuditoria("A1","APROBACIÓN DE ESQUEMA DE CERTIFICACIÓN",e.codigo+" · "+e.nombre);
}

return e;
}
