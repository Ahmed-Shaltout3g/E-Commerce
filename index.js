import { initatApp } from "./src/utils/initiatApp.js";
import express from "express";
import { config } from "dotenv";
config({ path: "./config/dev.env" });

const app = express();

initatApp(express, app);
