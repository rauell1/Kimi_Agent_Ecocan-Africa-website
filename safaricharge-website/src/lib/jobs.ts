import { JOB_CONFIG } from '@/lib/config';
import { db } from '@/lib/db';
import { type EmailJobPayload, sendTransactionalEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function enqueueEmailJob(payload: EmailJobPayload) {
  await db.job.create({
    data: {
      type: 'SEND_EMAIL',
      payload: JSON.stringify(payload),
      scheduledFor: new Date(),
      maxAttempts: JOB_CONFIG.maxAttempts,
    },
  });
}

function parsePayload(rawPayload: string): EmailJobPayload {
  return JSON.parse(rawPayload) as EmailJobPayload;
}

export async function processPendingJobs(batchSize = JOB_CONFIG.batchSize) {
  const jobs = await db.job.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: {
        lte: new Date(),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: batchSize,
  });

  let completed = 0;
  let failed = 0;

  for (const job of jobs) {
    const claim = await db.job.updateMany({
      where: {
        id: job.id,
        status: 'PENDING',
      },
      data: {
        status: 'PROCESSING',
        lockedAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });

    if (claim.count === 0) {
      continue;
    }

    try {
      switch (job.type) {
        case 'SEND_EMAIL':
          await sendTransactionalEmail(parsePayload(job.payload));
          break;
        default:
          throw new Error(`Unsupported job type: ${job.type}`);
      }

      await db.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });

      completed++;
    } catch (error) {
      const shouldRetry = job.attempts + 1 < job.maxAttempts;

      await db.job.update({
        where: { id: job.id },
        data: {
          status: shouldRetry ? 'PENDING' : 'FAILED',
          scheduledFor: shouldRetry ? new Date(Date.now() + JOB_CONFIG.retryDelayMs) : job.scheduledFor,
          lockedAt: null,
          lastError: error instanceof Error ? error.message : 'Unknown job error',
        },
      });

      logger.error('Background job failed', { jobId: job.id, type: job.type, error });
      failed++;
    }
  }

  return {
    scanned: jobs.length,
    completed,
    failed,
  };
}
