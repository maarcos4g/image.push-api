import fastify from "fastify";

import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { createDownloadUrl } from "./routes/create-upload-url";

const app = fastify()

//routes
app.register(createDownloadUrl)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.listen({
  port: 3333,
  host: '0.0.0.0',
}).then(() => {
  console.log('🔥 HTTP Server Running!')
})