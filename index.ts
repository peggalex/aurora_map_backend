// src/index.ts
import express, { Express, Request, Response } from "express";
import { AuroraForecastDataModule } from "./modules/aurora-forecast-data/application/module";

const init = async () => {
  const modules = {
    AuroraForecastData: await AuroraForecastDataModule.init(),
  };

  const app: Express = express();
  const port = 3000;

  app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });

  setTimeout(() => {
    const dataPullJob = modules.AuroraForecastData.getDataPullJob();
    console.log({
      lastExecuted: dataPullJob.lastExecution,
    });
  }, 5000);
};

init();
