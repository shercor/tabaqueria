function formatearPrecio(input) {
    console.log(input.value);
    let valor = input.value.replace(/[^0-9]/g, '');
    console.log('Se está formateando el precio');
    if (valor.length > 3) {
        valor =  valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    valor = '$' + valor;
    console.log('El nuevo valor es: ', valor);
    input.value = valor;
}