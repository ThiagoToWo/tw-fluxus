/**FUNÇÕES ÚTEIS PRIMÁRIAS: chamadas na função principal*/
function optimize() {
    let c = 0;
    let p = 0;
    prog[p] = cont[c];
    while (prog[p] != undefined) {
        if (isspace(prog[p])) {
            while (isspace(cont[++c]));
            prog[p] = cont[c];
        }
        if (prog[p] == "\"") {
            while ((prog[++p] = cont[++c]) != "\"");
        }
        if (prog[p] == "#") {
            while (cont[++c] != "\n" && cont[c] != undefined);
            prog[p] = cont[c];
            continue;
        }
        prog[++p] = cont[++c];
    }
}

function markLabels() {
    const temp = { value: undefined };
    if (token == "{") {
        getnext();
    } else {
        error(7); /*the program must start with {*/
    }
    if (isdigit(token) || token == "+" || token == ".") {
        scannum(temp);
        if (token != ";") error(6);
        labl[idx] = temp.value;
    }
    while (prog[idx] != undefined) {
        if (token == ";") {
            getnext();
            if (token == "}") {
                getnext();
            }
            if (isdigit(token) || token == "+" || token == ".") {
                scannum(temp);
                if (token != ";") error(6);
                labl[idx] = temp.value;
            }
        } else {
            getnext();
        }
    }
}

function markBounds() {
    for (let i = 0; prog[i] != undefined; i++) {
        if (prog[i] == "{") {
            start = i;
        } else if (prog[i] == "}") {
            end = i;
        }
    }
}

/*FUNÇÕES ÚTEIS SECUNDÁRIAS: auxiliam as funções úteis chamadas na função principal*/
function getnext() {
    token = prog[++idx];
}

function error(e) {
    const errors = [
        "Error",                                    /*error(0)*/
        "Unexpected token",                         /*error(1)*/
        "Not a valid expression",                   /*error(2)*/
        "Invalid comparison simbol",                /*error(3)*/
        "Invalid variable name",                    /*error(4)*/
        "Invalid command",                          /*error(5)*/
        "; expected",                               /*error(6)*/
        "the program must start with {",            /*error(7)*/
        "= expected",                               /*error(8)*/
        "[ character expected",                     /*error(9)*/
        "Division by zero",                         /*error(10)*/
        "the number has more than 100 digits",      /*error(11)*/
        "the string has more than 100000 chars",    /*error(12)*/
        "the array is out of bounds"                /*error(13)*/
    ];
    resultArea.value += "\nSnippet: ";
    for (let i = -5; i <= 5; i++) {
        if (prog[idx + i] != undefined) {
            resultArea.value += prog[idx + i];
        }
    }
    resultArea.value += `. Current token: ${token}. In idx = ${idx}.`;
    resultArea.value += ` Error: ${errors[e]}.\n`;
    throw new Error("exit(1)");
}

function scannum(n) {
    let val;
    let power = 1.0;
    let signal;
    let esignal;
    let exp = 0.0;
    signal = (prog[idx] == "-") ? -1 : 1;
    if (prog[idx] == "+" || prog[idx] == "-") idx++;
    for (val = 0.0; isdigit(prog[idx]); idx++) {
        val = 10.0 * val + Number(prog[idx]);
    }
    if (prog[idx] == ".") idx++;
    for (power = 1.0; isdigit(prog[idx]); idx++) {
        val = 10.0 * val + Number(prog[idx]);
        power *= 10.0;
    }
    if (prog[idx] == "e" || prog[idx] == "E") {
        idx++;
        esignal = (prog[idx] == "-") ? -1 : 1;
        if (prog[idx] == "+" || prog[idx] == "-") idx++;
        for (exp = 0; isdigit(prog[idx]); idx++) {
            exp = 10 * exp + Number(prog[idx]);
        }
    }
    if (esignal > 0) {
        n.value = signal * (val / power) * Math.pow(10, exp);
    } else {
        n.value = signal * (val / power) / Math.pow(10, exp);
    }
    token = prog[idx];
}

function scanstr(s) {
    match("\"");
    let i = 0;
    while (token != "\"" && i < STRLEN - 1) {
        if (token == "\\") {
            getnext();
            switch (token) {
                case "a": s[i++] = "\a"; break;
                case "b": s[i++] = "\b"; break;
                case "f": s[i++] = "\f"; break;
                case "n": s[i++] = "\n"; break;
                case "r": s[i++] = "\r"; break;
                case "t": s[i++] = "\t"; break;
                case "v": s[i++] = "\v";
            }
        } else {
            s[i++] = token;
        }
        getnext();
    }
    if (i == STRLEN - 1) error(12); /*the string has more than 100000 characters*/
    match("\"");
}

function isspace(c) {
    return c == " " || c == "\n" || c == "\t";
}

function isdigit(c) {
    if (c == undefined) return false;
    const cta = c.charCodeAt(0);
    return cta >= 48 && cta <= 57;
}

function isalpha(c) {
    const cta = c.charCodeAt(0);
    return (cta >= 65 && cta <= 90) || (cta >= 97 && cta <= 122);
}

function match(c) {
    if (token == c) getnext();
    else error(1);
}