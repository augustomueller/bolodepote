export const config = {
  port: Number(process.env.PORT ?? 3333),
  jsonServerUrl: (process.env.JSON_SERVER_URL ?? 'http://localhost:3001').replace(/\/$/, ''),
}
