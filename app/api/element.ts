import { db } from "~/db.server";

export async function getElementsByProjectId(projectId: string) {
    return db.element.findMany({
        where: { projectId },
        orderBy: { displayOrder: "asc" },
    });
}
