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

// update profile data
export async function updateProfile(userId: string, data: {
    tagline?: string;
    bio?: string;
    avatar?: string;
}) {
    return db.profile.update({
        where: {
            userId
        },
        data
    });
}

// clear avatar from profile (set to null)
export async function clearAvatar(userId: string) {
    return db.profile.update({
        where: {
            userId
        },
        data: {
            avatar: null
        }
    });
}