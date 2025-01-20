1. 채권발행정보 데이터 마이그레이션 (1회성)
   1.1. 채권기본정보 : npm run migrate:bond-basics-postgres
   1.2. 채권시세정보 : npm run migrate:bond-prices-postgres
   1.3. 채권발행정보 : npm run migrate:bond-issues-postgres

2. 스케줄러
   2.1. 채권시세정보 스케줄러 실행 : npm run start:bond-price-scheduler
   2.2. 채권발행정보 스케줄러 실행 : npm run start:bond-issue-scheduler

3. 스키마 마이그레이션
   3.1. 스키마 마이그레이션 실행 방법 : npx sequelize-cli db:migrate
   3.2. 직전 스키마 마이그레이션 롤백 방법 : npx sequelize-cli db:migrate:undo
   3.3. 전체 스키마 마이그레이션 롤백 방법 : npx sequelize-cli db:migrate:undo:all
   3.4. 스키마 마이그레이션 확인 방법 : npx sequelize-cli db:migrate:status
