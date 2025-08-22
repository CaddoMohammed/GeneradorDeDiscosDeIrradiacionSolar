const Inputs = [document.getElementById("latitud"),document.getElementById("longitud")];
const Descriptors = [Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set,Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").get];
const ErrorInputs = [document.getElementById("error-latitud"),document.getElementById("error-longitud")];
const Mapa = L.map("map",{center:[14.084657,-87.165792],zoom:7,minZoom:3,maxZoom:18,zoomControl:false,attributionControl:false});
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`}).addTo(Mapa);	
new L.Control.MiniMap(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:15}),{toggleDisplay:true,minimized:false}).addTo(Mapa);
new L.Control.Zoom({position:'topleft'}).addTo(Mapa);
Mapa.setMaxBounds(L.latLngBounds(L.latLng(90,-180),L.latLng(-90,180)));
L.control.resetView({position:"topleft",title:"Reset view",latlng:L.latLng([14.084657,-87.165792]),zoom:7,}).addTo(Mapa);
L.control.scale().addTo(Mapa);
let error=[false,false],timer=null;
Object.defineProperty(HTMLInputElement.prototype,"value",{
	set:function(newValue){
		Descriptors[0].call(this,newValue);
		validation(this.id);
	},
	get:function(){
		return Descriptors[1].call(this);
	},
	configurable:true,
	enumerable:true
});
for(let i=0;i<Inputs.length;i++){
	Inputs[i]["value"] = "";
	Inputs[i].addEventListener("input",() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			validation(Inputs[i]["id"]);
			if((error[0]===false)&&(error[1]===false)){LeafletSetLocation(Mapa,Inputs)};
		},500);
	});
}
let locale = {moduleType:"locale",name:"es",dictionary:{Autoscale:"Autoescalar","Box Select":"Seleccionar Caja","Click to enter Colorscale title":"Introducir el t\xedtulo de la Escala de Color","Click to enter Component A title":"Introducir el t\xedtulo del Componente A","Click to enter Component B title":"Introducir el t\xedtulo del Componente B","Click to enter Component accordion title":"Introducir el t\xedtulo del Componente C","Click to enter Plot title":"Introducir el t\xedtulo de la Gr\xe1fica","Click to enter X axis title":"Introducir el t\xedtulo del eje X","Click to enter Y axis title":"Introducir el t\xedtulo del eje Y","Click to enter radial axis title":"Introducir el t\xedtulo del eje radial","Compare data on hover":"Comparar datos al pasar por encima","Double-click on legend to isolate one trace":"Haga doble-clic en la leyenda para aislar una traza","Double-click to zoom back out":"Haga doble-clic para restaurar la escala","Download plot as a png":"Descargar gr\xe1fico como png","Download plot":"Descargar gr\xe1fico","Edit in Chart Studio":"Editar en Chart Studio","IE only supports svg.  Changing format to svg.":"IE solo soporta svg. Cambiando formato a svg.","Lasso Select":"Seleccionar con lazo","Orbital rotation":"Rotaci\xf3n esf\xe9rica",Pan:"Desplazarse","Produced with Plotly.js":"Hecho con Plotly.js",Reset:"Reiniciar",	"Reset axes":"Reiniciar ejes","Reset camera to default":"Restaurar c\xe1mara predeterminada","Reset camera to last save":"Restaurar anterior c\xe1mara","Reset view":"Restaurar vista","Reset views":"Restaurar vistas","Show closest data on hover":"Mostrar el dato m\xe1s cercano al pasar por encima","Snapshot succeeded":"Gr\xe1fico guardado correctamente","Sorry, there was a problem downloading your snapshot!":"\xa1La descarga del gr\xe1fico fall\xf3!","Taking snapshot - this may take a few seconds":"Guardando gr\xe1fico - podr\xeda tardar unos segundos","Toggle Spike Lines":"Mostrar/Ocultar Gu\xedas","Toggle show closest data on hover":"Activar/Desactivar mostrar el dato m\xe1s cercano al pasar por encima","Turntable rotation":"Rotaci\xf3n plana",Zoom:"Modo Ampliar/Reducir","Zoom in":"Ampliar","Zoom out":"Reducir","close:":"cierre:","high:":"alza:","incoming flow count:":"flujo de entrada:","kde:":"edp:","lat:":"lat:","lon:":"lon:","low:":"baja:","lower fence:":"l\xedmite inferior:","max:":"m\xe1x:","mean \xb1 \u03c3:":"media \xb1 \u03c3:","mean:":"media:","median:":"mediana:","min:":"m\xedn:","new text":"nuevo texto","open:":"apertura:","outgoing flow count:":"flujo de salida:","q1:":"q1:","q3:":"q3:","source:":"fuente:","target:":"destino:",trace:"traza","upper fence:":"l\xedmite superior:"},format:{days:["Domingo","Lunes","Martes","Mi\xe9rcoles","Jueves","Viernes","S\xe1bado"],shortDays:["Dom","Lun","Mar","Mi\xe9","Jue","Vie","S\xe1b"],months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],shortMonths:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],date:"%d/%m/%Y",decimal:".",thousands:","}};
typeof Plotly=="undefined"?(window.PlotlyLocales=window.PlotlyLocales||[],window.PlotlyLocales.push(locale)):Plotly.register(locale);
Plotly.setPlotConfig({locale:"es"});
LeafletLocationPicker(Mapa,Inputs);
function validation(x){
	let a = Inputs.findIndex(b => b.id===x);
	const Max=[90,180],Name=["latitud","longitud"];
	if(isNaN(Inputs[a]["value"])){
		Inputs[a]["className"] = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 appearance-none dark:text-white dark:border-red-500 border-red-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer";
		ErrorInputs[a]["innerHTML"] = "Solamente números";
		error[a] = true;
		return;
	} else {
		error[a] = false;
	}
	if(Math.abs(Inputs[a]["value"])>Max[a]){
		Inputs[a]["className"] = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 appearance-none dark:text-white dark:border-red-500 border-red-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer";
		ErrorInputs[a]["innerHTML"] = `La ${Name[a]} debe ser solo desde -${Max[a]}° hasta ${Max[a]}°`;
		error[a] = true;
		return;
	} else {
		error[a] = false;
	}
	Inputs[a]["className"] = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer";
	ErrorInputs[a].innerHTML = "";
	if(Inputs[a]["value"].trim()===""){error[a]=true;return};
}
function calcular(x){
	if((error[0]===true)||(error[1]===true)){return};
	let z = {"lat":Inputs[0]["value"],"lng":Inputs[1]["value"],"modelo":x}
	let btns = [document.getElementById("btn-calcular-1"),document.getElementById("btn-calcular-2")];
	let labels = [document.getElementById("label-anisotropico"),document.getElementById("label-isotropico")];
	let spinners = [document.getElementById("spinner-anisotropico"),document.getElementById("spinner-isotropico")];
	btns[0].disabled=true;btns[1].disabled=true;
	btns[0].classList.add("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
	btns[1].classList.add("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
	labels[x].innerHTML = "Cargando...";
	spinners[x].classList.remove("hidden");
	fetch(`https://discos-de-irradiacion-solar-a00-252997894133.northamerica-northeast2.run.app/generar`,{method:"POST",headers:{"Content-Type":"application/json",},body:JSON.stringify(z)})
	.then(u => u.json())
	.then(v => {
		btns[0].disabled=false;btns[1].disabled=false;
		btns[0].classList.remove("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
		btns[1].classList.remove("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
		if(x===0){
			labels[x].innerHTML = "Modelo anisotrópico";
		} else {
			labels[x].innerHTML = "Modelo isosotrópico";
		}
		spinners[x].classList.add("hidden");
		resultados(v);
		console.log(v);
	})
	.catch(k => console.error(k));
}
function resultados(x){
	hideElements();
	let a = document.getElementById("promedios");
	a["value"] = "1";
	let b = {displaylogo:false,toImageButtonOptions:{format:"png",filename:"fd",height:1080,width:1300,scale:1},modeBarButtonsToRemove:["autoScale2d","lasso2d","select2d","zoom2d"],displayModeBar:true,showAxisRangeEntryBoxes:false,showAxisDragHandles:false,showAxisRangeEntryBoxes:false,responsive:true,doubleClickDelay:10};
	a["value"] = 1;
	Plotly.newPlot("bar-graphic",[x["Promedios"][1]],b);
	a.addEventListener("change",function(){
		Plotly.newPlot("bar-graphic",[x["Promedios"][a["value"]]],b);
	});
	Plotly.newPlot("line-graphic",[x["Angulo de declinacion"]],b);
}
function exportar(){
	if(Datos===undefined){return};
	let btn = document.getElementById("btn-exportar");
	let label = document.getElementById("label-exportar");
	let spinner = document.getElementById("spinner-exportar");
	btn.disabled = true;
	btn.classList.add("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
	label.innerHTML = "Cargando...";
	spinner.classList.remove("hidden");
	fetch("https://discos-de-irradiacion-solar-a00-252997894133.northamerica-northeast2.run.app/exportarPDF",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Datos)})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.blob(); 
	})
	.then(blob => {
		btn.disabled = false;
		btn.classList.remove("bg-blue-400","dark:bg-blue-500","cursor-not-allowed");
		label.innerHTML = "Exportar documento";
		spinner.classList.add("d-none");
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `Disco de irradiación solar`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	})
	.catch(k => {
		console.error(k);
	});
}
function hideElements(){
	if(document.getElementsByTagName("main")[0].style.display!=="none"){
		document.getElementsByTagName("main")[0].style.display = "none";
		document.getElementById("results").classList.remove("hidden");
		document.getElementById("results").classList.add("flex");
	} else {
		document.getElementsByTagName("main")[0].style.removeProperty("display");
		document.getElementById("results").classList.add("hidden");
		document.getElementById("results").classList.remove("flex");
	}
}