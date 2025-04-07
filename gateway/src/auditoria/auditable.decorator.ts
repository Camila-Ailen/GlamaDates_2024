import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_METADATA = 'auditable_metadata';

export interface AuditableMetadata {
  entity?: string;
  action?: string;
  description?: string;
}

export const Auditable = (metadata: AuditableMetadata = {}) =>
  SetMetadata(AUDITABLE_METADATA, metadata);
