const express = require("express");

const openingController = require(
    "../controllers/opening.controller"
);

const router = express.Router();

router.get(
    "/",
    openingController.getOpenings
);

router.get(
    "/design/:designId",
    openingController.getOpeningsByDesign
);

router.get(
    "/:id",
    openingController.getOpeningById
);

router.post(
    "/",
    openingController.createOpening
);

router.delete(
    "/:id",
    openingController.deleteOpening
);

module.exports = router;