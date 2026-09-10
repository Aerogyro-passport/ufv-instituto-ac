const USUARIOS_INSTITUTO=[
{
codigo:"AML",
nombre:"Ángel M. de Llaguno",
usuario:"AML",
password:"AML",
cargo:"ADMINISTRADOR",
rol:"Administrador",
verTodo:true,
administrador:true,
permisos:[]
},
{
codigo:"LRA",
nombre:"Luis Ramírez Angulo",
usuario:"LRA",
password:"LRA",
cargo:"ADMINISTRADOR",
rol:"Administrador",
verTodo:true,
administrador:true,
permisos:[]
},
{
codigo:"ILB",
nombre:"Irene López Burgo",
usuario:"ILB",
password:"ILB",
cargo:"DIRECCIÓN",
rol:"Dirección",
verTodo:true,
administrador:false,
permisos:[]
},
{
codigo:"GGV",
nombre:"Gloria García Valiente",
usuario:"GGV",
password:"GGV",
cargo:"EDITOR PRINCIPAL",
rol:"Editor principal",
verTodo:false,
administrador:false,
permisos:[]
},
{
codigo:"CP",
nombre:"Carlos Paniagua",
usuario:"CP",
password:"CP",
cargo:"EDITOR PRINCIPAL",
rol:"Editor principal",
verTodo:false,
administrador:false,
permisos:[]
}
];

function buscarUsuario(usuario,password){
usuario=(usuario||"").trim().toUpperCase();
password=(password||"").trim();

return USUARIOS_INSTITUTO.find(u=>
u.usuario.toUpperCase()===usuario &&
u.password===password
)||null;
}

function iniciarSesion(usuario){
const sesion={
codigo:usuario.codigo,
nombre:usuario.nombre,
cargo:usuario.cargo,
rol:usuario.rol,
verTodo:usuario.verTodo,
administrador:usuario.administrador,
permisos:usuario.permisos
};

sessionStorage.setItem(
"rita_instituto_usuario",
JSON.stringify(sesion)
);

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

function haySesion(){
return usuarioActivo()!==null;
}

function esAdministrador(){
const usuario=usuarioActivo();
return !!(usuario&&usuario.administrador);
}

function puedeVerTodo(){
const usuario=usuarioActivo();
return !!(usuario&&(usuario.verTodo||usuario.administrador));
}

function tienePermiso(permiso){
const usuario=usuarioActivo();

if(!usuario)return false;
if(usuario.administrador)return true;

return Array.isArray(usuario.permisos)&&
usuario.permisos.includes(permiso);
}

function exigirSesion(){
if(!haySesion()){
window.location.href="index.html";
return false;
}
return true;
}

function exigirPermiso(permiso){
if(!exigirSesion())return false;

if(!tienePermiso(permiso)){
alert("No dispone de permiso para acceder a esta función.");
return false;
}

return true;
}

function cerrarSesion(){
sessionStorage.removeItem("rita_instituto_usuario");
window.location.href="index.html";
}
