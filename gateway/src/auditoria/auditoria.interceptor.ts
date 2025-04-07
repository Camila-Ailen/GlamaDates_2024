import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: any; // Adjust the type of 'user' based on your application's requirements
  }
}

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user as any; // Si usás JWT, esto debería ser tu payload
    const url = request.originalUrl;

    const entity = this.extractEntityName(url); // ejemplo: '/usuarios/3' => 'usuarios'

    const shouldAudit = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    let oldData: any = null;

    if (shouldAudit && (method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
      const entityId = this.extractEntityId(url);
      if (entityId) {
        const repo = this.auditoriaService.getRepositoryForEntity(entity);
        if (repo) {
          repo.findOne({ where: { id: entityId } }).then((found) => {
            oldData = found;
          });
        }
      }
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        if (shouldAudit) {
          await this.auditoriaService.create({
            userId: user?.id || null,
            entity,
            accion: method,
            description: `Acción ${method} en ${entity}`,
            oldData,
            newData: responseBody,
          });
        }
      }),
    );
  }

  private extractEntityName(url: string): string {
    const parts = url.split('/').filter((p) => p.length > 0);
    return parts[0]; // asumiendo estructura /entidad/:id
  }

  private extractEntityId(url: string): string | null {
    const parts = url.split('/').filter((p) => p.length > 0);
    return parts.length > 1 ? parts[1] : null;
  }
}
