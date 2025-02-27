import { db } from "~/db.server";

// get or create a new profile for existing user
export async function getProfileByUserId(userId: string) {
    return db.profile.upsert({
        where: {
            userId
        },
        update: {},
        create: {
            userId
        }
    });
}