import { Test, TestingModule } from "@nestjs/testing";
import { AuthProvider } from "./auth.provider.js";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service.js";
import { ConfigService } from "@nestjs/config";
import { RegisterDto } from "./dtos/register.dto.js";

describe('AuthProvider', () => {
    let authprovider: AuthProvider;
    let usersRepository: Repository<User>;
    let mailService: MailService;
    let configService: ConfigService;
    const REPOSITORY_TOKEN = getRepositoryToken(User);
    const registerDto: RegisterDto = {
        email: 'admin@gmail.com',
        password: '123456',
        username: ""
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthProvider,
                { provide: JwtService, useValue: {} },
                { provide: MailService, useValue: {
                    sendVerifyEmailTemplate: vi.fn()
                } },
                { provide: ConfigService, useValue: {
                    get: vi.fn()
                }
             },
                { provide: REPOSITORY_TOKEN, useValue: {
                    findOne: vi.fn(),
                    create: vi.fn((dto: RegisterDto) => Promise.resolve(dto)),
                    save: vi.fn((user: User) => Promise.resolve({ ...user })),
                } }
            ]
        }).compile();

        authprovider = module.get<AuthProvider>(AuthProvider);
        usersRepository = module.get<Repository<User>>(REPOSITORY_TOKEN);
        mailService = module.get<MailService>(MailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it("should authProvider be defined", () => {
        expect(authprovider).toBeDefined();
    });

    it("should userRepository be defined", () => {
        expect(usersRepository).toBeDefined();
    });

    // register
    describe('register', () => {
        it("should call 'findOne' method in users repository", async () => {
            await authprovider.register(registerDto);
            expect(usersRepository.findOne).toHaveBeenCalled();
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
        }); 

        it("should call 'create' method in users repository", async () => {
            await authprovider.register(registerDto);
            expect(usersRepository.create).toHaveBeenCalled();
            expect(usersRepository.create).toHaveBeenCalledTimes(1)
        }); 

        it("should call 'save' method in users repository", async () => {
            await authprovider.register(registerDto);
            expect(usersRepository.save).toHaveBeenCalled();
            expect(usersRepository.save).toHaveBeenCalledTimes(1)
        }); 

        it("should call 'sendverifyEmailTemplate' method in mail service", async () => {
            await authprovider.register(registerDto);
            expect(mailService.sendVerifyEmailTemplate).toHaveBeenCalled();
            expect(mailService.sendVerifyEmailTemplate).toHaveBeenCalledTimes(1)
        }); 

        it("should call 'get' method in config service", async () => {
            await authprovider.register(registerDto);
            expect(configService.get).toHaveBeenCalled();
            expect(configService.get).toHaveBeenCalledTimes(1)
        }); 
    })
}) 