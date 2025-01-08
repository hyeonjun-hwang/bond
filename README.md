# bond

package.json 에서
"migrate:bonds": "node scripts/migrations/bondIssueMigration.js" 실행방법 : npm run migrate:bonds

스케줄러 실행방법 ("start:scheduler": "node scripts/schedulers/bondIssueScheduler.js")
운영환경 : npm run start:scheduler
테스트 : NODE_ENV=development node scripts/schedulers/bondIssueScheduler.js --test

서버 실행 : "start": "npx nodemon app.js" 실행방법 : npm start
