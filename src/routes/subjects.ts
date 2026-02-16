import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;
        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        //if search query exists, filter by subject code or name
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.code, `%${search}%`),
                    ilike(subjects.name, `%${search}%`)
                )
            )
        }

        //if department query exists, filter by department
        if (department) {
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`
            filterConditions.push(
                ilike(departments.name, deptPattern)
            )
        }

        //combine all filters using and if any exists
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects), 
                department: {...getTableColumns(departments)}
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);
        
        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })


    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

export default router;
