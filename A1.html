const RUTA_PERFILES="/03_UFV_INSTITUTO/99_datos_Rita/maestro_perfiles_certificables.json";
let PERFILES_CERTIFICABLES=[],PERFILES_CARGADOS=false;

const normalizarPerfil=t=>(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
const clonarPerfil=o=>JSON.parse(JSON.stringify(o));
const fechaISO=()=>new Date().toISOString().slice(0,10);

function generarId(prefijo,lista){
let max=0;
(lista||[]).forEach(x=>{const n=parseInt(String(x.id||"").replace(/\D/g,""),10);if(!isNaN(n)&&n>max)max=n});
return prefijo+"-"+String(max+1).padStart(3,"0");
}

async function cargarPerfilesCertificables(){
const d=await leerDropbox(RUTA_PERFILES);
if(!Array.isArray(d))throw Error("maestro_perfiles_certificables.json no contiene un Maestro válido.");
PERFILES_CERTIFICABLES=d;
PERFILES_CARGADOS=true;
return d;
}

async function guardarPerfilesCertificables(){
if(!Array.isArray(PERFILES_CERTIFICABLES))throw Error("El Maestro de Perfiles Certificables no es válido.");
await escribirDropbox(RUTA_PERFILES,PERFILES_CERTIFICABLES);
return true;
}

async function obtenerPerfilesCertificables(){
if(!PERFILES_CARGADOS)await cargarPerfilesCertificables();
return PERFILES_CERTIFICABLES;
}

function buscarPerfilCertificable(codigo){
return PERFILES_CERTIFICABLES.find(p=>p.codigo===codigo)||null;
}

function nuevoPerfilCertificable(){
let n=1;
while(PERFILES_CERTIFICABLES.some(p=>p.codigo==="PER-"+String(n).padStart(3,"0")))n++;
return{
codigo:"PER-"+String(n).padStart(3,"0"),nombre:"",version:"01",estado:"BORRADOR",fecha_alta:fechaISO(),alcance:"",
funciones_tareas:[],competencias:[],
requisitos:{educacion:[],formacion:[],experiencia:[],examenes:[],otros:[]},
riesgos:[],
certificacion_inicial:{criterios:[],metodos_evaluacion:[]},
vigilancia:{aplica:false,criterios:[]},
recertificacion:{aplica:false,periodicidad_meses:0,criterios:[],metodos_evaluacion:[]},
suspension_retirada:{criterios:[]},
codigo_conducta:{aplica:false,contenido:""},
validacion:{estado:"PENDIENTE",fecha:"",responsable:"",observaciones:""}
};
}

async function altaPerfilCertificable(datos){
if(!PERFILES_CARGADOS)await cargarPerfilesCertificables();
const p=nuevoPerfilCertificable();
if(datos.codigo)p.codigo=String(datos.codigo).trim().toUpperCase();
if(!datos.nombre||!String(datos.nombre).trim())throw Error("Debe indicar la denominación del perfil certificable.");
if(PERFILES_CERTIFICABLES.some(x=>normalizarPerfil(x.nombre)===normalizarPerfil(datos.nombre)))throw Error("Ya existe un perfil certificable con esa denominación.");
if(PERFILES_CERTIFICABLES.some(x=>normalizarPerfil(x.codigo)===normalizarPerfil(p.codigo)))throw Error("Ya existe un perfil certificable con ese código.");
p.nombre=String(datos.nombre).trim();
if(datos.alcance!==undefined)p.alcance=String(datos.alcance||"").trim();
PERFILES_CERTIFICABLES.push(p);
await guardarPerfilesCertificables();
if(typeof registrarAuditoria==="function")await registrarAuditoria("A1","ALTA DE PERFIL CERTIFICABLE",p.codigo+" · "+p.nombre);
return p;
}

async function modificarPerfilCertificable(codigo,cambios){
if(!PERFILES_CARGADOS)await cargarPerfilesCertificables();
const p=buscarPerfilCertificable(codigo);
if(!p)throw Error("Perfil no encontrado.");
Object.keys(cambios||{}).forEach(k=>{if(k!=="codigo")p[k]=clonarPerfil(cambios[k])});
await guardarPerfilesCertificables();
if(typeof registrarAuditoria==="function")await registrarAuditoria("A1","MODIFICACIÓN DE PERFIL CERTIFICABLE",p.codigo+" · "+p.nombre);
return p;
}

async function añadirFuncionTarea(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const x={id:generarId("FT",p.funciones_tareas),titulo:String(datos.titulo||"").trim(),descripcion:String(datos.descripcion||"").trim()};
if(!x.titulo)throw Error("Debe indicar la función o tarea.");
p.funciones_tareas.push(x);await guardarPerfilesCertificables();return x;
}

async function añadirCompetencia(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const x={id:generarId("COM",p.competencias),nombre:String(datos.nombre||"").trim(),descripcion:String(datos.descripcion||"").trim(),criterios:Array.isArray(datos.criterios)?datos.criterios:[]};
if(!x.nombre)throw Error("Debe indicar la competencia.");
p.competencias.push(x);await guardarPerfilesCertificables();return x;
}

function crearRequisito(tipo,datos,lista){
const pref={educacion:"REQ-EDU",formacion:"REQ-FOR",experiencia:"REQ-EXP",otros:"REQ-OTR"};
return{id:generarId(pref[tipo]||"REQ",lista),titulo:String(datos.titulo||"").trim(),descripcion:String(datos.descripcion||"").trim(),obligatorio:datos.obligatorio!==false,alternativa:String(datos.alternativa||"").trim(),metodo_comprobacion:String(datos.metodo_comprobacion||"").trim(),evidencias:Array.isArray(datos.evidencias)?datos.evidencias:[],documentos:Array.isArray(datos.documentos)?datos.documentos:[],riesgos:Array.isArray(datos.riesgos)?datos.riesgos:[]};
}

async function añadirRequisito(codigo,tipo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
if(!["educacion","formacion","experiencia","otros"].includes(tipo))throw Error("Tipo de requisito no válido.");
const lista=p.requisitos[tipo]||[],r=crearRequisito(tipo,datos,lista);
if(!r.titulo)throw Error("Debe indicar el requisito.");
if(!r.metodo_comprobacion)throw Error("Todo requisito debe tener MÉTODO DE COMPROBACIÓN.");
lista.push(r);p.requisitos[tipo]=lista;await guardarPerfilesCertificables();return r;
}

async function añadirFormacion(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const lista=p.requisitos.formacion||[],x=crearRequisito("formacion",datos,lista);
x.denominacion=String(datos.denominacion||datos.titulo||"").trim();
x.duracion_horas=Number(datos.duracion_horas||0);
x.caracteristicas=String(datos.caracteristicas||"").trim();
x.temario_texto=String(datos.temario_texto||"").trim();
x.temario_archivo=datos.temario_archivo||null;
if(!x.denominacion)throw Error("Debe indicar la denominación del curso.");
if(!x.metodo_comprobacion)throw Error("Debe indicar el método de comprobación de la formación.");
lista.push(x);p.requisitos.formacion=lista;await guardarPerfilesCertificables();return x;
}

async function añadirExperiencia(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const lista=p.requisitos.experiencia||[],x=crearRequisito("experiencia",datos,lista);
x.tipo=datos.tipo||"LABORAL";
x.duracion_meses=Number(datos.duracion_meses||0);
x.horas=Number(datos.horas||0);
x.tutelada=!!datos.tutelada;
x.requisitos_tutor=String(datos.requisitos_tutor||"").trim();
x.evidencias_tutela=Array.isArray(datos.evidencias_tutela)?datos.evidencias_tutela:[];
if(!x.metodo_comprobacion)throw Error("Debe indicar el método de comprobación de la experiencia.");
lista.push(x);p.requisitos.experiencia=lista;await guardarPerfilesCertificables();return x;
}

async function añadirExamen(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const lista=p.requisitos.examenes||[];
const x={
id:generarId("EXA",lista),nombre:String(datos.nombre||"").trim(),descripcion:String(datos.descripcion||"").trim(),
metodo_comprobacion:String(datos.metodo_comprobacion||"").trim(),tipo_prueba:datos.tipo_prueba||"CONOCIMIENTOS",
metrica:{tipo:datos.metrica?.tipo||"PUNTUACIÓN",maximo:Number(datos.metrica?.maximo||100),minimo_apto:Number(datos.metrica?.minimo_apto||0)},
rubrica:Array.isArray(datos.rubrica)?datos.rubrica:[],criterio_resultado:String(datos.criterio_resultado||"APTO / NO APTO"),
evidencias:Array.isArray(datos.evidencias)?datos.evidencias:[],documentos:Array.isArray(datos.documentos)?datos.documentos:[],riesgos:Array.isArray(datos.riesgos)?datos.riesgos:[]
};
if(!x.nombre)throw Error("Debe indicar la denominación de la prueba.");
if(!x.metodo_comprobacion)throw Error("Debe indicar el MÉTODO DE COMPROBACIÓN de la prueba.");
if(!x.rubrica.length&&!x.metrica.minimo_apto)throw Error("Debe definir la MÉTRICA o RÚBRICA DE EVALUACIÓN.");
lista.push(x);p.requisitos.examenes=lista;await guardarPerfilesCertificables();return x;
}

async function añadirRiesgoPerfil(codigo,datos){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const lista=p.riesgos||[];
const x={id:generarId("RIE",lista),riesgo:String(datos.riesgo||"").trim(),causa:String(datos.causa||"").trim(),consecuencia:String(datos.consecuencia||"").trim(),probabilidad:Number(datos.probabilidad||1),impacto:Number(datos.impacto||1),nivel:0,aceptable:true,controles:String(datos.controles||"").trim(),accion:String(datos.accion||"").trim(),responsable:String(datos.responsable||"").trim(),riesgo_residual:Number(datos.riesgo_residual||0)};
x.nivel=x.probabilidad*x.impacto;
x.aceptable=x.nivel<=6;
if(!x.riesgo)throw Error("Debe identificar el riesgo.");
lista.push(x);p.riesgos=lista;await guardarPerfilesCertificables();return x;
}

function tieneRiesgosNoAceptables(p){
return(p.riesgos||[]).some(r=>r.aceptable===false&&!String(r.accion||"").trim());
}

function validarPerfilCertificable(p){
const errores=[];
if(!p.nombre)errores.push("Falta denominación.");
if(!p.alcance)errores.push("Falta definir el alcance.");
if(!(p.funciones_tareas||[]).length)errores.push("No se han definido funciones o tareas.");
if(!(p.competencias||[]).length)errores.push("No se han definido competencias.");
["educacion","formacion","experiencia","examenes","otros"].forEach(g=>(p.requisitos?.[g]||[]).forEach(r=>{if(!r.metodo_comprobacion)errores.push("Existe un requisito de "+g+" sin método de comprobación.")}));
(p.requisitos?.examenes||[]).forEach(e=>{if(!(e.rubrica||[]).length&&!Number(e.metrica?.minimo_apto))errores.push("El examen "+e.nombre+" no tiene métrica o rúbrica.")});
if(tieneRiesgosNoAceptables(p))errores.push("Existen riesgos NO ACEPTABLES sin tratamiento definido.");
return{valido:errores.length===0,errores};
}

async function aprobarPerfilCertificable(codigo,responsable,observaciones=""){
const p=buscarPerfilCertificable(codigo);if(!p)throw Error("Perfil no encontrado.");
const v=validarPerfilCertificable(p);
if(!v.valido)throw Error("No puede aprobarse el perfil:\n\n"+v.errores.join("\n"));
p.estado="APROBADO";
p.validacion={estado:"APROBADO",fecha:fechaISO(),responsable:String(responsable||"").trim(),observaciones:String(observaciones||"").trim()};
await guardarPerfilesCertificables();
if(typeof registrarAuditoria==="function")await registrarAuditoria("A1","APROBACIÓN DE PERFIL CERTIFICABLE",p.codigo+" · "+p.nombre);
return p;
}
