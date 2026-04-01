import prisma from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";

const selectUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
};

const registerUser = async (userData) => {
    
  const { name, email, password, role } = userData;

  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    throw new AppError("A user with this email already exists.", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: selectUserFields,
  });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user: newUser, token };
};

const loginUser = async (email, password) => {

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Your account is currently inactive. Please contact support.", 403);
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export { registerUser, loginUser };

