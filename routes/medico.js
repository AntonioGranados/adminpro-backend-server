var express = require('express');
var mdwreAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importamos el esquema de medicos
var Medico = require('../models/medico');

// =============================
// Obtener todos los medicos
// =============================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0; // parametro opcional si no viene nada se pondra 0
    desde = Number(desde); // Nos aseguramos que la variable sea un numero

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') // Mostramos informacion de la tabla usuario el nombre y el email
        .populate('hospital') // mostramos toda la informacion de hospital
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener medicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });
        });
});

// =============================
// Crear un medico
// =============================
app.post('/', mdwreAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Médico guardado correctamente',
            medicoGuardado
        });
    });
});

// =============================
// Actualizar un medico
// =============================
app.put('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Medico actualizado correctamente',
                medicoGuardado
            });
        });
    });
});

// =============================
// Eliminar un medico
// =============================
app.delete('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Médico eliminado correctamente',
            medico: medicoEliminado
        });
    });
});


module.exports = app;