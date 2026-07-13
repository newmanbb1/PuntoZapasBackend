import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password_hash if validation is successful', async () => {
      const mockUser = { id_usuario: 1, email: 'test@test.com', password_hash: 'hashedpassword', rol: 'ADMIN' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validateUser('test@test.com', 'password123');
      expect(result).toEqual({ id_usuario: 1, email: 'test@test.com', rol: 'ADMIN' });
      expect(result.password_hash).toBeUndefined();
    });

    it('should return null if password validation fails', async () => {
      const mockUser = { id_usuario: 1, email: 'test@test.com', password_hash: 'hashedpassword' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validateUser('test@test.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const mockUser = { id_usuario: 1, email: 'test@test.com', rol: 'ADMIN', sucursal_id: 1 };
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(mockUser);
      expect(result).toEqual({
        access_token: 'token',
        user: mockUser
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id_usuario,
        rol: mockUser.rol,
        sucursal_id: mockUser.sucursal_id
      });
    });
  });

  describe('register', () => {
    it('should throw UnauthorizedException if email is already registered', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ id_usuario: 1 } as any);

      await expect(service.register({ email: 'existing@test.com' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password_hash on successful registration', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const createdUser = { id_usuario: 2, email: 'new@test.com', password_hash: 'hashed' };
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser as any);

      const result = await service.register({ email: 'new@test.com' });
      expect(result).toEqual({ id_usuario: 2, email: 'new@test.com' });
    });
  });
});
