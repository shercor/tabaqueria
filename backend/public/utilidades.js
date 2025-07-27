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

async function quitarDelCarro(e, pedidoId) {
    e.preventDefault(); // prevenir comportamiento por defecto del botón

    console.log("Restando una unidad del producto del carrito");

    const button = e.currentTarget; // se recomienda usar currentTarget en vez de target
    const detalleProductoId = button.dataset.id;
    const productoId = button.dataset.productoid;
    const productoCantidad = parseInt(button.dataset.cantidad, 10);

    console.log(`Restando del carrito: ${detalleProductoId}`);
    console.log(`Pedido ID: ${pedidoId}`);

    await fetch("/pedidos/quitar-del-carro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "CSRF-Token": !{JSON.stringify(csrfToken)}  // asegúrate de pasarlo correctamente
        },
        body: JSON.stringify({ productoId, detalleProductoId, pedidoId, productoCantidad })
    });

    actualizarCarrito();
}

async function agregarAlCarro(e) {
    e.preventDefault();

    const button = e.currentTarget;
    const productoId = button.dataset.productoid;

    console.log("Añadiendo una unidad del producto al carrito");

    await fetch("/pedidos/agregar-al-carro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "CSRF-Token": !{JSON.stringify(csrfToken)}  
        },
        body: JSON.stringify({ productoId, cantidad: 1 })
    });

    actualizarCarrito();
}