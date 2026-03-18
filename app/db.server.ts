import { PrismaClient, User } from '@prisma/client';
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;

const db = new PrismaClient().$extends({
    model: {
        user: {
            async signUp(email: string, username: string, password: string) {
                const hashedPassword = await hash(password, SALT_ROUNDS);
                return db.user.create({
                    data: {
                        email,
                        username,
                        password: hashedPassword,
                    },
                    omit: {
                        password: true,
                    },
                });
            },

            async signIn(emailOrUsername: string, password: string): Promise<User | undefined> {
                const user = await db.user.findFirst({
                    where: {
                        OR: [
                            { email: emailOrUsername },
                            { username: emailOrUsername }
                        ],
                    },
                });

                if (!user) {
                    return;
                }

                const passwordMatch = await compare(password, user.password);

                if (!passwordMatch) {
                    return;
                }

                return user;
            },
        },
    },
});

export { db };
