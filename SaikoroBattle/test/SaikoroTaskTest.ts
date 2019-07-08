namespace SaikoroTaskTest {

    export function init(): void {
        getElementById('btn').addEventListener('click', clickBtn);
    }

    function getElementById(elementId: string): HTMLElement {
        let elm: HTMLElement | null = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }

    export function dbg(text: string): void {
        let dbg = getElementById('debugBoard2');
        let h = dbg.innerHTML;
        h += '&nbsp;&nbsp;&nbsp;&nbsp;' + text + '<br>';
        dbg.innerHTML = h;
    }

    let task = new SaikoroBattle.SaikoroTask(callback, rollingFunc);

    function clickBtn(): void {
        if (task.mode == 'idle' || task.mode == 'finish') {
            getElementById('result').innerHTML = '';
            getElementById('saikoro').innerHTML = '';
            task.do();
        } else if (task.mode == 'running') {
            task.asap();
        }
    }

    function callback(me: number): void {
        getElementById('result').innerHTML = String(me + 1);
    }

    function rollingFunc(me: number): void {
        getElementById('saikoro').innerHTML = SaikoroBattle.SaikoroTask.saikoroHTML(me);
    }

}