var express = require('express');
var bcrypt = require('bcryptjs');
var jwtoken = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// Importamos el esquema de usuarios
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================
// Autenticacion de Google
// ================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token; // recibimos el token
    var googleUser = await verify(token).catch(err => { // esperamos respuesta de la funcion
        return res.status(403).json({ // si hay error
            ok: false,
            mensaje: 'Token no válido'
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => { // verificamos si el email del usuario viene en la informacion
        if (err) { // Si hay un error
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioBD) { // Si viene usuario de base de datos quiere decir que es una reautenticacion
            if (usuarioBD.google === false) { // si no ha sido autenticado por google
                if (err) { // Si hay un error
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticacion normal'
                    });
                } else { // el usuario ya existe en la bd y se le genera un nuevo token
                    var token = jwtoken.sign({ usuario: usuarioBD }, SEED, { expiresIn: 7200 }) // data, seed o identificador unico de token, tiempo de expiracion en este caso 2 horas
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioBD,
                        token: token,
                        id: usuarioBD._id
                    });
                }
            }
        } else {
            // El usuario no existe en la bd, hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => { // Guardamos en la bd generandole un token
                var token = jwtoken.sign({ usuario: usuarioBD }, SEED, { expiresIn: 7200 }) // data, seed o identificador unico de token, tiempo de expiracion en este caso 2 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });
});

// ================================
// Autenticacion normal
// ================================
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