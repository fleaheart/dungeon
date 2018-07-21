namespace SaikoroTaskTest {

	export function init() {
		getElementById('btn').addEventListener('click', clickBtn);
	}

	function getElementById(elementId: string): HTMLElement {
		let elm: HTMLElement | null = document.getElementById(elementId);
		if (elm == null) {
			throw elementId + ' is not found.';
		}
		return elm;
	}

	export function dbg(text: string) {
		let dbg = getElementById('debugBoard2');
		let h = dbg.innerHTML;
		h += '&nbsp;&nbsp;&nbsp;&nbsp;' + text + '<br>';
		dbg.innerHTML = h;
	}

	let task = new SaikoroBattle.SaikoroTask(callback, rollingFunc);

	function clickBtn() {
		if (task.mode == 'idle' || task.mode == 'finish') {
			getElementById('result').innerHTML = '';
			getElementById('saikoro').innerHTML = '';
			task.do();
		} else if (task.mode == 'running') {
			task.asap();
		}
	}

	function callback(me: number) {
		getElementById('result').innerHTML = String(me + 1);
	}

	function rollingFunc(me: number) {
		getElementById('saikoro').innerHTML = SaikoroBattle.SaikoroTask.saikoroHTML(me);
	}

}