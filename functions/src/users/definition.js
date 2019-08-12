exports.users_definition = [
    {
        id: { column: "id", id: true },
        full_name: {
            first_name: "first_name",
            last_name: "last_name"
        },
        contact: {
            email: "email",
            phonenumber: "phone_number"
        },
        avatar: "avatar",
        birth_of_date: "birth_of_date",
        address: {
            country: "country",
            state: "state",
            region: "region",
            zipcode: "zipcode",
            address: "address"
        },
        auth: {
            email_auth: "uid"
        },
        devices: ["devices"],
        is_confirmed: { column: "is_confirmed", type: "BOOLEAN" },
        is_premium: { column: "is_premium", type: "BOOLEAN" },
        created_at: "created_at",
        updated_at: "updated_at"
    }
]