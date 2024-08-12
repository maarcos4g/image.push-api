import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/cloudflare";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { db } from "@/db/connection";

export async function createDownloadUrl(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/upload',
      {
        schema: {
          body: z.object({
            name: z.string().min(1),
            contentType: z.string().regex(/\w+\/[-+.\w]+/),
          }),
          response: {
            201: z.object({
              signedUrl: z.string().url()
            })
          }
        }
      },
      async (request, reply) => {
        const { contentType, name } = request.body

        const fileKey = randomUUID().concat('-').concat(name)

        const signedUrl = await getSignedUrl(r2, new PutObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: fileKey,
          ContentType: contentType,
        }), {
          expiresIn: 600, //60 seconds
        })

        const file = await db.file.create({
          data: {
            name,
            contentType,
            key: fileKey,
          }
        })

        return reply.status(201).send({ signedUrl })
      })
}