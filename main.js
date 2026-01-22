const Inputs = [document.getElementById("latitud"),document.getElementById("longitud")];
const Descriptors = [Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set,Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").get];
const ErrorInputs = [document.getElementById("error-latitud"),document.getElementById("error-longitud")];
const Mapa = L.map("map",{"center":[14.084657,-87.165792],"zoom":7,"minZoom":3,"maxZoom":18,"zoomControl":false,"attributionControl":false});
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{"attribution":`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`}).addTo(Mapa);
new L.Control.MiniMap(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{"maxZoom":15}),{"toggleDisplay":true,"minimized":false}).addTo(Mapa);
new L.Control.Zoom({"position":"topleft"}).addTo(Mapa);
Mapa.setMaxBounds(L.latLngBounds(L.latLng(90,-180),L.latLng(-90,180)));
L.control.resetView({"position":"topleft","title":"Reset view","latlng":L.latLng([14.084657,-87.165792]),"zoom":7}).addTo(Mapa);
L.control.scale().addTo(Mapa);
let error=[false,false],timer=null;
Object.defineProperty(HTMLInputElement.prototype,"value",{
	set:function(newValue){
		Descriptors[0].call(this,newValue);
		validation(this["id"]);
	},
	get:function(){
		return Descriptors[1].call(this);
	},
	"configurable":true,
	"enumerable":true
});
for(let i=0;i<Inputs["length"];i++){
	Inputs[i]["value"] = "";
	Inputs[i].addEventListener("input",() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			validation(Inputs[i]["id"]);
			if((error[0]===false)&&(error[1]===false)){
				LeafletSetLocation(Mapa,Inputs);
			}
		},500);
	});
}
let locale = {"moduleType":"locale","name":"es","dictionary":{"Autoscale":"Autoescalar","Box Select":"Seleccionar Caja","Click to enter Colorscale title":"Introducir el t\xedtulo de la Escala de Color","Click to enter Component A title":"Introducir el t\xedtulo del Componente A","Click to enter Component B title":"Introducir el t\xedtulo del Componente B","Click to enter Component accordion title":"Introducir el t\xedtulo del Componente C","Click to enter Plot title":"Introducir el t\xedtulo de la Gr\xe1fica","Click to enter X axis title":"Introducir el t\xedtulo del eje X","Click to enter Y axis title":"Introducir el t\xedtulo del eje Y","Click to enter radial axis title":"Introducir el t\xedtulo del eje radial","Compare data on hover":"Comparar datos al pasar por encima","Double-click on legend to isolate one trace":"Haga doble-clic en la leyenda para aislar una traza","Double-click to zoom back out":"Haga doble-clic para restaurar la escala","Download plot as a png":"Descargar gr\xe1fico como png","Download plot":"Descargar gr\xe1fico","Edit in Chart Studio":"Editar en Chart Studio","IE only supports svg. Changing format to svg.":"IE solo soporta svg. Cambiando formato a svg.","Lasso Select":"Seleccionar con lazo","Orbital rotation":"Rotaci\xf3n esf\xe9rica","Pan":"Desplazarse","Produced with Plotly.js":"Hecho con Plotly.js","Reset":"Reiniciar","Reset axes":"Reiniciar ejes","Reset camera to default":"Restaurar c\xe1mara predeterminada","Reset camera to last save":"Restaurar anterior c\xe1mara","Reset view":"Restaurar vista","Reset views":"Restaurar vistas","Show closest data on hover":"Mostrar el dato m\xe1s cercano al pasar por encima","Snapshot succeeded":"Gr\xe1fico guardado correctamente","Sorry, there was a problem downloading your snapshot!":"\xa1La descarga del gr\xe1fico fall\xf3!","Taking snapshot - this may take a few seconds":"Guardando gr\xe1fico - podr\xeda tardar unos segundos","Toggle Spike Lines":"Mostrar/Ocultar Gu\xedas","Toggle show closest data on hover":"Activar/Desactivar mostrar el dato m\xe1s cercano al pasar por encima","Turntable rotation":"Rotaci\xf3n plana","Zoom":"Modo Ampliar/Reducir","Zoom in":"Ampliar","Zoom out":"Reducir","close:":"cierre:","high:":"alza:","incoming flow count:":"flujo de entrada:","kde:":"edp:","lat:":"lat:","lon:":"lon:","low:":"baja:","lower fence:":"l\xedmite inferior:","max:":"m\xe1x:","mean \xb1 \u03c3:":"media \xb1 \u03c3:","mean:":"media:","median:":"mediana:","min:":"m\xedn:","new text":"nuevo texto","open:":"apertura:","outgoing flow count:":"flujo de salida:","q1:":"q1:","q3:":"q3:","source:":"fuente:","target:":"destino:","trace":"traza","upper fence:":"l\xedmite superior:"},"format":{"days":["Domingo","Lunes","Martes","Mi\xe9rcoles","Jueves","Viernes","S\xe1bado"],"shortDays":["Dom","Lun","Mar","Mi\xe9","Jue","Vie","S\xe1b"],"months":["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],"shortMonths":["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],"date":"%d/%m/%Y","decimal":".","thousands":","}};
typeof Plotly == "undefined"?(window["PlotlyLocales"]=window["PlotlyLocales"]||[],window["PlotlyLocales"].push(locale)):Plotly.register(locale);
Plotly.setPlotConfig({"locale":"es"});
LeafletLocationPicker(Mapa,Inputs);
let Datos,select=0;
window.addEventListener("load",() => {
	let a = localStorage.getItem("CaddoMohammed-DiscoDeIrradiacionSolar");
	if(a!==null){
		Datos = JSON.parse(a);
		Inputs[0]["value"] = Datos["coordenadas"][0];
		Inputs[1]["value"] = Datos["coordenadas"][1];
		LeafletSetLocation(Mapa,Datos["coordenadas"],true);
	}
});
document.getElementById("select-grafico").addEventListener("change",() => {
	select = Number(document.getElementById("select-grafico").value);
	Grafico();
});
function validation(x){
	let a = Inputs.findIndex(b => b["id"]===x);
	const Max=[90,180], Name=["latitud","longitud"];
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
	ErrorInputs[a]["innerHTML"] = "";
	if(Inputs[a]["value"].trim()===""){
		error[a] = true;
		return;
	}
}
async function Calcular(x){
	if((error[0]===true)||(error[1]===true)){
		return;
	}
	let labels = ["Modelo isotrópico","Modelo anisotrópico"];
	let z = {"lat":Number(Inputs[0]["value"]),"lng":Number(Inputs[1]["value"]),"modelo":x};
	if(Datos){
		if((Datos["coordenadas"][0]===z["lat"])&&(Datos["coordenadas"][1]===z["lng"])&&(Datos["modelo"]===x)){
			HideElements();
			select = 6;
			MostrarGrafico(1);
			return;
		}
	}
	try{
		document.getElementById(x==1?"btn-calcular-2":"btn-calcular-1").disabled = true;
		Loading(`calcular-${x}`,labels[x-1]);
		let a = await fetch(`https://discos-de-irradiacion-solar-server-252997894133.us-central1.run.app/generar`,{"method":"POST","headers":{"Content-Type":"application/json"},"body":JSON.stringify(z)});
		Loading(`calcular-${x}`,labels[x-1]);
		document.getElementById(x==1?"btn-calcular-2":"btn-calcular-1").disabled = false;
		if(!a["ok"]){
			throw new Error(`HTTP ${a.status}: ${errBody}`)
		}
		Datos = await a.json();
		HideElements();
		localStorage.setItem("CaddoMohammed-DiscoDeIrradiacionSolar",JSON.stringify(Datos));
		select = 6;
		MostrarGrafico(1);
	}
	catch(f){
		ErrorMessage("Error obteniendo respuesta del servidor, intente de nuevo en un rato");
	}
}
async function Exportar(){
	if(Datos===undefined){
		return;
	}
	try{
		document.getElementById("btn-regresar").disabled = true;
		Loading("exportar","Exportar documento");
		let a = await fetch("https://discos-de-irradiacion-solar-server-252997894133.us-central1.run.app/exportar-pdf",{"method":"POST","headers":{"Content-Type":"application/json"},"body":JSON.stringify(Datos)});
		if(!a["ok"]){
			Loading("exportar","Exportar documento");
			document.getElementById("btn-regresar").disabled = false;
			throw new Error(`HTTP ${a.status}: ${errBody}`)
		}
		const blob = await a.blob();
		const url = window["URL"].createObjectURL(blob);
		const b = document.createElement("a");
		b["href"] = url;
		b["target"] = "_blank";
		b["rel"] = "noopener noreferrer";
		b["download"] = "Disco de irradiación solar";
		document["body"].appendChild(b);
		Loading("exportar","Exportar documento");
		document.getElementById("btn-regresar").disabled = false;
		b.click();
		b.remove();
		window["URL"].revokeObjectURL(url);
	}
	catch(f){
		ErrorMessage("Error generando el documento PDF");
	}
}
function HideElements(){
	let a = document.getElementById("home");
	let b = document.getElementById("results");
	if(a["classList"].contains("flex")){
		a["classList"].remove("flex");
		a["classList"].add("hidden");
		b["classList"].add("flex");
		b["classList"].remove("hidden");
	} else {
		a["classList"].add("flex");
		a["classList"].remove("hidden");
		b["classList"].remove("flex");
		b["classList"].add("hidden");
	}
}
function ErrorMessage(y){
	document.getElementById("message-error")["innerHTML"] = y;
	OpenModal("error-modal");
}
function OpenModal(x){
	let a = document.getElementById(x);
	let b = function(e){
		if(e["target"]===e["currentTarget"]){
			OpenModal(x);
		}
	}
	if(a["classList"].contains("hidden")){
		a["classList"].remove("hidden");
		a["classList"].add("flex");
		a.addEventListener("click",(e) => b(e));
	} else {
		a["classList"].add("hidden");
		a["classList"].remove("flex");
		a.removeEventListener("click",(e) => b(e));
	}
}
function Loading(x,y){
	let spinner = document.getElementById(`spinner-${x}`);
	let label = document.getElementById(`label-${x}`);
	let btn = document.getElementById(`btn-${x}`);
	if(spinner["classList"].contains("hidden")){
		spinner["classList"].remove("hidden");
		btn["disabled"] = true;
		btn["classList"].remove("bg-blue-600","cursor-pointer");
		btn["classList"].add("bg-blue-800","cursor-not-allowed");
		label["innerHTML"] = "Cargando...";
	} else {
		label["innerHTML"] = y;
		spinner["classList"].add("hidden");
		btn["disabled"] = false;
		btn["classList"].add("bg-blue-600","cursor-pointer");
		btn["classList"].remove("bg-blue-800","cursor-not-allowed");
	}
}
function CrearDisco(){
	let z = {
		"x":[-1,-0.9722222222222222,-0.9444444444444444,-0.9166666666666666,-0.8888888888888888,-0.8611111111111112,-0.8333333333333334,-0.8055555555555556,-0.7777777777777778,-0.75,-0.7222222222222222,-0.6944444444444444,-0.6666666666666666,-0.6388888888888888,-0.6111111111111112,-0.5833333333333334,-0.5555555555555556,-0.5277777777777778,-0.5,-0.4722222222222222,-0.4444444444444444,-0.4166666666666667,-0.3888888888888889,-0.3611111111111111,-0.3333333333333333,-0.3055555555555556,-0.2777777777777778,-0.25,-0.2222222222222222,-0.19444444444444445,-0.16666666666666666,-0.1388888888888889,-0.1111111111111111,-0.08333333333333333,-0.05555555555555555,-0.027777777777777776,0,0.027777777777777776,0.05555555555555555,0.08333333333333333,0.1111111111111111,0.1388888888888889,0.16666666666666666,0.19444444444444445,0.2222222222222222,0.25,0.2777777777777778,0.3055555555555556,0.3333333333333333,0.3611111111111111,0.3888888888888889,0.4166666666666667,0.4444444444444444,0.4722222222222222,0.5,0.5277777777777778,0.5555555555555556,0.5833333333333334,0.6111111111111112,0.6388888888888888,0.6666666666666666,0.6944444444444444,0.7222222222222222,0.75,0.7777777777777778,0.8055555555555556,0.8333333333333334,0.8611111111111112,0.8888888888888888,0.9166666666666666,0.9444444444444444,0.9722222222222222,1],
		"y":[-1,-0.9722222222222222,-0.9444444444444444,-0.9166666666666666,-0.8888888888888888,-0.8611111111111112,-0.8333333333333334,-0.8055555555555556,-0.7777777777777778,-0.75,-0.7222222222222222,-0.6944444444444444,-0.6666666666666666,-0.6388888888888888,-0.6111111111111112,-0.5833333333333334,-0.5555555555555556,-0.5277777777777778,-0.5,-0.4722222222222222,-0.4444444444444444,-0.4166666666666667,-0.3888888888888889,-0.3611111111111111,-0.3333333333333333,-0.3055555555555556,-0.2777777777777778,-0.25,-0.2222222222222222,-0.19444444444444445,-0.16666666666666666,-0.1388888888888889,-0.1111111111111111,-0.08333333333333333,-0.05555555555555555,-0.027777777777777776,0,0.027777777777777776,0.05555555555555555,0.08333333333333333,0.1111111111111111,0.1388888888888889,0.16666666666666666,0.19444444444444445,0.2222222222222222,0.25,0.2777777777777778,0.3055555555555556,0.3333333333333333,0.3611111111111111,0.3888888888888889,0.4166666666666667,0.4444444444444444,0.4722222222222222,0.5,0.5277777777777778,0.5555555555555556,0.5833333333333334,0.6111111111111112,0.6388888888888888,0.6666666666666666,0.6944444444444444,0.7222222222222222,0.75,0.7777777777777778,0.8055555555555556,0.8333333333333334,0.8611111111111112,0.8888888888888888,0.9166666666666666,0.9444444444444444,0.9722222222222222,1],
		"z":[],
		"autocontour":true,
		"type":"contour",
		"colorscale":"Jet"
	}
	for(let i=0;i<73;i++){
		let row=[];
		for(let j=0;j<73;j++){
			let x_val=z["x"][i];
			let y_val=z["y"][j];
			let r_coord=Math.sqrt(Math.pow(x_val,2)+Math.pow(y_val,2));
			if(r_coord<=1){
				let theta_coord = Math.atan2(y_val,x_val)*(180/Math.PI);
				if(theta_coord<0){
					theta_coord = 360+theta_coord;
				}
				let r_idx=Math.round(r_coord*18);
				let theta_idx=Math.round(theta_coord/5);
				if(r_idx>18){
					r_idx = 18;
				}
				if(theta_idx>=73){
					theta_idx = 0;
				}
				if(Datos["Disco de irradiacion solar"][theta_idx]!==undefined){
					row.push(Datos["Disco de irradiacion solar"][theta_idx][r_idx]);
				} else {
					row.push(0);
				}
			} else {
				row.push(NaN);
			}
		}
		z["z"].push(row);
	}
	return z;
}
function MostrarGrafico(u){
	if(u===0){
		if(select>0){
			select = select-1;
		} else {
			select = 6;
		}
	} else {
		if(select<6){
			select = select+1;
		} else {
			select = 0;
		}	
	}
	document.getElementById("select-grafico").value = select;
	Grafico();
}
function Grafico(){
	let Title = document.getElementById("titulo");
	let x,y,z;
	y = {"margin":{"autoexpand":true},"yaxis":{"fixedrange":true},"xaxis":{"fixedrange":true}}
	z = {"displaylogo":false,"displayModeBar":true,"responsive":true,"modeBarButtonsToRemove":["autoScale2d","lasso2d","select2d","zoom2d","zoomIn2d","zoomOut2d","pan2d","resetScale2d"],"doubleClickDelay":300,"staticPlot":false,"showAxisRangeEntryBoxes":false,"showAxisDragHandles":false,"dragmode":false}
	switch(select){
		case 0:
			Title["innerHTML"] = "Disco de irradiación solar";
			x = CrearDisco();
			z["toImageButtonOptions"] = {"format":"png","filename":`Disco de irradiación solar, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":1300,"scale":10};
			break;
		case 1:
			Title["innerHTML"] = "Promedio mensual de irradiación descendente de onda corta";
			x = Datos["Promedios"][2];
			y["yaxis"] = {"title":{"text":"kWh/m<sup>2</sup>/dia"}};
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio mensual de irradiación descendente de onda corta, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":500,"scale":5};
			break;
		case 2:
			Title["innerHTML"] = "Promedio mensual de irradiacion difusa de onda corta";
			x = Datos["Promedios"][1];
			y["yaxis"] = {"title":{"text":"kWh/m<sup>2</sup>/dia"}};
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio mensual de irradiacion difusa de onda corta, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":500,"scale":5};
			break;
		case 3:
			Title["innerHTML"] = "Promedio mensual del ángulo de puesta del sol";
			x = Datos["Promedios"][5];
			y["yaxis"] = {"title":{"text":"grados"}};
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio mensual del ángulo de puesta del sol, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":500,"scale":5};
			break;
		case 4:
			Title["innerHTML"] = "Promedio mensual de irradiación UVA";
			x = Datos["Promedios"][3];
			y["yaxis"] = {"title":{"text":"kWh/m<sup>2</sup>/dia"}};
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio mensual de irradiación UVA, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":500,"scale":5};
			break;
		case 5:
			Title["innerHTML"] = "Promedio mensual del albedo en cielo";
			x = Datos["Promedios"][4];
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio mensual del albedo en cielo, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":500,"scale":5};
			break;
		case 6:
			Title["innerHTML"] = "Promedio de Índice de claridad de insolación";
			x = Datos["Promedios"][0];
			z["toImageButtonOptions"] = {"format":"png","filename":`Promedio de Índice de claridad de insolación, lat:${Datos["coordenadas"][0]}, lng:${Datos["coordenadas"][1]}`,"height":1080,"width":1300,"scale":2};
			break;
	}
	Plotly.newPlot("grafico",[x],y,z);
}