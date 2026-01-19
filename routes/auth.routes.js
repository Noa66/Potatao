const express = require("express");
const router = express.Router(); 
const db = require("../db/connection");
const md5 = require("md5");

// Route POST pour inscription
router.post("/register", async (req, res) => {

    // Récupérer les données du formulaire
    const { username, password } = req.body;

    try {

        // Insérer l'utilisateur dans la base de données
        const hashedPassword = md5(password);
        db.query(
            "INSERT INTO user (username, password) VALUES (?, ?)",
            [username, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        // Gestion de l'erreur de doublon
                        return res.send("Nom d'utilisateur déjà pris");
                    }
                    throw err;
                }

                // Inscription réussie, redirection page login
                res.redirect("/login?success=1");
            }
        );
    } catch (err) {
        console.error(err);
        res.send("Erreur serveur");
    }
});

// Route POST pour connexion
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Merci de remplir tous les champs");
    }

    // Vérifier si l'utilisateur existe
    db.query(
        "SELECT * FROM user WHERE username = ?",
        [username],
        async (err, results) => {
            if (err) throw err;

            // Si aucun utilisateur trouvé
            if (results.length === 0) {
                return res.send("Nom d'utilisateur ou mot de passe incorrect");
            }

            const user = results[0];

            // Comparer le mot de passe avec celui en base de données
            const match = md5(password) === user.password;
            if (!match) {
                return res.send("Nom d'utilisateur ou mot de passe incorrect");
            }

            // Initialiser la session utilisateur
            req.session.user = {
                id: user.id_user,
                username: user.username
            };

            // Connexion réussie
            // Rediriger vers la page des articles
            res.redirect("/articles"); 
        }
    );
});

// GET /logout
router.get("/logout", (req, res) => {

    // Détruire la session
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la déconnexion");
        }

        // Redirige vers la page d'accueil
        res.redirect("/");
    });
});


// GET /delaccount
router.get("/delaccount", (req, res) => {
    const userId = req.session.user.id;

    // Supprimer l'utilisateur de la base de données
    db.query(
        "DELETE FROM user WHERE id_user = ?",
        [userId],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur serveur");
            }
        }
    );
    // Supprimer tous les messages de l'utilisateur
    db.query(
        "DELETE FROM message WHERE id_user = ?",
        [userId],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur serveur");
            }
        }
    );
    // Détruire la session
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la suppression du compte");
        }
    // Redirige vers la page d'accueil
    res.redirect("/");
    });
});



module.exports = router;
