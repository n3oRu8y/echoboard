import { RedisStore } from "connect-redis";
import express from "express";
import session from "express-session";
import http from "http";
import redisClient from "./db/redis.js";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import routes from "./routes/index.js";
import AuthMiddleware from "./middlewares/AuthMiddleware.js";

const PORT = process.env.PORT;
const SESSION_SECRET = `${process.env.SESSION_SECRET}`;

const app = express();

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

app.use(AuthMiddleware);

app.use((req, res, next) => {
    res.locals.title = "오류";
    res.locals.user = req.session.user;
    next();
});

app.use(routes);

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log("Server running on 3000");
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