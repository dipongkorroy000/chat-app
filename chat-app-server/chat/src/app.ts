// app.ts
import cors from "cors";
import express, {Application, Request, Response} from "express";
import path from "path";
import router from "./app/routes/chat";

const app: Application = express();

app.use(express.static(path.join(__dirname, "../public")));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // controls access for HTTP requests (REST API calls, static assets)
  })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({message: "chat service running"});
});

app.use("/api/v1", router);

export default app;
