import { createServer } from "http"; // ✅ use HTTP, not HTTPS
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import connetdb from "./config/connectdb";
import { graphqlHTTP } from "express-graphql";
import Marketplace from "./mongoDb/router/Marketplace.router";
import { marketplace } from "./graphql/schemas/marketplace.schema";
import { startNFTListener } from "./mongoDb/controllers/listener.controlers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Frontend origin
const allowedOrigin = "https://leox-multi.vercel.app";

// ✅ CORS setup
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// ✅ Handle preflight requests globally
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// ✅ HTTP + Socket.io
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Routes
app.get("/", (_, res) => res.send("Welcome to the GraphQL API!"));
app.use("/api", Marketplace);
app.use("/g", graphqlHTTP({ schema: marketplace, graphiql: true }));

// ✅ Start server
const start = async () => {
  try {
    await connetdb();
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Allowed Origin: ${allowedOrigin}`);
    });
    await startNFTListener();
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

start();
