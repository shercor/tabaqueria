const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Inicio',
        barra: true
    })
}

export{
    admin
}
