const inicio = (req, res) => {
    res.render('inicio', { pagina: 'Inicio', barra: true });
};

export { inicio };
