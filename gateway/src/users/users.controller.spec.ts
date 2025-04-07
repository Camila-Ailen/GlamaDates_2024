import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserPaginationDto } from './dto/pagination-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    all: jest.fn().mockResolvedValue(['user1', 'user2']),
    getBy: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
    create: jest.fn().mockResolvedValue({ id: 3, name: 'Created User' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated User' }),
    delete: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const query = new UserPaginationDto();
    const result = await controller.all(query);
    expect(result.status).toBe('success');
    expect(result.data).toEqual(['user1', 'user2']);
    expect(service.all).toHaveBeenCalledWith({ query });
  });

  it('should return user by ID', async () => {
    const req = { user: { id: 1 } } as any;
    const result = await controller.getById(req, 1);
    expect(result.status).toBe('success');
    expect(result.data).toEqual({ id: 1, name: 'Test User' });
    expect(service.getBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should delete a user', async () => {
    const result = await controller.delete({ id: 1 });
    expect(result.status).toBe('success');
    expect(result.data).toEqual({ deleted: true });
    expect(service.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
