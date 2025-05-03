import express from 'express';
import {
  getAllUsers,
  getUserById,
  loginUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updatePassword
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

export default userRouter;