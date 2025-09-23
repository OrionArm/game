import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '../db/drizzle.service';
import { users, type User, type NewUser } from './user.schema';
import { RegisterDto, LoginDto, AuthResponseDto } from './auth.dto';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = registerDto;

    // Проверяем, существует ли пользователь
    const existingUser = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const existingEmail = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const newUser: NewUser = {
      username,
      email,
      passwordHash,
    };

    const [createdUser] = await this.drizzleService.db
      .insert(users)
      .values(newUser)
      .returning();

    // Создаем JWT токен
    const payload = { sub: createdUser.id, username: createdUser.username };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // Находим пользователя
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Создаем JWT токен
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async validateUserById(userId: number): Promise<User | null> {
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  }
}
