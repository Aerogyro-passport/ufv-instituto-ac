const DROPBOX_APP_KEY="hyv716xdipmnh7x";
const DROPBOX_APP_SECRET="almpjgv638kqzh9";
const DROPBOX_REFRESH_TOKEN="FxIHaLYaGacAAAAAAAAAAdCOyUDABuG_3HLAx6WDI67bvgnfT-ZsfIY1jQvqFe9l";

let DROPBOX_ACCESS_TOKEN="";
let DROPBOX_ACCESS_TOKEN_EXPIRA=0;

async function obtenerDropboxAccessToken(){
const ahora=Date.now();

if(
DROPBOX_ACCESS_TOKEN &&
ahora < DROPBOX_ACCESS_TOKEN_EXPIRA-60000
){
return DROPBOX_ACCESS_TOKEN;
}

const cuerpo=new URLSearchParams();

cuerpo.append("grant_type","refresh_token");
cuerpo.append("refresh_token",DROPBOX_REFRESH_TOKEN);
cuerpo.append("client_id",DROPBOX_APP_KEY);
cuerpo.append("client_secret",DROPBOX_APP_SECRET);

const r=await fetch(
"https://api.dropboxapi.com/oauth2/token",
{
method:"POST",
headers:{
"Content-Type":"application/x-www-form-urlencoded"
},
body:cuerpo.toString()
}
);

if(!r.ok){
let texto="";
try{
texto=await r.text();
}catch(e){}

throw new Error(
"No se ha podido obtener autorización de Dropbox"+
(texto?": "+texto:"")
);
}

const datos=await r.json();

DROPBOX_ACCESS_TOKEN=datos.access_token;
DROPBOX_ACCESS_TOKEN_EXPIRA=
Date.now()+((datos.expires_in||14400)*1000);

return DROPBOX_ACCESS_TOKEN;
}
