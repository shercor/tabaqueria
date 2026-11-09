// Envoltorios de SweetAlert (se carga como script global en el layout)

export const mostrarError = (mensaje) =>
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje || 'Ocurrió un problema' });

export const mostrarExito = (titulo, texto) =>
    Swal.fire({ icon: 'success', title: titulo, text: texto, confirmButtonText: 'Ok' });
