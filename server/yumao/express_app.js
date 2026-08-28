import express from "express";
import cors from "cors";
import index from "./api_index";
import user from "./api_user";
import admin from "./api_admin";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/index", index);
app.use("/api/v1/user", user);
app.use("/api/v1/admin", admin);

export default app;





