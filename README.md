# Expense Tracker 

A minimalist web app to track expenses in a table format

## Features 
- Add and edit expense records with reason, amount, date and season
- Report for total and seasonal expenditure as well as top expenses
- Local storage persistence

## Technologies Used
- HTML
- CSS 
- JavaScript 

## The Process 
- The site was built to be as simple as possible; to alleviate the friction that comes with tracking ones expense.
- It utilizes a table with 4 headers (Reason, Amount, Date and Season) and accept user spending accordingly.
- New rows (records) are dynamically created and stored in persistent local storage by clicking the plus '+' button left of the table 
- User input, accepted through text input and date input type in the table cells, gets stored and processed to calculate and display total expenditure, sorted to determine top expenses and organized by seasons to provide insights about a users spending

## How to Run 
- just open index.html in your browser 

## What Was Learned 
- DOM manipulation in regards to element selection and usage such as div, table and dialog. Dynamic UI updating for table rows and theme changes, event listening and bubbling for buttons and inputs. User input handling and algorithms for sorting, categorizing and calculating total.
- Using localStorage API for state persistence so as to maintain and reload user data 
- Responsive layout and media queries 

## Future Plans 
- Provide better UI/UX
- Show more analytics like charts and graphs
- Better user input validation especially for season column 
- Add support for budgeting and income tracking 
- User account creation, authorization and authentication 
