function DistancePlatesGenerator(_inputFormName, _rootFolder, _models, _translation) {
	var self = this;
	this.generatorForm = document.getElementById(_inputFormName);
	this.models = _models;
	this.translation = _translation;
	while (this.generatorForm.firstChild) {
		this.generatorForm.removeChild(this.generatorForm.firstChild);
	}
	this.rootFolder = _rootFolder
	createInterface();
	createModel();
	this.generatorForm.addEventListener("submit",function(event){ createModel(); event.preventDefault(); } );
	
	function createInterface() {
		// main form panels
		var leftPane = document.createElement("div");
		leftPane.className = "left-pane";
		self.generatorForm.appendChild(leftPane);	
		var rightPane = document.createElement("div");
		rightPane.className = "right-pane";
		self.generatorForm.appendChild(rightPane);
		
		// milage start field
		var startGroup = document.createElement("p");
		leftPane.appendChild(startGroup);
		var startLabel = document.createElement("label");
		startLabel.textContent = self.translation.strings["start"];
		startGroup.appendChild(startLabel);
		self.startField = document.createElement("input");
		self.startField.type = "number";
		self.startField.min = 0.0;
		self.startField.max = 999.9;
		self.startField.step = 0.1;
		self.startField.value = 0.0;
		self.startField.title = self.translation.strings["startHelp"];
		startGroup.appendChild(self.startField);
		
		// milage end field
		var endGroup = document.createElement("p");
		leftPane.appendChild(endGroup);
		var endLabel = document.createElement("label");
		endLabel.textContent = self.translation.strings["end"];
		endGroup.appendChild(endLabel);
		self.endField = document.createElement("input");
		self.endField.type = "number";
		self.endField.min = 0.0;
		self.endField.max = 999.9;
		self.endField.step = 0.1;
		self.endField.value = 10.0;
		self.endField.title = self.translation.strings["endHelp"];
		endGroup.appendChild(self.endField);
		
		// offset enabling
		var offsetGroup = document.createElement("p");
		leftPane.appendChild(offsetGroup);
		self.offsetCheckbox = document.createElement("input");
		self.offsetCheckbox.type = "checkbox";
		self.offsetCheckbox.addEventListener("click",function(){ toggleOffset() });
		self.offsetCheckbox.title = self.translation.strings["offsetEnableHelp"];
		offsetGroup.appendChild(self.offsetCheckbox);
		var offsetLabel = document.createElement("label");
		offsetLabel.textContent = self.translation.strings["offsetEnable"];
		offsetGroup.appendChild(offsetLabel);
		
		// real distance between plates/posts
		var realDistanceGroup = document.createElement("p");
		leftPane.appendChild(realDistanceGroup);
		var realDistanceLabel = document.createElement("label");
		realDistanceLabel.textContent = self.translation.strings["realDistance"];
		realDistanceGroup.appendChild(realDistanceLabel);
		self.realDistanceField = document.createElement("input");
		self.realDistanceField.type = "number";
		self.realDistanceField.min = 1;
		self.realDistanceField.max = 150;
		self.realDistanceField.step = 0.1;
		self.realDistanceField.value = 78;
		self.realDistanceField.disabled = true;
		self.realDistanceField.title = self.translation.strings["realDistanceHelp"];
		realDistanceGroup.appendChild(self.realDistanceField);
		
		//initial offset (visible on first plate)
		var initOffsetGroup = document.createElement("p");
		leftPane.appendChild(initOffsetGroup);
		var initOffsetLabel = document.createElement("label");
		initOffsetLabel.textContent = self.translation.strings["initOffset"];
		initOffsetGroup.appendChild(initOffsetLabel);
		self.initOffsetField = document.createElement("input");
		self.initOffsetField.disabled = true;
		self.initOffsetField.type = "number";
		self.initOffsetField.min = -50;
		self.initOffsetField.max = 50;
		self.initOffsetField.step = 0.1;
		self.initOffsetField.value = 12;
		self.initOffsetField.disabled = true;
		self.initOffsetField.title = self.translation.strings["initOffsetHelp"];
		initOffsetGroup.appendChild(self.initOffsetField);
		
		// model scale
		var scaleGroup = document.createElement("p");
		leftPane.appendChild(scaleGroup);
		var scaleLabel = document.createElement("label");
		scaleLabel.textContent = self.translation.strings["scale"];
		scaleGroup.appendChild(scaleLabel);
		self.scaleField = document.createElement("input");
		self.scaleField.type = "number";
		self.scaleField.min = 9;
		self.scaleField.max = 220;
		self.scaleField.step = 0.5;
		self.scaleField.value = 25;
		self.scaleField.title = self.translation.strings["scaleHelp"];
		scaleGroup.appendChild(self.scaleField);
		
		// model style
		var styleGroup = document.createElement("p");
		leftPane.appendChild(styleGroup);
		var styleLabel = document.createElement("label");
		styleLabel.innerHTML = self.translation.strings["style"];
		styleGroup.appendChild(styleLabel);
		self.styleField = document.createElement("select");
		styleGroup.appendChild(self.styleField);
		for (var i = 0; i < self.models.length; i++) {
			var styleOption = document.createElement("option");
			styleOption.value = i;
			styleOption.textContent = self.models[i].name[self.translation.lang];
			if (i == 0) {
				styleOption.selected = true;
			}
			self.styleField.appendChild(styleOption);
		}
		
		// enabling doubling parts
		var doubleGroup = document.createElement("p");
		leftPane.appendChild(doubleGroup);
		self.doubleCheckbox = document.createElement("input");
		self.doubleCheckbox.type = "checkbox";
		self.doubleCheckbox.title = self.translation.strings["doubleHelp"];
		doubleGroup.appendChild(self.doubleCheckbox);
		var doubleLabel = document.createElement("label");
		doubleLabel.textContent = self.translation.strings["double"];
		doubleGroup.appendChild(doubleLabel);
		
		// submit button
		var submitGroup = document.createElement("p");
		leftPane.appendChild(submitGroup);
		var submitButton = document.createElement("input");
		submitButton.type = "submit";
		submitButton.className = "submit";
		submitButton.value = self.translation.strings["submit"];
		submitGroup.appendChild(submitButton);
		
		// download button
		self.downloadButton = document.createElement("a");
		self.downloadButton.textContent = self.translation.strings["download"];
		self.downloadButton.className = "button";
		submitGroup.appendChild(self.downloadButton);

		// target iframe for PDF document
		self.iframe = document.createElement("iframe");
		rightPane.appendChild(self.iframe);
		
		// status text
		self.statusText = document.createElement("h1");
		self.statusText.textContent = self.translation.strings["generating"];
		rightPane.appendChild(self.statusText);
	}
	
	function toggleOffset() {
		var visible = !self.offsetCheckbox.checked;
		self.realDistanceField.disabled = visible;
		self.initOffsetField.disabled = visible;
	}
	
	function validateSingleInput(input,minValue,maxValue) {
		if (input.value === '' || input.value === ' ' || isNaN(input.value) || 
				input.value < minValue || input.value > maxValue) {
			input.className = "field-error";
			return false;
		}
		input.className = "";
		return true;		
	}
	
	function validateInputs() {
		var noError = validateSingleInput(self.startField,0,999.9) &
			validateSingleInput(self.endField,0,999.9) &
			validateSingleInput(self.realDistanceField,0,150) &
			validateSingleInput(self.initOffsetField,-50,50) &
			validateSingleInput(self.scaleField,6,220);
		if (noError) {
			if (Number(self.startField.value) > Number(self.endField.value)) {
				var tmp = self.startField.value;
				self.startField.value = self.endField.value;
				self.endField.value = tmp;
			}
			return true;
		}
		return false;
	}
	
	function createModel() {
		self.iframe.style.display = "none";
		self.statusText.style.display = "block";
		
		if (!validateInputs()) {
			return false;
		}
	
		var start = self.startField.value * 1000;
		var end = self.endField.value * 1000;
		var realDistance = Number(self.realDistanceField.value);
		var km = 0;
		var hm = 0;
		var offset = null;
		var initOffset = Number(self.initOffsetField.value);
		var fontPath = self.rootFolder + "fonts/";
		

		/* see https://github.com/devongovett/pdfkit/issues/623	
				https://stackoverflow.com/questions/26392735/pdfkit-custom-fonts-fs-readfilesync-is-not-a-function */
		var xhr1 = new XMLHttpRequest();
		var xhr2 = new XMLHttpRequest();
		xhr1.open('GET', fontPath + "arial.ttf", true);
		xhr1.responseType = 'arraybuffer';
		xhr1.send();
		
		xhr1.onload = function (e) {
		  if (this.status == 200) {
			xhr2.open('GET', fontPath + self.models[self.styleField.selectedIndex].font, true);
			xhr2.responseType = 'arraybuffer';
			xhr2.send();
			}
		}

		xhr2.onload = function (e) {
		  if (this.status == 200) {
			doc = new PDFDocument({
				size: [595.2757, 841.8899], //A4 210mmx297mm
				margin: 19.8425, //7mm
				info: {
					Title: self.models[self.styleField.selectedIndex].name[self.translation.lang] + 
						   self.translation.strings["title"] + self.scaleField.value,
					Author: self.translation.strings["repository"]
				}
			}),
			stream = doc.pipe(blobStream()),
			doc.registerFont("arial", xhr1.response);
			doc.registerFont("plate", xhr2.response);
			
			var lastModelPos = [19.8425,19.8425];
			var firstModel = true;
			createPageTemplate(doc);
			
			for (var i = start; i <= end; i+=100) {
				km = Math.floor(i/1000) 
				hm = Math.floor(i % 1000 / 100);
				if (self.offsetCheckbox.checked) {
					offset = Math.floor(i / realDistance) * realDistance + initOffset - i;
					nextOffset = offset + realDistance;
					if (Math.abs(offset) > nextOffset)
						offset = nextOffset;
				}
				else {
					offset = null;
				}
				for (var j = 0; j<(self.doubleCheckbox.checked?2:1); j++) {
					if (!firstModel) {
						lastModelPos[0] += self.models[self.styleField.selectedIndex].width + 4.252;
						if ((lastModelPos[0] + self.models[self.styleField.selectedIndex].width) > 570) {
							lastModelPos[0] = 19.8425;
							lastModelPos[1] += self.models[self.styleField.selectedIndex].height + 4.252;
							if ((lastModelPos[1] + self.models[self.styleField.selectedIndex].height) > 732) {
								lastModelPos[1] = 19.8425;
								doc.addPage();
								createPageTemplate(doc);
							}
						}
					}
					else {
						firstModel = false;
					}
					doc.font("plate");
					self.models[self.styleField.selectedIndex].draw(
							doc, lastModelPos, self.scaleField.value, km, hm, offset);
				}
			}

			doc.end();
			
			stream.on("finish", function() {
				self.iframe.style.display = "initial";
				self.statusText.style.display = "none";
				self.iframe.src = stream.toBlobURL("application/pdf");
				//see http://jsfiddle.net/viebel/3V6pZ/12/
				self.downloadButton.href = self.iframe.src;				
				self.downloadButton.download = self.translation.strings["filename"].replace("%",((self.scaleField.value < 100?"0":"") + self.scaleField.value));
			});

		  }
		}

	}
	
	function createPageTemplate(doc) {
		doc.font("arial");
		doc.fontSize(18).text(self.models[self.styleField.selectedIndex].name[self.translation.lang] + self.translation.strings["title"] + self.scaleField.value, 19.8425, 754.7717);
		doc.fontSize(9)
		var footerText = self.translation.strings["footer"].replace("%",new Date().getFullYear())
		doc.text(footerText, 19.8425, 798.1324);
		doc.text("1cm", 536.041, 748.4971);
		
		for (var i=0; i<25; i++) {
			doc.rect(575.434, 19.842 + (i * 28.346), 5.669, 28.346).lineWidth(0.0028).fillAndStroke((i%2?"#000000":"#FFFFFF"), "#000000");
		}
		for (var i=0; i<19; i++) {
			doc.rect(19.842 + (i * 28.346), 739.843, 28.346, 5.669).lineWidth(0.0028).fillAndStroke((i%2?"#000000":"#FFFFFF"), "#000000");
		}
		doc.save();
		doc.translate(23 + doc.widthOfString(footerText),796.727);
		doc.rect(0,0,60.021,11.313).fill("#000000");
		doc.rect(0.789,0.763,58.443,9.787).fill("#FFFFFF");
		doc.rect(1.496,1.456,57.028,8.4).fill("#000000");
		doc.path("M1.496,1.465v8.4h15.061c0.969-1.225,1.623-2.649,1.623-4.2c0-1.54-0.643-2.979-1.6-4.2H1.496z").fill("#C0C4BC");
		doc.path("M47.809,3.557h1.217c0.679,0,1.185,0.046,1.517,0.138c0.334,0.09,0.619,0.243,0.856,0.461c0.21,0.189,0.366,0.408,0.468,0.655c0.103,0.248,0.153,0.528,0.153,0.842c0,0.316-0.051,0.6-0.153,0.85c-0.102,0.247-0.258,0.466-0.468,0.655c-0.239,0.217-0.526,0.372-0.862,0.464c-0.336,0.09-0.84,0.136-1.511,0.136h-1.217V3.557zM48.963,4.375v2.563h0.413c0.472,0,0.831-0.109,1.079-0.329c0.25-0.219,0.375-0.538,0.375-0.956c0-0.417-0.124-0.733-0.372-0.951s-0.608-0.326-1.082-0.326H48.963zM42.666,3.557h1.289l1.627,2.88v-2.88h1.094v4.2h-1.288L43.76,4.875v2.882h-1.094V3.557zM39.882,5.688h1.882v0.818h-1.882V5.688zM39.01,7.525c-0.212,0.104-0.433,0.181-0.662,0.233s-0.469,0.079-0.719,0.079c-0.745,0-1.336-0.195-1.771-0.585c-0.436-0.392-0.653-0.923-0.653-1.593c0-0.671,0.218-1.202,0.653-1.592c0.436-0.393,1.026-0.588,1.771-0.588c0.25,0,0.489,0.026,0.719,0.079c0.229,0.052,0.45,0.13,0.662,0.232v0.87c-0.214-0.138-0.424-0.237-0.632-0.302c-0.208-0.063-0.427-0.095-0.656-0.095c-0.412,0-0.735,0.123-0.971,0.371c-0.236,0.247-0.354,0.589-0.354,1.023c0,0.434,0.118,0.773,0.354,1.021c0.235,0.247,0.559,0.371,0.971,0.371c0.229,0,0.448-0.031,0.656-0.096c0.208-0.063,0.418-0.164,0.632-0.301V7.525zM30.319,3.557h1.289l1.627,2.88v-2.88h1.094v4.2h-1.288l-1.628-2.882v2.882h-1.094V3.557zM27.535,5.688h1.882v0.818h-1.882V5.688zM23.595,3.557h1.262l1.019,1.496l1.019-1.496h1.266l-1.706,2.43v1.771H25.3V5.986L23.595,3.557zM22.916,5.509c0.247,0.067,0.439,0.192,0.575,0.374s0.203,0.405,0.203,0.669c0,0.405-0.146,0.708-0.437,0.906c-0.292,0.199-0.735,0.299-1.331,0.299h-1.915v-4.2h1.732c0.621,0,1.07,0.088,1.349,0.264c0.279,0.177,0.419,0.459,0.419,0.847c0,0.205-0.051,0.379-0.152,0.523C23.258,5.333,23.109,5.439,22.916,5.509M21.843,7.02c0.231,0,0.405-0.046,0.521-0.139c0.118-0.092,0.177-0.23,0.177-0.416c0-0.182-0.058-0.317-0.174-0.407c-0.116-0.093-0.291-0.139-0.524-0.139h-0.677V7.02H21.843zM21.804,5.183c0.182,0,0.319-0.038,0.414-0.113c0.094-0.075,0.141-0.186,0.141-0.332c0-0.144-0.047-0.254-0.141-0.329c-0.095-0.076-0.232-0.115-0.414-0.115h-0.638v0.89H21.804z").fill("#FFFFFF");
		doc.path("M14.424,1.456c1.086,1.073,1.76,2.563,1.76,4.209c0,1.643-0.669,3.128-1.75,4.2H6.097c-1.08-1.072-1.75-2.558-1.75-4.2c0-1.646,0.674-3.136,1.759-4.209H14.424z").fill("#000000");
		doc.path("M10.265,10.428c2.63,0,4.763-2.133,4.763-4.763c0-2.629-2.133-4.762-4.763-4.762c-2.629,0-4.762,2.133-4.762,4.762C5.503,8.295,7.636,10.428,10.265,10.428").fill("#FFFFFF");
		doc.path("M13.563,4.683L12.78,5.095c-0.085-0.176-0.188-0.299-0.312-0.369c-0.124-0.07-0.242-0.106-0.354-0.106c-0.528,0-0.793,0.349-0.793,1.047c0,0.316,0.067,0.57,0.201,0.761s0.331,0.285,0.592,0.285c0.345,0,0.588-0.169,0.729-0.507l0.74,0.369c-0.162,0.289-0.381,0.517-0.655,0.682c-0.274,0.166-0.574,0.249-0.898,0.249c-0.535,0-0.963-0.162-1.283-0.486c-0.321-0.324-0.481-0.775-0.481-1.353c0-0.564,0.164-1.011,0.491-1.343c0.328-0.331,0.742-0.496,1.242-0.496C12.73,3.827,13.252,4.112,13.563,4.683").fill("#000000");
		doc.path("M10.148,4.683L9.355,5.095C9.271,4.919,9.167,4.796,9.044,4.726S8.807,4.619,8.7,4.619c-0.527,0-0.792,0.349-0.792,1.047c0,0.316,0.066,0.57,0.2,0.761S8.439,6.712,8.7,6.712c0.346,0,0.589-0.169,0.729-0.507l0.729,0.369c-0.155,0.289-0.37,0.517-0.645,0.682C9.24,7.422,8.937,7.505,8.605,7.505c-0.528,0-0.955-0.162-1.279-0.486C7.003,6.694,6.841,6.243,6.841,5.666c0-0.564,0.163-1.011,0.491-1.343C7.66,3.992,8.073,3.827,8.574,3.827C9.307,3.827,9.832,4.112,10.148,4.683").fill("#000000");
		doc.restore();
	}
}

Translation = function() {
	this.lang = "en";
	this.strings = {"start":"Distance beginning [km]",
					"startHelp":"Kilometre and hectometre on the first post/plate, value from 0,0 to 999,9.",
					"end":"Distance end [km]",
					"endHelp":"Kilometre and hectometre on the last post/plate, value from 0,0 to 999,9.",
					"offsetEnable":"Show offset",
					"offsetEnableHelp":"Difference between real distance and location of plate is visible.",
					"realDistance":"Posts distance [m]",
					"realDistanceHelp":"Real distance between actual location of plates, value from 1,0 to 150,0.",
					"initOffset":"Initial offset [m]",
					"initOffsetHelp":"Offset visible on the first plate, value from -50,0 to 50,0.",
					"scale":"Scale 1:",
					"scaleHelp":"Model scale, value from 9 to 220.",
					"style":"Style",
					"double":"Create doubles",
					"doubleHelp":"Create two plates/posts for each hectometre.",
					"submit":"Create",
					"download":"Download",
					"generating":"One moment, please...",
					"title":", scale 1:",
					"repository":"PKP Repository",
					"filename":"distance_signs_en%cl.pdf",
					"footer":"Author: Pawel Adamowicz (http://pkprepo.net/), %, selected rights reserved"};
}

TranslationPl = function() {
	this.lang = "pl";
	this.strings = {"start":"Początek pikietażu [km]",
					"startHelp":"Kilometr i hektometr widoczny na pierwszej tablicy/słupku, wartośc od 0,0 do 999,9.",
					"end":"Koniec pikietażu [km]",
					"endHelp":"Kilometr i hektometr widoczny na ostatniej tablicy/słupku, wartośc od 0,0 do 999,9.",
					"offsetEnable":"Pokaż domiar",
					"offsetEnableHelp":"Różnica między rzeczywistym hektometrem a położeniem tablicy będzie widoczna.",
					"realDistance":"Odległość słupów [m]",
					"realDistanceHelp":"Rzeczywista odległość między miejscami położenia tablic, wartość od 1,0 do 150,0.",
					"initOffset":"Początkowe przesunięcie [m]",
					"initOffsetHelp":"Domiar widoczny na pierwszej tablicy, wartość od -50,0 do 50,0.",
					"scale":"Skala 1:",
					"scaleHelp":"Skala modelu, wartość od 9 do 220.",
					"style":"Styl",
					"double":"Generuj podwójnie",
					"doubleHelp":"Generowane dwie tablice/dwa słupki dla każdego hektometra.",
					"submit":"Generuj",
					"download":"Pobierz",
					"generating":"Chwilkę...",
					"title":", skala 1:",
					"repository":"Repozytorium PKP",
					"filename":"hektometry_pl%cl.pdf",
					"footer":"Opracował Paweł Adamowicz (http://pkprepo.net/), %, niektóre prawa zastrzeżone"};
}
TranslationPl.prototype = new Translation();

TranslationDe = function() {
	this.lang = "de";
	this.strings = {"start":"Anfang der Kilometrierung [km]",
					"startHelp":"Streckenkilometer an ersten Tafel/Stein, von 0,0 bis 999,9.",
					"end":"Ende der Kilometrierung [km]",
					"endHelp":"Streckenkilometer an letzten Tafel/Stein, von 0,0 bis 999,9.",
					"offsetEnable":"Zeige Korrekturangabe",
					"offsetEnableHelp":"Abstandunterschied zwischen wirklichen Kilometrierung und Lage von der Tafel wird gezeigt.",
					"realDistance":"Abstand zwischen Masten [m]",
					"realDistanceHelp":"Wirklicher Abstand z.B. zwischen Fahrleitungsmasten, an den die Schilder sind angebracht, von 1,0 bis 150,0.",
					"initOffset":"Anfangsverlagerung [m]",
					"initOffsetHelp":"Korrekturangabe an ersten Tafel, von -50,0 bis 50,0.",
					"scale":"Maßtab 1:",
					"scaleHelp":"Maßtab des Modell, von 9 bis 220.",
					"style":"Stil",
					"double":"Erzeuge doppelt",
					"doubleHelp":"Zwei Tafeln/Steine für jeden Hektometer.",
					"submit":"Erzeuge",
					"download":"Herunterlade",
					"generating":"Ein Moment, bitte...",
					"title":", Maßtab 1:",
					"repository":"PKP Repositorium",
					"filename":"kilometerzeichen_de%cl.pdf",
					"footer":"Bearbeitet bei Paweł Adamowicz (http://pkprepo.net/), %, ausgewählte Rechte vorbehalten"};
}
TranslationDe.prototype = new Translation();

Model = function() {
	this.name = {"pl":"Model",
				 "en":"Model EN",
				 "de":"Model DE"}
	this.font = "techniczna.ttf";
	this.width = 0;
	this.height = 0;
	this.fillColor = "#FFFFFF";
	this.borderColor = "#888888";
	this.fontColor = "#000000";
	this.borderWidth = 0.0762;
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 992.1261 / scale;
		this.height = 1218.8978 / scale;
		doc.rect(pos[0],pos[1],this.width,this.height)
			.lineWidth(this.borderWidth)
			.fillAndStroke(this.fillColor,this.borderColor);
	}
}

DistPlatesPKPep3 = function() {
	this.name = {"pl":"Tablice hektometrowe PKP, epoka III-IV",
				 "en":"Distance plates PKP, epoch III-IV",
				 "de":"Hektometerzeichen PKP, Epoche III-IV"};
	this.font = "techniczna.ttf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 992.1261 / scale;
		this.height = 1218.8978 / scale;
		var fontHeight = 454.82 / scale,
			offsetString = "";
			
		doc.rect(pos[0], 
				 pos[1], 
				this.width, 
				this.height)
				.lineWidth(this.borderWidth)
				.fillAndStroke(this.fillColor,this.borderColor);
		doc.fill(this.fontColor);
		doc.fontSize(fontHeight);
		doc.text(km, 
				 pos[0] + 546.3101 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 126.816 / scale);
		doc.text(hm, 
				 pos[0] + 546.3101 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 578.868 / scale);
		if ((offset != null) && (offset != 0)) {
			offsetString = (offset > 0?"+":"") + offset.toFixed(0);
			doc.fontSize(fontHeight * 0.2857);
			doc.text(offsetString, 
					 pos[0] + 900.424 / scale - doc.widthOfString(offsetString), 
					 pos[1] + 924.353 / scale);
		}
	}
}
DistPlatesPKPep3.prototype = new Model();

DistPlatesPKPep4 = function() {
	this.name = {"pl":"Tablice hektometrowe PKP, epoka IV-V",
				 "en":"Distance plates PKP, epoch IV-V",
				 "de":"Hektometerzeichen PKP, Epoche IV-V"};
	this.font = "hektometr_pkp_ep4.otf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 992.1261 / scale;
		this.height = 1218.8978 / scale;
		var offsetString = "";
			
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.path("M56.69,0h878.747c31.322,0,56.689,25.391,56.689,56.701v1105.485c0,31.322-25.367,56.713-56.689,56.713H56.69c-31.299,0-56.69-25.391-56.69-56.713V56.701C0,25.391,25.392,0,56.69,0z").lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
		
		doc.fill(this.fontColor);
		doc.fontSize(808.08 / scale);
		doc.text(km, 
				 pos[0] + 496.0631 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 85.04 / scale);
		doc.fontSize(626.26 / scale);
		doc.text(hm, 
				 pos[0] + 496.0631 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 710.656 / scale);
		if ((offset != null) && (offset != 0)) {
			offsetString = (offset > 0?"+":"") + offset.toFixed(0);
			doc.fontSize(181.82 / scale);
			doc.text(offsetString, 
					 pos[0] + 950.599 / scale - doc.widthOfString(offsetString), 
					 pos[1] + 1022.469 / scale);
		}
	}
}
DistPlatesPKPep4.prototype = new Model();

DistPlatesPKPep5 = function() {
	this.name = {"pl":"Tablice hektometrowe PKP, epoka Vc (wg Ie-102)",
				 "en":"Distance plates PKP, epoch Vc",
				 "de":"Hektometerzeichen PKP, Epoche Vc"};
	this.font = "ie102.otf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 992.1261 / scale;
		this.height = 1218.8978 / scale;
		var fontHeight = 453.5434 / scale;
		var	margin = 85.0394 / scale;
		var	border = 14.1732 / scale;
			
		doc.rect(pos[0], 
				 pos[1], 
				this.width, 
				this.height)
				.fill(this.fontColor);
		doc.rect(pos[0] + border, 
				 pos[1] + border,
				 this.width - 2 * border, 
				 this.height - 2 * border)
				 .fill(this.fillColor);
		doc.fill(this.fontColor);
		doc.fontSize(fontHeight * 1.1429);
		doc.text(km, 
				 pos[0] + (this.width - doc.widthOfString(km.toString())) / 2, 
				 pos[1] + margin - fontHeight * 0.1429); 
		doc.fontSize(fontHeight * 1.1429);
		doc.text(hm, 
				 pos[0] + (this.width - doc.widthOfString(hm.toString())) / 2, 
				 pos[1] + this.height - margin - fontHeight * 1.1429);
		if ((offset != null) && (offset != 0)) {
			var offsetString = (offset > 0?"+":"") + offset.toFixed(1).replace('.',',');
			doc.fontSize(fontHeight*0.2857);
			doc.text(offsetString, 
					 pos[0] + this.width / 2 + 0.30 * fontHeight, 
					 pos[1] + this.height - margin - 0.2857 * fontHeight);
		}
	}
}
DistPlatesPKPep5.prototype = new Model();

DistPostsPKP = function() {
	this.name = {"pl":"Słupki hektometrowe PKP, od epoki III",
				 "en":"Distance posts PKP, since epoch III",
				 "de":"Hektometersteine PKP, von Epoche III"};
	this.font = "techniczna.ttf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 2721.26 / scale;
		this.height = 3061.43 / scale;
			
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		if (scale <= 45) {
			doc.polygon([1360.62,623.62], [1247.241,510.241], [623.633,510.241], [510.229,623.62], [510.229,3061.426], [1360.62,3061.426]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.polygon([2721.265,623.62], [2607.886,510.241], [1984.253,510.241], [1870.874,623.62], [1870.874,3061.426], [2721.265,3061.426]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(0,623.62,510.254,2437.806).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(1360.62,623.62,510.254,2437.806).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(0,463.281,510.254,160.339).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(1360.62,463.281,510.254,160.339).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(623.633,0,623.608,510.241).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		}
		else {
			doc.rect(510.254,510.241,850.366,2551.185).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(0,510.241,510.254,2551,185).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(1870.874,510.241,850.366,2551.185).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(1360.62,510.241,510.254,2551.185).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
			doc.rect(510.254,0,850.366,510.241).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);		
		}
		if ((offset != null) && (offset != 0)) {
			doc.rect(0,1502.356,2721.265,141.735).fill(this.fontColor);
		}
		doc.restore();
		
		doc.fontSize(453.5434 / scale).fill(this.fontColor);
		doc.text(km, 
				 pos[0] + 969.214 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 536.069 / scale);
		doc.text(km, 
				 pos[0] + 2329.834 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 536.069 / scale);
		doc.text(hm, 
				 pos[0] + 969.214 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 989.621 / scale);
		doc.text(hm, 
				 pos[0] + 2329.834 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 989.621 / scale);
	}
}
DistPostsPKP.prototype = new Model();

DistPlatesDB1 = function() {
	this.name = {"pl":"Tablice hektometrowe DB, linie główne, od epoki IV",
				 "en":"Distance plates DB, main lines, since epoch IV",
				 "de":"Hektometerzeichen für Hauptbahnen, DB, von Epoche IV"};
	this.font = "hektometr_db_ep4.otf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 0;
		this.height = 2267.729 / scale;
		if (km < 100) {
			this.width = 1360.631 / scale;
		}
		else {
			this.width = 2040.946 / scale;
		}
		doc.rect(pos[0], 
				 pos[1], 
				 this.width, 
				 this.height)
				 .lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.fontSize(1100.0022 / scale).fill(this.fontColor);
		doc.text(km, 
				 pos[0] + (this.width - doc.widthOfString(km.toString())) / 2, 
				 pos[1] + 197.32 / scale);
		doc.text(hm, 
				 pos[0] + (this.width - doc.widthOfString(hm.toString())) / 2, 
				 pos[1] + 1190.572 / scale);
		if ((offset != null) && (offset != 0)) {
			var offsetValue = (hm * 100 + offset);
			if (offsetValue < 0 && km > 0) {
				offsetValue += 1000;
			}
			var offsetString = offsetValue.toFixed(0);
			if (offsetValue > 0 && offsetValue < 100) {
				offsetString = "0" + offsetString;
				if ( offsetValue < 10) {
					offsetString = "0" + offsetString;
				}
			}
			doc.fontSize(106.452 / scale);
			doc.text(offsetString, 
				 pos[0] + this.width - doc.widthOfString(offsetString) - 113.376 / scale , 
				 pos[1] + 2082.957 / scale);
			
		}
	}
}
DistPlatesDB1.prototype = new Model();

DistPlatesDB2 = function() {
	this.name = {"pl":"Tablice hektometrowe DB, linie drugorzędne, od epoki IV",
				 "en":"Distance plates DB, secondary lines, since epoch IV",
				 "de":"Hektometerzeichen für Nebenbahnen, DB, von Epoche IV"};
	this.font = "hektometr_db_ep4.otf";
	
	this.draw = function(doc, pos, scale, km, hm, offset) {
		this.width = 0;
		this.height = 1729.135 / scale;
		if (km < 100) {
			this.width = 907.084 / scale;
		}
		else {
			this.width = 1360.639 / scale;
		}
		doc.rect(pos[0], 
				 pos[1], 
				 this.width, 
				 this.height)
				 .lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.fontSize(745.1628 / scale).fill(this.fontColor);
		doc.text(km, 
				 pos[0] + (this.width - doc.widthOfString(km.toString())) / 2, 
				 pos[1] + 230.897 / scale);
		doc.text(hm, 
				 pos[0] + (this.width - doc.widthOfString(hm.toString())) / 2, 
				 pos[1] + 902.969 / scale);
		if ((offset != null) && (offset != 0)) {
			var offsetValue = (hm * 100 + offset);
			if (offsetValue < 0 && km > 0) {
				offsetValue += 1000;
			}
			var offsetString = offsetValue.toFixed(0);
			if (offsetValue > 0 && offsetValue < 100) {
				offsetString = "0" + offsetString;
				if ( offsetValue < 10) {
					offsetString = "0" + offsetString;
				}
			}
			doc.fontSize(106.452 / scale);
			doc.text(offsetString, 
				 pos[0] + this.width - doc.widthOfString(offsetString) - 80 / scale , 
				 pos[1] + 1513.215 / scale);
			
		}
	}
}
DistPlatesDB2.prototype = new Model();


DistPostsDR1 = function() {
	this.name = {"pl":"Słupki hektometrowe DR, linie główne, epoka II",
				 "en":"Distance posts DR, main lines, epoch II",
				 "de":"Hektometersteine für Hauptbahnen, DR, Epoche II"};
	this.font = "hektometr_dr_ep2.otf";
		
	this.drawPostType1 = function(doc, pos, scale) {
		this.width = 2551.159 / scale;
		this.height = 3399.268 / scale;
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.rect(0, 501.99, 425.195, 2749.609).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.rect(1275.585, 501.99, 425.195, 2749.609).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([1275.585,501.99], [850.39,416.944], [425.195,501.99], [425.195,3251.6], [1275.585,3251.6]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([2551.159,501.99], [2125.964,416.944], [1700.769,501.99], [1700.769,3251.6], [2551.159,3251.6]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([341.797,84.986], [767.089,0], [850.39,416.956], [425.098,501.941]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([1359.021,84.986], [933.716,0], [850.39,416.956], [1275.683,501.941]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
	}
		
	this.drawPostType2 = function(doc, pos, scale) {
		this.width = 3004.725 / scale;
		this.height = 3399.268 / scale;
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.rect(0, 505.005, 425.195, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.rect(1502.368, 505.005, 425.195, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);;
		doc.polygon([1502.368,505.005], [963.781,419.959], [425.195,505.005], [425.195,3254.614], [1502.368,3254.614]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([3004.725,505.005], [2466.15,419.959], [1927.576,505.005], [1927.576,3254.614], [3004.725,3254.614]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([358.667,85.303], [897.266,0], [963.781,419.959], [425.184,505.262]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([1568.885,85.303], [1030.285,0], [963.77,419.959], [1502.381,505.262]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
	}
	
	this.drawPostType3 = function(doc, pos, scale) {
		this.width = 3458.276 / scale;
		this.height = 3399.268 / scale;
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.rect(0, 506.738, 425.195, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.rect(1729.15, 506.738, 425.195, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);;
		doc.polygon([1729.15,505.859], [1077.173,421.704], [425.195,506.738], [425.195,3256.348], [1729.15,3256.348]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([3458.276,506.738], [2806.299,421.704], [2154.346,506.738], [2154.346,3256.348], [3458.276,3256.348]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([370.508,84.668], [1022.412,0], [1077.148,421.655], [425.293,506.323]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([1783.813,84.668], [1131.934,0], [1077.173,421.655], [1729.053,506.323]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
	}
	
	this.drawPostType4 = function(doc, pos, scale) {
		this.width = 4308.643 / scale;
		this.height = 3399.268 / scale;
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.rect(0, 648.779, 566.919, 2749.609).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.rect(2154.321, 648.779, 566.919, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);;
		doc.polygon([2154.321,648.779], [1360.62,563.745], [566.919,648.779], [566.919,3398.389], [2154.321,3398.389]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([4308.643,648.779], [3514.941,563.745], [2721.24,648.779], [2721.24,3398.389], [4308.643,3398.389]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([506.592,84.814], [1300.366,0], [1360.596,563.721], [566.821,648.535]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([2214.648,84.814], [1420.85,0], [1360.62,563.721], [2154.395,648.535]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
	}
		
	this.drawPostType5 = function(doc, pos, scale) {
		this.width = 4875.61 / scale;
		this.height = 3399.268 / scale;
		doc.save();
		doc.translate(pos[0], pos[1]);
		doc.scale(1 / scale);
		doc.rect(0, 649.658, 566.919, 2749.609).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.rect(2437.793, 649.658, 566.919, 2749.585).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);;
		doc.polygon([2437.793,649.658], [1502.368,564.624], [566.943,649.658], [566.943,3399.268], [2437.793,3399.268]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([4875.61,649.658], [3940.161,564.624], [3004.736,649.658], [3004.736,3399.268], [4875.61,3399.268]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([515.527,85.132], [1450.977,0], [1502.344,564.6], [566.895,649.731]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.polygon([2489.209,85.132], [1553.76,0], [1502.368,564.6], [2437.842,649.731]).lineWidth(this.borderWidth).fillAndStroke(this.fillColor,this.borderColor);
		doc.restore();
	}	
		
	this.draw = function(doc, pos, scale, km, hm, offset) {
		if (km >= 0 && km < 20 && hm != 0) {
			this.drawPostType1(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 850.39 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
			doc.text(km, 
				 pos[0] + 2125.964 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
			doc.text(hm, 
				 pos[0] + 850.39 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1380.726 / scale);
			doc.text(hm, 
				 pos[0] + 2125.964 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1380.726 / scale);
		} else if (km >= 0 && km < 20 && hm == 0) {
			this.drawPostType2(doc, pos, scale);
			doc.fontSize(992.128 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 963.781 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(km, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
		} else if (km >= 20 && km < 100 && hm != 0) {
			this.drawPostType2(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 963.781 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(km, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(hm, 
				 pos[0] + 963.781 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1383.752 / scale);
			doc.text(hm, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1383.752 / scale);
		} else if (km >= 20 && km < 100 && hm == 0) {
			this.drawPostType3(doc, pos, scale);
			doc.fontSize(992.128 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(km, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
		} else if (km >= 100 && km < 200 && hm != 0) {
			this.drawPostType3(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(km, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(hm, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1385.474 / scale);
			doc.text(hm, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1385.474 / scale);
		} else if (km >= 100 && km < 200 && hm == 0) {
			this.drawPostType4(doc, pos, scale);
			doc.fontSize(992.128 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1360.62 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
			doc.text(km, 
				 pos[0] + 3514.941 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
		} else if (km >= 200 && hm != 0) {
			this.drawPostType4(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1360.62 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
			doc.text(km, 
				 pos[0] + 3514.941 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
			doc.text(hm, 
				 pos[0] + 1360.62 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1527.515 / scale);
			doc.text(hm, 
				 pos[0] + 3514.941 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1527.515 / scale);
		} else {
			this.drawPostType5(doc, pos, scale);
			doc.fontSize(992.128 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1502.368 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 734.692 / scale);
			doc.text(km, 
				 pos[0] + 3940.161 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 734.692 / scale);
		}
	}
}
DistPostsDR1.prototype = new Model();

DistPostsDR2 = function() {
	var self = this;
	this.name = {"pl":"Słupki hektometrowe DR, linie drugorzędne, epoka II",
				 "en":"Distance posts DR, secondary lines, epoch II",
				 "de":"Hektometersteine für Nebenbahnen, DR, Epoche II"};
		
	this.draw = function(doc, pos, scale, km, hm, offset) {
		if (km >= 0 && km < 20 && hm == 0) {
			this.drawPostType1(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 850.39 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
			doc.text(km, 
				 pos[0] + 2125.964 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
		} else if (km >= 0 && km < 100 && hm != 0) {
			this.drawPostType1(doc, pos, scale);
			doc.fontSize(595.264 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 850.39 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
			doc.text(km, 
				 pos[0] + 2125.964 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 587.024 / scale);
			doc.text(hm, 
				 pos[0] + 850.39 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1182.288 / scale);
			doc.text(hm, 
				 pos[0] + 2125.964 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1182.288 / scale);
		} else if (km >= 20 && km < 100 && hm == 0) {
			this.drawPostType2(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 963.781 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(km, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
		} else if (km >= 100 && km < 200 && hm != 0) {
			this.drawPostType2(doc, pos, scale);
			doc.fontSize(595.264 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 963.781 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(km, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 590.039 / scale);
			doc.text(hm, 
				 pos[0] + 963.781 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1185.303 / scale);
			doc.text(hm, 
				 pos[0] + 2466.15 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1185.303 / scale);
		} else if (km >= 100 && km < 200 && hm == 0) {
			this.drawPostType3(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(km, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
		} else if (km >= 200 && hm != 0) {
			this.drawPostType3(doc, pos, scale);
			doc.fontSize(595.264 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(km, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 591.772 / scale);
			doc.text(hm, 
				 pos[0] + 1077.173 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1187.036 / scale);
			doc.text(hm, 
				 pos[0] + 2806.299 / scale - doc.widthOfString(hm.toString()) / 2, 
				 pos[1] + 1187.036 / scale);
		} else {
			this.drawPostType4(doc, pos, scale);
			doc.fontSize(793.701 / scale).fill(this.fontColor);
			doc.text(km, 
				 pos[0] + 1360.62 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
			doc.text(km, 
				 pos[0] + 3514.941 / scale - doc.widthOfString(km.toString()) / 2, 
				 pos[1] + 733.813 / scale);
		}
	}
}
DistPostsDR2.prototype = new DistPostsDR1();