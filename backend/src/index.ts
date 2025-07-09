import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User'; // Added import for User model
import Course from './models/Course';
import Enrollment from './models/Enrollment';
import RequestModel from './models/Request';
import Progress from './models/Progress';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monk-learn-hub';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Enrollments: userId -> courseId[]
let enrollments: Record<string, string[]> = {};

// Helper to map _id to id
function mapId(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(mapId);
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id;
  return obj;
}

// List all users (students and admins)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    const usersWithId = users.map(u => ({ ...u.toObject(), id: u._id }));
    res.json(usersWithId);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Requests endpoints
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await RequestModel.find();
    res.json(requests.map(mapId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    const exists = await RequestModel.findOne({ studentId, courseId });
    if (!exists) {
      await RequestModel.create({ studentId, courseId });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.delete('/api/requests', async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    await RequestModel.deleteOne({ studentId, courseId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Enrollments endpoints
app.get('/api/enrollments/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const enrollments = await Enrollment.find({ studentId: req.params.userId });
    const courseIds = enrollments.map(e => e.courseId);
    res.json(courseIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

app.post('/api/enrollments', async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    // Check if already enrolled
    const exists = await Enrollment.findOne({ studentId, courseId });
    if (!exists) {
      await Enrollment.create({ studentId, courseId });
      // Increment enrolledStudents in Course
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });
    }
    // Set user status to active
    await User.findByIdAndUpdate(studentId, { status: 'active' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

app.delete('/api/enrollments', async (req, res) => {
  const { studentId, courseId } = req.body;
  try {
    await Enrollment.deleteOne({ studentId, courseId });
    // Decrement enrolledStudents in Course
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: -1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unenroll' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Courses endpoints
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses.map(mapId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(mapId(course));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, thumbnail, modules, status } = req.body;
    const newCourse = await Course.create({ title, description, thumbnail, modules, status });
    res.json(newCourse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const { title, description, thumbnail, modules, status } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, thumbnail, modules, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Course not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Users endpoints
app.post('/api/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = await User.create({ email, password, name, phone, role: role || 'student' });
    res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, status: user.status, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create a new user (admin only)
app.post('/api/users', async (req, res) => {
  const { email, password, name, phone, role, status } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = await User.create({ email, password, name, phone, role: role || 'student', status: status || 'active' });
    res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, status: user.status, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user (admin only)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, phone, password, status, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, password, status, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ id: updated._id, email: updated.email, name: updated.name, phone: updated.phone, status: updated.status, role: updated.role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user (admin only)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Progress endpoints
app.get('/api/progress/:userId/:courseId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId) || !mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ error: 'Invalid user or course ID' });
    }
    const progress = await Progress.findOne({ userId: req.params.userId, courseId: req.params.courseId });
    res.json({ watched: progress ? progress.watched : [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.post('/api/progress/:userId/:courseId/:videoId', async (req, res) => {
  const { userId, courseId, videoId } = req.params;
  try {
    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = await Progress.create({ userId, courseId, watched: [videoId] });
    } else if (!progress.watched.includes(videoId)) {
      progress.watched.push(videoId);
      await progress.save();
    }
    res.json({ watched: progress.watched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Password reset endpoint
app.post('/api/reset-password', async (req, res) => {
  const { email, phone, newPassword } = req.body;
  try {
    const user = await User.findOne({ email, phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found or phone number does not match.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Add 'Git Handbook.pdf' as a study resource to the 'Getting Started with Git' module in all courses if not already present
// courses.forEach(course => { // This line is removed as per the edit hint
//   const gitModule = course.modules && course.modules.find(m => m.title && m.title.toLowerCase().includes('git')); // This line is removed as per the edit hint
//   if (gitModule && gitModule.materials && !gitModule.materials.some(mat => mat.name === 'Git Handbook.pdf')) { // This line is removed as per the edit hint
//     gitModule.materials.push({ // This line is removed as per the edit hint
//       id: 'mat1', // This line is removed as per the edit hint
//       name: 'Git Handbook.pdf', // This line is removed as per the edit hint
//       dataUrl: 'https://guides.github.com/pdfs/github-git-cheat-sheet.pdf' // This line is removed as per the edit hint
//     }); // This line is removed as per the edit hint
//   } // This line is removed as per the edit hint
// }); // This line is removed as per the edit hint

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 