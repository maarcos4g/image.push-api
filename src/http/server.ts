import fastify from "fastify";

import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { createUploadUrl } from "./routes/create-upload-url";
import { createDownloadUrl } from "./routes/create-download-url";

const app = fastify()

//routes
app.register(createUploadUrl)
app.register(createDownloadUrl)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.listen({
  port: 3333,
  host: '0.0.0.0',
}).then(() => {
  console.log('🔥 HTTP Server Running!')
})