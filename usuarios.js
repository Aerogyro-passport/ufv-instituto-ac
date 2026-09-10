const USUARIOS_INSTITUTO=[
{codigo:"AML",nombre:"Ángel M. de Llaguno",password:"pollo33",rol:"Administrador",administrador:true,permisos:["A1","A2","A3","A4","A5","A6","A7","A8"]},
{codigo:"LRA",nombre:"Luis Ramírez Angulo",password:"pollo33",rol:"Administrador",administrador:true,permisos:["A6","A7","A8"]},
{codigo:"PRG",nombre:"Pilar Rodríguez Gabriel",password:"pollo33",rol:"Usuario",administrador:false,permisos:["A1","A2","A3","A4","A5","A6"]},
{codigo:"FRGC",nombre:"Felipe Rodrigo Gutiérrez de la Cámara",password:"pollo33",rol:"Usuario",administrador:false,permisos:["A1","A2","A3","A4","A5","A6","A7","A8"]},
{codigo:"MEV",nombre:"Manuel Evaluador",password:"pollo33",rol:"Evaluador · DEMO",administrador:false,permisos:["A1","A3","A5"],demo:true},
{codigo:"APT",nombre:"Ana Partes",password:"pollo33",rol:"Partes interesadas · DEMO",administrador:false,permisos:["A5","A6"],demo:true},
{codigo:"PFO",nombre:"Pedro formador",password:"pollo33",rol:"Formador · DEMO",administrador:false,permisos:["A1","A4"],demo:true}
];

function normalizar(txt){
return(txt||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().replace(/\s+/g," ").toLowerCase();
}

function buscarUsuario(nombre,password){
return USUARIOS_INSTITUTO.find(u=>normalizar(u.nombre)===normalizar(nombre)&&u.password===password)||null;
}

function iniciarSesion(usuario){
const sesion={
codigo:usuario.codigo,
nombre:usuario.nombre,
rol:usuario.rol,
administrador:usuario.administrador,
permisos:[...usuario.permisos],
demo:!!usuario.demo
};
sessionStorage.setItem("rita_instituto_usuario",JSON.stringify(sesion));
return sesion;
}

function usuarioActivo(){
try{
return JSON.parse(sessionStorage.getItem("rita_instituto_usuario"))||null;
}catch(e){
return null;
}
}

function tienePermiso(codigo){
const u=usuarioActivo();
return!!(u&&Array.isArray(u.permisos)&&u.permisos.includes(codigo));
}

function cerrarSesion(){
sessionStorage.removeItem("rita_instituto_usuario");
location.href="index.html";
}
