const express = require("express");
const { userValidate } = require("../zod");
const { Account } = require("../db");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const zod = require("zod");

const app = express();
const router = express.Router();

router.get("/balence", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balence,
  });
});

router.post("/transfer", authMiddleware, async function (req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { amount, to } = req.body;
  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );
  if (!amount || amount > account.balence) {
    await session.abortTransaction();
    return res.status(400).json({
      msg: "Insuffiecient balence",
    });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);
  if (!toAccount) {
    session.abortTransaction();
    res.status(400).json({
      msg: "Invalid account",
    });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balence: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balence: amount } }
  ).session(session);

  await session.commitTransaction();
  res.json({
    message: " Transfer succesful",
  });
});

module.exports = router;
