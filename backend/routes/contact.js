// import express from "express";
// import Lead from "../models/Lead.js";

// import {
//   sendContactNotification,
//   sendAutoReply
// } from "../lib/email.js";
const express = require("express");
const router = express.Router();

const { Lead } = require("../lib/models");

const {
  sendContactNotification,
  sendAutoReply
} = require("../lib/email");

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      budget,
      message
    } = req.body;

    const finalBudget = budget || "";

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const lead = await Lead.create({
      name,
      email,
      budget: finalBudget,
      message
    });

    await sendContactNotification({
      name,
      email,
      budget: finalBudget,
      message
    });

    await sendAutoReply({
      name,
      email
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      lead
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;