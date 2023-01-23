import { Test, TestingModule } from '@nestjs/testing';
import { GejalaService } from './gejala.service';

describe('GejalaService', () => {
  let service: GejalaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GejalaService],
    }).compile();

    service = module.get<GejalaService>(GejalaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
