import express from 'express';
import {
  getAllUsers,
  getUserById,
  loginUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/userController';

const userRouter = express.Router();


userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/login', loginUser);
userRouter.post('/', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);
userRouter.patch('/:id/role', changeUserRole);
userRouter.patch('/:id/password', updatePassword);
// нууц үг мартсан
userRouter.post('/forgot-password', forgotPassword);
// нууц үг шинэчлэх
userRouter.post('/reset-password', resetPassword)

export default userRouter;