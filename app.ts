import "reflect-metadata";
import 'tsconfig-paths/register';
import { createExpressServer } from "routing-controllers";
import * as path from "path";
import express from "express";
import { typeOrmLoader } from "./src/loaders";
import { env } from "./env";

async function startApplication() {

  /**
   * creates express app, registers all controller routes and returns express app instance
   */
  const app = createExpressServer({
    routePrefix: env.app.prefix,
    controllers: [
      path.join(__dirname, './src/api/controllers/**/*.ts')
    ],
    middlewares: [],
    defaultErrorHandler: false,
  });

  app.use(express.static(path.join(__dirname, "public")));

  //establish DB connection
  await typeOrmLoader();

  // run express application on port 3000
  app.listen(env.APP_PORT || 3000);
  console.log("Express server listening on port", process.env.APP_PORT);
}

startApplication();
