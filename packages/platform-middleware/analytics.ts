import { AccountURN } from '@kubelt/urns/account'
import { DeploymentMetadata } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'
import { WriteAnalyticsDataPoint } from '@kubelt/platform-clients/analytics'

export type CustomAnalyticsFunctionType = () => AnalyticsEngineDataPoint

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  CustomAnalyticsFunction?: CustomAnalyticsFunctionType
  ServiceDeploymentMetadata?: DeploymentMetadata
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  WriteAnalyticsDataPoint({
    ...ctx,
    path,
    type,
  })

  return await next({
    ctx,
  })
}
