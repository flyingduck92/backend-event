import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    version: 'v0.0.1',
    title: 'Documentation of Web-Event API',
    description: 'Documentation of Web-Event API',
  },
  servers: [
    {
      url: 'http://localhost:3000/api/',
      description: 'Local Server',
    },
    {
      url: 'https://backend-event-rust.vercel.app/api/',
      description: 'Deployed Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      LoginRequest: {
        identifier: 'hello@email.com',
        password: 'Qwerty92',
      },
    },
  },
}

const outputFile = './swagger_output.json'
const routes = ['../routes/api.ts']

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc)
