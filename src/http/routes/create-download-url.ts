import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/cloudflare";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { db } from "@/db/connection";
import { BadRequest } from "./errors/bad-request";

export async function createDownloadUrl(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/uploads/:id',
      {
        schema: {
          params: z.object({
            id: z.string().uuid(),
          })
        }
      },
      async (request, reply) => {
        const { id } = request.params

        const file = await db.file.findUniqueOrThrow({
          where: { id }
        })

        if (!file) {
          throw new BadRequest('File not found.')
        }

        const downloadUrl = await getSignedUrl(r2, new GetObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: file.key,
        }), { expiresIn: 60 * 60 * 24 * 30 * 12 }) // 1 year

        return reply.redirect(301, downloadUrl)

      })
}