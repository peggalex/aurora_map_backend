// src/index.ts
import express, { Express, Request, Response } from "express";
import { AuroraForecastDataModule } from "./modules/aurora-forecast-data/application/module";
import { ApiGatewayModule } from "./modules/api-gateway/application/module";

const init = async () => {
  const auroraForecastDataModule = await AuroraForecastDataModule.init();
  const modules = {
    AuroraForecastData: auroraForecastDataModule,
    ApiGateway: await ApiGatewayModule.init(auroraForecastDataModule),
  };
};

init();
