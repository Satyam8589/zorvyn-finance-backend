import asyncHandler from "../../utils/asyncHandler.js";
import { registerUser, loginUser } from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";

const register = asyncHandler(async (req, res) => {

  const { name, email, password, role } = req.body;

  const data = await registerUser({ name, email, password, role });

  sendSuccess(res, "User registered successfully", data, 201);
});

const login = asyncHandler(async (req, res) => {
    
  const { email, password } = req.body;

  const data = await loginUser(email, password);

  sendSuccess(res, "Login successful", data, 200);
});

export { register, login };
