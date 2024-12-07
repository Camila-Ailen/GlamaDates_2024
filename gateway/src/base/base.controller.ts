import { PermissionsGuard } from '@/auth/permissions.guard';
import { Logger } from '@nestjs/common';
import { Controller, Get, UseGuards } from '@nestjs/common';

@UseGuards(PermissionsGuard)
export class BaseController {
  public logger: Logger;

  constructor(readonly object: { name: string; }) {
    this.logger = new Logger(this.object.name);
  }
}
