import { Test, TestingModule } from '@nestjs/testing';
import { GejalaController } from './gejala.controller';
import { GejalaService } from './gejala.service';

describe('GejalaController', () => {
  let controller: GejalaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GejalaController],
      providers: [GejalaService],
    }).compile();

    controller = module.get<GejalaController>(GejalaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
