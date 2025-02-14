import { ApplicationDashboard } from './ApplicationDashboard'

export default {
  title: 'Pages/Applications/Dashboard',
  component: ApplicationDashboard,
}

const Template = () => (
  <ApplicationDashboard
    galaxyGql={{
      apiKey: 'API_KEY',
      createdAt: new Date(),
      onKeyRoll: () => {},
    }}
    oAuth={{
      appId: 'APP_ID',
      appSecret: 'APP_SECRET',
      createdAt: new Date(),
      onKeyRoll: () => {},
    }}
  />
)

export const Default = Template.bind({})
