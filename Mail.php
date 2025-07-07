<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    echo "Votre demande ou question(s) a bien été envoyé !:D ";
} else {
    echo "Erreur : La demande n'a pas été envoyé :(";
}
