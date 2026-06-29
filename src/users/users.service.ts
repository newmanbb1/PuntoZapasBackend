import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    let { password_hash, ...rest } = createUserDto;
    
    if (password_hash) {
      const salt = await bcrypt.genSalt();
      password_hash = await bcrypt.hash(password_hash, salt);
    }

    return this.usersRepository.create({
      ...rest,
      password_hash,
    });
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let { password_hash, ...rest } = updateUserDto;
    
    const data: any = { ...rest };
    
    if (password_hash) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(password_hash, salt);
    }

    try {
      return await this.usersRepository.update(id, data);
    } catch (error) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async remove(id: number) {
    try {
      return await this.usersRepository.remove(id);
    } catch (error) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
