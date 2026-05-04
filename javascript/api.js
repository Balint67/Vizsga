const API_BASE_URL = window.FORGEX_API_URL || "http://localhost:3000/api";

async function getAuthHeaders(user) {
    if (!user) {
        return {};
    }

    const token = await user.getIdToken();

    return {
        Authorization: `Bearer ${token}`
    };
}

async function request(path, options = {}) {
    const { user, headers = {}, body, ...restOptions } = options;
    const authHeaders = await getAuthHeaders(user);
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...restOptions,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Az API-kérés sikertelen.");
    }

    return data;
}

export const api = {
    getReviews() {
        return request("/reviews");
    },
    createReview(user, review) {
        return request("/reviews", {
            method: "POST",
            user,
            body: review
        });
    },
    deleteReview(user, reviewId) {
        return request(`/reviews/${reviewId}`, {
            method: "DELETE",
            user
        });
    },
    getBookings(user) {
        return request("/bookings", {
            user
        });
    },
    createBooking(user, booking) {
        return request("/bookings", {
            method: "POST",
            user,
            body: booking
        });
    },
    deleteBooking(user, bookingId) {
        return request(`/bookings/${bookingId}`, {
            method: "DELETE",
            user
        });
    }
};
