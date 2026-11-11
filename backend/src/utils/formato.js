// Formatea un monto en pesos chilenos: 15000 -> $15.000
const formatearPesos = (valor) => '$' + Math.round(Number(valor) || 0).toLocaleString('es-CL');

// "$15.000" -> 15000; vacío o sin dígitos -> null
const aEntero = (valor) => {
    const digitos = String(valor ?? '').replace(/\D/g, '');
    return digitos ? parseInt(digitos, 10) : null;
};

// Escapa texto antes de insertarlo en HTML armado a mano (por ejemplo, en emails)
const escaparHtml = (texto) =>
    String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

export { formatearPesos, aEntero, escaparHtml };
