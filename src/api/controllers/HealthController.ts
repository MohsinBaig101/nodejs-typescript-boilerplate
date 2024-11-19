import { JsonController, Get, HttpCode, UseAfter, Req } from 'routing-controllers';
import { ErrorHandlerMiddleware } from '../customMiddleware/ErrorHandlerMiddleware';
import { HttpClientService } from 'axios-bunyan-package';

@JsonController('/health')
@UseAfter(ErrorHandlerMiddleware)
export class HealthController {
  constructor(
  ) {
  }

  @Get('/')
  @HttpCode(200)
  public health() {
    return 'container running';
  }

  @Get('/testing')
  @HttpCode(200)
  public async testing(
    @Req() req: any,
  ) {
    const client = new HttpClientService({
      host: "https://api.restful-api.dev", path: "/objects", c2bToken: "token"
    });

    const data = await client.get('?id=3&id=5&id=10', {channeld:"TBK"});
    return data;
  }
}
