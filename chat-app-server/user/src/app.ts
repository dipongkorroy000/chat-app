import cors from "cors";
import express, {Application, Request, Response} from "express";
import path from "path";
import router from "./app/routes/user";
import env from "./app/env";

const app: Application = express();

// Serve static files like CSS
app.use(express.static(path.join(__dirname, "../public"))); // Adjusted path

app.use(
  cors({
    credentials: true,
    origin: env.frontend_url,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1", router);

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send({message: "user service running"});
});

export default app;
