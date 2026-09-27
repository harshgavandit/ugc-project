import express from 'express';
import { getAllProjects, getProjectById, getUserCredits, toggleProjectPublic } from './user.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';


const userRouter = express.Router();

userRouter.get('/credits', requireAuth, getUserCredits)
userRouter.get('/projects', requireAuth, getAllProjects)
userRouter.get('/projects/:projectId', requireAuth, getProjectById)
userRouter.get('/publish/:projectId', requireAuth, toggleProjectPublic)

export default userRouter;