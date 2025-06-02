// src/auditoria/auditoria.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import { AUDITABLE_METADATA, AuditableMetadata } from './auditable.decorator';
import { SKIP_AUDIT } from './skip_audit.decorator';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipAudit = this.reflector.get<boolean>(SKIP_AUDIT, context.getHandler());
    if (skipAudit) {
      return next.handle();
    }
    
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Solo auditar si es una acción de cambio
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const auditableMetadata: AuditableMetadata = this.reflector.get(
      AUDITABLE_METADATA,
      context.getHandler(),
    ) || {};

    // Intentar inferir entidad desde el controlador
    const controllerName = context.getClass().name.replace('Controller', '');
    const defaultEntity = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);

    // Inferir acción desde el método HTTP
    const defaultAction = this.getActionFromMethod(method);

    const entity = auditableMetadata.entity || defaultEntity;
    const action = auditableMetadata.action || defaultAction;
    const description = auditableMetadata.description || '';

    const userId = request.user?.id || null;
    const oldData = request.oldData || null;
    const bodyData = request.body || null;

    return next.handle().pipe(
      map((responseData) => {
        this.auditoriaService.create({
          userId,
          entity,
          accion: action,
          description,
          oldData,
          newData: bodyData,
        });
        return responseData;
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREAR';
      case 'PATCH':
      case 'PUT':
        return 'ACTUALIZAR';
      case 'DELETE':
        return 'BORRAR';
      default:
        return 'DESCONOCIDO';
    }
  }
}
