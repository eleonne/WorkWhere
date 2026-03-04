# Project: WorkWhere
## Description 
This is an app to track the days I`m working from home. I want to log the days I telework and then show a calendar with the days I teleworked this month. It should show a total of days I did telework this month. It should not allow me to enter more than 12 days of telework per month.

Stack: React.js, TypeScript, Prisma, SQLite3
Run dev: npm dev | Tests: npm test | Lint: npm lint
Conventions: kebab-case files, named exports only, strict mode, no any

## Folder Structure
src/components/ - React components
src/pages/ - Project pages
src/api - Backend API
prisma/ - Prisma

## Prisma commands
npx prisma migrate dev — run migrations
npx prisma generate — regenerate client after schema changes
npx prisma studio — inspect DB

## Environment Variables
DATABASE_URL

## Styling approach
CSS Modules

## State Management
Local state

## API pattern
REST

## Component conventions
One component per file
Co-locate styles

## Test framework
Jest
Integration

## Do-nots
don't auto-commit
don't add unrequested features

## Business Rules
You can only enter 12 telework days per month
The system should show how many telework days are left in the month
The system should show the current month in the calendar by default
The system should allow the user to navigate through the months in the calendar
The system should allow the user to select the date and a comment to register a telework day
The user should be able to delete a logged telework day
The user should be able to edit a logged telework day