/**FUNÇÕES PRINCIPAIS: eventos de botões*/
function main() {
    varbl.fill(0);
    str.fill(undefined);
    prog = [];
    cont = codeArea.value;
    optimize();
    idx = 0;
    token = prog[idx];
    markLabels();
    markBounds();
    idx = 0;
    token = prog[idx];
    program();
    resultArea.value += `\nTempo: ${dt / 1000} segundos\n`;
}

btRun.addEventListener("click", main);
btReset.addEventListener("click", reset);
for (const button of btSnipets) {
    button.addEventListener("click", markSnipet);
}
btDisplaySnipets.addEventListener("click", displaySnipets);

function reset() {
    resultArea.value = "";
}

function markSnipet(e) {
    const element = e.target;
    codeArea.focus();
    let cursor = codeArea.selectionStart;
    const simbol = element.id;
    codeArea.value = codeArea.value.slice(0, cursor) + simbol + codeArea.value.slice(cursor);
    codeArea.selectionStart = codeArea.selectionEnd = cursor + 1;
    if (element.className == "double")
        codeArea.selectionStart = codeArea.selectionEnd = cursor + 2;
}

function displaySnipets() {
    if (dvSnipets.className == "hide") {
        dvSnipets.className = "show";
        btDisplaySnipets.innerHTML = "Snipets &#9650;"
    } else {
        dvSnipets.className = "hide";
        btDisplaySnipets.innerHTML = "Snipets &#9660;"
    }
}