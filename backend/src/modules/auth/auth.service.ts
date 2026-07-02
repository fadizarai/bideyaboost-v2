import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { hashPassword, comparePassword, generateToken } from '../../shared/utils/auth.util';
import { AppError } from '../../shared/errors/AppError';
import { config } from '../../config/env.config';

export class AuthService {
    static async register(input: RegisterInput) {
        const existingUser = await AuthRepository.findByEmail(input.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        const passwordHash = await hashPassword(input.password);

        const user = await AuthRepository.createWithRole(
            {
                email: input.email,
                passwordHash,
                name: input.name,
            },
            input.role,
            input.roleData || {}
        );

        return user;
    }

    static async login(input: LoginInput) {
        const user = await AuthRepository.findByEmail(input.email);
        if (!user || !(await comparePassword(input.password, user.passwordHash))) {
            throw new AppError('Invalid email or password', 401);
        }

        const role = this.getUserRole(user);
        const tokens = this.generateAuthTokens(user.id, role);

        return { user, tokens };
    }

    private static getUserRole(user: any): string {
        if (user.admin) return 'ADMIN';
        if (user.expert) return 'EXPERT';
        if (user.student) return 'STUDENT';
        if (user.parent) return 'PARENT';
        return 'USER';
    }

    static generateAuthTokens(userId: string, role: string) {
        const accessToken = generateToken({ sub: userId, role }, config.jwt.accessExpirationMinutes);
        const refreshToken = generateToken({ sub: userId }, config.jwt.refreshExpirationDays);

        return {
            access: {
                token: accessToken,
                expires: config.jwt.accessExpirationMinutes,
            },
            refresh: {
                token: refreshToken,
                expires: config.jwt.refreshExpirationDays,
            },
        };
    }
}
