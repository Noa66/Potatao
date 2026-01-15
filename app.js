const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Mini site Web avec Express !");
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
