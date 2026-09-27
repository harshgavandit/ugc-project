import express from 'express';
import { createProject, createVideo, deleteProject, getAllPublishedProjects } from './project.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import upload from '../../config/upload.js';

const projectRouter = express.Router()

projectRouter.post('/create', requireAuth, upload.array('images', 2), createProject)
projectRouter.post('/video', requireAuth, createVideo)
projectRouter.get('/published', getAllPublishedProjects)
projectRouter.delete('/:projectId', requireAuth, deleteProject)

export default projectRouter
