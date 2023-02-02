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
            varbl[index.value * VARMAX + i] = Number(prompt("Número: "));
            resultArea.value += varbl[index.value * VARMAX + i] + "\n";
        } else {
            varbl[index.value * VARMAX] = Number(prompt("Número: "));
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
            let string = prompt("Caractere: ");
            str[index.value][i] = string[0];
            resultArea.value += str[index.value][i] + "\n";
        } else {
            str[index.value] = prompt("Caracteres: ");
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