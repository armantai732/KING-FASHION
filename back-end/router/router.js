import express, { Router } from 'express'
import { Login, Register, verifyemail, ResendVerificationOtp } from '../controler/authControler.js'
import { createProduct, deleteProduct, getAllProduct, getProduct, getProductlimit, getSingleProduct, updateProduct, updatestatus } from '../controler/ProductControler.js'
import { upload } from '../middleware/multer.js'
import { AddCart, GetCart, UpdateCartItem, DeleteCartItem } from '../controler/CartControler.js'
import { PlaceOrder, GetMyOrders, GetSavedAddress, GetAllOrdersAdmin, UpdateOrderStatus, CancelOrder } from '../controler/OrderControler.js'
import { RequestDeliveryOtp, VerifyDeliveryOtp } from '../controler/DeliveryOtpControler.js'
import { RequestPasswordReset, ResetPassword } from '../controler/ForgotPasswordControler.js'
import { ToggleWishlist, GetWishlist } from '../controler/WishlistControler.js'
import { GetDashboardStats } from '../controler/DashboardControler.js'
import { AuthMiddleWare, AdminOnly } from '../middleware/authMiddleware.js'

const routes = Router()
routes.post("/register", Register)
routes.post("/login", Login)
routes.post("/verifyemail", verifyemail)
routes.post("/resend-otp", ResendVerificationOtp)

// forgot password (OTP sent to gmail, no login required)
routes.post("/forgot-password/request", RequestPasswordReset)
routes.post("/forgot-password/reset", ResetPassword)

// wishlist / "like" — permanent until the user unlikes (login required)
routes.post("/wishlist/toggle", AuthMiddleWare, ToggleWishlist)
routes.get("/wishlist", AuthMiddleWare, GetWishlist)

routes.post("/logout", (req, res) => {
    res.status(200).json({
        status: true,
        message: "Logout successful"
    })
})



// product

routes.post(
    "/product/add",
    upload.array("image", 10),
    createProduct
);
routes.get("/product/getall", getAllProduct)
routes.get("/product/getproduct/:category", getProduct)
routes.get("/product/limit/:category", getProductlimit)
routes.get("/product/:id", getSingleProduct);
routes.put("/product/update/:id", updateProduct);
routes.delete("/product/delete/:id", deleteProduct);
routes.put("/product/status/:id", updatestatus)



// cart (all cart routes require login)
routes.post("/cart/add", AuthMiddleWare, AddCart)
routes.get("/cart", AuthMiddleWare, GetCart)
routes.put("/cart/:id", AuthMiddleWare, UpdateCartItem)
routes.delete("/cart/:id", AuthMiddleWare, DeleteCartItem)

// orders / checkout (require login)
routes.post("/order/place", AuthMiddleWare, PlaceOrder)
routes.get("/order/my", AuthMiddleWare, GetMyOrders)
routes.get("/order/saved-address", AuthMiddleWare, GetSavedAddress)
routes.put("/order/:id/cancel", AuthMiddleWare, CancelOrder)

// delivery confirmation via OTP (no login required — email + order id only)
routes.post("/delivery-otp/request", RequestDeliveryOtp)
routes.post("/delivery-otp/verify", VerifyDeliveryOtp)


// admin — order management
routes.get("/admin/orders", AuthMiddleWare, AdminOnly, GetAllOrdersAdmin)
routes.put("/admin/orders/:id/status", AuthMiddleWare, AdminOnly, UpdateOrderStatus)

// admin — dashboard
routes.get("/admin/dashboard", AuthMiddleWare, AdminOnly, GetDashboardStats)



export default routes