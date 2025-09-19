import { DrizzleService } from './drizzle.service';

async function runMigrations() {
  const drizzleService = new DrizzleService();

  try {
    console.log('Running migrations...');
    await drizzleService.runMigrations();
    console.log('Migrations completed!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await drizzleService.closeConnection();
  }
}

runMigrations().catch((err) => {
  console.error('Unhandled migration error:', err);
  process.exit(1);
});
