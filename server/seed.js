const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Bookmark = require('./models/Bookmark');

dotenv.config();

const categories = [
  { name: 'Frontend Developer', description: 'Focuses on user interface, HTML/CSS/JS, React, performance, responsive design, and CSS layouts.' },
  { name: 'Backend Developer', description: 'Focuses on databases, server architectures, REST APIs, microservices, performance, and scaling.' },
  { name: 'Full Stack Developer', description: 'Combines both client-side interfaces and backend logic, deployment architectures, and end-to-end setups.' },
  { name: 'Java Developer', description: 'Covers core Java concepts, Spring Boot framework, multithreading, collections, and Java Design Patterns.' },
  { name: 'Python Developer', description: 'Covers Django/FastAPI, Python object-oriented programming, data science basics, and scripting guidelines.' },
  { name: 'MERN Developer', description: 'Specializes in MongoDB, Express, React, and Node.js stack development, including state management and JWT auth.' },
  { name: 'React Developer', description: 'Deep dive into React hooks, state machines, Virtual DOM, rendering cycles, Redux, and concurrent mode.' },
  { name: 'Node.js Developer', description: 'Covers asynchronous programming, the event loop, V8 engine basics, streams, buffer management, and express servers.' },
  { name: 'Software Engineer', description: 'Covers general computer science principles, data structures, algorithms, system designs, and software lifecycles.' },
];

const questions = [
  {
    title: 'Explain JavaScript Closures and a practical use case',
    description: 'What is a closure in JavaScript? Explain how they work behind the scenes (lexical scope) and provide a practical real-world use case where closures are highly beneficial.',
    role: 'Frontend Developer',
    difficulty: 'Easy',
    tags: ['JavaScript', 'Closures', 'Lexical Scope'],
    expectedAnswer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function scope even after the outer function has returned. A practical use case is creating private variables (encapsulation) or currying/function factories. For example: function createCounter() { let count = 0; return function() { count++; return count; } }.',
    estimatedTime: 10,
  },
  {
    title: 'How does the Node.js Event Loop work?',
    description: 'Explain the Node.js Event Loop phases, how it enables non-blocking I/O operations despite JavaScript being single-threaded, and the difference between microtasks (process.nextTick, Promise callbacks) and macrotasks (setTimeout, setInterval).',
    role: 'Node.js Developer',
    difficulty: 'Hard',
    tags: ['Node.js', 'Event Loop', 'Asynchronous', 'Performance'],
    expectedAnswer: 'The event loop is what allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible. It runs in phases: timers, pending callbacks, idle/prepare, poll (retrieves new I/O events), check (setImmediate callbacks), and close callbacks. Microtasks (like process.nextTick and Promise resolves) are executed immediately after the current operation finishes and before moving to the next phase of the event loop. Macrotasks (like timers and I/O callbacks) run in their specific phases. This priority system prevents I/O starvation.',
    estimatedTime: 15,
  },
  {
    title: 'Explain React useEffect cleanup function and why it is used',
    description: 'When does the cleanup function in React\'s useEffect hook run? Give examples of operations that require cleanups and what happens if you neglect them.',
    role: 'React Developer',
    difficulty: 'Medium',
    tags: ['React', 'Hooks', 'useEffect', 'Memory Leak'],
    expectedAnswer: 'The cleanup function in useEffect runs when the component unmounts, and also before running the effect again on subsequent renders (if dependencies change). It is used to clean up side-effects, such as canceling API subscriptions, clearing setTimeout/setInterval timers, removing global event listeners, or cleaning up WebSocket connections. Neglecting cleanup leads to memory leaks, state update errors on unmounted components, and erratic application behaviors.',
    estimatedTime: 10,
  },
  {
    title: 'Compare SQL vs NoSQL databases: When to use which?',
    description: 'Analyze the differences between Relational (SQL) and Non-Relational (NoSQL) databases. Detail their scaling capabilities, schema rules, transactions (ACID vs BASE), and clear scenarios for choosing one over the other.',
    role: 'Backend Developer',
    difficulty: 'Medium',
    tags: ['Databases', 'SQL', 'NoSQL', 'System Design'],
    expectedAnswer: 'SQL databases are relational, table-based, have a predefined schema, scale vertically (typically), and follow ACID properties (Atomicity, Consistency, Isolation, Durability) for transactions. Best for complex queries, financial apps, and structured tables. NoSQL databases are non-relational, document/key-value/graph-based, dynamic schema, scale horizontally (sharding), and follow BASE (Basically Available, Soft state, Eventual consistency). Best for unstructured data, high-throughput scaling, and rapid prototype cycles (like MongoDB in MERN).',
    estimatedTime: 12,
  },
  {
    title: 'What is MVC Architecture and how does MERN implement it?',
    description: 'Explain the Model-View-Controller pattern. Discuss how MERN stack applications implement or modify this paradigm. Address what role Express routing and controllers play.',
    role: 'MERN Developer',
    difficulty: 'Medium',
    tags: ['Architecture', 'MVC', 'MERN', 'Software Design'],
    expectedAnswer: 'MVC separates applications into Model (data logic), View (UI), and Controller (business logic). In MERN: Mongoose models represent the Model layer; React represents the View layer (separated completely via HTTP client-server architecture); Express controllers and routing serve as the Controller, handling requests, processing logic, and returning JSON. This decouples front and back ends, allowing API endpoints to serve multiple clients.',
    estimatedTime: 15,
  },
];

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected!');

    // Clean up
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Question.deleteMany();
    await Answer.deleteMany();
    await Bookmark.deleteMany();
    console.log('Database cleaned.');

    // 1. Create Admin User
    console.log('Creating seed admin user...');
    const admin = await User.create({
      name: 'Sphere Admin',
      email: 'seedadmin@talentsphere.com',
      password: 'admin123',
      avatar: 'https://ui-avatars.com/api/?name=Sphere+Admin&background=4f46e5&color=fff&bold=true',
      role: 'admin',
    });
    console.log(`Admin user created: ${admin.email} (password: admin123)`);

    // 2. Create Student User
    console.log('Creating seed student user...');
    const student = await User.create({
      name: 'John Doe',
      email: 'student@talentsphere.com',
      password: 'student123',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=06b6d4&color=fff&bold=true',
      role: 'student',
    });
    console.log(`Student user created: ${student.email} (password: student123)`);

    // 3. Create Categories
    console.log('Seeding categories...');
    const createdCategories = [];
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      const item = await Category.create({ ...cat, slug });
      createdCategories.push(item);
    }
    console.log(`${createdCategories.length} categories seeded.`);

    // 4. Create Questions
    console.log('Seeding questions...');
    let questionCount = 0;
    for (const q of questions) {
      await Question.create({
        ...q,
        createdBy: admin._id,
      });
      questionCount++;
    }
    console.log(`${questionCount} questions seeded.`);

    console.log('Database seeded successfully! Exiting script...');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
