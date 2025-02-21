import { PrismaClient, User } from '@prisma/client';
import { hashSync, compareSync } from 'bcrypt';

const db = new PrismaClient().$extends({
    model: {
        user: {
            async signUp(email: string, username: string, password: string): Promise<User> {
                const hashedPassword = hashSync(password, 10);
                const user = await db.user.create({
                    data: {
                        email,
                        username,
                        password: hashedPassword,
                    },
                });

                return user;
            },

            async signIn(emailOrUsername: string, password: string): Promise<User> {
                const user = await db.user.findFirst({
                    where: {
                        OR: [
                            { email: emailOrUsername },
                            { username: emailOrUsername }
                        ],
                    },
                });
    
                if (!user) {
                    throw new Error('Invalid email or username');
                }
    
                const passwordMatch = compareSync(password, user.password);
    
                if (!passwordMatch) {
                    throw new Error('Invalid login or password');
                }
    
                return user;
            },
        },
    },
});

export { db };