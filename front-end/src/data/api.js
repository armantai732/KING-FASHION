const API_URL = import.meta.env.VITE_API_URL
const BASE_URL = `${API_URL}/api`

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const RegisterData = async (form) => {
    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(form)
        });


        const text = await res.text();

        return JSON.parse(text);

    } catch (error) {
        console.error("ERROR:", error);
        return {
            status: false,
            message: error.message
        };
    }
}

export const LoginData = async (form) => {
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            credentials: "include",
            body: JSON.stringify(form)
        })

        const data = await res.json()
        return data;
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" }
    }
}


export const LogoutUser = async () => {
    try {
        const req = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            credentials: "include"
        })

        return await req.json()
    } catch (error) {
        console.log(error.message)
    }
}


export const VerifyOtp = async (form) => {
    try {
        const req = await fetch(`${BASE_URL}/verifyemail`, {
            method: 'POST',
            credentials: "include",
            body: JSON.stringify(form),
            headers: {
                'Content-Type': "application/json"
            },

        })

        return await req.json()
    } catch (error) {
        console.log(error.message)
    }
}

export const ResendOtp = async ({ email }) => {
    try {
        const res = await fetch(`${BASE_URL}/resend-otp`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })
        return await res.json();
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" };
    }
}

// forgot password (OTP sent to gmail)

export const RequestPasswordReset = async ({ email }) => {
    try {
        const res = await fetch(`${BASE_URL}/forgot-password/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })
        return await res.json();
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" };
    }
}

export const ResetPassword = async ({ email, otp, newPassword }) => {
    try {
        const res = await fetch(`${BASE_URL}/forgot-password/reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp, newPassword }),
        })
        return await res.json();
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" };
    }
}

// wishlist / "like"

export const ToggleWishlist = async (productId) => {
    try {
        const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ productId }),
        })
        return await res.json();
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" };
    }
}

export const GetWishlist = async () => {
    try {
        const res = await fetch(`${BASE_URL}/wishlist`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error.message)
        return { status: false, message: "Something went wrong" };
    }
}


// product

export const addProduct = async (formData) => {
    const res = await fetch(`${BASE_URL}/product/add`, {
        method: "POST",
        body: formData,
    });

    return await res.json();
};

export const getproduct = async (category) => {
    try {
        const res = await fetch(`${BASE_URL}/product/getproduct/${category}`)
        return await res.json()
    } catch (error) {
        console.log(error.message)
    }
}

export const getproductlimit = async (category) => {
    try {
        const res = await fetch(`${BASE_URL}/product/limit/${category}`)
        return await res.json()
    } catch (error) {
        console.log(error.message)
    }
}

export const getAllProduct = async (data) => {
    try {
        const res = await fetch(`${BASE_URL}/product/getall`, {
            method: "get"
        })
        return await res.json(data)
    } catch (error) {
        console.log(error.message)
    }
}


export const getSingleProduct = async (id) => {
    const res = await fetch(`${BASE_URL}/product/${id}`);
    return await res.json();
};

export const updateProduct = async (id, form) => {
    const res = await fetch(`${BASE_URL}/product/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
    });

    return await res.json();
};


export const deleteProduct = async (id) => {
    const res = await fetch(`${BASE_URL}/product/delete/${id}`, {
        method: "DELETE",
    });

    return await res.json();
};



export const updateProductStatus = async (id, status) => {
    const res = await fetch(`${BASE_URL}/product/status/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });

    return await res.json();
};





export const AddCart = async (data) => {
    try {
        const res = await fetch(`${BASE_URL}/cart/add`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify(data)
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const GetCart = async () => {
    try {
        const res = await fetch(`${BASE_URL}/cart`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const UpdateCartItem = async (id, quantity) => {
    try {
        const res = await fetch(`${BASE_URL}/cart/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ quantity }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const DeleteCartItem = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/cart/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

// order / checkout

export const PlaceOrder = async ({
    address,
    paymentMethod,
    cartItemIds,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    try {
        const res = await fetch(`${BASE_URL}/order/place`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({
                address,
                paymentMethod,
                cartItemIds,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const CreateRazorpayOrder = async (amount) => {
    try {
        const res = await fetch(`${BASE_URL}/payment/create-order`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ amount }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const GetMyOrders = async () => {
    try {
        const res = await fetch(`${BASE_URL}/order/my`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const GetSavedAddress = async () => {
    try {
        const res = await fetch(`${BASE_URL}/order/saved-address`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

// admin — order management

export const CancelOrder = async (id, reason) => {
    try {
        const res = await fetch(`${BASE_URL}/order/${id}/cancel`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ reason }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const AdminGetOrders = async (status) => {
    try {
        const url = status
            ? `${BASE_URL}/admin/orders?status=${status}`
            : `${BASE_URL}/admin/orders`;

        const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const AdminUpdateOrderStatus = async (id, status, expectedDeliveryDate) => {
    try {
        const res = await fetch(`${BASE_URL}/admin/orders/${id}/status`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ status, expectedDeliveryDate }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const AdminGetDashboard = async () => {
    try {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
            method: "GET",
            credentials: "include",
            headers: {
                ...authHeaders(),
            },
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

// delivery confirmation via OTP (no login required)

export const RequestDeliveryOtp = async ({ orderId, email }) => {
    try {
        const res = await fetch(`${BASE_URL}/delivery-otp/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, email }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const VerifyDeliveryOtp = async ({ orderId, email, otp }) => {
    try {
        const res = await fetch(`${BASE_URL}/delivery-otp/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, email, otp }),
        })
        return await res.json();
    } catch (error) {
        console.log(error)
        return { status: false, message: "Something went wrong" };
    }
}

export const TrackVisit = async () => {
    try {
        const res = await fetch(`${BASE_URL}/track-visit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ path: window.location.pathname }),
        })
        return await res.json();
    } catch (error) {
        // visit tracking should never break the page, just ignore failures
        console.log(error)
    }
}