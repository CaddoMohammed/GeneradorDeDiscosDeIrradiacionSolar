(function (global) {
	"use strict";
	var PolarContour = {};
	PolarContour["colorscales"] = {
		"viridis": ["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"],
		"plasma": ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
		"inferno": ["#000004", "#1b0c41", "#4a0c6b", "#781c6d", "#a52c60", "#cf4446", "#ed6925", "#fb9b06", "#f7d13d", "#fcffa4"],
		"jet": ["#00007f", "#0000ff", "#007fff", "#00ffff", "#7fff7f", "#ffff00", "#ff7f00", "#ff0000", "#7f0000"],
		"hot": ["#000000", "#5a0000", "#8b0000", "#cd2626", "#ff4500", "#ff8c00", "#ffd700", "#ffff00", "#ffffff"],
		"rainbow": ["#96005a", "#0000c8", "#0019ff", "#0098ff", "#2cff96", "#97ff00", "#ffea00", "#ff6f00", "#ff0000"]
	};
	function interpolateColor(color1, color2, t) {
		var r1 = parseInt(color1.slice(1, 3), 16);
		var g1 = parseInt(color1.slice(3, 5), 16);
		var b1 = parseInt(color1.slice(5, 7), 16);
		var r2 = parseInt(color2.slice(1, 3), 16);
		var g2 = parseInt(color2.slice(3, 5), 16);
		var b2 = parseInt(color2.slice(5, 7), 16);
		var r = Math.round(r1 + (r2 - r1) * t);
		var g = Math.round(g1 + (g2 - g1) * t);
		var b = Math.round(b1 + (b2 - b1) * t);
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	function getColorAtValue(colors, value) {
		var v = Math.max(0, Math.min(1, value));
		var idx = v * (colors.length - 1);
		var i = Math.floor(idx);
		var t = idx - i;
		if (i >= colors.length - 1) return colors[colors.length - 1];
		return interpolateColor(colors[i], colors[i + 1], t);
	}
	function createColorscale(colors) {
		var scale = [];
		for (var i = 0; i < colors.length; i++) {
			scale.push([i / (colors.length - 1), colors[i]]);
		}
		return scale;
	}
	function extractContourPaths(z, level, wrapJ) {
		var m = z.length;
		var n = z[0].length;
		var segments = [];
		var jLimit = wrapJ ? n : n - 1;
		for (var i = 0; i < m - 1; i++) {
			for (var j = 0; j < jLimit; j++) {
				var jNext = wrapJ ? (j + 1) % n : j + 1;
				var z00 = z[i][j], z10 = z[i + 1][j], z01 = z[i][jNext], z11 = z[i + 1][jNext];
				var idx = 0;
				if (z00 >= level) idx |= 1;
				if (z10 >= level) idx |= 2;
				if (z01 >= level) idx |= 4;
				if (z11 >= level) idx |= 8;
				if (idx === 0 || idx === 15) continue;
				var pts = {};
				if ((z00 >= level) !== (z10 >= level)) pts.bottom = [i + (level - z00) / (z10 - z00), j];
				if ((z01 >= level) !== (z11 >= level)) pts.top = [i + (level - z01) / (z11 - z01), jNext];
				if ((z00 >= level) !== (z01 >= level)) {
					var fracL = (level - z00) / (z01 - z00);
					pts.left = [i, wrapJ && j === n - 1 ? (fracL < 0.5 ? j + fracL : jNext - (1 - fracL)) : j + fracL];
				}
				if ((z10 >= level) !== (z11 >= level)) {
					var fracR = (level - z10) / (z11 - z10);
					pts.right = [i + 1, wrapJ && j === n - 1 ? (fracR < 0.5 ? j + fracR : jNext - (1 - fracR)) : j + fracR];
				}
				var keys = Object.keys(pts);
				if (keys.length === 2) {
					segments.push([pts[keys[0]], pts[keys[1]]]);
				} else if (keys.length === 4) {
					var avg = (z00 + z10 + z01 + z11) / 4;
					if (avg >= level) {
						segments.push([pts.bottom, pts.left]);
						segments.push([pts.top, pts.right]);
					} else {
						segments.push([pts.bottom, pts.right]);
						segments.push([pts.top, pts.left]);
					}
				}
			}
		}
		return connectSegments(segments);
	}
	function connectSegments(segments) {
		var paths = [], used = new Array(segments.length).fill(false);
		var tol = 0.001;
		function close(p1, p2) {
			return Math.abs(p1[0] - p2[0]) < tol && Math.abs(p1[1] - p2[1]) < tol;
		}
		for (var s = 0; s < segments.length; s++) {
			if (used[s]) continue;
			var path = [segments[s][0], segments[s][1]];
			used[s] = true;
			var changed = true;
			while (changed) {
				changed = false;
				for (var k = 0; k < segments.length; k++) {
					if (used[k]) continue;
					var seg = segments[k];
					if (close(seg[0], path[path.length - 1])) { path.push(seg[1]); used[k] = true; changed = true; }
					else if (close(seg[1], path[path.length - 1])) { path.push(seg[0]); used[k] = true; changed = true; }
					else if (close(seg[0], path[0])) { path.unshift(seg[1]); used[k] = true; changed = true; }
					else if (close(seg[1], path[0])) { path.unshift(seg[0]); used[k] = true; changed = true; }
				}
			}
			if (path.length >= 3) paths.push(path);
		}
		return paths;
	}
	function smoothPath(pts) {
		if (pts.length < 4) return pts;
		var result = [];
		var n = pts.length;
		var closed = Math.abs(pts[0][0] - pts[n - 1][0]) < 0.01 && Math.abs(pts[0][1] - pts[n - 1][1]) < 0.01;
		for (var i = 0; i < n - 1; i++) {
			var p0 = pts[i === 0 ? (closed ? n - 2 : 0) : i - 1];
			var p1 = pts[i];
			var p2 = pts[i + 1];
			var p3 = pts[i + 2 >= n ? (closed ? (i + 2) % n : n - 1) : i + 2];
			for (var t = 0; t <= 1; t += 0.1) {
				var t2 = t * t, t3 = t2 * t;
				var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
				var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
				result.push([x, y]);
			}
		}
		if (closed && result.length > 0) result.push(result[0].slice());
		return result;
	}
	function gridToCartesian(gridPath, rArray, thetaArray, maxR, rotate) {
		var cartPath = [];
		var nR = rArray.length, nTheta = thetaArray.length;
		for (var i = 0; i < gridPath.length; i++) {
			var ri = gridPath[i][0], ti = gridPath[i][1];
			var ri0 = Math.max(0, Math.floor(ri)), ri1 = Math.min(ri0 + 1, nR - 1);
			var rFrac = ri - ri0;
			var rVal = (rArray[ri0] * (1 - rFrac) + rArray[ri1] * rFrac) / maxR;
			var ti0 = ((Math.floor(ti) % nTheta) + nTheta) % nTheta;
			var ti1 = ((ti0 + 1) % nTheta);
			var tFrac = ti - Math.floor(ti);
			var t0 = thetaArray[ti0], t1 = thetaArray[ti1];
			if (Math.abs(t1 - t0) > 180) { if (t0 < t1) t0 += 360; else t1 += 360; }
			var tVal = t0 * (1 - tFrac) + t1 * tFrac + 90 + rotate;
			var tRad = tVal * Math.PI / 180;
			cartPath.push([rVal * Math.cos(tRad), rVal * Math.sin(tRad)]);
		}
		return cartPath;
	}
	function transpose(src, nR, nTheta) {
		var z = [];
		for (var i = 0; i < nR; i++) {
			z[i] = [];
			for (var j = 0; j < nTheta; j++) {
				z[i][j] = src[j][i];
			}
		}
		return z;
	}
	function linspace(start, end, n) {
		var arr = [], step = (end - start) / (n - 1);
		for (var i = 0; i < n; i++) arr.push(start + i * step);
		return arr;
	}
	function parseData(data, moduleName, thetaStart, thetaEnd, rStart, rEnd) {
		var theta, r, nTheta, nR, z;
		if (data && !Array.isArray(data) && data.r && data.theta && data.z) {
			if (!Array.isArray(data.z) || !Array.isArray(data.z[0])) {
				throw new Error(moduleName + ": data.z debe ser un arreglo de arreglos (matriz 2D).");
			}
			if (data.z.length !== data.theta.length) {
				throw new Error(moduleName + ": data.z.length (" + data.z.length + ") debe ser igual a data.theta.length (" + data.theta.length + ").");
			}
			for (var vi = 0; vi < data.z.length; vi++) {
				if (data.z[vi].length !== data.r.length) {
					throw new Error(moduleName + ": data.z[" + vi + "].length (" + data.z[vi].length + ") debe ser igual a data.r.length (" + data.r.length + ").");
				}
			}
			theta = data.theta.slice();
			r = data.r.slice();
			nTheta = theta.length;
			nR = r.length;
			rEnd = Math.max.apply(null, r);
			z = transpose(data.z, nR, nTheta);
		} else {
			nTheta = data.length;
			nR = data[0].length;
			if (thetaEnd - thetaStart === 360 && nTheta > 2) {
				var dataWraps = true;
				for (var ci = 0; ci < nR && dataWraps; ci++) {
					if (Math.abs(data[0][ci] - data[nTheta - 1][ci]) > 1e-10) {
						dataWraps = false;
					}
				}
				if (dataWraps) {
					theta = linspace(thetaStart, thetaEnd, nTheta);
				} else {
					theta = linspace(thetaStart, thetaEnd, nTheta + 1);
					theta.pop();
				}
			} else {
				theta = linspace(thetaStart, thetaEnd, nTheta);
			}
			r = linspace(rStart, rEnd, nR);
			z = transpose(data, nR, nTheta);
		}
		return { theta: theta, r: r, z: z, nTheta: nTheta, nR: nR, rEnd: rEnd };
	}
	PolarContour.plot = function (containerId, data, options) {
		options = options || {};
		var colorscale = options.colorscale || "custom";
		var rotate = options.rotate || 0;
		var title = options.title || "";
		var showColorbar = options.showColorbar !== false;
		var showGrid = options.showGrid !== false;
		var showLabels = options.showLabels !== false;
		var lineWidth = options.lineWidth || 0.8;
		var fillContours = options.fillContours !== false;
		var dark = !!options.darkMode;
		var colorbarTitle = options.colorbarTitle || "Valor Z";
		var rLabelsOpt = options.rLabels || null;
		var thetaLabelsOpt = options.thetaLabels || null;
		var rLabel = options.rLabel || "r";
		var thetaLabelStr = options.thetaLabel || "\u03b8";
		var zLabelStr = options.zLabel || "z";
		var theme = dark ? {
			paper: "transparent",
			plot: "transparent",
			grid: "rgba(255,255,255,0.2)",
			contourLine: "rgba(255,255,255,0.25)",
			title: "#e2e8f0",
			label: "#94a3b8",
			colorbarText: "#cbd5e1"
		} : {
			paper: "#fff",
			plot: "#fafafa",
			grid: "rgba(50,50,50,0.4)",
			contourLine: "rgba(0,0,0,0.4)",
			title: "#333",
			label: "#444",
			colorbarText: "#333"
		};
		var colors;
		if (Array.isArray(colorscale)) {
			colors = colorscale;
		} else if (typeof colorscale === "string") {
			colors = PolarContour.colorscales[colorscale] || PolarContour.colorscales.custom;
		} else {
			colors = PolarContour.colorscales.custom;
		}
		var parsed = parseData(data, "PolarContour",
			options.thetaStart || 0, options.thetaEnd || 360,
			options.rStart || 0, options.rEnd || 90);
		var nTheta = parsed.nTheta, nR = parsed.nR;
		var theta = parsed.theta, r = parsed.r, z = parsed.z;
		var rEnd = parsed.rEnd;
		var zMin = Infinity, zMax = -Infinity;
		for (var i = 0; i < z.length; i++) {
			for (var j = 0; j < z[i].length; j++) {
				if (z[i][j] < zMin) zMin = z[i][j];
				if (z[i][j] > zMax) zMax = z[i][j];
			}
		}
		var thetaRange = theta[theta.length - 1] - theta[0];
		var thetaStepAvg = thetaRange / (nTheta - 1);
		var wrapJ = Math.abs(thetaRange + thetaStepAvg - 360) < thetaStepAvg * 0.5;
		var paddingRow = [];
		for (j = 0; j < nTheta; j++) {
			paddingRow.push(zMin - 1);
		}
		z.push(paddingRow);
		r.push(rEnd * 1.05);

		var traces = [];
		var numLevels = colors.length;
		var levelStep = (zMax - zMin) / numLevels;
		var levels = [];
		for (var k = 0; k <= numLevels; k++) {
			levels.push(zMin + k * levelStep);
		}
		if (fillContours) {
			var baseCircle = [];
			for (var a = 0; a <= 360; a += 2) {
				var aRad = a * Math.PI / 180;
				baseCircle.push([Math.cos(aRad), Math.sin(aRad)]);
			}
			traces.push({
				type: "scatter",
				mode: "none",
				x: baseCircle.map(function (pt) { return pt[0]; }),
				y: baseCircle.map(function (pt) { return pt[1]; }),
				fill: "toself",
				fillcolor: colors[0],
				line: { width: 0 },
				hoverinfo: "text",
				text: "z < " + levels[1].toFixed(4),
				hoverlabel: { bgcolor: colors[0], font: { color: "#fff" } },
				showlegend: false
			});
			for (k = 1; k < numLevels; k++) {
				var level = levels[k];
				var color = colors[k];
				var contourPaths = extractContourPaths(z, level, wrapJ);
				for (var p = 0; p < contourPaths.length; p++) {
					var gridPath = contourPaths[p];
					var cartPath = gridToCartesian(gridPath, r, theta, rEnd, rotate);
					var smoothed = smoothPath(cartPath);
					if (smoothed.length < 3) continue;
					var allOutside = true;
					var sxMin = Infinity, sxMax = -Infinity, syMin = Infinity, syMax = -Infinity;
					for (var si = 0; si < smoothed.length; si++) {
						var sr = Math.sqrt(smoothed[si][0] * smoothed[si][0] + smoothed[si][1] * smoothed[si][1]);
						if (sr > 1.0) {
							smoothed[si][0] /= sr;
							smoothed[si][1] /= sr;
						}
						if (sr < 0.98) allOutside = false;
						if (smoothed[si][0] < sxMin) sxMin = smoothed[si][0];
						if (smoothed[si][0] > sxMax) sxMax = smoothed[si][0];
						if (smoothed[si][1] < syMin) syMin = smoothed[si][1];
						if (smoothed[si][1] > syMax) syMax = smoothed[si][1];
					}
					if (allOutside) continue;
					if (Math.min(sxMax - sxMin, syMax - syMin) < 0.015) continue;
					smoothed.push(smoothed[0].slice());
					traces.push({
						type: "scatter",
						mode: "none",
						x: smoothed.map(function (pt) { return pt[0]; }),
						y: smoothed.map(function (pt) { return pt[1]; }),
						fill: "toself",
						fillcolor: color,
						line: { width: 0 },
						hoverinfo: "text",
						text: "z ≥ " + level.toFixed(4),
						hoverlabel: { bgcolor: color, font: { color: "#fff" } },
						showlegend: false
					});
				}
			}
		}
		for (k = 1; k < numLevels; k++) {
			var level = levels[k];
			var contourPaths = extractContourPaths(z, level, wrapJ);
			for (var p = 0; p < contourPaths.length; p++) {
				var gridPath = contourPaths[p];
				var cartPath = gridToCartesian(gridPath, r, theta, rEnd, rotate);
				var smoothed = smoothPath(cartPath);
				if (smoothed.length < 2) continue;
				var allOutsideL = true;
				var lxMin = Infinity, lxMax = -Infinity, lyMin = Infinity, lyMax = -Infinity;
				for (var li = 0; li < smoothed.length; li++) {
					var lr = Math.sqrt(smoothed[li][0] * smoothed[li][0] + smoothed[li][1] * smoothed[li][1]);
					if (lr > 1.0) {
						smoothed[li][0] /= lr;
						smoothed[li][1] /= lr;
					}
					if (lr < 0.98) allOutsideL = false;
					if (smoothed[li][0] < lxMin) lxMin = smoothed[li][0];
					if (smoothed[li][0] > lxMax) lxMax = smoothed[li][0];
					if (smoothed[li][1] < lyMin) lyMin = smoothed[li][1];
					if (smoothed[li][1] > lyMax) lyMax = smoothed[li][1];
				}
				if (allOutsideL) continue;
				if (Math.min(lxMax - lxMin, lyMax - lyMin) < 0.015) continue;
				traces.push({
					type: "scatter",
					mode: "lines",
					x: smoothed.map(function (pt) { return pt[0]; }),
					y: smoothed.map(function (pt) { return pt[1]; }),
					line: {
						color: theme.contourLine,
						width: lineWidth,
						shape: "spline",
						smoothing: 1.3
					},
					hoverinfo: "text",
					text: "z = " + level.toFixed(3),
					showlegend: false
				});
			}
		}
		var hoverX = [], hoverY = [], hoverText = [];
		for (i = 0; i < nR; i++) {
			for (j = 0; j < nTheta; j++) {
				var rVal = r[i];
				var thetaVal = theta[j];
				var zVal = z[i][j];
				var tAngle = thetaVal + 90 + rotate;
				var tRad = tAngle * Math.PI / 180;
				var rNorm = rVal / rEnd;
				hoverX.push(rNorm * Math.cos(tRad));
				hoverY.push(rNorm * Math.sin(tRad));
				hoverText.push(rLabel + " = " + rVal.toFixed(2) + "<br>" + thetaLabelStr + " = " + thetaVal.toFixed(2) + "\u00b0<br>" + zLabelStr + " = " + zVal.toFixed(4));
			}
		}
		traces.push({
			type: "scatter",
			mode: "markers",
			x: hoverX,
			y: hoverY,
			marker: { size: 8, opacity: 0 },
			hoverinfo: "text",
			text: hoverText,
			hoverlabel: { bgcolor: "rgba(0,0,0,0.8)", font: { color: "#fff" } },
			showlegend: false
		});
		if (showGrid) {
			var circleAngles = [];
			for (var a = 0; a <= 360; a += 2) {
				circleAngles.push(a * Math.PI / 180);
			}

			var gridRadii = [0.25, 0.5, 0.75, 1.0];
			gridRadii.forEach(function (radius, idx) {
				traces.push({
					type: "scatter",
					mode: "lines",
					x: circleAngles.map(function (a) { return radius * Math.cos(a); }),
					y: circleAngles.map(function (a) { return radius * Math.sin(a); }),
					line: { color: theme.grid, width: 1, dash: "dot" },
					hoverinfo: "skip",
					showlegend: false
				});
			});

			for (var angle = 0; angle < 360; angle += 30) {
				var rad = angle * Math.PI / 180;
				traces.push({
					type: "scatter",
					mode: "lines",
					x: [0, Math.cos(rad)],
					y: [0, Math.sin(rad)],
					line: { color: theme.grid, width: 1, dash: "dot" },
					hoverinfo: "skip",
					showlegend: false
				});
			}
		}
		if (showColorbar) {
			traces.push({
				type: "scatter",
				mode: "markers",
				x: [null],
				y: [null],
				marker: {
					color: [zMin, zMax],
					colorscale: createColorscale(colors),
					cmin: zMin,
					cmax: zMax,
					showscale: true,
					colorbar: {
						title: { text: colorbarTitle || zLabelStr, side: "right", font: { color: theme.colorbarText } },
						thickness: 20,
						len: 0.75,
						x: 1.02,
						tickformat: ".2f",
						tickfont: { color: theme.colorbarText }
					}
				},
				hoverinfo: "skip",
				showlegend: false
			});
		}
		var annotations = [];
		if (showLabels) {
			var defaultAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
			annotations = defaultAngles.map(function (angle, idx) {
				var rad = angle * Math.PI / 180;
				return {
					x: 1.12 * Math.cos(rad),
					y: 1.12 * Math.sin(rad),
					text: thetaLabelsOpt ? thetaLabelsOpt[idx] : angle + "\u00b0",
					showarrow: false,
					font: { size: 11, color: theme.label }
				};
			});
			if (rLabelsOpt && showGrid) {
				var gridRadiiLabels = [0.25, 0.5, 0.75, 1.0];
				for (var ri = 0; ri < gridRadiiLabels.length && ri < rLabelsOpt.length; ri++) {
					annotations.push({
						"x":0,
						"y":gridRadiiLabels[ri]+0.04,
						"text":rLabelsOpt[ri],
						"showarrow":false,
						"font":{"size":9,"color":theme["label"]}
					});
				}
			}
		}
		var layout = {
			"title":{"text":"<b>"+title+"</b>","font":{"size":18,"color":theme["title"]}},
			"xaxis":{
				"scaleanchor":"y",
				"scaleratio":1,
				"showgrid":false,
				"zeroline":false,
				"showticklabels":false,
				"range":[-1.3,1.3]
			},
			"yaxis":{
				"showgrid":false,
				"zeroline":false,
				"showticklabels":false,
				"range":[-1.3,1.3]
			},
			"annotations":annotations,
			"margin":{"t":60,"r":100,"b":40,"l":40},
			"paper_bgcolor":theme["paper"],
			"plot_bgcolor":theme["plot"]
		}
		Plotly.newPlot(containerId,traces,layout,{"responsive":true});
	}
	global.PolarContour = PolarContour;
})(typeof window!=="undefined"?window:this);
