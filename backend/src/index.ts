import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// In-memory data stores
let courses = [
  {
    id: "101",
    title: "Full Stack Web Development",
    description: "Learn to build modern web applications using React, Node.js, and MongoDB.",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    status: "active",
    modules: [
      {
        id: "m1",
        title: "Frontend Basics",
        description: "Introduction to HTML, CSS, and JavaScript.",
        videos: [
          {
            id: "v1",
            title: "HTML & CSS Crash Course",
            description: "Learn the basics of HTML and CSS.",
            videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
            thumbnailUrl: "https://img.youtube.com/vi/UB1O30fR-EE/hqdefault.jpg"
          },
          {
            id: "v2",
            title: "JavaScript Essentials",
            description: "Master the fundamentals of JavaScript.",
            videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
            thumbnailUrl: "https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat1",
            name: "HTML5 Cheat Sheet.pdf",
            dataUrl: "https://www.w3schools.com/html/html_cheat_sheet.pdf"
          }
        ]
      },
      {
        id: "m2",
        title: "React Fundamentals",
        description: "Dive into React and learn how to build dynamic UIs.",
        videos: [
          {
            id: "v3",
            title: "React JS Crash Course",
            description: "A fast-paced introduction to React.",
            videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
            thumbnailUrl: "https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat2",
            name: "React Official Docs.pdf",
            dataUrl: "https://react.dev/_next/static/media/react-dev.pdf"
          }
        ]
      },
      {
        id: "m3",
        title: "Backend with Node.js",
        description: "Learn to build REST APIs using Node.js and Express.",
        videos: [
          {
            id: "v4",
            title: "Node.js Crash Course",
            description: "Get started with Node.js and Express.",
            videoUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
            thumbnailUrl: "https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat3",
            name: "Node.js Guide.pdf",
            dataUrl: "https://nodejs.org/static/documents/Nodejs-Guide.pdf"
          }
        ]
      }
    ],
    enrolledStudents: 0
  },
  {
    id: "102",
    title: "Python for Beginners",
    description: "Start your Python journey with this beginner-friendly course.",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    status: "active",
    modules: [
      {
        id: "m1",
        title: "Getting Started with Python",
        description: "Install Python and write your first script.",
        videos: [
          {
            id: "v1",
            title: "Python Installation & Setup",
            description: "How to install Python and set up your environment.",
            videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
            thumbnailUrl: "https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat1",
            name: "Python Basics.pdf",
            dataUrl: "https://www.python.org/static/community_logos/python-logo.pdf"
          }
        ]
      },
      {
        id: "m2",
        title: "Python Programming",
        description: "Learn Python syntax and basic programming concepts.",
        videos: [
          {
            id: "v2",
            title: "Python Programming for Beginners",
            description: "A beginner-friendly introduction to Python programming.",
            videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
            thumbnailUrl: "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat2",
            name: "Python Programming Notes.pdf",
            dataUrl: "https://www.tutorialspoint.com/python/python_tutorial.pdf"
          }
        ]
      }
    ],
    enrolledStudents: 0
  },
  {
    id: "103",
    title: "Kubernetes Essentials",
    description: "Master container orchestration with Kubernetes.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
    status: "active",
    modules: [
      {
        id: "m1",
        title: "Kubernetes Basics",
        description: "Introduction to Kubernetes and its architecture.",
        videos: [
          {
            id: "v1",
            title: "Kubernetes Introduction",
            description: "What is Kubernetes and why use it?",
            videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do",
            thumbnailUrl: "https://img.youtube.com/vi/X48VuDVv0do/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat1",
            name: "Kubernetes Handbook.pdf",
            dataUrl: "https://kubernetes.io/docs/concepts/overview/what-is-kubernetes.pdf"
          }
        ]
      },
      {
        id: "m2",
        title: "Kubernetes in Practice",
        description: "Hands-on with deployments, services, and scaling.",
        videos: [
          {
            id: "v2",
            title: "Kubernetes Deployments",
            description: "How to deploy and scale applications on Kubernetes.",
            videoUrl: "https://www.youtube.com/watch?v=Zp6JpU1Kk1k",
            thumbnailUrl: "https://img.youtube.com/vi/Zp6JpU1Kk1k/hqdefault.jpg"
          }
        ],
        materials: [
          {
            id: "mat2",
            name: "Kubernetes Cheat Sheet.pdf",
            dataUrl: "https://www.digitalocean.com/community/cheatsheets/kubernetes-cheat-sheet.pdf"
          }
        ]
      }
    ],
    enrolledStudents: 0
  },
  {
    id: '2',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'Intro to Node.js',
        description: 'What is Node.js and why use it?',
        videos: [
          {
            id: 'v1',
            title: 'Node.js Introduction',
            description: 'Introduction video',
            videoUrl: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat2',
            name: 'Node.js Guide.pdf',
            dataUrl: 'https://nodejs.org/static/documents/Nodejs-Guide.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '3',
    title: 'HTML & CSS Crash Course',
    description: 'Learn how to build beautiful websites with HTML and CSS.',
    thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'HTML Basics',
        description: 'Structure your web pages with HTML.',
        videos: [
          {
            id: 'v1',
            title: 'HTML Introduction',
            description: 'Introduction to HTML',
            videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat4',
            name: 'HTML5 Notes.pdf',
            dataUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '5',
    title: 'JavaScript Essentials',
    description: 'Master the fundamentals of JavaScript programming.',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'JavaScript Syntax',
        description: 'Understand the basics of JS syntax.',
        videos: [
          {
            id: 'v1',
            title: 'JavaScript Basics',
            description: 'Introduction to JavaScript',
            videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat5',
            name: 'JavaScript Guide.pdf',
            dataUrl: 'https://www.cs.cmu.edu/~15131/resources/js.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '6',
    title: 'Git & GitHub for Developers',
    description: 'Learn version control and collaboration with Git and GitHub.',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'Getting Started with Git',
        description: 'Install Git and make your first commit.',
        videos: [
          {
            id: 'v1',
            title: 'Git Installation',
            description: 'How to install Git',
            videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat6',
            name: 'Git Handbook.pdf',
            dataUrl: 'https://guides.github.com/pdfs/github-git-cheat-sheet.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  // New Courses
  {
    id: '7',
    title: 'DevSecOps',
    description: 'Integrate security into DevOps processes for robust, secure software delivery.',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'DevSecOps Introduction',
        description: 'What is DevSecOps?',
        videos: [
          {
            id: 'v1',
            title: 'DevSecOps Overview',
            description: 'Overview of DevSecOps',
            videoUrl: 'https://www.youtube.com/watch?v=2YDwPZQJzjc',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat7',
            name: 'DevSecOps Guide.pdf',
            dataUrl: 'https://www.synopsys.com/content/dam/synopsys/sig-assets/white-papers/devsecops-whitepaper.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '8',
    title: 'MLOps',
    description: 'Operationalize machine learning models with best practices and tools.',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'MLOps Basics',
        description: 'Introduction to MLOps.',
        videos: [
          {
            id: 'v1',
            title: 'MLOps Introduction',
            description: 'Introduction to MLOps',
            videoUrl: 'https://www.youtube.com/watch?v=06-AZXmwHjo',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat8',
            name: 'MLOps Whitepaper.pdf',
            dataUrl: 'https://ml-ops.org/content/dam/mlops/pdf/mlops-whitepaper.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '9',
    title: 'Generative AI',
    description: 'Explore the world of generative AI, from text to images and beyond.',
    thumbnail: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    modules: [
      {
        id: 'm1',
        title: 'What is Generative AI?',
        description: 'Overview of generative models.',
        videos: [
          {
            id: 'v1',
            title: 'Generative AI Overview',
            description: 'Overview of Generative AI',
            videoUrl: 'https://www.youtube.com/watch?v=WXuK6gekU1Y',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat9',
            name: 'Generative AI Overview.pdf',
            dataUrl: 'https://arxiv.org/pdf/2005.05238.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
  {
    id: '10',
    title: 'Kubernetes',
    description: 'Master container orchestration with Kubernetes.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
    modules: [
      {
        id: 'm1',
        title: 'Kubernetes Basics',
        description: 'Introduction to Kubernetes.',
        videos: [
          {
            id: 'v1',
            title: 'Kubernetes Introduction',
            description: 'Introduction to Kubernetes',
            videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
            thumbnailUrl: '',
          },
        ],
        materials: [
          {
            id: 'mat10',
            name: 'Kubernetes Handbook.pdf',
            dataUrl: 'https://kubernetes.io/docs/concepts/overview/what-is-kubernetes.pdf',
          },
        ],
      },
    ],
    status: 'active',
    enrolledStudents: 0,
  },
];

type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
};

let users: User[] = [
  { id: '1', email: 'admin@monk.edu', password: 'admin123', name: 'Admin User', phone: '0000000000', status: 'active' },
  { id: '2', email: 'student@monk.edu', password: 'student123', name: 'John Doe', phone: '1111111111', status: 'active' },
];

// userId -> { courseId -> [videoId, ...] }
let progress: Record<string, Record<string, string[]>> = {};

// Enrollments: userId -> courseId[]
let enrollments: Record<string, string[]> = {};

// List all users (students and admins)
app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

// Pending requests (in-memory)
let requests: { studentId: string; courseId: string }[] = [];

app.get('/api/requests', (req: Request, res: Response) => {
  res.json(requests);
});

app.post('/api/requests', (req: Request, res: Response) => {
  const { studentId, courseId } = req.body;
  if (!requests.find(r => r.studentId === studentId && r.courseId === courseId)) {
    requests.push({ studentId, courseId });
  }
  res.json({ success: true });
});

app.delete('/api/requests', (req: Request, res: Response) => {
  const { studentId, courseId } = req.body;
  requests = requests.filter(r => !(r.studentId === studentId && r.courseId === courseId));
  res.json({ success: true });
});

// Enrollments endpoints
app.get('/api/enrollments/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const userEnrollments = enrollments[userId] || [];
  res.json(userEnrollments);
});

app.post('/api/enrollments', (req: Request, res: Response) => {
  const { studentId, courseId } = req.body;
  
  // Initialize user enrollments if not exists
  if (!enrollments[studentId]) {
    enrollments[studentId] = [];
  }
  
  // Add course to user enrollments if not already enrolled
  if (!enrollments[studentId].includes(courseId)) {
    enrollments[studentId].push(courseId);
  }
  
  // Update course enrollment count
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.enrolledStudents = (course.enrolledStudents || 0) + 1;
  }
  
  // Set student status to 'active'
  const user = users.find(u => u.id === studentId);
  if (user && user.status === 'inactive') {
    user.status = 'active';
  }
  
  res.json({ success: true });
});

app.delete('/api/enrollments', (req: Request, res: Response) => {
  const { studentId, courseId } = req.body;
  
  if (enrollments[studentId]) {
    enrollments[studentId] = enrollments[studentId].filter(id => id !== courseId);
  }
  
  // Update course enrollment count
  const course = courses.find(c => c.id === courseId);
  if (course && course.enrolledStudents) {
    course.enrolledStudents = Math.max(0, course.enrolledStudents - 1);
  }
  
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Courses endpoints
app.get('/api/courses', (req: Request, res: Response) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req: Request, res: Response) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(course);
});

app.post('/api/courses', (req: Request, res: Response) => {
  const { title, description, thumbnail, modules, status } = req.body;
  const newCourse = {
    id: String(Date.now()),
    title,
    description,
    thumbnail: thumbnail || null,
    modules: modules || [],
    status: status || 'draft',
    enrolledStudents: 0,
  };
  courses.push(newCourse);
  res.json(newCourse);
});

app.put('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, thumbnail, modules, status } = req.body;
  const courseIndex = courses.findIndex(c => c.id === id);
  if (courseIndex === -1) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  courses[courseIndex] = {
    ...courses[courseIndex],
    title,
    description,
    thumbnail: thumbnail || null,
    modules: modules || [],
    status,
  };
  res.json(courses[courseIndex]);
});

app.delete('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  courses = courses.filter(c => c.id !== id);
  res.json({ success: true });
});

// Users endpoints
app.post('/api/register', (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;
  if (users.find(u => u.email === email)) {
    res.status(400).json({ error: 'Email already exists' });
    return;
  }
  const newUser: User = { id: String(Date.now()), email, password, name, phone, status: 'active' };
  users.push(newUser);
  res.json({ id: newUser.id, email, name, phone, status: newUser.status });
});

app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
});

// Progress endpoints
app.get('/api/progress/:userId/:courseId', (req: Request, res: Response) => {
  const { userId, courseId } = req.params;
  const watched = progress[userId]?.[courseId] || [];
  res.json({ watched });
});

app.post('/api/progress/:userId/:courseId/:videoId', (req: Request, res: Response) => {
  const { userId, courseId, videoId } = req.params;
  if (!progress[userId]) progress[userId] = {};
  if (!progress[userId][courseId]) progress[userId][courseId] = [];
  if (!progress[userId][courseId].includes(videoId)) {
    progress[userId][courseId].push(videoId);
  }
  res.json({ watched: progress[userId][courseId] });
});

// Password reset endpoint
app.post('/api/reset-password', (req: Request, res: Response) => {
  const { email, phone, newPassword } = req.body;
  const user = users.find(u => u.email === email && u.phone === phone);
  if (!user) {
    res.status(404).json({ error: 'User not found or phone number does not match.' });
    return;
  }
  user.password = newPassword;
  res.json({ success: true });
});

// Add 'Git Handbook.pdf' as a study resource to the 'Getting Started with Git' module in all courses if not already present
courses.forEach(course => {
  const gitModule = course.modules && course.modules.find(m => m.title && m.title.toLowerCase().includes('git'));
  if (gitModule && gitModule.materials && !gitModule.materials.some(mat => mat.name === 'Git Handbook.pdf')) {
    gitModule.materials.push({
      id: 'mat1',
      name: 'Git Handbook.pdf',
      dataUrl: 'https://guides.github.com/pdfs/github-git-cheat-sheet.pdf'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 