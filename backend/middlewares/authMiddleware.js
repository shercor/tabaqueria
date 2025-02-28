import jwt from 'jsonwebtoken';

const verificarJWT = (req, res, next, isTest) => {

    // Obtención de Token
    const token = req.cookies._token;

    // Valida únicamente si nos encontramos en la vista de prueba de usuario
    if (isTest){
        if (token){
            req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        } 
        return next()
    }

    // Si no viene un Token, no se ha iniciado sesión aún
    if (!token) {
        return res.status(401).redirect('/auth/login'); // Si no existe token, 
    }

    // Si viene Token, hacer verificación de Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Se valida la firma del JWT con los datos del Payload y del Header, JWT_SECRET
        req.usuario = decoded; // Guarda la info del usuario en req
        return next();
    } catch (error) {
        return res.status(403).redirect('/auth/login'); // Token inválido
    }
};

export default verificarJWT;