import cron from 'node-cron';
import { getAutoFollowUps } from '../db/applications';

export function autoCheck() {
  cron.schedule('0 9 * * *', async () => {
    try {
      const result = await getAutoFollowUps();
      console.log(result.rows, result.rowCount);
    }
    catch (err) {
      console.error(err);
    }
  });
} 