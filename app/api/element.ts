import { db } from "~/db.server";

export async function getElementsByProjectId(projectId: string) {
    return db.element.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' }
    });
}

export async function createElement(data: {
    name: string;
    description?: string;
    color: string;
    iconKey: string;
    projectId: string;
}) {
    return db.element.create({ data: { ...data, description: data.description || null } });
}

export async function updateElement(elementId: string, data: {
    name?: string,
    description?: string,
    color?: string,
    iconKey?: string,
}) {
    return db.element.update({
        where: { id: elementId },
        data
    });
}

export async function deleteElement(elementId: string) {
    return db.element.delete({ where: { id: elementId } });
}

export async function reorderElements(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.element.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}