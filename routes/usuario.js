var express = require('express');
var bcrypt = require('bcryptjs');
var jwtoken = require('jsonwebtoken');

var mdwreAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importamos el esquema de usuarios
var Usuario = require('../models/usuario');


// =============================
// Obtener todos los usuarios
// =============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // parametro opcional si no viene nada se pondra 0
    desde = Number(desde); // Nos aseguramos que la variable sea un numero

    Usuario.find({}, 'nombre email img role')
        .skip(desde) // funcion de mongoose para decirle que salte lo que venga en la variable desde
        .limit(5) // muestra solo 5 registros
        .exec((err, usuarios) => { // listado de usuarios obteniendo solo el nombre email role e img
            if (err) { // Si encuentra algún error
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => { // Hacemos el conteo de registros
                if (err) { // Si encuentra algún error
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los usuarios',
                        errors: err
                    });
                }

                // Si no sucede ningún error
                res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo // muestra el numero total de registros
                });
            });
        });
});


// =============================
// Crear un nuevo usuario
// =============================
app.post('/', mdwreAutenticacion.verificaToken, (req, res) => {
    var body = req.body; // extraemos el body
    var usuario = new Usuario({ // Creamos un objeto de tipo usuario
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Encriptamos la contraseña
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => { // Guardamos en la bd
        if (err) { // Si hay algún error
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario en la base de datos',
                errors: err
            });
        }

        // Si no hay ningún error
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// =============================
// Actualizar un usuario
// =============================
app.put('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id; // Obtenemos el id
    var body = req.body; // Obtenemos nuevamente toda la informacion para actualizar

    Usuario.findById(id, (err, usuario) => { // Buscamos un usuario por el id
        if (err) { // Si ha un error
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) { // Si no viene un usuario o viene null
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });

        }

        usuario.nombre = body.nombre; // usuario.nombre va ser igual a lo que se envie en el body
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => { // Se guarda la actualizacion en la bd
            if (err) { // Si hay un error
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)'; // No devolvemos la contraseña cuando actualizamos el usuario

            res.status(200).json({ //Si no hay errores se actualiza el usuario
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuario: usuarioGuardado
            });
        });
    });
});

// =============================
// Eliminar un usuario por el id
// =============================
app.delete('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario',
                errors: err
            });
        }

        if (!usuarioEliminado) { // Si no viene un usuario o viene null
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con el id ' + id,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado correctamente',
            usuario: usuarioEliminado
        });
    });
});



module.exports = app; // exportamos para poder utilizarlo fuera de este archivo