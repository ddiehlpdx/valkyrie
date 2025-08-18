import { db } from "~/db.server";

// get or create a new profile for existing user
export async function getProfileByUserId(userId: string) {
    try {
        return await db.profile.upsert({
            where: {
                userId
            },
            update: {},
            create: {
                userId
            }
        });
    } catch (error) {
        console.error('Profile upsert error:', error);
        // If there's a foreign key error, just try to find existing profile
        const existingProfile = await db.profile.findUnique({
            where: { userId }
        });
        if (existingProfile) {
            return existingProfile;
        }
        // If no profile exists and we can't create one, return null
        return null;
    }
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