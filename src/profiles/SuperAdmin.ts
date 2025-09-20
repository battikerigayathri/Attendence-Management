import mercury from "@mercury-js/core"
const rules = [
    {
        modelName: "User",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "Address",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "Attendence",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "AssignedCentre",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "FaceEncoding",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "File",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "Session",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
    {
        modelName: "TrainingCentre",
        access: {
            create: true,
            read: true,
            update: true,
            delete: true,
        },
    },
]
export const SuperAdminProfile = mercury.access.createProfile("SUPER_ADMIN", rules);