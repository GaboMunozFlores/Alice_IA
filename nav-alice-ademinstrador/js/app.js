// CONFIG FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
  authDomain: "proyectercerparcial.firebaseapp.com",
  databaseURL: "https://proyectercerparcial-default-rtdb.firebaseio.com",
  projectId: "proyectercerparcial",
  storageBucket: "proyectercerparcial.appspot.com",
  messagingSenderId: "39792129165",
  appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};

firebase.initializeApp(firebaseConfig)

const db = firebase.firestore();



// USUARIOS ACTIVOS

async function cargarUsuarios(){

const snapshot = await db
.collection("usuarios")
.where("online","==",true)
.get()

document.getElementById("usuariosActivos").innerText = snapshot.size

}



// SESIONES

async function cargarSesiones(){

const snapshot = await db.collection("sessions").get()

document.getElementById("sesionesHoy").innerText = snapshot.size

}

// CARGAR DATOS

cargarUsuarios()
cargarSesiones()
cargarCVs()

/* cv*/
async function cargarCVs(){

  const snapshot = await db.collection("analisisCV").get();

  let html="";

  snapshot.forEach(doc=>{

    const data = doc.data();

    const resultado = data.resultado ? data.resultado : {};

    const perfil = resultado.perfil ? resultado.perfil : "Sin perfil";
    const motivo = resultado.motivo ? resultado.motivo : "Sin análisis";
    const esApto = resultado.esApto ? true : false;
    const urlCV = resultado.urlCV ? resultado.urlCV : "#";

    const estado = data.estado ? data.estado : "Pendiente";

    html += `
    <tr>

      <td>
        <a href="${urlCV}" target="_blank">
        Ver CV
        </a>
      </td>

      <td>${perfil}</td>

      <td>${motivo}</td>

      <td class="${esApto ? 'estado-apto':'estado-rechazado'}">
        ${estado}
      </td>

      <td>

        <button class="btn-aprobar"
        onclick="aprobarCV('${doc.id}')">
        Aprobar
        </button>

        <button class="btn-rechazar"
        onclick="rechazarCV('${doc.id}')">
        Rechazar
        </button>

      </td>

    </tr>
    `;

  });

  document.getElementById("tablaCV").innerHTML = html;

}
window.aprobarCV = async function(id){

await db.collection("analisisCV").doc(id).update({

estado:"Aprobado",
validado:true

})

cargarCVs()

}
window.rechazarCV = async function(id){

await db.collection("analisisCV").doc(id).update({

estado:"Rechazado",
validado:true

})

cargarCVs()

console.log(data);

snapshot.forEach(doc=>{
  const data = doc.data();
  console.log(data);
});

}
async function registrarSesion(usuario){

await db.collection("sessions").add({

uid: usuario.uid,
email: usuario.email,
loginAt: new Date(),
logoutAt: null,
active: true

})

}
async function cerrarSesion(uid){

const snapshot = await db
.collection("sessions")
.where("uid","==",uid)
.where("active","==",true)
.get()

snapshot.forEach(async doc =>{

await db.collection("sessions")
.doc(doc.id)
.update({

active:false,
logoutAt:new Date()

})

})

}
async function cargarUsuariosActivos(){

const snapshot = await db
.collection("sessions")
.where("active","==",true)
.get()

document.getElementById("usuariosActivos").innerText = snapshot.size

}
db.collection("sessions")
.where("active","==",true)
.onSnapshot(snapshot => {

document.getElementById("usuariosActivos").innerText = snapshot.size

})
async function cargarUsuariosOnline(){

const snapshot = await db
.collection("sessions")
.where("active","==",true)
.get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

html+=`

<tr>
<td>${data.email}</td>
<td>${data.loginAt.toDate().toLocaleTimeString()}</td>
<td>${data.ip || "N/A"}</td>
</tr>

`

})

document.getElementById("tablaUsuariosOnline").innerHTML = html

}
// Mostrar sección de usuarios activos

window.mostrarUsuarios = function(){

document.getElementById("seccionUsuarios").style.display = "block"

cargarUsuarios()

}

async function cargarUsuarios(){

const snapshot = await db.collection("usuarios").get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

html += `

<tr>

<td>${data.email || "Sin email"}</td>

<td>${data.lastLogin ? new Date(data.lastLogin.seconds * 1000).toLocaleString() : "N/A"}</td>

<td>
</td>

<td>

<button onclick="toggleUser('${doc.id}', ${data.enabled})">
${data.enabled ? "Bloquear" : "Activar"}
</button>

</td>

</tr>

`

})

document.getElementById("tablaUsuarios").innerHTML = html

}

function mostrarSeccion(id){

// ocultar todas
document.getElementById("dashboard").style.display = "none"
document.getElementById("seccionUsuarios").style.display = "none"

// mostrar la seleccionada
document.getElementById(id).style.display = "block"

}

window.abrirUsuarios = function(){

mostrarSeccion("seccionUsuarios")

cargarUsuarios()

}

async function cargarUsuarios(){

const snapshot = await db.collection("usuarios").get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

const email = data.email || "Sin email"
const estado = data.enabled ? "Activo" : "Bloqueado"

let fecha = "N/A"

if(data.lastLogin && data.lastLogin.seconds){
fecha = new Date(data.lastLogin.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${email}</td>
<td>${fecha}</td>
<td>${estado}</td>
</tr>
`

})

document.getElementById("tablaUsuarios").innerHTML = html

}

// CAMBIAR SECCIONES
window.cambiarSeccion = function(id){

document.getElementById("dashboard").style.display = "none"
document.getElementById("seccionUsuarios").style.display = "none"

document.getElementById(id).style.display = "block"

}


// ABRIR USUARIOS
window.abrirUsuarios = function(){

window.cambiarSeccion("seccionUsuarios")

cargarUsuarios()

}

async function cargarUsuarios(){

const snapshot = await db.collection("usuarios").get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

let fecha = "N/A"

if(data.lastLogin && data.lastLogin.seconds){
fecha = new Date(data.lastLogin.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${data.email || "Sin email"}</td>
<td>${fecha}</td>
<td>${data.enabled ? "Activo" : "Bloqueado"}</td>
</tr>
`

})

document.getElementById("tablaUsuarios").innerHTML = html

}
async function registrarUsuario(email, password){

const userCred = await firebase.auth()
.createUserWithEmailAndPassword(email, password)

const user = userCred.user

await db.collection("usuarios").doc(user.uid).set({

email: user.email,
role: "user",
enabled: true,
createdAt: new Date(),
lastLogin: null,
online: false

})

}
async function registrarUsuario(email, password){

const userCred = await firebase.auth()
.createUserWithEmailAndPassword(email, password)

const user = userCred.user

await db.collection("usuarios").doc(user.uid).set({

email: user.email,
role: "user",
enabled: true,
createdAt: new Date(),
lastLogin: null,
online: false

})

}
async function logout(){

const user = firebase.auth().currentUser

if(user){

await db.collection("usuarios").doc(user.uid).update({

online: false

})

}

await firebase.auth().signOut()

}
firebase.auth().onAuthStateChanged(async user => {

if(user){

await db.collection("usuarios").doc(user.uid).update({
online: true
})

}else{
console.log("No hay usuario")
}

})
async function cargarUsuariosActivos(){

const snapshot = await db
.collection("usuarios")
.where("online","==",true)
.get()

document.getElementById("usuariosActivos").innerText = snapshot.size

}
async function cargarUsuarios(){

const snapshot = await db.collection("usuarios").get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

html += `
<tr>
<td>${data.email}</td>
<td>${data.role}</td>
<td>${data.enabled ? "Activo":"Bloqueado"}</td>
</tr>
`

})

document.getElementById("tablaUsuarios").innerHTML = html

}
window.toggleUser = async function(uid, estado){

await db.collection("usuarios").doc(uid).update({

enabled: !estado

})

}
async function login(email, password){

const cred = await firebase.auth()
.signInWithEmailAndPassword(email, password)

const user = cred.user

// ACTUALIZAR USUARIO
await db.collection("usuarios").doc(user.uid).update({
lastLogin: new Date(),
online: true
})

// REGISTRAR LOG
await db.collection("logs").add({

uid: user.uid,
email: user.email,
accion: "login",
fecha: new Date()

})

}
async function logout(){

const user = firebase.auth().currentUser

if(user){

await db.collection("logs").add({

uid: user.uid,
email: user.email,
accion: "logout",
fecha: new Date()

})

await db.collection("usuarios").doc(user.uid).update({
online: false
})

}

await firebase.auth().signOut()

}
async function cargarLogs(){

const snapshot = await db
.collection("logs")
.orderBy("fecha","desc")
.limit(20)
.get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

let fecha = "N/A"

if(data.fecha){
fecha = new Date(data.fecha.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${data.email}</td>
<td>${data.accion}</td>
<td>${fecha}</td>
</tr>
`

})

document.getElementById("tablaLogs").innerHTML = html

}
firebase.auth().onAuthStateChanged(async user => {

if(user){

console.log("Usuario activo:", user.email)

//  ACTUALIZAR ESTADO
await db.collection("usuarios").doc(user.uid).set({
email: user.email,
lastLogin: new Date(),
online: true
},{merge:true})

//  REGISTRAR LOG
await db.collection("logs").add({
uid: user.uid,
email: user.email,
accion: "login",
fecha: new Date()
})

}else{

console.log("No hay usuario logeado")

}

})
async function cargarUsuarios(){

const usersSnap = await db.collection("usuarios").get()
const logsSnap = await db.collection("logs").get()

// contador por usuario
let contador = {}

logsSnap.forEach(doc=>{

const log = doc.data()

if(log.accion === "login"){

contador[log.email] = (contador[log.email] || 0) + 1

}

})

let html=""

usersSnap.forEach(doc=>{

const user = doc.data()

const email = user.email || "Sin email"
const estado = user.enabled ? "Activo" : "Bloqueado"

//obtener conteo
const veces = contador[email] || 0

html += `
<tr>
<td>${email}</td>
<td>${veces}</td>
<td>${estado}</td>
</tr>
`

})

document.getElementById("tablaUsuarios").innerHTML = html

}

window.abrirUsuarios = async function(){

cambiarSeccion("seccionUsuarios")

const usersSnap = await db.collection("usuarios").get()
const logsSnap = await db.collection("logs").get()

let contador = {}

// contar logins
logsSnap.forEach(doc=>{
  const log = doc.data()
  if(log.accion === "login"){
    contador[log.email] = (contador[log.email] || 0) + 1
  }
})

let html=""

usersSnap.forEach(doc=>{

const user = doc.data()

html += `
<tr>
<td>${user.email}</td>
<td>${contador[user.email] || 0}</td>
<td>${user.enabled ? "Activo":"Bloqueado"}</td>
</tr>
`

})

document.getElementById("tablaUsuarios").innerHTML = html

}
window.abrirLogs = async function(){

cambiarSeccion("seccionLogs")

const snapshot = await db.collection("logs")
.orderBy("fecha","desc")
.limit(20)
.get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

let fecha = "N/A"

if(data.fecha){
fecha = new Date(data.fecha.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${data.email}</td>
<td>${data.accion}</td>
<td>${fecha}</td>
</tr>
`

})

document.getElementById("tablaLogs").innerHTML = html

}
let chart

function iniciarGrafica(){

const canvas = document.getElementById("graficaUsuarios")

if(!canvas){
console.log("No existe canvas")
return
}

const ctx = canvas.getContext("2d")

chart = new Chart(ctx,{
type:"line",
data:{
labels:[],
datasets:[{
label:"Usuarios",
data:[]
}]
}
})

}

function escucharUsuariosActivos(){

db.collection("usuarios")
.where("online","==",true)
.onSnapshot(snapshot => {

const total = snapshot.size

console.log("Usuarios activos:", total) 

const hora = new Date().toLocaleTimeString()

chart.data.labels.push(hora)
chart.data.datasets[0].data.push(total)

if(chart.data.labels.length > 10){
chart.data.labels.shift()
chart.data.datasets[0].data.shift()
}

chart.update()

document.getElementById("usuariosActivos").innerText = total

})

}
window.onload = function(){
console.log("Cargando panel...")
iniciarGrafica()
escucharUsuariosActivos()
}
db.collection("usuarios").onSnapshot(snapshot => {

const total = snapshot.size

document.getElementById("usuariosActivos").innerText = total

})

function escucharUsuarios(){

db.collection("usuarios").onSnapshot(snapshot => {

const total = snapshot.size

console.log("Usuarios:", total)

const hora = new Date().toLocaleTimeString()

chart.data.labels.push(hora)
chart.data.datasets[0].data.push(total)

if(chart.data.labels.length > 10){
chart.data.labels.shift()
chart.data.datasets[0].data.shift()
}

chart.update()

document.getElementById("usuariosActivos").innerText = total

})

}
//hasta aqui

firebase.auth().onAuthStateChanged(user => {

if(user){

console.log("Usuario activo:", user.email)

// mostrar en el panel
const el = document.getElementById("usuarioActual")

if(el){
el.innerText = user.email
}
}else{

console.log("No hay usuario")

const el = document.getElementById("usuarioActual")

if(el){
el.innerText = user.email
}
}

})
const el = document.getElementById("usuarioActual")

if(el){
el.innerText = user.email
}

window.testLogin = async function(){

await firebase.auth().signInWithEmailAndPassword(
"dont_care58@hotmail.com",
"123456"
)

}
function setTexto(id, valor){

const el = document.getElementById(id)

if(el){
el.innerText = valor
}else{
console.log("No existe:", id)
}

}

firebase.auth().onAuthStateChanged(user => {

const el = document.getElementById("usuarioActual")

if(!el) return

if(user){

console.log("Usuario activo:", user.email)
el.innerText = user.email

}else{

console.log("No hay usuario")
el.innerText = "No logeado"

}

})
window.loginTest = async function(){

try{

const cred = await firebase.auth()
.signInWithEmailAndPassword(
"dont_care58@hotmail.com",
"123456"
)

console.log("Login correcto:", cred.user.email)

}catch(e){

console.error("Error login:", e)

}

}

window.toggleMenu = function(id){

const menu = document.getElementById(id)

if(menu.style.display === "block"){
menu.style.display = "none"
}else{
menu.style.display = "block"
}

}

window.irUsuarios = function(){

cambiarSeccion("seccionUsuarios")
cargarUsuarios()
cargarUltimosLogins()

}
/*borra */  
async function cargarUltimosLogins(){

const snapshot = await db.collection("logs")
.where("accion","==","login")
.orderBy("fecha","desc")
.limit(5)
.get()

let html=""

snapshot.forEach(doc=>{

const data = doc.data()

let fecha = "N/A"

if(data.fecha && data.fecha.seconds){
fecha = new Date(data.fecha.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${data.email || "Sin email"}</td>
<td>${fecha}</td>
<td>${data.ip || "N/A"}</td>
</tr>
`

})

document.getElementById("tablaLogins").innerHTML = html

}

async function cargarLogs(){

const snapshot = await db.collection("logs")
.orderBy("fecha","desc")
.limit(10)
.get()

let html = ""

snapshot.forEach(doc => {

const data = doc.data()

// convertir fecha correctamente
let fecha = "Sin fecha"

if(data.fecha){
if(data.fecha.seconds){
fecha = new Date(data.fecha.seconds * 1000).toLocaleString()
}else{
fecha = new Date(data.fecha).toLocaleString()
}
}

html += `
<tr>
<td>${data.email || "Sin email"}</td>
<td>${data.accion || "Sin acción"}</td>
<td>${fecha}</td>
</tr>
`

})

document.getElementById("tablaLogs").innerHTML = html

}

function irLogs(){
cambiarSeccion("seccionLogs")
cargarLogs()
}

escucharLogs()

function escucharLogs(){

db.collection("logs")
.orderBy("fecha","desc")
.limit(10)
.onSnapshot(snapshot => {

let html = ""

snapshot.forEach(doc => {

const data = doc.data()

let fecha = "Sin fecha"

if(data.fecha?.seconds){
fecha = new Date(data.fecha.seconds * 1000).toLocaleString()
}

html += `
<tr>
<td>${data.email || "Sin email"}</td>
<td>${data.accion}</td>
<td>${fecha}</td>
</tr>
`

})

document.getElementById("tablaLogs").innerHTML = html

})

}

//borrar despues
firebase.auth().onAuthStateChanged(async user => {

if(user){

console.log("Usuario logeado:", user.email)

// 🔥 mostrar usuario
const el = document.getElementById("usuarioActual")
if(el){
el.innerText = user.email
}

const doc = await db.collection("usuarios").doc(user.uid).get()

if(!doc.exists || doc.data().rol !== "admin"){
alert("No tienes acceso al panel")
window.location.href = "index.html"
}

}else{

console.log("No hay usuario, redirigiendo...")

window.location.href = "login.html" // o tu página principal

}

})

window.cerrarSesion = async function(){

await firebase.auth().signOut()

// limpiar sesión local
sessionStorage.clear()

// redirigir
window.location.href = "login.html"

}
window.cerrarSesion = async function(){

try{

await firebase.auth().signOut()

console.log("Sesión cerrada")

window.location.href = "index.html"

}catch(error){

console.error("Error al cerrar sesión:", error)

}

}

firebase.auth().onAuthStateChanged(user => {

const el = document.getElementById("usuarioActual")

if(user){

console.log("Usuario activo:", user.email)

if(el){
el.innerText = user.email
}

}else{

console.log("No hay usuario")

if(el){
el.innerText = "No logeado"
}

window.location.href = "index.html"

}

})

// BOTÓN LOGOUT 
document.getElementById("btnLogout").addEventListener("click", async () => {

try{

await firebase.auth().signOut()

alert("Sesión cerrada")

window.location.href = "index.html"

}catch(e){

console.error(e)
alert("Error al cerrar sesión")

}

})