exports.users_definition = [
    {
        id: { column: "id", id: true },
        full_name: {
            first_name: { column: "first_name" },
            last_name: "last_name"
        },
        contact: {
            phonenumber: "phone_number",
            address: "address"
        },
        gender: "gender",
        avatar: "avatar",
        birth_of_date: "birth_of_date",
        address: {
            country: "country",
            state: "state",
            region: "region",
            zipcode: "zipcode",
            address: "address"
        },
        authentication: {
            email: "email",
            password: "password"
        },
        is_confirmed: { column: "is_confirmed", type: "BOOLEAN" },
        is_premium: { column: "is_premium", type: "BOOLEAN" },
        created_at: "created_at",
        updated_at: "updated_at"
    }
]

exports.auth_definition = [
    {
        user_id: "user_id",
        deviceInfo: "deviceInfo",
        access_token: "access_token",
        auth_type: "auth_type",
        expires_in: "expires_in",
    }
]