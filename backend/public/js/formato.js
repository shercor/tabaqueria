// Formatea un monto en pesos chilenos: 15000 -> $15.000
export const formatearPesos = (valor) => '$' + Math.round(Number(valor) || 0).toLocaleString('es-CL');

// Evita que un texto (por ejemplo, el nombre de un producto) se interprete como HTML
export function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// Formatea en vivo los inputs con data-formato="pesos": 15000 -> $15.000
export function activarInputsDePesos() {
    document.querySelectorAll('input[data-formato="pesos"]').forEach((input) => {
        input.addEventListener('input', () => {
            const digitos = input.value.replace(/\D/g, '');
            input.value = digitos ? formatearPesos(digitos) : '';
        });
    });
}
