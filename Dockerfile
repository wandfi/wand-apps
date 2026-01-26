FROM oven/bun:1 AS base

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY .output ./

EXPOSE 3000
USER bun
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun","--bun","run","server/index.mjs"]