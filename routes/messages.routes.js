const express = require("express");
const router = express.Router();
const db = require("../db/connection");

// GET - afficher la page articles
router.get("/articles", (req, res) => {

    // Vérifier si l'utilisateur est connecté
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Récupérer les messages avec les noms d'utilisateur
    db.query(
        `SELECT m.id_message, m.content, m.id_user, u.username
        FROM message m
        JOIN user u ON m.id_user = u.id_user
        ORDER BY m.id_message DESC`,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur serveur");
            }

            res.render("articles", {
                messages: results,
                user: req.session.user
            });
        }
    );

});

// POST - créer un message
router.post("/messages", (req, res) => {

    // Vérifier si l'utilisateur est connecté
    console.log("Session user :", req.session.user);
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Récupérer le contenu du message
    const content = req.body.content;
    const userId = req.session.user.id;

    // if (!content) {
    //     return res.status(400).send("Message vide");
    // }


    // Insérer le message dans la base de données
    if (!content || content.trim() === "") {
        return res.status(400).send("Le message ne peut pas être vide");
    }
    else{
        db.query(
            "INSERT INTO message (id_user, content) VALUES (?, ?)",
            [userId, content],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Erreur serveur");
                }

                // Rediriger vers la page des articles
                res.redirect("/articles");
            }
        );
    }
});

// GET formulaire édition
router.get("/messages/edit/:id", (req, res) => {
    const messageId = req.params.id;

    // Récupérer le message à éditer
    db.query(
        "SELECT * FROM message WHERE id_message = ?",
        [messageId],
        (err, results) => {
            if (err) return res.status(500).send("Erreur serveur");
            if (results.length === 0) return res.send("Message introuvable");

            // Rendre le formulaire d'édition avec le message existant
            res.render("edit_message", { message: results[0] });
        }
    );
});

// POST sauvegarde modification
router.post("/messages/edit/:id", (req, res) => {
    const messageId = req.params.id;
    const newContent = req.body.content;

    // Mettre à jour le message dans la base de données
    db.query(
        "UPDATE message SET content = ? WHERE id_message = ?",
        [newContent, messageId],
        (err) => {
            if (err) return res.status(500).send("Erreur serveur");

            // Rediriger vers la page des articles
            res.redirect("/articles");
        }
    );
});

// GET suppression
router.get("/messages/delete/:id", (req, res) => {
    const messageId = req.params.id;

    // Supprimer le message de la base de données
    db.query(
        "DELETE FROM message WHERE id_message = ?",
        [messageId],
        (err) => {
            if (err) return res.status(500).send("Erreur serveur");
            
            // Rediriger vers la page des articles
            res.redirect("/articles");
        }
    );
});



module.exports = router;
