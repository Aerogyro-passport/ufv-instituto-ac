/* =========================================================
   RITA© · UFV INSTITUTO
   MOTOR DE USUARIOS
   Maestro: Dropbox /03_UFV_INSTITUTO/99_datos_Rita/
   ========================================================= */

const RITA={
base:"/03_UFV_INSTITUTO/99_datos_Rita",
archivos:{
usuarios:"maestro_usuarios.json",
configuracion:"maestro_configuracion.json",
auditoria:"maestro_auditoria.json",
sesiones:"maestro_sesiones.json"
},
usuarios:[],
configuracion:null
};

function normalizar(txt){
return(txt||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
}

function rutaMaestro(nombre){
return `${RITA.base}/${RITA.archivos[nombre]}`;
}

/* =========================================================
   DROPBOX
   DROPBOX_TOKEN deberá estar definido antes de cargar este JS
   ========================================================= */

function tokenDropbox(){
if(typeof DROPBOX_TOKEN==="undefined"||!DROPBOX_TOKEN){
throw new Error("No se ha configurado la conexión con Dropbox.");
}
return DROPBOX_TOKEN;
}

async function leerDropbox(path){
const r=await fetch("https://content.dropboxapi.com/2/files/download",{
method:"POST",
headers:{
"Authorization":"Bearer "+tokenDropbox(),
"Dropbox-API-Arg":JSON.stringify({path})
}
});

if(!r.ok){
let detalle="";
try{detalle=await r.text()}catch(e){}
throw new Error(`Error Dropbox ${r.status}: ${detalle}`);
}

return await r.json();
}

async function escribirDropbox(path,data){
const contenido=JSON.stringify(data,null,2);

const r=await fetch("https://content.dropboxapi.com/2/files/upload",{
method:"POST",
headers:{
"Authorization":"Bearer "+tokenDropbox(),
"Content-Type":"application/octet-stream",
"Dropbox-API-Arg":JSON.stringify({
path,
mode:"overwrite",
autorename:false,
mute:true
})
},
body:contenido
});

if(!r.ok){
let detalle="";
try{detalle=await r.text()}catch(e){}
throw new Error(`Error Dropbox ${r.status}: ${detalle}`);
}

return await r.json();
}

/* =========================================================
   CARGA DE MAESTROS
   ========================================================= */

async function cargarUsuarios(){
const datos=await leerDropbox(rutaMaestro("usuarios"));
if(!Array.isArray(datos))throw new Error("maestro_usuarios.json no contiene una lista válida.");
RITA.usuarios=datos;
return datos;
}

async function cargarConfiguracion(){
const datos=await leerDropbox(rutaMaestro("configuracion"));
RITA.configuracion=datos;
return datos;
}

async function iniciarRita(){
await Promise.all([
cargarUsuarios(),
cargarConfiguracion()
]);
return true;
}

/* =========================================================
   IDENTIFICACIÓN
   ========================================================= */

async function buscarUsuario(usuario,password){
if(!RITA.usuarios.length)await cargarUsuarios();

return RITA.usuarios.find(u=>
u.activo!==false&&
normalizar(u.usuario)===normalizar(usuario)&&
u.password===password
)||null;
}

function iniciarSesion(usuario){
const sesion={
codigo:usuario.codigo,
usuario:usuario.usuario,
nombre:usuario.nombre,
rol:usuario.rol,
administrador:!!usuario.administrador,
permisos:Array.isArray(usuario.permisos)?[...usuario.permisos]:[],
demo:!!usuario.demo,
inicio:new Date().toISOString()
};

sessionStorage.setItem("rita_instituto_usuario",JSON.stringify(sesion));
registrarSesion("INICIO",sesion).catch(console.error);
return sesion;
}

function usuarioActivo(){
try{
const x=sessionStorage.getItem("rita_instituto_usuario");
return x?JSON.parse(x):null;
}catch(e){
return null;
}
}

function tienePermiso(codigo){
const u=usuarioActivo();
return!!(u&&Array.isArray(u.permisos)&&u.permisos.includes(codigo));
}

async function cerrarSesion(){
const u=usuarioActivo();
if(u){
try{await registrarSesion("CIERRE",u)}catch(e){console.error(e)}
}
sessionStorage.removeItem("rita_instituto_usuario");
location.href="index.html";
}

/* =========================================================
   GESTIÓN DE USUARIOS DESDE A8
   ========================================================= */

async function guardarUsuarios(){
await escribirDropbox(rutaMaestro("usuarios"),RITA.usuarios);
}

async function altaUsuario(datos){
if(!RITA.usuarios.length)await cargarUsuarios();

if(RITA.usuarios.some(u=>normalizar(u.usuario)===normalizar(datos.usuario))){
throw new Error("Ya existe un usuario con ese nombre de acceso.");
}

if(RITA.usuarios.some(u=>normalizar(u.codigo)===normalizar(datos.codigo))){
throw new Error("Ya existe un usuario con ese código.");
}

const nuevo={
codigo:(datos.codigo||"").trim().toUpperCase(),
usuario:normalizar(datos.usuario),
nombre:(datos.nombre||"").trim(),
password:datos.password||"pollo33",
rol:datos.rol||"Usuario",
administrador:!!datos.administrador,
activo:datos.activo!==false,
demo:!!datos.demo,
permisos:Array.isArray(datos.permisos)?datos.permisos:[]
};

RITA.usuarios.push(nuevo);
await guardarUsuarios();

await registrarAuditoria(
"A8",
"ALTA DE USUARIO",
`Alta de ${nuevo.nombre} (${nuevo.usuario})`
);

return nuevo;
}

async function editarUsuario(codigo,cambios){
if(!RITA.usuarios.length)await cargarUsuarios();

const u=RITA.usuarios.find(x=>x.codigo===codigo);
if(!u)throw new Error("Usuario no encontrado.");

const codigoAnterior=u.codigo;

if(cambios.nombre!==undefined)u.nombre=cambios.nombre.trim();
if(cambios.usuario!==undefined)u.usuario=normalizar(cambios.usuario);
if(cambios.password)u.password=cambios.password;
if(cambios.rol!==undefined)u.rol=cambios.rol;
if(cambios.activo!==undefined)u.activo=!!cambios.activo;
if(cambios.demo!==undefined)u.demo=!!cambios.demo;
if(cambios.administrador!==undefined)u.administrador=!!cambios.administrador;
if(Array.isArray(cambios.permisos))u.permisos=[...cambios.permisos];

await guardarUsuarios();

await registrarAuditoria(
"A8",
"EDICIÓN DE USUARIO",
`Edición del usuario ${codigoAnterior} · ${u.nombre}`
);

return u;
}

async function cambiarPermisos(codigo,permisos){
return editarUsuario(codigo,{permisos});
}

async function cambiarEstadoUsuario(codigo,activo){
return editarUsuario(codigo,{activo});
}

async function cambiarPassword(codigo,password){
if(!password)throw new Error("La contraseña no puede quedar vacía.");
return editarUsuario(codigo,{password});
}

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

async function guardarConfiguracion(config){
RITA.configuracion=config;
await escribirDropbox(rutaMaestro("configuracion"),config);

await registrarAuditoria(
"A8",
"CAMBIO DE CONFIGURACIÓN",
"Modificación de parámetros generales de Rita©"
);

return config;
}

/* =========================================================
   AUDITORÍA
   ========================================================= */

async function registrarAuditoria(area,accion,detalle){
let lista=[];

try{
lista=await leerDropbox(rutaMaestro("auditoria"));
if(!Array.isArray(lista))lista=[];
}catch(e){
lista=[];
}

const u=usuarioActivo();
const ahora=new Date();

lista.push({
id:"AUD-"+String(lista.length+1).padStart(4,"0"),
fecha:ahora.toISOString().slice(0,10),
hora:ahora.toTimeString().slice(0,8),
usuario_codigo:u?.codigo||"SISTEMA",
usuario_nombre:u?.nombre||"Sistema",
area:area||"",
modulo:area==="A8"?"Configuración":"",
accion,
detalle:detalle||"",
resultado:"Correcto"
});

await escribirDropbox(rutaMaestro("auditoria"),lista);
}

/* =========================================================
   SESIONES
   ========================================================= */

async function registrarSesion(tipo,usuario){
if(RITA.configuracion?.acceso?.registro_accesos===false)return;

let lista=[];

try{
lista=await leerDropbox(rutaMaestro("sesiones"));
if(!Array.isArray(lista))lista=[];
}catch(e){
lista=[];
}

const ahora=new Date();

lista.push({
id:"SES-"+String(lista.length+1).padStart(5,"0"),
tipo,
fecha:ahora.toISOString().slice(0,10),
hora:ahora.toTimeString().slice(0,8),
usuario_codigo:usuario.codigo,
usuario:usuario.usuario,
nombre:usuario.nombre
});

await escribirDropbox(rutaMaestro("sesiones"),lista);
}

/* =========================================================
   UTILIDADES A8
   ========================================================= */

async function obtenerUsuarios(){
await cargarUsuarios();
return RITA.usuarios;
}

async function obtenerConfiguracion(){
return await cargarConfiguracion();
}

async function obtenerAuditoria(){
const x=await leerDropbox(rutaMaestro("auditoria"));
return Array.isArray(x)?x:[];
}

async function obtenerSesiones(){
const x=await leerDropbox(rutaMaestro("sesiones"));
return Array.isArray(x)?x:[];
}
