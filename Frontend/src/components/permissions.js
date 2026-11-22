
export const permissions = {
    student: [
        "home",
        "inventory",
        "borrow_requests",
        "loans"
    ],

    staff: [
        "home",
        "catagory",
        "inventory",
        "borrow_requests",
        "loans"
    ],

    admin: [
        "home",
        "catagory",
        "inventory",
        "borrow_requests",
        "loans",
        "users",
        "reports"
    ]
};

export function hasPermission(role, page) {
    return permissions[role]?.includes(page) ?? false;
}
