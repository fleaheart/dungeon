"use strict";
var SaikoroTaskTest;
(function (SaikoroTaskTest) {
    function init() {
        getElementById('btn').addEventListener('click', clickBtn);
    }
    SaikoroTaskTest.init = init;
    function getElementById(elementId) {
        var elm = document.getElementById(elementId);
        if (elm == null) {
            throw elementId + ' is not found.';
        }
        return elm;
    }
    function dbg(text) {
        var dbg = getElementById('debugBoard2');
        var h = dbg.innerHTML;
        h += '&nbsp;&nbsp;&nbsp;&nbsp;' + text + '<br>';
        dbg.innerHTML = h;
    }
    SaikoroTaskTest.dbg = dbg;
    var task = new SaikoroBattle.SaikoroTask(callback, rollingFunc);
    function clickBtn() {
        if (task.mode == 'idle' || task.mode == 'finish') {
            getElementById('result').innerHTML = '';
            getElementById('saikoro').innerHTML = '';
            task.do();
        }
        else if (task.mode == 'running') {
            task.asap();
        }
    }
    function callback(me) {
        getElementById('result').innerHTML = String(me + 1);
    }
    function rollingFunc(me) {
        getElementById('saikoro').innerHTML = SaikoroBattle.SaikoroTask.saikoroHTML(me);
    }
})(SaikoroTaskTest || (SaikoroTaskTest = {}));
//# sourceMappingURL=SaikoroTaskTest.js.map