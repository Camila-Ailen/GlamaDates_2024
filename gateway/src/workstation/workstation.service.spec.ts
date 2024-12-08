import { Test, TestingModule } from '@nestjs/testing';
import { WorkstationService } from './workstation.service';

describe('WorkstationService', () => {
  let service: WorkstationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkstationService],
    }).compile();

    service = module.get<WorkstationService>(WorkstationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
