/* =========================================================
   RITA© · UFV INSTITUTO
   MOTOR DE USUARIOS
   Maestro: Dropbox /03_UFV_INSTITUTO/99_datos_Rita/
   ========================================================= */

const RITA={
base:"/03_UFV_INSTITUTO/99_datos_Rita/",
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
return RITA.base+RITA.archivos[nombre];
}

async function leerDropbox(path){
const token=await obtenerDropboxAccessToken();

const r=await fetch("https://content.dropboxapi.com/2/files/download",{
method:"POST",
headers:{
Authorization:"Bearer "+token,
"Dropbox-API-Arg":JSON.stringify({path})
}
});

if(!r.ok){
let detalle="";
try{detalle=await r.text()}catch(e){}
throw new Error("Dropbox "+r.status+(detalle?": "+detalle:""));
}

const texto=await r.text();

try{
return JSON.parse(texto);
}catch(e){
throw new Error("El archivo "+path+" no contiene JSON válido.");
}
}

async function escribirDropbox(path,data){
const token=await obtenerDropboxAccessToken();

const r=await fetch("https://content.dropboxapi.com/2/files/upload",{
method:"POST",
headers:{
Authorization:"Bearer "+token,
"Content-Type":"application/octet-stream",
"Dropbox-API-Arg":JSON.stringify({
path,
mode:"overwrite",
autorename:false,
mute:true
})
},
body:JSON.stringify(data,null,2)
});

if(!r.ok){
let detalle="";
try{detalle=await r.text()}catch(e){}
throw new Error("Dropbox "+r.status+(detalle?": "+detalle:""));
}

return await r.json();
}

/* =========================================================
   USUARIOS
   ========================================================= */

async function cargarUsuarios(){
const datos=await leerDropbox(rutaMaestro("usuarios"));

if(!Array.isArray(datos)){
throw new Error("maestro_usuarios.json no contiene una lista válida.");
}

RITA.usuarios=datos;
return datos;
}

async function guardarUsuarios(){
await escribirDropbox(rutaMaestro("usuarios"),RITA.usuarios);
}

async function obtenerUsuarios(){
return await cargarUsuarios();
}

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

async function cargarConfiguracion(){
const datos=await leerDropbox(rutaMaestro("configuracion"));
RITA.configuracion=datos;
return datos;
}

async function obtenerConfiguracion(){
return await cargarConfiguracion();
}

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
   INICIALIZACIÓN
   ========================================================= */

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
if(!RITA.usuarios.length){
await cargarUsuarios();
}

return RITA.usuarios.find(u=>
u.activo!==false &&
normalizar(u.usuario)===normalizar(usuario) &&
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

sessionStorage.setItem(
"rita_instituto_usuario",
JSON.stringify(sesion)
);

registrarSesion("INICIO",sesion).catch(console.error);

return sesion;
}

function usuarioActivo(){
try{
const datos=sessionStorage.getItem("rita_instituto_usuario");
return datos?JSON.parse(datos):null;
}catch(e){
return null;
}
}

function tienePermiso(codigo){
const usuario=usuarioActivo();

return!!(
usuario &&
Array.isArray(usuario.permisos) &&
usuario.permisos.includes(codigo)
);
}

async function cerrarSesion(){
const usuario=usuarioActivo();

if(usuario){
try{
await registrarSesion("CIERRE",usuario);
}catch(e){
console.error(e);
}
}

sessionStorage.removeItem("rita_instituto_usuario");
location.href="index.html";
}

/* =========================================================
   ALTA DE USUARIOS
   ========================================================= */

async function altaUsuario(datos){
if(!RITA.usuarios.length){
await cargarUsuarios();
}

if(
RITA.usuarios.some(
u=>normalizar(u.usuario)===normalizar(datos.usuario)
)
){
throw new Error("Ya existe un usuario con ese nombre de acceso.");
}

if(
RITA.usuarios.some(
u=>normalizar(u.codigo)===normalizar(datos.codigo)
)
){
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
permisos:Array.isArray(datos.permisos)?[...datos.permisos]:[]
};

RITA.usuarios.push(nuevo);

await guardarUsuarios();

await registrarAuditoria(
"A8",
"ALTA DE USUARIO",
"Alta de "+nuevo.nombre+" ("+nuevo.usuario+")"
);

return nuevo;
}

/* =========================================================
   EDICIÓN DE USUARIOS
   ========================================================= */

async function editarUsuario(codigo,cambios){
if(!RITA.usuarios.length){
await cargarUsuarios();
}

const usuario=RITA.usuarios.find(u=>u.codigo===codigo);

if(!usuario){
throw new Error("Usuario no encontrado.");
}

if(cambios.nombre!==undefined){
usuario.nombre=(cambios.nombre||"").trim();
}

if(cambios.usuario!==undefined){
const nuevoUsuario=normalizar(cambios.usuario);

const repetido=RITA.usuarios.some(
u=>u!==usuario && normalizar(u.usuario)===nuevoUsuario
);

if(repetido){
throw new Error("Ya existe otro usuario con ese nombre de acceso.");
}

usuario.usuario=nuevoUsuario;
}

if(cambios.codigo!==undefined){
const nuevoCodigo=(cambios.codigo||"").trim().toUpperCase();

const repetido=RITA.usuarios.some(
u=>u!==usuario && normalizar(u.codigo)===normalizar(nuevoCodigo)
);

if(repetido){
throw new Error("Ya existe otro usuario con ese código.");
}

usuario.codigo=nuevoCodigo;
}

if(cambios.password){
usuario.password=cambios.password;
}

if(cambios.rol!==undefined){
usuario.rol=cambios.rol;
}

if(cambios.activo!==undefined){
usuario.activo=!!cambios.activo;
}

if(cambios.demo!==undefined){
usuario.demo=!!cambios.demo;
}

if(cambios.administrador!==undefined){
usuario.administrador=!!cambios.administrador;
}

if(Array.isArray(cambios.permisos)){
usuario.permisos=[...cambios.permisos];
}

await guardarUsuarios();

await registrarAuditoria(
"A8",
"EDICIÓN DE USUARIO",
"Edición del usuario "+usuario.codigo+" · "+usuario.nombre
);

return usuario;
}

async function cambiarPermisos(codigo,permisos){
return await editarUsuario(codigo,{permisos});
}

async function cambiarEstadoUsuario(codigo,activo){
return await editarUsuario(codigo,{activo});
}

async function cambiarPassword(codigo,password){
if(!password){
throw new Error("La contraseña no puede quedar vacía.");
}

return await editarUsuario(codigo,{password});
}

/* =========================================================
   AUDITORÍA
   ========================================================= */

async function obtenerAuditoria(){
const datos=await leerDropbox(rutaMaestro("auditoria"));
return Array.isArray(datos)?datos:[];
}

async function registrarAuditoria(area,accion,detalle){
let lista=[];

try{
lista=await obtenerAuditoria();
}catch(e){
lista=[];
}

const usuario=usuarioActivo();
const ahora=new Date();

lista.push({
id:"AUD-"+String(lista.length+1).padStart(4,"0"),
fecha:ahora.toISOString().slice(0,10),
hora:ahora.toTimeString().slice(0,8),
usuario_codigo:usuario?.codigo||"SISTEMA",
usuario_nombre:usuario?.nombre||"Sistema",
area:area||"",
modulo:area==="A8"?"Configuración":"",
accion:accion||"",
detalle:detalle||"",
resultado:"Correcto"
});

await escribirDropbox(rutaMaestro("auditoria"),lista);
}

/* =========================================================
   SESIONES
   ========================================================= */

async function obtenerSesiones(){
const datos=await leerDropbox(rutaMaestro("sesiones"));
return Array.isArray(datos)?datos:[];
}

async function registrarSesion(tipo,usuario){
if(!RITA.configuracion){
try{
await cargarConfiguracion();
}catch(e){}
}

if(RITA.configuracion?.acceso?.registro_accesos===false){
return;
}

let lista=[];

try{
lista=await obtenerSesiones();
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
