// Additional courses for the catalogue, in the same shape as catalogue-data.js.
export const moreCourses = [
  {
    slug: "computer-basics",
    title: "Computer and internet basics",
    skill: "Computer basics",
    level: "Beginner",
    hours: 4,
    priceMmk: 0,
    description: "Organise files, search the web safely and use email and online tools with confidence at work.",
    lessons: [
      {
        title: "Files, folders and your computer",
        body: [
          "A computer stores your work as files. You keep files organised in folders.",
          "Give files clear names, like cv-aung-2026.pdf, so you can find them fast.",
          "Save important files in two places, for example your laptop and Google Drive, so you do not lose them.",
        ],
        keyPoints: ["Files hold your work; folders organise them", "Use clear file names", "Keep a backup copy of important files"],
        summary: "Good file names and tidy folders save time. A second copy keeps your work safe.",
        quiz: [
          {
            prompt: "Why save important files in two places?",
            options: ["So you do not lose them if one copy is lost", "To make the computer faster", "Because files expire"],
            answer: 0,
          },
        ],
      },
      {
        title: "Using the internet well",
        body: [
          "A web browser such as Chrome or Firefox opens websites on the internet.",
          "Search engines like Google find answers. Use clear keywords, such as 'Excel SUM function'.",
          "Before you type a password, check the address starts with https and the site name is spelled correctly.",
        ],
        keyPoints: ["A browser opens websites", "Clear keywords give better search results", "Check for https and the right address"],
        summary: "Search with clear keywords and check the address before you log in to any site.",
        quiz: [
          {
            prompt: "What should a login page address start with?",
            options: ["ftp", "http", "https"],
            answer: 2,
          },
        ],
      },
      {
        title: "Email and online tools for work",
        body: [
          "Most companies use email for formal messages. Write a clear subject line and a polite greeting.",
          "Tools like Google Docs let several people edit the same file at the same time.",
          "Interviews and meetings often happen on Zoom, Google Meet or Microsoft Teams, so test your camera and microphone first.",
        ],
        keyPoints: ["Use a clear subject and polite greeting", "Shared documents let teams edit together", "Test your setup before video calls"],
        summary: "Clear emails, shared documents and video calls are daily tools in most offices.",
        quiz: [
          {
            prompt: "What should every work email have?",
            options: ["Many emojis", "A clear subject line", "No greeting"],
            answer: 1,
          },
        ],
      },
    ],
    test: [
      { prompt: "Which is the best file name for your CV?", options: ["document1.pdf", "new new final.pdf", "cv-aung-2026.pdf"], answer: 2 },
      { prompt: "What does a web browser do?", options: ["Opens websites", "Prints files", "Charges the battery"], answer: 0 },
      { prompt: "What should you check before typing a password on a site?", options: ["The page colour", "The address and https", "The number of images"], answer: 1 },
      { prompt: "Which tool lets several people edit one file at once?", options: ["Google Docs", "A USB drive", "A printer"], answer: 0 },
    ],
  },
  {
    slug: "english-it",
    title: "English for the IT workplace",
    skill: "Workplace English",
    level: "Beginner",
    hours: 6,
    priceMmk: 20000,
    description: "Understand common IT words, write clear work messages and speak up in team meetings in English.",
    lessons: [
      {
        title: "Common IT words",
        body: [
          "Many IT words come from English, like bug, deploy, deadline and feature.",
          "A bug is a mistake in software. Deploy means to put new code live for users.",
          "Learn new words in small groups and use each one in a sentence every day.",
        ],
        keyPoints: ["A bug is a mistake in software", "Deploy means putting code live", "Practise new words in sentences"],
        summary: "A small set of IT words comes up every day. Using them in sentences helps you remember them.",
        quiz: [
          {
            prompt: "What does 'deploy' mean?",
            options: ["Delete old code", "Put new code live for users", "Write a test"],
            answer: 1,
          },
        ],
      },
      {
        title: "Writing clear messages",
        body: [
          "Short, clear sentences are easier to read than long ones.",
          "In Slack, Teams or Telegram, say the main point first, then give the details.",
          "When you report a problem, write what you did, what you expected and what actually happened.",
        ],
        keyPoints: ["Keep sentences short", "Put the main point first", "Report: what you did, expected and saw"],
        summary: "Lead with the main point and keep it short. For problems, give steps, expected result and actual result.",
        quiz: [
          {
            prompt: "What should come first in a work message?",
            options: ["A long greeting", "Your full history", "The main point"],
            answer: 2,
          },
        ],
      },
      {
        title: "Meetings and stand-ups",
        body: [
          "In a daily stand-up, each person says what they did yesterday, what they will do today and any blockers.",
          "A blocker is something that stops your work, like missing access or an unclear task.",
          "If you do not understand, it is fine to say 'Could you repeat that, please?'",
        ],
        keyPoints: ["Stand-up: yesterday, today, blockers", "A blocker stops your work", "Asking to repeat is normal"],
        summary: "Stand-ups are short updates. Name your blockers early and ask politely when you do not understand.",
        quiz: [
          {
            prompt: "What is a blocker?",
            options: ["Something that stops your work", "A finished task", "A new teammate"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "What is a bug?", options: ["A new feature", "A mistake in software", "A meeting"], answer: 1 },
      { prompt: "Which message is clearest?", options: ["Hi, how are you, so about yesterday...", "Long story first, question at the end", "The login page is down. Steps to repeat are below."], answer: 2 },
      { prompt: "What do you share in a stand-up?", options: ["Yesterday, today and blockers", "Your salary", "Your full code"], answer: 0 },
      { prompt: "What can you say if you did not understand?", options: ["Nothing", "Could you repeat that, please?", "That is wrong"], answer: 1 },
    ],
  },
  {
    slug: "git",
    title: "Git and GitHub",
    skill: "Version control",
    level: "Beginner",
    hours: 4,
    priceMmk: 15000,
    description: "Track your code with Git, share it on GitHub and work with a team using branches and pull requests.",
    lessons: [
      {
        title: "What Git does",
        body: [
          "Git is a version control system. It records changes to your files over time.",
          "Each saved snapshot is called a commit, with a short message that describes the change.",
          "GitHub is a website that stores Git repositories online so teams can share code.",
        ],
        keyPoints: ["Git records changes over time", "A commit is a saved snapshot", "GitHub hosts repositories online"],
        summary: "Git saves your history as commits. GitHub keeps that history online for your team.",
        quiz: [
          {
            prompt: "What is a commit?",
            options: ["A website", "A saved snapshot of changes", "A text editor"],
            answer: 1,
          },
        ],
      },
      {
        title: "Everyday Git commands",
        body: [
          "git status shows what has changed. git add chooses which changes go into the next commit.",
          "git commit -m with a short message saves those changes as a commit.",
          "git push sends your commits to GitHub, and git pull brings down your teammates' changes.",
        ],
        keyPoints: ["status, add, commit", "push sends commits to GitHub", "pull gets teammates' changes"],
        summary: "Check with status, stage with add, save with commit, then share with push and update with pull.",
        quiz: [
          {
            prompt: "Which command sends your commits to GitHub?",
            options: ["git status", "git add", "git push"],
            answer: 2,
          },
        ],
      },
      {
        title: "Branches and pull requests",
        body: [
          "A branch lets you work on a feature without changing the main code.",
          "When the work is ready, you open a pull request on GitHub so teammates can review it.",
          "After approval, the branch is merged into main. Pull often to avoid big conflicts.",
        ],
        keyPoints: ["Branches keep work separate", "Pull requests ask for review", "Merge after approval"],
        summary: "Teams build features on branches and use pull requests to review code before it joins main.",
        quiz: [
          {
            prompt: "What is a pull request for?",
            options: ["Asking teammates to review and merge your changes", "Deleting a branch", "Installing Git"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "What is Git?", options: ["A version control system", "A web browser", "A database"], answer: 0 },
      { prompt: "Which command shows what has changed?", options: ["git push", "git status", "git merge"], answer: 1 },
      { prompt: "Which command brings down your teammates' changes?", options: ["git add", "git commit", "git pull"], answer: 2 },
      { prompt: "Why work on a branch?", options: ["To change the main code without review", "To work on a feature without changing main", "To delete history"], answer: 1 },
    ],
  },
  {
    slug: "react",
    title: "React fundamentals",
    skill: "React",
    level: "Intermediate",
    hours: 14,
    priceMmk: 55000,
    description: "Build interactive web apps with React components, props, state, forms and data from APIs.",
    lessons: [
      {
        title: "Components and JSX",
        body: [
          "React builds user interfaces from small, reusable pieces called components.",
          "A component is a JavaScript function that returns JSX, which looks like HTML inside JavaScript.",
          "Component names start with a capital letter, like ProductCard or Navbar.",
        ],
        keyPoints: ["UIs are built from components", "Components return JSX", "Component names start with a capital letter"],
        summary: "React apps are made of small components. Each one is a function that returns JSX.",
        quiz: [
          {
            prompt: "What does a React component return?",
            options: ["A CSS file", "JSX", "A database"],
            answer: 1,
          },
        ],
      },
      {
        title: "Props and state",
        body: [
          "Props pass data from a parent component to a child, like a product name and price.",
          "State is data a component remembers and can change. You manage it with the useState hook.",
          "When state changes, React re-renders the component to show the new value.",
        ],
        keyPoints: ["Props flow from parent to child", "useState stores changing data", "Changing state re-renders the component"],
        summary: "Props bring data in from the parent. State holds data that changes, and React updates the screen for you.",
        quiz: [
          {
            prompt: "Which hook stores changing data in a component?",
            options: ["useProps", "useRender", "useState"],
            answer: 2,
          },
        ],
      },
      {
        title: "Lists, forms and data from APIs",
        body: [
          "Use map() to show a list, and give each item a unique key prop.",
          "Controlled inputs keep form values in state, so you always know what the user typed.",
          "useEffect can fetch data from an API when the component first appears on the page.",
        ],
        keyPoints: ["Lists use map() and a unique key", "Controlled inputs keep form values in state", "useEffect can load API data"],
        summary: "Real apps show lists, handle forms and load data. map(), controlled inputs and useEffect cover these jobs.",
        quiz: [
          {
            prompt: "What does each item in a list need?",
            options: ["A unique key prop", "A CSS class", "Its own file"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "How should a component name start?", options: ["With a number", "With a lowercase letter", "With a capital letter"], answer: 2 },
      { prompt: "Which way do props flow?", options: ["From parent to child", "From child to parent only", "From the server only"], answer: 0 },
      { prompt: "What happens when state changes?", options: ["Nothing", "The component re-renders", "The page reloads fully"], answer: 1 },
      { prompt: "Which hook is often used to fetch API data?", options: ["useEffect", "useKey", "useList"], answer: 0 },
    ],
  },
  {
    slug: "node-backend",
    title: "Backend with Node.js",
    skill: "Backend development",
    level: "Intermediate",
    hours: 14,
    priceMmk: 55000,
    description: "Build a simple REST API with Node.js and Express, connect it to a database and handle errors safely.",
    lessons: [
      {
        title: "What a backend does",
        body: [
          "The backend runs on a server. It stores data, checks rules and sends results to the frontend.",
          "Node.js lets you run JavaScript on a server, not only in the browser.",
          "npm installs packages, such as Express, that other developers have shared.",
        ],
        keyPoints: ["The backend stores data and checks rules", "Node.js runs JavaScript on a server", "npm installs packages"],
        summary: "The backend is the part users do not see. Node.js and npm let you build it with JavaScript.",
        quiz: [
          {
            prompt: "What does Node.js let you do?",
            options: ["Design logos", "Run JavaScript on a server", "Edit photos"],
            answer: 1,
          },
        ],
      },
      {
        title: "Building an API with Express",
        body: [
          "An API lets the frontend ask the backend for data using HTTP requests.",
          "GET reads data, POST creates data, PUT or PATCH updates it, and DELETE removes it.",
          "In Express, a route like app.get('/products', handler) answers one kind of request.",
        ],
        keyPoints: ["APIs talk over HTTP", "GET, POST, PUT/PATCH, DELETE", "Express routes answer requests"],
        summary: "An Express app is a set of routes. Each route matches an HTTP method and path and sends a response.",
        quiz: [
          {
            prompt: "Which HTTP method creates new data?",
            options: ["GET", "DELETE", "POST"],
            answer: 2,
          },
        ],
      },
      {
        title: "Data, errors and safety",
        body: [
          "Real apps save data in a database such as PostgreSQL or MongoDB.",
          "Check all user input and return clear status codes, like 400 for bad input and 404 for not found.",
          "Keep secrets like database passwords in environment variables, never in your code.",
        ],
        keyPoints: ["Store data in a database", "Validate input and use clear status codes", "Keep secrets in environment variables"],
        summary: "A safe backend checks input, returns clear errors and keeps secrets out of the code.",
        quiz: [
          {
            prompt: "Where should a database password be kept?",
            options: ["In environment variables", "In the frontend code", "In a public GitHub repository"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "What does npm do?", options: ["Installs packages", "Hosts websites", "Designs pages"], answer: 0 },
      { prompt: "Which HTTP method reads data?", options: ["POST", "GET", "DELETE"], answer: 1 },
      { prompt: "Which status code means 'not found'?", options: ["200", "400", "404"], answer: 2 },
      { prompt: "Why use environment variables?", options: ["To make code longer", "To keep secrets out of the code", "To speed up the browser"], answer: 1 },
    ],
  },
  {
    slug: "sql",
    title: "Databases and SQL",
    skill: "Databases",
    level: "Beginner",
    hours: 8,
    priceMmk: 35000,
    description: "Read, filter, join and update data in a relational database using SQL queries.",
    lessons: [
      {
        title: "Tables, rows and columns",
        body: [
          "A relational database stores data in tables, a bit like a spreadsheet with strict rules.",
          "Each row is one record, such as one customer. Each column is one field, such as phone number.",
          "A primary key is a column with a unique value for every row, like customer_id.",
        ],
        keyPoints: ["Data lives in tables", "Rows are records; columns are fields", "A primary key is unique for each row"],
        summary: "Tables hold rows of records. A primary key makes sure every row can be found by a unique value.",
        quiz: [
          {
            prompt: "What does a primary key do?",
            options: ["Sorts the table", "Uniquely identifies each row", "Deletes duplicates"],
            answer: 1,
          },
        ],
      },
      {
        title: "Reading data with SELECT",
        body: [
          "SELECT chooses columns and FROM chooses the table, for example SELECT name FROM customers.",
          "WHERE filters rows, such as WHERE city = 'Mandalay'.",
          "ORDER BY sorts results, and COUNT, SUM and AVG give counts, totals and averages.",
        ],
        keyPoints: ["SELECT columns FROM a table", "WHERE filters rows", "ORDER BY sorts; COUNT, SUM, AVG summarise"],
        summary: "Most SQL work is SELECT queries. WHERE filters, ORDER BY sorts and functions summarise.",
        quiz: [
          {
            prompt: "Which keyword filters rows?",
            options: ["ORDER BY", "FROM", "WHERE"],
            answer: 2,
          },
        ],
      },
      {
        title: "Joins and changing data",
        body: [
          "A JOIN combines rows from two tables using a related column, like orders.customer_id and customers.id.",
          "INSERT adds rows, UPDATE changes them and DELETE removes them.",
          "Always use a WHERE clause with UPDATE and DELETE, or you may change every row.",
        ],
        keyPoints: ["JOIN links related tables", "INSERT, UPDATE, DELETE change data", "Always add WHERE to UPDATE and DELETE"],
        summary: "Joins connect tables. Be careful when changing data and always check your WHERE clause.",
        quiz: [
          {
            prompt: "What happens if you run DELETE without WHERE?",
            options: ["Every row in the table is deleted", "Nothing happens", "Only the first row is deleted"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "In a table, what is one row?", options: ["One field", "One record", "One database"], answer: 1 },
      { prompt: "Which query gets all names from customers?", options: ["SELECT name FROM customers", "GET name IN customers", "FIND customers.name"], answer: 0 },
      { prompt: "Which function adds up numbers?", options: ["COUNT", "AVG", "SUM"], answer: 2 },
      { prompt: "What combines rows from two related tables?", options: ["ORDER BY", "JOIN", "INSERT"], answer: 1 },
    ],
  },
  {
    slug: "uiux",
    title: "UI/UX design basics",
    skill: "UI/UX design",
    level: "Beginner",
    hours: 8,
    priceMmk: 40000,
    description: "Design screens that are clear and easy to use, from user goals to wireframes, prototypes and testing.",
    lessons: [
      {
        title: "UI and UX",
        body: [
          "UX (user experience) is how easy and pleasant a product is to use. UI (user interface) is how it looks.",
          "Good design starts with the user's goal, such as paying a bill with KBZPay in a few taps.",
          "Talk to real users and watch them use your design to find problems.",
        ],
        keyPoints: ["UX is about ease of use", "UI is about look and layout", "Start from the user's goal"],
        summary: "UI and UX work together. Start from what the user wants to do, then make it simple.",
        quiz: [
          {
            prompt: "What does UX focus on?",
            options: ["Only colours", "How easy and pleasant a product is to use", "Server speed"],
            answer: 1,
          },
        ],
      },
      {
        title: "Layout, colour and type",
        body: [
          "Visual hierarchy shows the most important things first, using size, weight and position.",
          "Use a few consistent colours, and make sure text has enough contrast to read.",
          "Give elements space, and make buttons big enough to tap on a phone.",
        ],
        keyPoints: ["Hierarchy guides the eye", "Few colours, good contrast", "Space and tap-friendly buttons"],
        summary: "Clear hierarchy, readable contrast and enough spacing make a screen easy to scan and use.",
        quiz: [
          {
            prompt: "Why does text need good contrast?",
            options: ["To look modern", "To use more colours", "So people can read it easily"],
            answer: 2,
          },
        ],
      },
      {
        title: "Wireframes, prototypes and testing",
        body: [
          "A wireframe is a simple sketch of a screen's layout, without final colours or images.",
          "A prototype links screens so people can click through the flow like a real app.",
          "Usability testing means watching users try tasks and fixing what confuses them.",
        ],
        keyPoints: ["Wireframes plan layout", "Prototypes show the flow", "Testing finds confusing parts"],
        summary: "Sketch with wireframes, connect screens in a prototype, then test with real users and improve.",
        quiz: [
          {
            prompt: "What is a wireframe?",
            options: ["A simple layout sketch", "The final app code", "A colour palette"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "What does UI mean?", options: ["User interface", "Unique input", "User internet"], answer: 0 },
      { prompt: "What does visual hierarchy do?", options: ["Hides content", "Shows the most important things first", "Adds more colours"], answer: 1 },
      { prompt: "What lets people click through screens before the app is built?", options: ["A database", "A wireframe only", "A prototype"], answer: 2 },
      { prompt: "What is usability testing?", options: ["Watching users try tasks", "Checking server logs", "Counting pages"], answer: 0 },
    ],
  },
  {
    slug: "figma",
    title: "Figma for beginners",
    skill: "Figma",
    level: "Beginner",
    hours: 6,
    priceMmk: 30000,
    description: "Design app screens in Figma with frames, auto layout and components, then share a clickable prototype.",
    lessons: [
      {
        title: "Getting started with Figma",
        body: [
          "Figma is a design tool that runs in the browser, and the free plan is enough to start.",
          "You design inside frames, which act like screens for a phone or a desktop.",
          "Shapes, text and images are layers. You can see them all in the layers panel on the left.",
        ],
        keyPoints: ["Figma runs in the browser", "Frames act like screens", "Everything is a layer"],
        summary: "Figma is free to start. You build screens in frames and manage items in the layers panel.",
        quiz: [
          {
            prompt: "What is a frame in Figma?",
            options: ["A type of font", "A container that acts like a screen", "A paid plugin"],
            answer: 1,
          },
        ],
      },
      {
        title: "Auto layout and components",
        body: [
          "Auto layout arranges items in a row or column and resizes the frame, like a button that fits its text.",
          "A component is a reusable element, such as a button. Edit the main component and every copy updates.",
          "Copies of a component are called instances.",
        ],
        keyPoints: ["Auto layout arranges and resizes", "Components are reusable", "Copies are called instances"],
        summary: "Auto layout saves manual spacing. Components keep repeated items the same across your design.",
        quiz: [
          {
            prompt: "What happens when you edit a main component?",
            options: ["Its instances update too", "Only that one copy changes", "The file is deleted"],
            answer: 0,
          },
        ],
      },
      {
        title: "Prototypes and handoff",
        body: [
          "In prototype mode, you link frames so a click on a button opens the next screen.",
          "Share a link so clients and teammates can view the design and leave comments.",
          "Developers can select layers to see sizes, colours and spacing, and export images they need.",
        ],
        keyPoints: ["Link frames in prototype mode", "Share links for comments", "Developers inspect and export"],
        summary: "A shared prototype gets feedback early, and developers can read exact values from the file.",
        quiz: [
          {
            prompt: "How do you make a button click open the next screen?",
            options: ["Add a comment", "Export the frame", "Link frames in prototype mode"],
            answer: 2,
          },
        ],
      },
    ],
    test: [
      { prompt: "Where can you see all the layers in a file?", options: ["The layers panel", "The export menu", "The comment box"], answer: 0 },
      { prompt: "What does auto layout do?", options: ["Adds colours", "Arranges items and resizes the frame", "Deletes layers"], answer: 1 },
      { prompt: "What is a copy of a component called?", options: ["A frame", "A layer group", "An instance"], answer: 2 },
      { prompt: "How do teammates give feedback on a design?", options: ["They cannot", "By printing it", "By opening a shared link and commenting"], answer: 2 },
    ],
  },
  {
    slug: "spreadsheets",
    title: "Spreadsheets for data",
    skill: "Excel and Google Sheets",
    level: "Beginner",
    hours: 6,
    priceMmk: 25000,
    description: "Use formulas, clean messy data and build pivot tables and charts in Excel or Google Sheets.",
    lessons: [
      {
        title: "Cells, rows and formulas",
        body: [
          "A spreadsheet is a grid of cells. Each cell has an address, like B3 for column B, row 3.",
          "Formulas start with an equals sign, such as =B2*C2 to multiply quantity by price.",
          "Functions like SUM, AVERAGE and COUNT work on ranges, such as =SUM(D2:D20).",
        ],
        keyPoints: ["Cells have addresses like B3", "Formulas start with =", "SUM, AVERAGE and COUNT work on ranges"],
        summary: "Formulas do the maths for you. Point them at cells and ranges instead of typing numbers.",
        quiz: [
          {
            prompt: "What does every formula start with?",
            options: ["#", "=", "@"],
            answer: 1,
          },
        ],
      },
      {
        title: "Cleaning and sorting data",
        body: [
          "Real data is often messy, with extra spaces, mixed date formats and duplicate rows.",
          "TRIM removes extra spaces, and the Remove duplicates tool clears repeated rows.",
          "Sort and filter help you find things fast, like all sales from Yangon branches.",
        ],
        keyPoints: ["Real data is messy", "TRIM and Remove duplicates clean it", "Sort and filter find what you need"],
        summary: "Clean data first, then sort and filter. Clean data gives correct totals.",
        quiz: [
          {
            prompt: "Which function removes extra spaces?",
            options: ["SUM", "COUNT", "TRIM"],
            answer: 2,
          },
        ],
      },
      {
        title: "Lookups, pivot tables and charts",
        body: [
          "XLOOKUP or VLOOKUP finds a value in another table, like a product's price from its code.",
          "A pivot table summarises data, such as total sales in MMK by month and by shop.",
          "Use a line chart for trends over time and a bar chart to compare groups.",
        ],
        keyPoints: ["Lookups pull values from other tables", "Pivot tables summarise", "Line for trends, bar for comparisons"],
        summary: "Lookups join data, pivot tables summarise it and charts make the result easy to understand.",
        quiz: [
          {
            prompt: "Which tool summarises total sales by month?",
            options: ["A pivot table", "TRIM", "A cell address"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "Which formula adds D2 to D20?", options: ["=ADD(D2-D20)", "=SUM(D2:D20)", "SUM D2 D20"], answer: 1 },
      { prompt: "What is a common problem in real data?", options: ["Duplicate rows", "Too few cells", "No columns"], answer: 0 },
      { prompt: "Which tool finds a product's price from its code?", options: ["TRIM", "Sort", "XLOOKUP"], answer: 2 },
      { prompt: "Which chart is best for sales over 12 months?", options: ["Line chart", "No chart", "A single number"], answer: 0 },
    ],
  },
  {
    slug: "python-data",
    title: "Data analysis with Python",
    skill: "Data analysis",
    level: "Intermediate",
    hours: 12,
    priceMmk: 50000,
    description: "Load, clean, group and chart data with Python and pandas, and share clear findings with your team.",
    lessons: [
      {
        title: "Python and pandas basics",
        body: [
          "Python is a popular language for data work because it is easy to read.",
          "pandas is a Python library for tables of data. A table in pandas is called a DataFrame.",
          "Load a CSV file with pd.read_csv('sales.csv') and look at the first rows with df.head().",
        ],
        keyPoints: ["Python is easy to read", "pandas works with tables called DataFrames", "read_csv loads data; head shows the top rows"],
        summary: "pandas turns a CSV file into a DataFrame you can explore with a few lines of Python.",
        quiz: [
          {
            prompt: "What is a table called in pandas?",
            options: ["A list", "A DataFrame", "A chart"],
            answer: 1,
          },
        ],
      },
      {
        title: "Cleaning and exploring data",
        body: [
          "df.info() shows column types and missing values. df.describe() gives basic statistics like the mean.",
          "dropna() removes rows with missing values, and fillna() fills them with a value you choose.",
          "Filter rows with a condition, like df[df['city'] == 'Yangon'].",
        ],
        keyPoints: ["info() and describe() explore data", "dropna() and fillna() handle missing values", "Filter rows with conditions"],
        summary: "Check your data first, handle missing values, then filter to the rows you need.",
        quiz: [
          {
            prompt: "Which method shows basic statistics like the mean?",
            options: ["df.head()", "df.dropna()", "df.describe()"],
            answer: 2,
          },
        ],
      },
      {
        title: "Grouping and charts",
        body: [
          "groupby() groups rows and summarises them, like df.groupby('product')['sales'].sum() for total sales per product.",
          "Matplotlib, or the DataFrame plot() method, turns results into charts.",
          "At work, share a clear chart and two or three findings, not just raw code.",
        ],
        keyPoints: ["groupby() summarises by group", "plot() and Matplotlib draw charts", "Share findings, not only code"],
        summary: "Group data to answer business questions, chart the result and explain what it means.",
        quiz: [
          {
            prompt: "Which method gives totals per product?",
            options: ["groupby()", "read_csv()", "head()"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "Which function loads a CSV file in pandas?", options: ["pd.open_csv()", "pd.load()", "pd.read_csv()"], answer: 2 },
      { prompt: "What does fillna() do?", options: ["Fills missing values", "Deletes the file", "Sorts columns"], answer: 0 },
      { prompt: "What does df.info() show?", options: ["Only the first row", "Column types and missing values", "A chart"], answer: 1 },
      { prompt: "What should you share with your manager after an analysis?", options: ["Only raw code", "Nothing", "A clear chart and key findings"], answer: 2 },
    ],
  },
  {
    slug: "it-support",
    title: "IT support and networking basics",
    skill: "IT support",
    level: "Beginner",
    hours: 8,
    priceMmk: 30000,
    description: "Fix common computer problems, understand basic networking and support office users through a helpdesk.",
    lessons: [
      {
        title: "Hardware, software and troubleshooting",
        body: [
          "Hardware is the physical parts, like the CPU, RAM and storage. Software is the programs that run on it.",
          "Start with simple checks: is it plugged in, switched on, and has it been restarted?",
          "Change one thing at a time and write down what you tried.",
        ],
        keyPoints: ["Hardware is physical; software is programs", "Check power, cables and restart first", "Change one thing at a time"],
        summary: "Most problems have simple causes. Check the basics first and work step by step.",
        quiz: [
          {
            prompt: "What is a good first troubleshooting step?",
            options: ["Replace the motherboard", "Restart and check cables and power", "Reinstall Windows"],
            answer: 1,
          },
        ],
      },
      {
        title: "Networking basics",
        body: [
          "Every device on a network has an IP address. A router connects the office network to the internet.",
          "DNS turns names like google.com into IP addresses.",
          "The ping command checks if one device can reach another, and ipconfig shows your IP address on Windows.",
        ],
        keyPoints: ["Devices have IP addresses", "DNS turns names into IP addresses", "ping tests reach; ipconfig shows your IP"],
        summary: "IP addresses, routers and DNS make networks work. ping and ipconfig help you find network problems.",
        quiz: [
          {
            prompt: "What does DNS do?",
            options: ["Speeds up the CPU", "Stores files", "Turns domain names into IP addresses"],
            answer: 2,
          },
        ],
      },
      {
        title: "Helping users at work",
        body: [
          "Most companies track problems as tickets in a helpdesk system.",
          "Ask clear questions, stay patient and explain fixes in simple words.",
          "Write short notes on each fix so the team can solve the same problem faster next time.",
        ],
        keyPoints: ["Problems are tracked as tickets", "Be patient and explain simply", "Document every fix"],
        summary: "Good IT support is calm, clear and well documented.",
        quiz: [
          {
            prompt: "Why write notes after a fix?",
            options: ["So the team can solve it faster next time", "To make tickets longer", "Notes are not needed"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "Which of these is hardware?", options: ["RAM", "Microsoft Word", "A web browser"], answer: 0 },
      { prompt: "What connects the office network to the internet?", options: ["A keyboard", "A router", "A printer"], answer: 1 },
      { prompt: "Which command checks if a device can be reached?", options: ["ipconfig", "dir", "ping"], answer: 2 },
      { prompt: "How do most companies track user problems?", options: ["Tickets in a helpdesk system", "Only by phone calls", "They do not track them"], answer: 0 },
    ],
  },
  {
    slug: "security",
    title: "Cybersecurity basics",
    skill: "Cybersecurity",
    level: "Beginner",
    hours: 6,
    priceMmk: 35000,
    description: "Protect your accounts, spot phishing and scams, and follow safe habits that keep company data secure.",
    lessons: [
      {
        title: "Passwords and two-factor authentication",
        body: [
          "Use a long, unique password for every account. A password manager can remember them for you.",
          "Two-factor authentication (2FA) adds a second check after your password, like a code from an app.",
          "Never share one-time codes (OTP) from KBZPay, Wave Money or your bank, even with someone who says they are staff.",
        ],
        keyPoints: ["Long, unique passwords for every account", "Turn on 2FA", "Never share OTP codes"],
        summary: "Strong passwords and 2FA protect your accounts. Real staff will never ask for your OTP.",
        quiz: [
          {
            prompt: "What should you do if someone asks for your OTP code?",
            options: ["Send it quickly", "Never share it", "Share only half of it"],
            answer: 1,
          },
        ],
      },
      {
        title: "Phishing and scams",
        body: [
          "Phishing is a fake message that tries to make you click a link or give away your details.",
          "Warning signs include urgent threats, spelling mistakes, strange sender addresses and surprise prizes.",
          "Type the real website address yourself instead of clicking links in messages.",
        ],
        keyPoints: ["Phishing tricks you into clicking or sharing", "Watch for urgency and odd senders", "Go to sites directly, not via links"],
        summary: "Slow down when a message feels urgent. Check the sender and visit the real site yourself.",
        quiz: [
          {
            prompt: "Which is a phishing warning sign?",
            options: ["A newsletter you signed up for", "A colleague confirming a planned meeting", "An urgent message saying your account closes today"],
            answer: 2,
          },
        ],
      },
      {
        title: "Staying safe at work",
        body: [
          "Install updates quickly, because many updates fix security holes.",
          "Lock your screen when you leave your desk, and do not plug in unknown USB drives.",
          "Back up important data and report anything strange to IT straight away.",
        ],
        keyPoints: ["Install updates quickly", "Lock your screen; avoid unknown USB drives", "Back up and report problems early"],
        summary: "Small daily habits like updates, screen locks and quick reports keep company data safe.",
        quiz: [
          {
            prompt: "Why install software updates?",
            options: ["They often fix security holes", "They delete all emails", "They make passwords longer"],
            answer: 0,
          },
        ],
      },
    ],
    test: [
      { prompt: "What does 2FA add?", options: ["A second check after your password", "A shorter password", "A faster login with no password"], answer: 0 },
      { prompt: "What should you do with a link in a suspicious message?", options: ["Click it to check", "Forward it to friends", "Do not click; visit the real site yourself"], answer: 2 },
      { prompt: "What should you do when you leave your desk?", options: ["Leave it open", "Lock your screen", "Turn off the monitor only"], answer: 1 },
      { prompt: "Which password habit is safest?", options: ["One password for everything", "A unique password for each account", "Your birthday"], answer: 1 },
    ],
  },
];
