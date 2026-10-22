// Prices match the locked catalogue. Frontend 45,000 is still a placeholder.
export const courses = [
  {
    title: "Career starter: working in IT",
    skill: "IT careers",
    level: "Beginner",
    hours: 3,
    priceMmk: 0,
    description: "Learn what IT roles exist, how teams work and how to show your skills to a company.",
    lessons: [
      {
        title: "IT roles in Myanmar",
        body: [
          "IT companies in Myanmar hire for many entry roles: frontend and backend developers, QA testers, UI designers and IT support.",
          "Software houses build products for clients, outsourcing firms deliver projects for overseas companies, and startups build their own product.",
          "Each role needs a different set of skills. Pick one goal first, then learn the skills for it in order.",
        ],
        keyPoints: [
          "Common entry roles: developer, QA tester, designer, IT support",
          "Company types: software house, outsourcing firm, startup, digital agency",
          "Pick one goal and learn its skills in order",
        ],
        summary: "Entry IT jobs in Myanmar come in a few clear roles. Choosing one goal makes it easier to know what to learn next.",
        quiz: [
          {
            prompt: "What should you do first when starting an IT career?",
            options: ["Learn every language at once", "Pick one goal and learn its skills in order", "Apply to every job"],
            answer: 1,
          },
        ],
      },
      {
        title: "How software teams work",
        body: [
          "Most teams plan work in short cycles called sprints, usually one or two weeks long.",
          "Work is tracked as tasks on a board. Each task moves from To do, to In progress, to Review, to Done.",
          "Code and designs are reviewed by teammates before they are released. Clear, polite feedback is part of the job.",
        ],
        keyPoints: ["Teams work in short sprints", "Tasks move across a board", "Every piece of work is reviewed"],
        summary: "Software teams plan in sprints, track tasks on a board and review each other's work before release.",
        quiz: [
          {
            prompt: "What usually happens before code is released?",
            options: ["A teammate reviews it", "Nothing", "The client writes it again"],
            answer: 0,
          },
        ],
      },
      {
        title: "Proving your skills",
        body: [
          "A certificate shows you finished a course. A real task shows a company you can do the work.",
          "On The Citadel, every course ends with a challenge set by a verified partner company.",
          "Good challenge answers explain your choices, not only the final result.",
        ],
        keyPoints: ["Certificates show learning; tasks show ability", "Courses end with a company challenge", "Explain your choices"],
        summary: "Companies trust real work more than certificates, so explain your thinking when you answer a challenge.",
        quiz: [
          {
            prompt: "What makes a strong challenge answer?",
            options: ["Only the final result", "The result plus why you made each choice", "A long CV"],
            answer: 1,
          },
        ],
      },
    ],
    test: [
      { prompt: "Which is an entry IT role?", options: ["Chief financial officer", "QA tester", "Bank teller"], answer: 1 },
      { prompt: "How long is a typical sprint?", options: ["6 months", "1 day", "1–2 weeks"], answer: 2 },
      { prompt: "Where do tasks move during a sprint?", options: ["On a board", "In an email", "On paper only"], answer: 0 },
      { prompt: "What proves you can do the work?", options: ["A long CV", "A real task", "A photo"], answer: 1 },
    ],
  },
  {
    title: "Frontend basics: HTML, CSS and JavaScript",
    skill: "Frontend development",
    level: "Beginner",
    hours: 12,
    priceMmk: 45000,
    description: "Build simple, responsive web pages and add interaction with JavaScript.",
    lessons: [
      {
        title: "HTML structure",
        body: [
          "HTML describes the structure of a page with elements such as header, main, section, h1 and p.",
          "Use the element that matches the meaning: a button for actions, a link for navigation, a list for lists.",
          "Meaningful HTML helps screen readers and search engines understand the page.",
        ],
        keyPoints: ["HTML is the page structure", "Use elements that match meaning", "Semantic HTML helps accessibility"],
        summary: "HTML gives a page its structure. Choosing the right element for each job makes the page accessible.",
        quiz: [{ prompt: "Which element should run an action?", options: ["div", "button", "span"], answer: 1 }],
      },
      {
        title: "CSS layout and responsive design",
        body: [
          "CSS controls how elements look: colour, spacing, size and layout.",
          "Flexbox lays items out in a row or column; grid lays them out in rows and columns at once.",
          "Media queries change the layout at different screen widths, so one page works on phones and laptops.",
        ],
        keyPoints: ["CSS controls look and layout", "Flexbox for one direction, grid for two", "Media queries make pages responsive"],
        summary: "CSS styles the page. Flexbox, grid and media queries let one layout adapt to any screen.",
        quiz: [{ prompt: "What makes a layout change on small screens?", options: ["Media queries", "Bigger images", "More HTML"], answer: 0 }],
      },
      {
        title: "JavaScript and the DOM",
        body: [
          "JavaScript makes pages interactive. It can read and change elements through the DOM.",
          "Event listeners run code when the user clicks, types or submits a form.",
          "Keep functions small and name them after what they do.",
        ],
        keyPoints: ["JavaScript adds interaction", "The DOM lets code change the page", "Event listeners react to the user"],
        summary: "JavaScript listens for user events and updates the page through the DOM.",
        quiz: [{ prompt: "What runs code when a user clicks?", options: ["An event listener", "A media query", "An h1"], answer: 0 }],
      },
    ],
    test: [
      { prompt: "Which element is best for navigation to another page?", options: ["button", "div", "a"], answer: 2 },
      { prompt: "Which CSS tool lays out rows and columns at once?", options: ["Flexbox", "Grid", "Float"], answer: 1 },
      { prompt: "What do media queries respond to?", options: ["Screen width", "User age", "File size"], answer: 0 },
      { prompt: "How does JavaScript change the page?", options: ["Through CSS only", "It cannot", "Through the DOM"], answer: 2 },
      { prompt: "Why use semantic HTML?", options: ["Faster typing", "Accessibility and meaning", "Smaller images"], answer: 1 },
    ],
  },
  {
    title: "Manual QA testing",
    skill: "QA testing",
    level: "Beginner",
    hours: 8,
    priceMmk: 30000,
    description: "Write test cases, find bugs and report them clearly so developers can fix them.",
    lessons: [
      {
        title: "What QA testers do",
        body: [
          "QA testers check that software works as expected before users see it.",
          "They read the requirements, plan what to test and try both normal and unusual inputs.",
        ],
        keyPoints: ["QA checks software before release", "Test normal and unusual inputs"],
        summary: "QA testers protect users by checking software against its requirements before release.",
        quiz: [{ prompt: "When does QA testing happen?", options: ["Before release", "Never", "Only after complaints"], answer: 0 }],
      },
      {
        title: "Writing test cases",
        body: [
          "A test case lists the steps, the input data and the expected result.",
          "Good test cases are short, repeatable and test one thing each.",
        ],
        keyPoints: ["Steps, data and expected result", "One thing per test case"],
        summary: "A good test case is short, repeatable and checks a single expected result.",
        quiz: [{ prompt: "What must a test case include?", options: ["Expected result", "The tester's age", "A logo"], answer: 0 }],
      },
      {
        title: "Reporting bugs",
        body: [
          "A bug report needs a clear title, steps to reproduce, the expected and actual result, and a screenshot if possible.",
          "Rate how serious the bug is so the team can decide what to fix first.",
        ],
        keyPoints: ["Clear title and steps", "Expected vs actual result", "Severity helps priority"],
        summary: "Clear bug reports with steps, results and severity help developers fix the right things first.",
        quiz: [{ prompt: "What helps a team decide what to fix first?", options: ["Severity", "Font size", "Report length"], answer: 0 }],
      },
    ],
    test: [
      { prompt: "What is a test case?", options: ["A bug fix", "Steps, data and expected result", "A design file"], answer: 1 },
      { prompt: "What belongs in a bug report?", options: ["Your salary", "Nothing", "Steps to reproduce"], answer: 2 },
      { prompt: "Why test unusual inputs?", options: ["To find hidden bugs", "To slow the team", "No reason"], answer: 0 },
      { prompt: "What does severity describe?", options: ["Who found it", "How serious a bug is", "When it was found"], answer: 1 },
    ],
  },
];
