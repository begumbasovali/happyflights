# Database Export Instructions

Since MongoDB tools are not installed locally, here are instructions for creating a database export:

## Option 1: Using MongoDB Compass (Recommended)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select the `happyflights` database
4. For each collection (flights, tickets, users, admins):
   - Click on the collection
   - Go to "Documents" tab
   - Click "Export Data" 
   - Choose JSON format
   - Export to a file

## Option 2: Using MongoDB Shell
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/happyflights

# Export each collection
db.flights.find().pretty()
db.tickets.find().pretty()
db.users.find().pretty()
db.admins.find().pretty()
```

## Option 3: Alternative Export Command
If MongoDB tools are installed:
```bash
mongodump --host localhost:27017 --db happyflights --out ./database-export
```

## Sample Data
The database contains:
- **admins**: 1 record (admin user)
- **flights**: 6 records (4 future, 2 past flights)
- **tickets**: ~2 booking records
- **users**: User registration data

## Database Schema
- Database Name: `happyflights`
- Connection String: `mongodb://localhost:27017/happyflights`
- Collections: admins, flights, tickets, users 