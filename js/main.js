/**ELEMENTOS HTML*/
const codeArea = document.querySelector("#code");
const resultArea = document.querySelector("#result");
const btRun = document.querySelector("#inRun");
const btReset = document.querySelector("#inReset");
const btSnipets = document.querySelectorAll("#snipets input");

/**VARIÁVEIS GLOBAIS*/
const PROGLEN = 10000;
const VARMAX = 26;
const VARLEN = 1000000;
const STRLEN = 100000;
const FNAMELEN = 100;

const varbl = new Array(VARMAX * VARLEN); /*array of numerical variables*/
const str = new Array(VARMAX); /*array of string variables*/
let prog = []; /*optimized program string pointer*/
let cont; /*program content text*/
const labl = []; /*label characters and their values*/
let token; /*current character in program*/
let idx; /*current token index*/
let back_pt; /*point at which the program loops back when return is called*/
let start; /*index at which the program starts*/
let end; /*index at which the program ends*/
let dt; /*the number of ticks since the execution starts*/

btRun.addEventListener("click", main);
btReset.addEventListener("click", reset);
for (const button of btSnipets) {
    button.addEventListener("click", markSnipet);
}

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
    if (simbol == "  ")
        codeArea.selectionStart = codeArea.selectionEnd = cursor + 2;
}

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

/**FUNÇÕES DA LINGUAGEM TW/FLUXUS: entrada/saída, comandos e cálculos*/
function program() {
    const t0 = new Date();
    match("{");
    statement_seq();
    dt = new Date() - t0;
}

function statement_seq() {
    while (token != "}") {
        statement();
        if (token == ";") {
            match(";");
        } else {
            error(6);
        }
    }
}

function statement() {
    switch (token) {
        case ">": /*read*/
            match(">");
            if (token == ">") {
                match(">");
                read();
            } else {
                error(5); /*Invalid command*/
            }
            break;
        case "<": /*write*/
            match("<");
            if (token == "<") {
                match("<");
                write();
            } else if (token == "-") { /*return*/
                match("-");
                match(";");
                back();
            } else {
                error(5); /*Invalid command*/
            }
            break;
        case "?": /*conditional*/
            conditional();
            break;
        case "-": /*branch*/
            match("-");
            if (token == ">") {
                match(">");
                branch();
            } else {
                error(5); /*Invalid command*/
            }
            break;
        case "=": /*subrotine*/
            match("=");
            if (token == ">") {
                match(">");
                subrotine();
            } else {
                error(5); /*Invalid command*/
            }
    }
    if (isalpha(token) || token == "$") { /*assignment*/
        assign();
    } else if (isdigit(token)) { /*lable handle*/
        label();
    }
}

/**entrada/saída*/
function assign() {
    if (isalpha(token)) {
        num_assign();
    } else if (token == "$") {
        text_assign();
    } else {
        error(4); /*Invalid variable name*/
    }
}

function num_assign() {
    const variable = { value: undefined };
    const index = { value: undefined };
    id(variable, index);
    if (token == "=") {
        match("=");
        let i = 0;
        varbl[index.value * VARMAX + i] = logical_expr();
        while (token == "," && i <= VARLEN) {
            match(",");
            ++i;
            varbl[index.value * VARMAX + i] = logical_expr();
        }
        if (i > VARLEN) error(13); /*the array is out of bounds*/
    } else if (token == "[") {
        match("[");
        let i = logical_expr();
        if (i > VARLEN) error(13); /*the array is out of bounds*/
        match("]");
        if (token == "=") {
            match("=");
            varbl[index.value * VARMAX + i] = logical_expr();
            while (token == "," && i <= VARLEN) {
                match(",");
                i++;
                varbl[index.value * VARMAX + i] = logical_expr();
            }
            if (i > VARLEN) error(13); /*the array is out of bounds*/
        } else {
            error(8); /*= expected*/
        }
    } else {
        error(4); /*Invalid variable name*/
    }
}

function text_assign() {
    const string = [];
    const variable = { value: undefined };
    const index = { value: undefined };
    match("$");
    id(variable, index);
    if (token == "=") {
        match("=");
        scanstr(string);
        str[index.value] = string;
    } else if (token == "[") {
        match("[");
        const i = logical_expr();
        match("]");
        if (token == "=") {
            match("=");
            str[index.value][i] = logical_expr();
        } else {
            error(8); /*= expected*/
        }
    } else {
        error(4); /*Invalid variable name*/
    }
}

function read() {
    container();
    while (token == ",") {
        match(",");
        container();
    }
}

function container() {
    const variable = { value: undefined };
    const index = { value: undefined };
    if (isalpha(token)) {
        id(variable, index);
        if (token == "[") {
            match("[");
            const i = logical_expr();
            if (i > VARLEN) error(13); /*the array is out of bounds*/
            match("]");
            varbl[index.value * VARMAX + i] = Number(prompt("Number: "));
            resultArea.value += varbl[index.value * VARMAX + i] + "\n";
        } else {
            varbl[index.value * VARMAX] = Number(prompt("Number: "));
            resultArea.value += varbl[index.value * VARMAX] + "\n";
        }
    } else if (token == "$") {
        match("$");
        id(variable, index);
        if (token == "[") {
            match("[");
            const i = logical_expr();
            if (i > STRLEN - 1) error(13); /*the array is out of bounds*/
            match("]");
            let string = prompt("Character: ");
            str[index.value][i] = string[0];
            resultArea.value += str[index.value][i] + "\n";
        } else {
            str[index.value] = prompt("Character(s): ");
            resultArea.value += str[index.value] + "\n";
        }
    } else {
        error(4); /*Invalid variable name*/
    }
}

function write() {
    sintagma();
    while (token == ",") {
        match(",");
        sintagma();
    }
}

function sintagma() {
    let result;
    const string = [];
    if (token == "\"") {
        let i = 1;
        while (prog[idx + i] != "\"") i++;
        if (prog[idx + i + 1] == ";" || prog[idx + i + 1] == ",") {
            scanstr(string);
            resultArea.value += string.join("");
        } else {
            result = logical_expr();
            resultArea.value += result;
        }
    } else if (token == "$") {
        const variable = { value: undefined };
        const index = { value: undefined };
        if (prog[idx + 2] == ";" || prog[idx + 2] == ",") {
            match("$");
            id(variable, index);
            resultArea.value += str[index.value].join("");
        } else if (prog[idx + 2] == "[") {
            let i = 3;
            while (prog[idx + i] != "]") i++;
            if (prog[idx + i + 1] == ";" || prog[idx + i + 1] == ",") {
                match("$");
                id(variable, index);
                match("[");
                const i = logical_expr();
                if (i > STRLEN - 1) error(13); /*the array is out of bounds*/
                match("]");
                resultArea.value += str[index.value][i];
            } else {
                result = logical_expr();
                resultArea.value += result;
            }
        }
    } else {
        result = logical_expr();
        resultArea.value += result;
    }
}

function id(variable, index) {
    if (isalpha(token)) {
        variable.value = token;
        index.value = (variable.value).toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        getnext();
    } else {
        error(4); /*Invalid variable name*/
    }
}

/**Comandos*/
function conditional() {
    match("?");
    const expression = logical_expr();
    match("?");
    match("-");
    match(">");
    if (expression == 1) {
        branch();
    } else {
        label();
    }
}

function branch() {
    const temp = { value: undefined };
    let pos;
    if (isdigit(token) || token == "+" || token == ".") {
        scannum(temp);
        if (token != ";") error(6);
        for (pos = 0; pos < PROGLEN; pos++) {
            if (temp.value == labl[pos]) break;
        }
        if (pos == PROGLEN) {
            resultArea.value += `The label ${temp.value} does not exist\n`;
            throw new Error("exit(1)");
        }
        idx = pos;
        token = prog[idx];
    } else {
        error(1); /*Unexpected token*/
    }
}

function subrotine() {
    let i = 0;
    while (prog[idx + i] != ";") i++;
    back_pt = idx + i;
    branch();
}

function label() {
    const temp = { value: undefined };
    scannum(temp);
}

function back() {
    idx = back_pt;
    token = prog[idx];
}

function logical_expr() {
    let temp = log_expr_term();
    while (token == "|") {
        match("|");
        temp = temp | log_expr_term();
    }
    return temp;
}

function log_expr_term() {
    let temp = log_expr_factor();
    while (token == "&") {
        match("&");
        temp = temp & log_expr_factor();
    }
    return temp;
}

function log_expr_factor() {
    let temp = relational_expr();
    switch (token) {
        case "=":
            match("=");
            if (token == "=") {
                match("=");
                temp = (temp == relational_expr());
            } else {
                error(3); /*Invalid comparison simbol*/
            }
            break;
        case "!":
            match("!");
            if (token == "=") {
                match("=");
                temp = (temp != relational_expr());
            } else {
                error(3); /*Invalid comparison simbol*/
            }
    }
    return temp;
}

function relational_expr() {
    let temp = simple_expr();
    switch (token) {
        case "<":
            match("<");
            if (token == "=") {
                match("=");
                temp = (temp <= simple_expr());
            } else {
                temp = (temp < simple_expr());
            }
            break;
        case ">":
            match(">");
            if (token == "=") {
                match("=");
                temp = (temp >= simple_expr());
            } else {
                temp = (temp > simple_expr());
            }
    }
    return temp;
}

function simple_expr() {
    let temp = term();
    while (token == "+" || token == "-") {
        switch (token) {
            case "+":
                match("+");
                temp += term();
                break;
            case "-":
                match("-");
                temp -= term();
        }
    }
    return temp;
}

function term() {
    let temp = factor();
    let divisor;
    while (token == "*" || token == "/" || token == "%") {
        switch (token) {
            case "*":
                match("*");
                temp *= factor();
                break;
            case "/":
                match("/");
                divisor = factor();
                if (divisor == 0) error(10); /*Division by zero*/
                temp /= divisor;
                break;
            case "%":
                match("%");
                divisor = factor();
                if (divisor == 0) error(10); /*Division by zero*/
                temp = Math.floor(temp) % Math.floor(divisor);
        }
    }
    return temp;
}

function factor() {
    const temp = { value: undefined };
    const string = [];
    if (token == "(") {
        match("(");
        temp.value = logical_expr();
        match(")");
    } else if (isdigit(token) || token == "+" || token == "-" || token == ".") {
        scannum(temp);
    } else if (isalpha(token)) {
        const variable = { value: undefined };
        const index = { value: undefined };
        id(variable, index);
        if (token == "[") {
            match("[");
            const i = logical_expr();
            match("]");
            temp.value = varbl[index.value * VARMAX + i];
        } else {
            temp.value = varbl[index.value * VARMAX];
        }
    } else if (token == "\"") {
        scanstr(string);
        temp.value = string[0];
    } else if (token == "$") {
        match("$");
        const variable = { value: undefined };
        const index = { value: undefined };
        id(variable, index);
        if (token == "[") {
            match("[");
            const i = logical_expr();
            match("]");
            temp.value = str[index.value][i];
        } else {
            temp.value = str[index.value];
        }
    } else {
        error(2); /*Not a valid expression*/
    }
    return temp.value;
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