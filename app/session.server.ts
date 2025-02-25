import { createCookieSessionStorage } from "@remix-run/node";

export type SessionData = {
    userId: string;
};

export type SessionFlashData = {
    error: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET environment value is required.');
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
        name: '__valkyrie_session',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'lax',
        secrets: [AUTH_SECRET],
        secure: true
    }
});

export {
    getSession,
    commitSession,
    destroySession
};