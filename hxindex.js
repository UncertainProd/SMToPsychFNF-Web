(function ($global) { "use strict";
var HxOverrides = function() { };
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
HxOverrides.now = function() {
	return Date.now();
};
var SMChart = function(chartstr) {
	chartstr = SMUtils.cleanChart(StringTools.trim(chartstr));
	var chartdatasections = chartstr.split(":");
	var arr = StringTools.trim(chartdatasections[0]).split("\n");
	this.chartType = arr[arr.length - 1];
	var arr = StringTools.trim(chartdatasections[1]).split("\n");
	this.author = arr[arr.length - 1];
	var arr = StringTools.trim(chartdatasections[2]).split("\n");
	this.difficulty = arr[arr.length - 1];
	var arr = StringTools.trim(chartdatasections[3]).split("\n");
	this.numericalMeter = arr[arr.length - 1];
	var arr = StringTools.trim(chartdatasections[4]).split("\n");
	this.grooveRadarVal = arr[arr.length - 1];
	var note_data = chartdatasections[chartdatasections.length - 1];
	var _g = [];
	var _g1 = 0;
	var _g2 = note_data.split(",");
	while(_g1 < _g2.length) {
		var x = _g2[_g1];
		++_g1;
		_g.push(StringTools.trim(x));
	}
	this.measures = _g;
	this.n_keys = StringTools.trim(this.measures[0]).split("\n")[0].length;
};
SMChart._cleanMetadata = function(str) {
	var arr = StringTools.trim(str).split("\n");
	return arr[arr.length - 1];
};
SMChart.prototype = {
	toFNF: function(bpmmap,offset,flipChart) {
		if(flipChart == null) {
			flipChart = false;
		}
		if(offset == null) {
			offset = 0.0;
		}
		var sections = [];
		var holdtracker = new haxe_ds_IntMap();
		var strumtime = 0.0;
		var beatnum = 0.0;
		var curbpm = SMUtils.bpmFromMap(bpmmap,beatnum);
		var change_bpm = false;
		var bfsection = flipChart;
		if(bfsection == null) {
			bfsection = false;
		}
		sections.push({ sectionNotes : [], sectionBeats : 4, typeOfSection : 0, mustHitSection : bfsection, gfSection : false, bpm : curbpm, changeBPM : change_bpm, altAnim : false});
		var _g = 0;
		var _g1 = this.measures;
		while(_g < _g1.length) {
			var measure = _g1[_g];
			++_g;
			var measure_rows = StringTools.trim(measure).split("\n");
			var _g2 = 0;
			while(_g2 < measure_rows.length) {
				var row = measure_rows[_g2];
				++_g2;
				var latestSection = sections[sections.length - 1];
				latestSection.bpm = curbpm;
				var _g3 = 0;
				var _g4 = row.length;
				while(_g3 < _g4) {
					var columnIndex = _g3++;
					var notevalue = row.charAt(columnIndex);
					switch(notevalue) {
					case "1":
						latestSection.sectionNotes.push([(strumtime - offset) * 1000,columnIndex,0.0]);
						break;
					case "3":
						var holdhead = holdtracker.h[columnIndex];
						if(holdhead != null) {
							holdhead.push((strumtime - offset) * 1000 - holdhead[0]);
							holdtracker.remove(columnIndex);
						} else {
							console.log("SMChart.hx:72:","[ERROR] Encountered tail " + notevalue + " with no head!");
						}
						break;
					case "2":case "4":
						latestSection.sectionNotes.push([(strumtime - offset) * 1000,columnIndex]);
						holdtracker.h[columnIndex] = latestSection.sectionNotes[latestSection.sectionNotes.length - 1];
						break;
					}
				}
				var beatsperrow = 4 / StringTools.trim(measure).split("\n").length;
				beatnum += beatsperrow;
				var nextbpm = SMUtils.bpmFromMap(bpmmap,beatnum);
				if(nextbpm != curbpm) {
					change_bpm = true;
					var bfsection = flipChart;
					if(bfsection == null) {
						bfsection = false;
					}
					sections.push({ sectionNotes : [], sectionBeats : 4, typeOfSection : 0, mustHitSection : bfsection, gfSection : false, bpm : nextbpm, changeBPM : change_bpm, altAnim : false});
				} else {
					change_bpm = false;
				}
				strumtime = beatnum * 60 / curbpm;
				curbpm = nextbpm;
			}
		}
		return sections;
	}
	,toString: function() {
		return "" + this.chartType + " - " + this.difficulty + " - " + this.numericalMeter + " by " + this.author + " (" + this.n_keys + "k chart)";
	}
};
var SMFile = function(filecontent) {
	this.bpms = [];
	this.charts = [];
	this.extraHeaderTags = new haxe_ds_StringMap();
	this._parseChart(filecontent);
};
SMFile.getOrDefault = function(val,defaultVal) {
	if(val == null) {
		return defaultVal;
	}
	return val;
};
SMFile.prototype = {
	_parseChart: function(chartstr) {
		var currHeaderEntry = "";
		var parsingTag = false;
		var _g = 0;
		var _g1 = chartstr.length;
		while(_g < _g1) {
			var i = _g++;
			var ch = chartstr.charAt(i);
			switch(ch) {
			case "#":
				parsingTag = true;
				break;
			case ";":
				parsingTag = false;
				var parsedentry = SMUtils.parseEntry(currHeaderEntry);
				if(!parsedentry.shouldParse) {
					currHeaderEntry = "";
					continue;
				}
				var _g2 = parsedentry.tag;
				if(_g2 == null) {
					this.extraHeaderTags.h[parsedentry.tag] = parsedentry.value;
				} else {
					switch(_g2) {
					case "BPMS":
						this.bpms = SMUtils.parseBPMStr(parsedentry.value);
						break;
					case "NOTES":
						this.charts.push(new SMChart(parsedentry.value));
						break;
					case "OFFSET":
						this.chartOffset = parseFloat(parsedentry.value);
						break;
					case "TITLE":
						this.title = parsedentry.value;
						break;
					default:
						this.extraHeaderTags.h[parsedentry.tag] = parsedentry.value;
					}
				}
				currHeaderEntry = "";
				break;
			default:
				if(parsingTag) {
					currHeaderEntry += ch;
				}
			}
		}
	}
	,makeFNFChart: function(chartIndex,song_config,flipchart) {
		if(flipchart == null) {
			flipchart = false;
		}
		if(chartIndex == null) {
			chartIndex = 0;
		}
		if(song_config == null) {
			song_config = { };
		}
		var val = song_config.song;
		var val1 = song_config.speed;
		var val2 = song_config.player1;
		var val3 = song_config.player2;
		var val4 = song_config.gfVersion;
		var fnfjson = { song : val == null ? this.extraHeaderTags.h["TITLE"] : val, notes : [], events : [], bpm : this.bpms[0][1], needsVoices : false, speed : val1 == null ? 1.0 : val1, player1 : val2 == null ? "bf" : val2, player2 : val3 == null ? "dad" : val3, gfVersion : val4 == null ? "gf" : val4, stage : "", validScore : true};
		var fnfchart = this.charts[chartIndex].toFNF(this.bpms,this.chartOffset,flipchart);
		fnfjson.notes = fnfjson.notes.concat(fnfchart);
		return { song : fnfjson};
	}
};
var SMUtils = function() { };
SMUtils.parseBPMStr = function(bpmstr) {
	var bpmmap = [];
	bpmstr = StringTools.trim(bpmstr);
	var bpmpairs = bpmstr.split(",");
	var _g = 0;
	while(_g < bpmpairs.length) {
		var pair = bpmpairs[_g];
		++_g;
		var splitpar = pair.split("=");
		bpmmap.push([parseFloat(splitpar[0]),parseFloat(splitpar[1])]);
	}
	bpmmap.sort(function(a,b) {
		if(a[0] > b[0]) {
			return 1;
		} else if(a[0] < b[0]) {
			return -1;
		} else {
			return 0;
		}
	});
	return bpmmap;
};
SMUtils.parseEntry = function(entry) {
	var pair = StringTools.trim(entry).split(":");
	var tag = pair[0];
	if(SMUtils.TAGS_TO_INCLUDE.indexOf(tag) == -1) {
		return { shouldParse : false, tag : tag};
	}
	var value;
	if(pair.length > 2) {
		value = pair.slice(1).join(":");
	} else {
		value = pair[1];
	}
	if(StringTools.endsWith(value,";")) {
		value = value.substring(0,value.length - 1);
	}
	return { shouldParse : true, tag : tag, value : value};
};
SMUtils.getBeatsPerRow = function(measure) {
	return 4 / StringTools.trim(measure).split("\n").length;
};
SMUtils.bpmFromMap = function(bpmmap,beatn) {
	var _g = 0;
	var _g1 = bpmmap.length;
	while(_g < _g1) {
		var i = _g++;
		if(bpmmap[i][0] > beatn) {
			return bpmmap[i - 1][1];
		}
	}
	return bpmmap[bpmmap.length - 1][1];
};
SMUtils.makeSwagSection = function(bpm,changebpm,bfsection) {
	if(bfsection == null) {
		bfsection = false;
	}
	return { sectionNotes : [], sectionBeats : 4, typeOfSection : 0, mustHitSection : bfsection, gfSection : false, bpm : bpm, changeBPM : changebpm, altAnim : false};
};
SMUtils.cleanChart = function(chartstr) {
	var newchartstr = "";
	var valid = true;
	var _g = 0;
	var _g1 = chartstr.length;
	while(_g < _g1) {
		var i = _g++;
		var ch = chartstr.charAt(i);
		if(ch == "/" && (i + 1 < chartstr.length && chartstr.charAt(i + 1) == "/")) {
			valid = false;
		} else if(ch == "\n") {
			newchartstr += ch;
			valid = true;
		} else if(valid) {
			newchartstr += ch;
		}
	}
	return newchartstr;
};
var Std = function() { };
Std.parseInt = function(x) {
	if(x != null) {
		var _g = 0;
		var _g1 = x.length;
		while(_g < _g1) {
			var i = _g++;
			var c = x.charCodeAt(i);
			if(c <= 8 || c >= 14 && c != 32 && c != 45) {
				var nc = x.charCodeAt(i + 1);
				var v = parseInt(x,nc == 120 || nc == 88 ? 16 : 10);
				if(isNaN(v)) {
					return null;
				} else {
					return v;
				}
			}
		}
	}
	return null;
};
var StringTools = function() { };
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	if(slen >= elen) {
		return s.indexOf(end,slen - elen) == slen - elen;
	} else {
		return false;
	}
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	if(!(c > 8 && c < 14)) {
		return c == 32;
	} else {
		return true;
	}
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,r,l - r);
	} else {
		return s;
	}
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,0,l - r);
	} else {
		return s;
	}
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var WebMain = function() { };
WebMain.parseSMFile = function(smString) {
	smString = StringTools.replace(smString,"\r\n","\n");
	WebMain.curSMFile = new SMFile(smString);
	while(WebMain.chartselect.children.length > 0) WebMain.chartselect.remove(0);
	var _g = 0;
	var _g1 = WebMain.curSMFile.charts.length;
	while(_g < _g1) {
		var i = _g++;
		var chart = WebMain.curSMFile.charts[i];
		var opt = window.document.createElement("option");
		opt.value = "" + i;
		opt.innerText = chart.toString();
		WebMain.chartselect.add(opt);
	}
	WebMain.songnameinput = window.document.getElementById("songname");
	WebMain.songnameinput.value = WebMain.curSMFile.title;
	console.log("WebMain.hx:53:",WebMain.curSMFile.title);
	console.log("WebMain.hx:54:",WebMain.curSMFile.extraHeaderTags);
	console.log("WebMain.hx:55:",WebMain.curSMFile.bpms);
	console.log("WebMain.hx:56:",WebMain.curSMFile.chartOffset);
};
WebMain.generateChart = function(e) {
	var cfg = { song : WebMain.songnameinput.value != "" ? WebMain.songnameinput.value : "SMSong", speed : WebMain.songspeedinput.value != "" ? parseFloat(WebMain.songspeedinput.value) : 1, player1 : WebMain.player1input.value != "" ? WebMain.player1input.value : "bf", player2 : WebMain.player2input.value != "" ? WebMain.player2input.value : "dad", gfVersion : WebMain.gfversioninput.value != "" ? WebMain.gfversioninput.value : "gf"};
	var fnfchart = WebMain.curSMFile.makeFNFChart(Std.parseInt(WebMain.chartselect.value),cfg,WebMain.flipchartinput.checked);
	var blob = new Blob([JSON.stringify(fnfchart,null,"\t")],{ type : "text/json"});
	var a_elem = window.document.createElement("a");
	a_elem.href = URL.createObjectURL(blob);
	a_elem.download = "" + StringTools.replace(cfg.song.toLowerCase()," ","-") + ".json";
	window.document.body.appendChild(a_elem);
	a_elem.click();
	window.document.body.removeChild(a_elem);
};
WebMain.handleFiles = function(e) {
	WebMain.thefiles = e.target.files;
	var simfile = WebMain.thefiles.item(0);
	var fr = new FileReader();
	fr.readAsText(simfile.slice());
	fr.onload = function() {
		WebMain.parseSMFile(fr.result);
	};
};
WebMain.main = function() {
	console.log("WebMain.hx:94:","-------Welcome to the SM to JSON converter------");
	WebMain.simfileupload = window.document.getElementById("fileupload");
	WebMain.simfileupload.addEventListener("change",WebMain.handleFiles,false);
	WebMain.generatechartbtn = window.document.getElementById("generate-chart");
	WebMain.generatechartbtn.addEventListener("click",WebMain.generateChart,false);
	WebMain.chartselect = window.document.getElementById("chartindex");
	WebMain.songnameinput = window.document.getElementById("songname");
	WebMain.songspeedinput = window.document.getElementById("songspeed");
	WebMain.player1input = window.document.getElementById("player1");
	WebMain.player2input = window.document.getElementById("player2");
	WebMain.gfversioninput = window.document.getElementById("gfversion");
	WebMain.flipchartinput = window.document.getElementById("flipchart");
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.prototype = {
	remove: function(key) {
		if(!this.h.hasOwnProperty(key)) {
			return false;
		}
		delete(this.h[key]);
		return true;
	}
};
var haxe_ds_StringMap = function() {
	this.h = Object.create(null);
};
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
};
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
SMUtils.TAG_START = "#";
SMUtils.TAG_END = ";";
SMUtils.TAG_SEP = ":";
SMUtils.TAGS_TO_INCLUDE = ["TITLE","OFFSET","BPMS","STOPS","NOTES","ARTIST","CREDIT"];
SMUtils.NOTE_NONE = "0";
SMUtils.NOTE_STEP = "1";
SMUtils.NOTE_HOLD_HEAD = "2";
SMUtils.NOTE_TAIL = "3";
SMUtils.NOTE_ROLL_HEAD = "4";
SMUtils.NOTE_MINE = "M";
SMUtils.BEATS_PER_MEASURE = 4;
WebMain.main();
})({});
