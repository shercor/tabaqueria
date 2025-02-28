const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        barra: true,
        csrfToken: req.csrfToken()
    })
}

export{
    admin
}