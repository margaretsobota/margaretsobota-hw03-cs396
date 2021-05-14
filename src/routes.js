"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");

const express = require("express");
const router = express.Router();

const ObjectId = require('mongoose').Types.ObjectId;


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });

// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({}).sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post(async(req, res) => {
        console.log("POST /doctors");
        try {
          if (!req.body.name || !req.body.seasons) {
            res.status(500).send({message: "Oops... bad data!"});
            console.log("bad!", req.body);
            return;
          }
          const newDoctor = req.body;
          const createdDoctor= await Doctor.create(newDoctor).save();
          res.status(201).send(createdDoctor);
        } catch(err) {
          res.status(500).send(err);
        }
    });

// optional:
router.route("/doctors/favorites")
    .get(async(req, res) => {
        console.log(`GET /doctors/favorites`);
        try {
          const favoriteDoctors = await FavoriteDoctor.find({});
          const doctors = [];
          for(let doctor of favoriteDoctors){
            const id = doctor.doctor;
            const doctorObj = await Doctor.findById(id);
            doctors.push(doctorObj);
          }
          res.status(200).send(doctors);
        } catch(err) {
          res.status(500).send(err);
        }

    })
    .post(async(req, res) => {
        console.log(`POST /doctors/favorites`);
        try{
          if (!req.body.doctor_id) {
            res.status(500).send({message: "Oops... bad data!"});
            return;
          }
          if (!ObjectId.isValid(req.body.doctor_id)) {
            res.status(500).send({message: "did not provide valid ID"});
            return;
          }
          const doctor = await Doctor.findById(req.body.doctor_id);
          if (!doctor) {
            res.status(500).send({message: "Oops... doctor not found!"});
            return;
          }
          const favorite = await FavoriteDoctor.create(doctor._id).save();
          res.status(201).send(doctor);
        }catch(err) {
          res.status(500).send(err);
        }

    });

router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .patch(async(req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        const updateObject = req.body;
        try {
          const updatedDoctor = await Doctor.findOneAndUpdate(
              { _id: req.params.id },
              {
                  $set: updateObject
              },
              { new: true }
          );
          if (!updatedDoctor) {
            res.status(404).send({message: "Oops... doctor not found!"});
            return;
          }
          res.status(200).send(updatedDoctor);
        } catch(error) {
          console.log(error);
          res.status(501).send({message: error});
        }
    })
    .delete(async(req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        try{
          const deleted = await Doctor.findOneAndDelete({
            _id: req.params.id
          });
          if (!deleted){
              res.status(404).send({message: "Oops... doctor not found!"});
              return;
          }
          res.status(200).send(null);
        } catch(err) {
          res.status(500).send(err);
        }
    });

router.route("/doctors/:id/companions")
    .get(async(req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        try {
          if (!ObjectId.isValid(req.params.id)) {
            res.status(404).send({message: "did not provide valid ID"});
            return;
          }
          const doctor = await Doctor.findById(req.params.id);
          if (!doctor) {
            res.status(404).send({message: "doctor not found"});
            return;
          }
          const companions = await Companion.find({
            doctors: {$in: req.params.id}
          });
          res.status(200).send(companions);
        } catch(err){
          res.status(500).send(err);
        }
    });


router.route("/doctors/:id/goodparent")
    .get(async(req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        try {
          if (!ObjectId.isValid(req.params.id)) {
            res.status(404).send({message: "did not provide valid ID"});
            return;
          }
          const doctor = await Doctor.findById(req.params.id);
          if (!doctor) {
            res.status(404).send({message: "doctor not found"});
            return;
          }
          const companions = await Companion.find({
            doctors: {$in: req.params.id}
          });
          const allAlive = companions.every(companion => {
            return companion.alive;
          })
          res.status(200).send(allAlive);
        } catch(err){
          res.status(500).send(err);
        }
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .get(async(req, res) => {
      console.log(`GET /doctors/favorites/${req.params.doctor_id}`);
      try{
        if (!ObjectId.isValid(req.params.doctor_id)) {
          res.status(404).send({message: "did not provide valid ID"});
          return;
        }
        const doctor = await Doctor.findById(req.params.doctor_id);
        const favoriteDoctor = await FavoriteDoctor.find({
          doctor: req.params.doctor_id
        });
        if(!doctor || favoriteDoctor.length === 0) {
          res.status(404).send({message: "doctor not found"});
          return;
        }
        res.status(200).send(doctor);
      }catch(err){
        console.log(err);
        res.status(500).send(err);
      }
    })
    .delete(async(req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        try {
          const deleted = await FavoriteDoctor.findOneAndDelete({
            doctor: req.params.doctor_id
          });
          res.status(200).send(null);
        } catch(err){
          res.status(500).send(err);
        }

    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({}).sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post(async(req, res) => {
        console.log("POST /companions");
        try {
          if (!req.body.name || !req.body.character || !req.body.doctors
              || !req.body.seasons || !req.body.alive
            ) {
            res.status(500).send({message: "Oops... bad data!"});
            return;
          }
          const newCompanion = req.body;
          const createdCompanion= await Companion.create(newCompanion).save();
          res.status(201).send(createdCompanion);
        } catch(err) {
          console.log(err);
          res.status(500).send(err);
        }
    });

router.route("/companions/crossover")
    .get(async(req, res) => {
        console.log(`GET /companions/crossover`);
        try{
          const companions = await Companion.find({
            "doctors.1": { "$exists": true }
          });
          res.status(200).send(companions);
        } catch(err){
          console.log(err);
          res.status(500).send(err);
        }
    });

// optional:
router.route("/companions/favorites")
    .get(async(req, res) => {
        console.log(`GET /companions/favorites`);
        try {
          const favoriteCompanions = await FavoriteCompanion.find({});
          const companions = [];
          for(let companion of favoriteCompanions){
            const id = companion.companion;
            const companionObj = await Companion.findById(id);
            companions.push(companionObj);
          }
          res.status(200).send(companions);
        } catch(err) {
          res.status(500).send(err);
        }
    })
    .post(async(req, res) => {
        console.log(`POST /companions/favorites`);
        try{
          if (!req.body.companion_id) {
            res.status(500).send({message: "Oops... bad data!"});
            return;
          }
          if (!ObjectId.isValid(req.body.companion_id)) {
            res.status(500).send({message: "did not provide valid ID"});
            return;
          }
          const companion = await Companion.findById(req.body.companion_id);
          if (!companion) {
            res.status(500).send({message: "Oops... doctor not found!"});
            return;
          }
          const favorite = await FavoriteCompanion.create(companion._id).save();
          res.status(201).send(companion);
        }catch(err) {
          res.status(500).send(err);
        }
    })

router.route("/companions/:id")
    .get(async(req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        try{
          if (!ObjectId.isValid(req.params.id)) {
            res.status(404).send({message: "did not provide valid ID"});
            return;
          }
          const companion = await Companion.findById(req.params.id);
          if (!companion) {
            res.status(404).send({message: "companion not found"});
            return;
          }
          res.status(200).send(companion);
        } catch(err){
          res.status(500).send(err);
        }

    })
    .patch(async(req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        const updateObject = req.body;
        try {
          const updatedCompanion = await Companion.findOneAndUpdate(
              { _id: req.params.id },
              {
                  $set: updateObject
              },
              { new: true }
          );
          if (!updatedCompanion) {
            res.status(404).send({message: "Oops... companion not found!"});
            return;
          }
          res.status(200).send(updatedCompanion);
        } catch(error) {
          res.status(501).send({message: error});
        }
    })
    .delete(async(req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        try{
          const deleted = await Companion.findOneAndDelete({
            _id: req.params.id
          });
          if (!deleted){
              res.status(404).send({message: "Oops... companion not found!"});
              return;
          }
          res.status(200).send(null);
        } catch(err) {
          res.status(500).send(err);
        }

    });

router.route("/companions/:id/doctors")
    .get(async(req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        try{
          if (!ObjectId.isValid(req.params.id)) {
            res.status(404).send({message: "did not provide valid ID"});
            return;
          }
          const companion = await Companion.findById(req.params.id);
          if (!companion) {
            res.status(404).send({message: "companion not found"});
            return;
          }
          const doctors = [];
          for (let id of companion.doctors) {
            const doctor = await Doctor.findById(id);
            doctors.push(doctor);
          }
          res.status(200).send(doctors);
        } catch(err){
          res.status(500).send(err);
        }
    });

router.route("/companions/:id/friends")
    .get(async(req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        try{
          if (!ObjectId.isValid(req.params.id)) {
            res.status(404).send({message: "did not provide valid ID"});
            return;
          }
          const companion = await Companion.findById(req.params.id);
          if (!companion) {
            res.status(404).send({message: "companion not found"});
            return;
          }
          const friends = await Companion.find({
            _id: {$ne: companion._id},
            seasons: {$in: companion.seasons}
          });
          res.status(200).send(friends);
        } catch(err){
          res.status(500).send(err);
        }
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .get(async(req, res) => {
      console.log(`GET /companions/favorites/${req.params.companion_id}`);
      try{
        if (!ObjectId.isValid(req.params.companion_id)) {
          res.status(404).send({message: "did not provide valid ID"});
          return;
        }
        const companion = await Companion.findById(req.params.companion_id);
        const favoriteCompanion = await FavoriteCompanion.find({
          companion: req.params.companion_id
        });
        if(!companion || favoriteCompanion.length === 0) {
          res.status(404).send({message: "companion not found"});
          return;
        }
        res.status(200).send(companion);
      }catch(err){
        console.log(err);
        res.status(500).send(err);
      }
    })
    .delete(async(req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        try {
          const deleted = await FavoriteCompanion.findOneAndDelete({
            companion: req.params.companion_id
          });
          res.status(200).send(null);
        } catch(err){
          res.status(500).send(err);
        }
    });

module.exports = router;
