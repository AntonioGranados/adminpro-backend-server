var jwtoken = require('jsonwebtoken');

var SEED = require('../config/config').SEED;



// =============================
// Verificar Token
// =============================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token; // recibimos el token

    jwtoken.verify(token, SEED, (err, decoded) => { // Recibimos el token, el seed y un callback con un error o la informacion devuelta
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }
        req.usuario = decoded.usuario // Mostramos la informacion del usuario que viene en el decoded y la guardamos en el req.usuario
        next();
    });
}