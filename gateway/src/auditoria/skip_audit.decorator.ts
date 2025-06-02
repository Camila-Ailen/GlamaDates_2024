import { SetMetadata } from '@nestjs/common';
export const SKIP_AUDIT = 'skip_audit';
export const SkipAudit = () => SetMetadata(SKIP_AUDIT, true);

