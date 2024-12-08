import { Test, TestingModule } from '@nestjs/testing';
import { WorkstationController } from './workstation.controller';
import { WorkstationService } from './workstation.service';

describe('WorkstationController', () => {
  let controller: WorkstationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkstationController],
      providers: [WorkstationService],
    }).compile();

    controller = module.get<WorkstationController>(WorkstationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
