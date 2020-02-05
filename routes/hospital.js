var express = require('express');
var mdwreAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importamos el esquema de hospital
var Hospital = require('../models/hospital');

// =============================
// Obtener todos los hospitales
// =============================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0; // parametro opcional si no viene nada se pondra 0
    desde = Number(desde); // Nos aseguramos que la variable sea un numero

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') // De la tabla usuario mostramos el nombre y el email
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospitales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });
            });
        });
});

// =============================
// Crear un hospital
// =============================
app.post('/', mdwreAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar hospital en la base de datos',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Hospital guardado correctamente',
            hospitalGuardado
        });
    });
});

// =============================
// Actualizar un hospital
// =============================
app.put('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado correctamente',
                hospital: hospitalGuardado
            });
        });
    });
});

// =============================
// Eliminar un hospital
// =============================
app.delete('/:id', mdwreAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con el id ' + id,
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital Eliminado Correctamente',
            hospital: hospitalEliminado
        });
    });
});


module.exports = app;