import express from "express";
import { getSchoolCONTROLLER } from "../controllers/school.controller";
import { addStudentToSchoolCONTROLLER, getStudentCONTROLLER, listStudentCONTROLLER } from "../controllers/student.controller";

const router = express.Router();

router.get('/', listStudentCONTROLLER);
router.post('/', addStudentToSchoolCONTROLLER);
router.get('/:code', getStudentCONTROLLER);

export default router;
