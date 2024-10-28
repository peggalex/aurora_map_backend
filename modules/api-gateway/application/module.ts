import express, { Express, Request, Response } from "express";
import { AuroraForecastDataModule } from "../../aurora-forecast-data/application/module";
import { IAuroraForecastDataModuleApi } from "../../aurora-forecast-data/application/module-api";

export class ApiGatewayModule {
  private static singleton:
    | { type: "NOT_INITIALIZED" }
    | { type: "INITIALIZING" }
    | { type: "INITIALIZED"; instance: ApiGatewayModule } = {
    type: "NOT_INITIALIZED",
  };

  private constructor(private app: Express) {}

  /**
   * Initialize module instance
   */
  static async init(auroraForecastDataModule: IAuroraForecastDataModuleApi) {
    if (ApiGatewayModule.singleton.type !== "NOT_INITIALIZED") {
      throw Error(`Already started initializing AuroraForecastDataModule`);
    }
    ApiGatewayModule.singleton = {
      type: "INITIALIZING",
    };
    const instance = await ApiGatewayModule.createInstance(
      auroraForecastDataModule
    );
    ApiGatewayModule.singleton = {
      type: "INITIALIZED",
      instance,
    };
    return instance;
  }

  private static async createInstance(
    auroraForecastDataModule: IAuroraForecastDataModuleApi
  ): Promise<ApiGatewayModule> {
    const logger = {
      info: (msg: string) =>
        console.log(`[${new Date().toLocaleTimeString()}] ${msg}`),
    };

    const app: Express = express();
    const port = 3000;

    app.get("/", (req: Request, res: Response) => {
      res.send("Express + TypeScript Server");
    });

    app.get(
      "/get-current-aurora-forecast",
      async (req: Request, res: Response) => {
        const currentAuroraForecast =
          await auroraForecastDataModule.getCurrentAuroraForecast();
        res.json(currentAuroraForecast);
        res.status(currentAuroraForecast === null ? 404 : 200);
      }
    );

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });

    return new ApiGatewayModule(app);
  }
}
