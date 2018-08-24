namespace Dungeon {

	const ippen = 36;

	export function constructor_init(): void {
		Kyoutsu.getElementById('refresh').addEventListener('click', refresh);

		let partsBoard = Kyoutsu.getElementById('div_partsBoard');

		let futosa: number = 2;

		for (let i = 0; i < 16; i++) {
			let c: string = i.toString(16).toUpperCase();

			let kukaku: HTMLElement = document.createElement('DIV');
			kukaku.className = 'kukaku';
			kukaku.style.margin = '4px';
			kukaku.style.border = '1px solid grey';
			kukaku.style.width = (ippen + futosa * 2) + 'px';
			kukaku.style.height = (ippen + futosa * 2) + 'px';

			let map: HTMLElement = document.createElement('DIV');
			map.id = 'parts[' + i + ']';
			setStyle(map, c.toUpperCase(), ippen, futosa);
			let nakami: HTMLElement = document.createElement('DIV');

			nakami.id = 'nakami[' + i + ']';
			nakami.className = 'nakami';
			nakami.style.width = ippen + 'px';
			nakami.style.height = ippen + 'px';

			nakami.textContent = String(c);

			map.appendChild(nakami);
			kukaku.appendChild(map);
			partsBoard.appendChild(kukaku);

			kukaku.addEventListener('mousedown', selectKukaku);
		}

		// dragdrop
		document.body.addEventListener('mousemove', drag);
		document.body.addEventListener('mouseup', dragStop);
	}

	let _mapdata: Array<string> = new Array<string>();

	function refresh(): void {
		let textarea = <HTMLTextAreaElement>Kyoutsu.getElementById('maptext');
		_mapdata = textarea.value.split(/[\r\n]+/g);

		let div_map: HTMLElement = Kyoutsu.getElementById('div_map');
		mapview(div_map, _mapdata, '');
	}

	function selectKukaku(e: MouseEvent): void {
		let element: HTMLElement | null = Kyoutsu.searchParentElement(<HTMLElement>e.target, 'kukaku');
		if (element == null) {
			return;
		}

		let rect: ClientRect = element.getBoundingClientRect();

		let mover: HTMLElement = <HTMLElement>element.cloneNode(true);
		mover.style.margin = '0';
		mover.style.border = '1px dashed red';
		mover.style.background = 'pink';

		mover.style.position = 'absolute';
		mover.style.top = rect.top + 'px';
		mover.style.left = rect.left + 'px';

		document.body.appendChild(mover);

		dragStart(e, mover);
	}

	let _dragObject: HTMLElement | undefined = undefined;
	let _startTop: number = 0;
	let _startLeft: number = 0;
	let _startX: number = 0;
	let _startY: number = 0;
	function dragStart(e: MouseEvent, element: HTMLElement): void {
		if (_dragObject != undefined) {
			return;
		}

		_dragObject = element;

		_startLeft = element.offsetLeft;
		_startTop = element.offsetTop;

		_startX = e.clientX;
		_startY = e.clientY;
	}

	function drag(e: MouseEvent): void {
		if (_dragObject == undefined) {
			return;
		}

		let x = _startLeft - (_startX - e.clientX);
		let y = _startTop - (_startY - e.clientY);

		_dragObject.style.left = x + 'px';
		_dragObject.style.top = y + 'px';
	}

	function dragStop(e: MouseEvent): void {
		if (_dragObject == undefined) {
			return;
		}

		let dropx = _startLeft - (_startX - e.clientX);
		let dropy = _startTop - (_startY - e.clientY);

		let boxippen = (ippen + 2 * 2);
		dropx = Math.floor(dropx + (boxippen / 2));
		dropy = Math.floor(dropy + (boxippen / 2));

		dropx = dropx - (dropx % boxippen);
		dropy = dropy - (dropy % boxippen);

		_dragObject.style.left = (dropx + 10) + 'px';
		_dragObject.style.top = (dropy + 6) + 'px';

		let c: string | null = _dragObject.textContent;
		if (c != null) {


			let x: number = dropx / boxippen;
			let y: number = (dropy - 200) / boxippen;

			for (let i = 0; i < y; i++) {
				let line: string | undefined = _mapdata[i];
				if (line == undefined) {
					line = '';
					_mapdata[i] = line;
				}
			}

			let line: string | undefined = _mapdata[y];
			if (line == undefined) {
				line = '';
			}

			while (line.length < x) {
				line = line + '0';
			}

			line = line.substr(0, x) + c + line.substr(x + 1);

			_mapdata[y] = line;

			(<HTMLTextAreaElement>document.getElementById('maptext')).value = _mapdata.join('\r\n');

			let div_map: HTMLElement = Kyoutsu.getElementById('div_map');
			mapview(div_map, _mapdata, '');
		}

		document.body.removeChild(_dragObject);

		_dragObject = undefined;
		_startTop = 0;
		_startY = 0;
	}
}
