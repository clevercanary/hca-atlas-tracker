import { query } from "./database";

export async function updateTaskCounts(): Promise<void> {
  await query(`
    UPDATE hat.atlases a
    SET
      overview = a.overview || jsonb_build_object('taskCount', counts.task_count, 'completedTaskCount', counts.completed_task_count)
    FROM (
      SELECT
        a.id AS atlas_id,
        COUNT(v.id) AS task_count,
        COUNT(CASE WHEN v.validation_info->>'validationStatus' = 'PASSED' THEN 1 END) AS completed_task_count
      FROM
        hat.atlases a
      LEFT JOIN
        hat.validations v ON a.id = ANY(v.atlas_ids)
      GROUP BY
        a.id
    ) AS counts
    WHERE a.id = counts.atlas_id;
  `);
}
