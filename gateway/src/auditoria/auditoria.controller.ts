import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuditsPaginationDto } from './dto/pagination-audits.dto';
import { ResposeDTO } from '@/base/dto/base.dto';
import { Auth } from '@/auth/auth.decorator';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) { }

  @Get()
  @Auth('read:audits')
  @ApiOperation({ summary: 'Get all audit logs' })
  async all(@Query() query: AuditsPaginationDto): Promise<ResposeDTO> {
    const audits = await this.auditoriaService.all({ query });
    return { status: 'success', data: audits };
  }

  @Get('filter-options')
  @Auth('read:audits')
  @ApiOperation({ summary: 'Get filter options for audits' })
  async getFilterOptions(): Promise<ResposeDTO> {
    const options = await this.auditoriaService.getFilterOptions();
    return { status: 'success', data: options };
  }
}
