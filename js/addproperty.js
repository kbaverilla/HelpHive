
document.addEventListener("DOMContentLoaded", () => {
    const supabase = window.supabaseClient;
    const form = document.getElementById("property-form");
    const message = document.getElementById("property-message");

    if (!supabase || !form || !message) {
        console.error(
            "Supabase client, property form, or message element is missing."
        );
        return;
    }

    function showMessage(text, type = "error") {
        message.textContent = text;
        message.className =
            "text-sm font-medium " +
            (type === "success"
                ? "text-green-600"
                : "text-red-500");
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            // Confirm the user is signed in.
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                showMessage(
                    "Please log in before saving a property."
                );
                return;
            }

            // Read the existing Add Property form fields.
            const propertyName =
                document.getElementById("propertyName").value.trim();

            const propertyType =
                document.getElementById("propertyType").value;

            const propertyAddress =
                document.getElementById("propertyAddress").value.trim();

            const propertyDescription =
                document.getElementById("propertyDescription").value.trim();

            const availableRooms =
                Number(document.getElementById("availableRooms").value);

            const roomType =
                document.getElementById("roomType").value;

            const rentInput =
                document.getElementById("monthlyRent").value;

            const monthlyRent = Number(rentInput);

            const electricityCharge =
                document.getElementById("electricityCharge").value;

            const waterCharge =
                document.getElementById("waterCharge").value;

            const amenities = Array.from(
                document.querySelectorAll(
                    'input[name="amenities"]:checked'
                )
            ).map((checkbox) => checkbox.value);

            // Validate the required fields.
            if (
                !propertyName ||
                !propertyType ||
                !propertyAddress ||
                propertyDescription.length < 10 ||
                !roomType ||
                !Number.isInteger(availableRooms) ||
                availableRooms < 1 ||
                rentInput === "" ||
                !Number.isFinite(monthlyRent) ||
                monthlyRent < 0 ||
                !electricityCharge ||
                !waterCharge
            ) {
                showMessage(
                    "Please complete all required fields correctly."
                );
                return;
            }

            // Match the column names in public.properties.
            const propertyRecord = {
                owner_id: user.id,
                property_name: propertyName,
                property_type: propertyType,
                full_address: propertyAddress,
                description: propertyDescription,
                available_rooms: availableRooms,
                room_type: roomType,
                monthly_rent: monthlyRent,
                electricity_charges: electricityCharge,
                water_charges: waterCharge,
                amenities: amenities,
                status: "available"
            };

            // Save permanently to Supabase.
            const { data, error } = await supabase
                .from("properties")
                .insert(propertyRecord)
                .select()
                .single();

            if (error) {
                console.error("Supabase save error:", error);
                showMessage(
                    "Unable to save the property: " + error.message
                );
                return;
            }

            console.log("Property saved:", data);

            showMessage(
                "Property saved successfully!",
                "success"
            );

            form.reset();

        } catch (error) {
            console.error("Unexpected property error:", error);
            showMessage(
                "Something went wrong. Please try again."
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
});
