var PaperAdventure = {

MODE_MAKIMONO: 'makimono',
MODE_KAMISHIBAI: 'kamishibai',

linkColor: null,
selectColor: null,

display: null,
scene: null,
step: null,
trace: null,

initialize: function(displayElem, sceneArray) {
	this.linkColor = 'blue';
	this.selectColor = 'red';

	this.display = displayElem;
	this.scene = sceneArray;
	this.step = 1;
	this.trace = new Array();

	this.toMakimono();

},

onload: function(fn) {
	if (window.addEventListener) {
		window.addEventListener('load', fn, false);
		return true;
	} else
	if (window.attachEvent) {
		return window.attachEvent('onload', fn);
	}
	else {
		window.onload = fn;
		return false;
	}
},

urlArguments: function() {
	var url = parent.document.location.href.split('?');
	var paramParts = new Array();
	if (1 < url.length) {
		paramParts = url[1].split('&');
	}
	var map = new Object;
	for (var i = 0; i < paramParts.length; i++) {
		var attr0val1 = paramParts[i].split('=');
		if (1 < attr0val1.length) {
			map[attr0val1[0]] = attr0val1[1];
		}
	}
	return map;
},

toMakimono: function() {
	this.mode = this.MODE_MAKIMONO;
},

toKamishibai: function() {
	this.mode = this.MODE_KAMISHIBAI;
},

start: function() {
	this.step = 1;
	this.go(0);
},

go: function (idx, selectedElem) {

	if (selectedElem != null) {
		var parent = null;
		if (this.mode == this.MODE_MAKIMONO) {
			parent = this.searchUpperElemnt(selectedElem, 'scene');
		} else {
			parent = this.display;
		}

		var elems = new Array();
		this.pickupElements(parent, 'link', elems);

		for (var i = 0; i < elems.length; i++) {
			elems[i].style.color = this.linkColor;
		}
		selectedElem.style.color = this.selectColor;
	}

	{ var i = this.step;
		while (true) {
			var elem = document.getElementById('sc' + i);
			if (elem == null) {
				break;
			}
			elem.parentNode.removeChild(elem);

			i++;
		}
	}

	var title = '';
	var html = '';

	var bodyParts = this.scene[idx].split('◇');
	if (2 <= bodyParts.length) {
		document.title = bodyParts[0];
		html = bodyParts[1];
	} else {
		html = this.scene[idx];
	}

	while (true) {
		var s = html.indexOf('[', 0);
		var e = html.indexOf(']', 0);

		var before = null;
		var linkParts = null;

		if (0 <= s && 0 <= e) {
			before = html.substring(s, e + 1);
			linkParts = html.substring(s + 1, e).split('→');

			if (linkParts.length != 2) {
				linkParts = html.substring(s + 1, e).split('←');
				if (linkParts.length == 2) {
					var swap = linkParts[0];
					linkParts[0] = linkParts[1];
					linkParts[1] = swap;
				} else {
					break;
				}
			}
		} else {
			s = html.indexOf('→', 0);
			if (0 <= s) {
				e = s + 1;
				while (e < html.length) {
					var c = html.charAt(e);
					if (isNaN(c) || c == ' ') {
						break;
					}
					e++;
				}
				before = html.substring(s, e);
				var linkNum = html.substring(s + 1, e);
				linkParts = new Array();
				linkParts[0] = '⇒' + linkNum;
				linkParts[1] = linkNum;
			} else {
				break;
			}
		}

		if (linkParts == null) {
			break;
		}

		var after = '<span class="link" onclick="go(' + linkParts[1] + ', this);">' + linkParts[0] + '</span>';

		html = html.replace(before, after);
	}

	while (0 <= html.indexOf('⇒', 0)) {
		html = html.replace('⇒', '→');
	}

	var id = null;
	if (this.mode == this.MODE_MAKIMONO) {
		id = 'sc' + this.step;
		var div = '<div id="' + id +  '" class="scene">' + html + '</div><p>';
		if (this.display.insertAdjacentHTML) {
			this.display.insertAdjacentHTML("BeforeEnd", div);
		} else {
			var r = document.createRange();
			r.selectNode(this.display);
			this.display.appendChild(r.createContextualFragment(div));
		}
		document.getElementById(id).step = this.step;
		document.getElementById(id).onmouseover = function() { PaperAdventure.step = this.step + 1; };
	} else {
		id = this.display.id;
		this.display.innerHTML = html;
		this.step ++;
	}
	this.trace.push(idx);

	{
		var elems = new Array();
		this.pickupElements(document.getElementById(id), 'link', elems);
		for (var i = 0; i < elems.length; i++) {
			elems[i].style.color = this.linkColor;
			elems[i].style.textDecoration = 'underline';
			elems[i].style.cursor = 'pointer';
		}
	}

	if (this.mode == this.MODE_MAKIMONO) {
		this.scroll();
	}
},

back: function () {
	this.trace.pop();
	idx = this.trace.pop();

	if (idx != null) {
		this.go(idx);
	}
},

pickupElements: function (parentElem, className, pickupElems) {

	if (pickupElems == null) {
		return;
	}

	var childElems = parentElem.childNodes;
	for (var i = 0; i < childElems.length; i++) {
		var elem = childElems[i];

		if (0 < elem.childNodes.length) {
			this.pickupElements(elem, className, pickupElems);
		}

		if (elem.className == className) {
			pickupElems.push(elem);
		}
	}
},

searchUpperElemnt: function(elem, className) {

	var parent = elem.parentNode;

	if (parent == null) {
		return null;
	}

	if (parent.className == className) {
		return parent;
	}

	return this.searchUpperElemnt(parent, className);
},

interval:1,
dx:0,
dy:10,

curX: null,
curY: null,

scroll: function() {

	window.scrollBy(this.dx, this.dy);

	var timer = setTimeout("PaperAdventure.scroll()", this.interval);

	var x = null;
	var y = null;

	if (document.all) {
		// ie
		x = document.body.scrollLeft;
		y = document.body.scrollTop;
	} else
	if (document.layers || document.getElementById) {
		x = pageXOffset;
		y = pageYOffset;
	}

	if (this.curX == x && this.curY == y) {
		clearTimeout(timer);
	} else {
		this.curX = x;
		this.curY = y;
	}
},

term: null

};

// shortcut
function go(idx, selectedElem) { PaperAdventure.go(idx, selectedElem); }
