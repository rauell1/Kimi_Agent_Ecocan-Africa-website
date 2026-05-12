import crypto from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

type JsonInput = Prisma.InputJsonValue;
type JsonLike = Prisma.JsonValue;

export type VersionStore = {
  current_version: string | null;
  versions: Record<
    string,
    {
      state_or_code: JsonLike;
      timestamp: string;
      metadata?: JsonLike;
      version_number: number;
      rolled_back_from?: string | null;
      state_hash?: string | null;
    }
  >;
};

type VersionSnapshot = {
  model: string;
  action: string;
  args?: unknown;
  before?: unknown;
  after?: unknown;
};

type MiddlewareParams = {
  action: string;
  model?: string;
  args?: unknown;
};

const PRIMARY_POINTER_ID = 'primary';
const VERSION_MODELS = new Set(['VersionEntry', 'VersionPointer']);
const MUTATION_ACTIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
]);
const attachedClients = new WeakSet<PrismaClient>();

function toJsonValue(value: unknown): JsonInput {
  const replacer = (_key: string, current: unknown) => {
    if (typeof current === 'bigint') {
      return current.toString();
    }

    if (current instanceof Date) {
      return current.toISOString();
    }

    return current;
  };

  try {
    return JSON.parse(JSON.stringify(value ?? null, replacer)) as JsonInput;
  } catch (error) {
    throw new Error('Version snapshot is not JSON serializable');
  }
}

function computeStateHash(value: JsonInput): string {
  const serialized = JSON.stringify(value);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

function getDelegate(client: PrismaClient, model: string | undefined) {
  if (!model) return null;
  const delegateName = model.charAt(0).toLowerCase() + model.slice(1);
  return (client as unknown as Record<string, unknown>)[delegateName] as
    | { findMany: (args?: unknown) => Promise<unknown> }
    | undefined;
}

async function captureBeforeState(client: PrismaClient, params: MiddlewareParams) {
  if (!params.model) return undefined;
  const delegate = getDelegate(client, params.model);
  if (!delegate) return undefined;

  const where = (params.args as Record<string, unknown> | undefined)?.where;

  switch (params.action) {
    case 'update':
    case 'delete':
    case 'upsert':
      return where ? delegate.findMany({ where }) : undefined;
    case 'updateMany':
    case 'deleteMany':
      return where ? delegate.findMany({ where }) : [];
    default:
      return undefined;
  }
}

async function captureAfterState(
  client: PrismaClient,
  params: MiddlewareParams,
  mutationResult: unknown
) {
  if (!params.model) return mutationResult;
  const delegate = getDelegate(client, params.model);
  if (!delegate) return mutationResult;

  const where = (params.args as Record<string, unknown> | undefined)?.where;

  switch (params.action) {
    case 'updateMany':
      return where ? delegate.findMany({ where }) : mutationResult;
    case 'deleteMany':
      return [];
    case 'createMany':
      return (params.args as Record<string, unknown> | undefined)?.data ?? mutationResult;
    default:
      return mutationResult;
  }
}

async function ensurePointer(client: PrismaClient) {
  return client.versionPointer.upsert({
    where: { id: PRIMARY_POINTER_ID },
    update: {},
    create: { id: PRIMARY_POINTER_ID },
    include: { currentVersion: true },
  });
}

export async function recordVersionSnapshot(
  client: PrismaClient,
  snapshot: VersionSnapshot | JsonInput | JsonLike,
  metadata?: Record<string, unknown>,
  rolledBackFrom?: string
) {
  const stateOrCode = toJsonValue(snapshot);
  const metadataValue = metadata ? toJsonValue(metadata) : undefined;
  const stateHash = computeStateHash(stateOrCode);

  const version = await client.$transaction(async (tx) => {
    const nextVersionNumberResult = await tx.versionEntry.aggregate({
      _max: { versionNumber: true },
    });
    const nextVersionNumber = (nextVersionNumberResult._max.versionNumber ?? 0) + 1;

    const created = await tx.versionEntry.create({
      data: {
        versionNumber: nextVersionNumber,
        stateOrCode,
        metadata: metadataValue,
        rolledBackFrom,
        stateHash,
      },
    });

    await tx.versionPointer.upsert({
      where: { id: PRIMARY_POINTER_ID },
      create: { id: PRIMARY_POINTER_ID, currentVersionId: created.id },
      update: { currentVersionId: created.id },
    });

    return created;
  });

  return version;
}

export async function rollbackToVersion(
  client: PrismaClient,
  targetVersionId: string,
  metadata?: Record<string, unknown>
) {
  const targetVersion = await client.versionEntry.findUnique({
    where: { id: targetVersionId },
  });

  if (!targetVersion) {
    throw new Error(`Version ${targetVersionId} not found`);
  }

  const combinedMetadata = {
    ...(metadata ?? {}),
    rolled_back_from: targetVersion.id,
    source_version_number: targetVersion.versionNumber,
  };

  return recordVersionSnapshot(client, targetVersion.stateOrCode, combinedMetadata, targetVersion.id);
}

export async function getVersionStore(client: PrismaClient): Promise<VersionStore> {
  const [pointer, versions] = await Promise.all([
    ensurePointer(client),
    client.versionEntry.findMany({
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const versionMap = versions.reduce<VersionStore['versions']>((acc, version) => {
    acc[version.id] = {
      state_or_code: version.stateOrCode,
      timestamp: version.createdAt.toISOString(),
      metadata: version.metadata ?? undefined,
      version_number: version.versionNumber,
      rolled_back_from: version.rolledBackFrom,
      state_hash: version.stateHash,
    };
    return acc;
  }, {});

  return {
    current_version: pointer.currentVersionId ?? null,
    versions: versionMap,
  };
}

function buildSnapshot(params: MiddlewareParams, result: unknown, before?: unknown): VersionSnapshot {
  return {
    model: params.model ?? 'unknown',
    action: params.action,
    args: (params.args as Record<string, unknown> | undefined) ?? undefined,
    before,
    after: result,
  };
}

export async function withVersioning<T>(
  client: PrismaClient,
  mutation: () => Promise<T> | T,
  snapshotBuilder: (result: T) => unknown,
  metadata?: Record<string, unknown>
): Promise<T> {
  const result = await mutation();

  try {
    const snapshot = snapshotBuilder(result) as VersionSnapshot | JsonInput | JsonLike;
    await recordVersionSnapshot(client, snapshot, metadata);
  } catch (error) {
    logger.error('Failed to record version snapshot for custom mutation', { error });
  }

  return result;
}

export function attachVersioningMiddleware(client: PrismaClient): PrismaClient {
  if (attachedClients.has(client)) {
    return client;
  }

  const versionedClient = client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!MUTATION_ACTIONS.has(operation) || VERSION_MODELS.has(model ?? '')) {
            return query(args);
          }

          const params: MiddlewareParams = { action: operation, model, args };
          const beforeState = await captureBeforeState(client, params);
          const result = await query(args);
          const afterState = await captureAfterState(client, params, result);
          const snapshot = buildSnapshot(params, afterState, beforeState);

          try {
            await recordVersionSnapshot(client, snapshot, {
              model,
              action: operation,
            });
          } catch (error) {
            logger.error('Failed to record version snapshot', {
              error,
              action: operation,
              model,
            });
          }

          return result;
        },
      },
    },
  });

  attachedClients.add(client);
  attachedClients.add(versionedClient as PrismaClient);

  return versionedClient as PrismaClient;
}
