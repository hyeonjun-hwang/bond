# bond

1. 마이그레이션
   "migrate:bonds": "node scripts/migrations/bondIssueMigration.js" 실행방법 : npm run migrate:bonds
   "migrate:bond-details": "node scripts/migrations/bondDetailMigration.js" 실행방법 : npm run migrate:bond-details

2. 스케줄러
   2.1. 채권발행정보
   실행방법 ("start:scheduler": "node scripts/schedulers/bondIssueScheduler.js")
   운영환경 : npm run start:bond-issue-scheduler
   테스트 : NODE_ENV=development node scripts/schedulers/bondIssueScheduler.js --test

   2.2. 채권기본정보
   실행방법 ("start:scheduler": "node scripts/schedulers/bondDetailScheduler.js")
   운영환경 : npm run start:bond-detail-scheduler
   테스트 : NODE_ENV=development node scripts/schedulers/bondDetailScheduler.js --test

서버 실행 : "start": "npx nodemon app.js" 실행방법 : npm start
