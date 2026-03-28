import { PrismaClient, User, Prisma } from '../generated/prisma/client';
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 250;

function isTransientAccelerateError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return error.message.includes('Accelerate');
    }
    return false;
}

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const db = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends({
    query: {
        $allOperations: async ({ args, query }) => {
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    return await query(args);
                } catch (error) {
                    if (attempt < MAX_RETRIES && isTransientAccelerateError(error)) {
                        console.warn(`Accelerate transient error, retrying (${attempt + 1}/${MAX_RETRIES})...`);
                        await sleep(RETRY_DELAY_MS * (attempt + 1));
                        continue;
                    }
                    throw error;
                }
            }
            throw new Error('Unreachable');
        },
    },
}).$extends({
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
