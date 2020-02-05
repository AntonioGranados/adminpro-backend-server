var express = require('express');
var app = express();

var Hospital = require('../models/hospital'); // Modelo de hospitales
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ========================
// Busqueda por coleccion
//=========================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var expresionRegular = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) { // Se busca por tabla
        case 'usuarios': // en caso de que sea usuarios
            promesa = buscarUsuarios(busqueda, expresionRegular);
            break;

        case 'medicos': // en caso de que sea medicos
            promesa = buscarMedicos(busqueda, expresionRegular);
            break;

        case 'hospitales': // en caso de que sea hospitales
            promesa = buscarHospitales(busqueda, expresionRegular);
            break;

        default: // Si no es ninguna de las anteriores
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son: Usuarios, Médicos, Hospitales',
                error: { message: 'Tipo de tabla/colección no válida' }
            });
    }

    promesa.then(data => { // resultado de la busqueda
        res.status(200).json({
            ok: true,
            [tabla]: data // tabla entre [] para que muestre el nombre de la tabla, si no se pone saldria la palabra tabla
        });
    });
});

// ==================
// Busqueda General
//===================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda; // obtenemos lo que se esta buscando
    var expresionRegular = new RegExp(busqueda, 'i'); // creamos una variable para poder buscar lo que mandamos por url y la i es para que sea insensible y lo busque tal cual se escriba sin importar si viene con mayusculas o minusculas

    Promise.all([ // Arreglo de varias promesas
            buscarHospitales(busqueda, expresionRegular),
            buscarMedicos(busqueda, expresionRegular),
            buscarUsuarios(busqueda, expresionRegular)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});


function buscarHospitales(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: expresionRegular })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => { // Buscamos por el nombre y lo que se escriba
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: expresionRegular })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => { // Buscamos por el nombre y lo que se escriba
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': expresionRegular }, { 'email': expresionRegular }]) // el or es un arreglo de condiciones para buscar por varias columnas
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app; // exportamos para poder utilizarlo fuera de este archivo