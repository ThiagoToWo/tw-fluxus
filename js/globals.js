/**ELEMENTOS HTML*/
const codeArea = document.querySelector("#code");
const resultArea = document.querySelector("#result");
const btRun = document.querySelector("#btRun");
const btReset = document.querySelector("#btReset");
const btSnipets = document.querySelectorAll("#snipets input");
const btDisplaySnipets = document.querySelector("#btDisplaySnipets");
const dvSnipets = document.querySelector("#snipets");

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