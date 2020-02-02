var express = require('express');
var bcrypt = require('bcryptjs');
var jwtoken = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// Importamos el esquema de usuarios
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => { // Buscamos especificamente el correo
        if (err) { // Si hay un error
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) { // Si no existe o el email es incorrecto
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) { // Como la contraseña esta encriptada, se usa el compareSync para ver si la contraseña guardada en la bd y la que escribe el usuario son iguales
            return res.status(400).json({ // Error en la contraseña
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear Token
        usuarioBD.password = ':)';
        var token = jwtoken.sign({ usuario: usuarioBD }, SEED, { expiresIn: 7200 }) // data, seed o identificador unico de token, tiempo de expiracion en este caso 2 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
});


module.exports = app;