function LeafletLocationPicker(map,a,b,c){
	if(map===undefined){return};
	let inputs,fix,config,arrays=0,objects=0,int=0;
	if(a!==undefined){
		if(Array.isArray(a)){arrays=arrays+1;inputs=a};
		if(Number.isInteger(a)){int=int+1;fix=a};
		if((typeof(a)==="object")&&!Array.isArray(a)){objects=objects+1;config=a};
	}
	if(b!==undefined){
		if(Array.isArray(b)){arrays=arrays+1;inputs=b};
		if(Number.isInteger(b)){int=int+1;fix=b};
		if((typeof(b)==="object")&&!Array.isArray(b)){objects=objects+1;config=b};
	}
	if(c!==undefined){
		if(Array.isArray(c)){arrays=arrays+1;inputs=c};
		if(Number.isInteger(c)){int=int+1;fix=c};
		if((typeof(c)==="object")&&!Array.isArray(c)){objects=objects+1;config=c};
	}
	if(arrays>1){console.error("Invalid parameters: only 1 array [lat,lng] is allowed");return};
	if(int>1){console.error("Invalid parameters: only 1 integer for decimal precision is allowed");return};
	if(objects>1){console.error("Invalid parameters: only 1 object for configuration is allowed");return};
	if((inputs!==undefined)&&(inputs.length!==2)){console.error("expected an array of length 2");return};
	LeafletLocationPickerConfig(map,config);
	map.on('click',function(w){
		let coords = [w.latlng.lat,w.latlng.lng];
		if(fix!==undefined){
			coords = [w.latlng.lat.toFixed(fix),w.latlng.lng.toFixed(fix)];
		}
		for(let i=0;i<inputs.length;i++){
			let a = "";
			if(inputs[i] instanceof HTMLElement){a="innerHTML"};
			if(inputs[i] instanceof HTMLInputElement){a="value"};
			if(a===""){inputs[i] = coords[i]};
			if(a!==""){inputs[i][a] = coords[i]};
		}
		LeafletSetLocation(map,coords,false);
	});
}
function LeafletSetLocation(map,values,move){
	if((!Array.isArray(values))||values.length!==2){console.error("expected an array of length 2");return};
	let coordenadas=[undefined,undefined],name=["lat","lng"];
	for(let i=0;i<values.length;i++){
		let a = "";
		if(values[i] instanceof HTMLElement){a="innerHTML"};
		if(values[i] instanceof HTMLInputElement){a="value"};
		if(a===""){coordenadas[i] = values[i]};
		if(a!==""){coordenadas[i] = values[i][a]};
		if(isNaN(coordenadas[i])){console.error(`value for ${name[i]} is NaN`);return};
	}
	let x=map["LeafletLocationPicker"],label=map["LeafletLocationPicker"]["label"];
	if(x["marker"]){map.removeLayer(x["marker"])};
	if(label["title"]===""){
		x["marker"] = L.marker(coordenadas,{icon:L.divIcon({className:"",iconSize:[x["width"],x["height"]],iconAnchor:x["margin"],html:x.icon(x["color"],x["thickness"])})}).addTo(map);
	} else {
		x["marker"] = L.marker(coordenadas,{icon:L.divIcon({className:"",iconSize:[x["width"],x["height"]],iconAnchor:x["margin"],html:x.icon(x["color"],x["thickness"])})}).addTo(map).bindTooltip(label["title"],{permanent:label["always visible"],"direction":label["direction"]});
	}
	if((move===true)||(move===undefined)){map.setView(coordenadas,map.getZoom())};
}
function LeafletLocationPickerConfig(map,config){
	if(map["LeafletLocationPicker"]!==undefined){return};
	function SetConfig(x,y){
		for(let i in y){
			if(x[i]===undefined){continue};
			if(typeof(y[i])!=="object"){
				x[i] = y[i];
				continue;
			}
			if(Array.isArray(y[i])){
				x[i] = y[i];
				continue;
			}
			if(typeof(y[i])==="object"){
				SetConfig(x[i],y[i]);
				continue;
			}
		}
	}
	map["LeafletLocationPicker"] = {
		"label":{
			"always visible":false,
			"title":"",
			"position":"top"
		},
		"width":24,
		"height":24,
		"color":"#000000",
		"icon":function(color,thickness){
			if(isNaN(thickness)){
				console.error("expected a number for thickness");
				return;
			}
			let icon =
				`<div style="display:flex; flex-direction:column; width:100%; height:100%; align-items:center; justify-content:start;">
					<div style="width:${thickness}%; height:${50-thickness/2}%; background-color:${color}; margin:0 auto;"></div>
					<div style="width:100%; height:${thickness}%; background-color:${color};"></div>
					<div style="width:${thickness}%; height:${50-thickness}%; background-color:${color}; margin:0 auto;"></div>
				</div>`;
			return icon;
		},
		"margin":[12,12],
		"thickness":8
	}
	SetConfig(map["LeafletLocationPicker"],config);
}