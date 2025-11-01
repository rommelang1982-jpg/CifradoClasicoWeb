// === ELEMENTOS ===
const algorithmSelect = document.getElementById('algorithm');
const textInput = document.getElementById('text');
const keyInput = document.getElementById('key');
const keyHint = document.getElementById('keyHint');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const visualTitle = document.getElementById('visualTitle');
const visualContent = document.getElementById('visualContent');

// === ACTUALIZAR AL CAMBIAR ===
function updateAll() {
    updateKeyHint();
    showVisualExplanation();
}
algorithmSelect.addEventListener('change', updateAll);
textInput.addEventListener('input', updateAll);
keyInput.addEventListener('input', updateAll);

// === PISTA DE CLAVE ===
function updateKeyHint() {
    const algo = algorithmSelect.value;
    const hints = {
        caesar: 'Ej: 3 (desplazamiento 0-25)',
        vigenere: 'Ej: LEMON (solo letras)',
        transposition: 'Ej: 4 (columnas ≥ 2)',
        substitution: 'Ej: QWERTYUIOPASDFGHJKLZXCVBNM (26 letras únicas)'
    };
    keyHint.textContent = hints[algo];
}
updateKeyHint();

// === ENTRADA LIMPIA ===
function getInput() {
    const text = textInput.value.toUpperCase().replace(/[^A-Z]/g, '');
    const key = keyInput.value.trim().toUpperCase();
    return { text, key, algo: algorithmSelect.value };
}

// === RESULTADO ===
function setResult(text) {
    output.textContent = text || '(vacío)';
    copyBtn.style.display = text ? 'block' : 'none';
}
function copyToClipboard() {
    navigator.clipboard.writeText(output.textContent);
    const orig = copyBtn.textContent;
    copyBtn.textContent = '¡Copiado!';
    setTimeout(() => copyBtn.textContent = orig, 1500);
}

function clearAll() {
    document.getElementById('cipherForm').reset();
    setResult('');
    showVisualExplanation();
}

// === CIFRAR / DESCIFRAR ===
function encrypt() { runOperation(true); }
function decrypt() { runOperation(false); }

function runOperation(isEncrypt) {
    const { text, key, algo } = getInput();
    if (!text) return alert('Ingresa un texto');
    if (!key) return alert('Ingresa una clave');

    let result = '';
    try {
        if (isEncrypt) {
            switch (algo) {
                case 'caesar': result = caesar(text, parseInt(key)); break;
                case 'vigenere': result = vigenere(text, key, true); break;
                case 'transposition': result = transposition(text, parseInt(key), true); break;
                case 'substitution': result = substitution(text, key, true); break;
            }
        } else {
            switch (algo) {
                case 'caesar': result = caesar(text, (26 - parseInt(key)) % 26); break;
                case 'vigenere': result = vigenere(text, key, false); break;
                case 'transposition': result = transposition(text, parseInt(key), false); break;
                case 'substitution': result = substitution(text, key, false); break;
            }
        }
        setResult(result);
        showVisualExplanation(result, isEncrypt);
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// === EXPLICACIÓN VISUAL ===
function showVisualExplanation(result = '', isEncrypt = true) {
    const { text, key, algo } = getInput();
    visualTitle.textContent = isEncrypt ? `Cifrando con ${getName(algo)}` : `Descifrando con ${getName(algo)}`;
    visualContent.innerHTML = '';

    if (!text || !key) {
        visualContent.innerHTML = '<p style="opacity:0.7;">Ingresa texto y clave para ver la explicación.</p>';
        return;
    }

    switch (algo) {
        case 'caesar': showCaesar(text, key, result, isEncrypt); break;
        case 'vigenere': showVigenere(text, key, result, isEncrypt); break;
        case 'transposition': showTransposition(text, key, result, isEncrypt); break;
        case 'substitution': showSubstitution(text, key, result, isEncrypt); break;
    }
}

function getName(algo) {
    const names = { caesar: 'Cifrado César', vigenere: 'Cifrado Vigenère', transposition: 'Transposición', substitution: 'Sustitución' };
    return names[algo];
}

// === VISUAL: CÉSAR ===
function showCaesar(text, key, result, isEncrypt) {
    const shift = parseInt(key) % 26;
    let table = `<table><tr><th>Letra</th>${text.split('').map(c => `<th>${c}</th>`).join('')}</tr>`;
    table += `<tr><td>→</td>${text.split('').map(c => {
        const code = c.charCodeAt(0) - 65;
        const newCode = (isEncrypt ? (code + shift) : (code - shift + 26)) % 26;
        return `<td class="highlight">${String.fromCharCode(newCode + 65)}</td>`;
    }).join('')}</tr></table>`;
    visualContent.innerHTML = `<p>Desplazamiento: <strong>${shift}</strong></p>${table}`;
}

// === VISUAL: VIGENÈRE ===
function showVigenere(text, key, result, isEncrypt) {
    const keyRep = key.repeat(Math.ceil(text.length / key.length)).slice(0, text.length);
    let table = `<table><tr><th>Texto</th><th>Clave</th><th>→</th><th>Resultado</th></tr>`;
    for (let i = 0; i < text.length; i++) {
        const t = text[i], k = keyRep[i];
        const shift = k.charCodeAt(0) - 65;
        const code = t.charCodeAt(0) - 65;
        const res = String.fromCharCode(((isEncrypt ? code + shift : code - shift + 26) % 26) + 65);
        table += `<tr><td>${t}</td><td>${k}</td><td>→</td><td class="highlight">${res}</td></tr>`;
    }
    table += `</table>`;
    visualContent.innerHTML = `<p>Clave repetida: <strong>${keyRep}</strong></p>${table}`;
}

// === VISUAL: TRANSPOSICIÓN ===
function showTransposition(text, key, result, isEncrypt) {
    const cols = parseInt(key);
    const rows = Math.ceil(text.length / cols);
    const grid = Array(rows).fill().map(() => Array(cols).fill('X'));
    let i = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (i < text.length) grid[r][c] = text[i++];

    let html = `<p>Cuadrícula ${rows}×${cols} (X = relleno)</p><div class="grid-visual">`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        html += `<div class="grid-cell ${cell === 'X' ? 'fill' : ''}">${cell}</div>`;
    }
    html += `</div><p>Lectura por columnas → <strong>${result}</strong></p>`;
    visualContent.innerHTML = html;
}

// === VISUAL: SUSTITUCIÓN ===
function showSubstitution(text, key, result, isEncrypt) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let table = `<table><tr><th>Original</th><th>Nueva</th></tr>`;
    for (let i = 0; i < 26; i++) table += `<tr><td>${alpha[i]}</td><td class="highlight">${key[i] || '?'}</td></tr>`;
    table += `</table>`;
    const map = text.split('').map(c => `${c}→${key[alpha.indexOf(c)]}`).join(' ');
    visualContent.innerHTML = `<p>Mapeo: <strong>${map}</strong></p>${table}`;
}

// === ALGORITMOS ===
function caesar(text, shift) { shift %= 26; return text.split('').map(c => String.fromCharCode(((c.charCodeAt(0)-65+shift+26)%26)+65)).join(''); }
function vigenere(text, key, e) { let r='',i=0;for(let c of text){let s=key.charCodeAt(i++%key.length)-65;let code=c.charCodeAt(0)-65;let newCode=e?(code+s):(code-s+26);r+=String.fromCharCode((newCode%26)+65);}return r; }
function transposition(text, cols, e) {
    if (!e) { const rows=Math.ceil(text.length/cols); const g=Array(rows).fill().map(()=>Array(cols).fill('')); let i=0; for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)if(i<text.length)g[r][c]=text[i++]; let res=''; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(g[r][c]!=='X')res+=g[r][c]; return res; }
    else { const rows=Math.ceil(text.length/cols); const g=Array(rows).fill().map(()=>Array(cols).fill('X')); let i=0; for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(i<text.length)g[r][c]=text[i++]; let res=''; for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)res+=g[r][c]; return res; }
}
function substitution(text, key, e) {
    const a='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return e ? text.split('').map(c=>key[a.indexOf(c)]).join('') : text.split('').map(c=>{const i=key.indexOf(c);return i!==-1?a[i]:c;}).join('');
}
