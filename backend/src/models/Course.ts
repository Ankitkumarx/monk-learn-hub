import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
}, { _id: false });

const materialSchema = new mongoose.Schema({
  id: String,
  name: String,
  dataUrl: String,
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  videos: [videoSchema],
  materials: [materialSchema],
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: String,
  status: { type: String, enum: ['active', 'draft', 'pending'], default: 'draft' },
  modules: [moduleSchema],
  enrolledStudents: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema); 