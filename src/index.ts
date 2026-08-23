import { RedisStore } from "connect-redis";
import express from "express";
import session from "express-session";
import http from "http";
import cookieParser from "cookie-parser";
import redisClient from "./db/redis.js";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import morgan from "morgan";
import routes from "./routes/index.js";
import AuthMiddleware from "./middlewares/AuthMiddleware.js";
import PageNotFound from "./middlewares/PageNotFound.js";
import PageError from "./middlewares/PageError.js";
import ViewService from "./application/view/ViewService.js";
import { SetupMiddleware } from "./middlewares/SetupMiddleware.js";
import CsrfMiddleware from "./middlewares/CsrfMiddleware.js";

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = `${process.env.SESSION_SECRET}`;

const app = express();

app.set("trust proxy", true);

app.disable('x-powered-by');

app.use(morgan("combined"));

app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: "sid",
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 30
    }
}));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(expressLayouts);
app.set("layout", "layout");

app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(cookieParser());

app.use(CsrfMiddleware);

app.use(SetupMiddleware);

app.use(AuthMiddleware);

app.use(async (req, res, next) => {
    res.locals.title = "오류";
    res.locals.user = req.session?.user;
    res.locals.navbarBoards = await ViewService.GetNavbarBoards();

    next();
});

app.use(routes);

app.use(PageNotFound);
app.use(PageError);

const server = http.createServer(app);

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on ${PORT}`);
});

function Shutdown() {
    console.log("Shutdown signal recieved");
    
    server.close(() => {
        console.log("All requests finished. Exiting now.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Force shutdown");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", Shutdown);
process.on("SIGINT", Shutdown);
