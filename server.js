import express from "express";
import cors from "cors";
import { generate } from "./chatBot.js";

const app = express();
app.use(express.json());
app.use(cors());

const port = 3005;

app.get("/", (req, res) => {
  res.send("Hello ");
});

app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;
  console.log("Message", message);

  const result = await generate(message, threadId);

  res.json({ message: result });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
