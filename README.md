# roommates-telegram-bot
Telegram bot for roommates to manage:
+ Room cleaning shifts
+ Shopping list
+ Bill files

## Intallations
1. Install Node.js and NPM
2. Install telegraf

        npm install telegraf

## Settings
### bot.js
Edit the "bot.js" file based on the bot token, the name of the roommates, the rooms to be cleaned and the types of bills

### inline_keyboards.js
Edit the "inline_keyboards.js" file based on the types of bills

### connection.js
Edit the "connection.js" file base on your database data

### bill
Modify the "bill" folder by adding the various subfolders for each type of bill

### database
1. Create the database

        CREATE DATABASE databasename;
        
2. Add the "product" table

        CREATE TABLE product (
            name varchar(100) NOT NULL,
            quantity tinyint(4) NOT NULL
        );

## Tools
+ Language: JavaScript with Node.js and telegraf.js frameworks 
+ Data Storage: MySQL
