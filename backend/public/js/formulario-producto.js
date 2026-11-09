// Formulario de producto: previsualiza la imagen elegida antes de guardar
const inputImagen = document.getElementById('imagen');
const vistaPrevia = document.getElementById('vista-previa');

inputImagen?.addEventListener('change', () => {
    const archivo = inputImagen.files[0];
    if (!archivo || !vistaPrevia) return;

    const lector = new FileReader();
    lector.onload = (evento) => {
        vistaPrevia.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
});
