import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, Video, Link } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface MaterialItem {
  id: string;
  name: string;
  dataUrl: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: VideoItem[];
  materials: MaterialItem[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  status: 'active' | 'draft' | 'pending';
}

interface CourseFormProps {
  course?: Course | null;
  onSave: (formData: Omit<Course, 'id'>) => void;
  onCancel: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    modules: [] as Module[],
    status: 'draft' as 'active' | 'draft' | 'pending',
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    videos: [] as VideoItem[],
    materials: [] as MaterialItem[],
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
  });

  const [newMaterial, setNewMaterial] = useState<MaterialItem | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail || '',
        modules: course.modules || [],
        status: course.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        modules: [],
        status: 'draft',
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData });
  };

  const handleAddModule = () => {
    if (newModule.title) {
      const module: Module = {
        id: `module_${Date.now()}`,
        title: newModule.title,
        description: newModule.description,
        videos: newModule.videos,
        materials: newModule.materials,
      };
      setFormData({
        ...formData,
        modules: [...formData.modules, module],
      });
      setNewModule({ title: '', description: '', videos: [], materials: [] });
    }
  };

  const handleRemoveModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter(module => module.id !== moduleId),
    });
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          thumbnail: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, moduleIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const video: VideoItem = {
          id: `video_${Date.now()}`,
          title: newVideo.title,
          description: newVideo.description,
          videoUrl: newVideo.videoUrl,
          thumbnailUrl: newVideo.thumbnailUrl,
        };
        const updatedModules = [...formData.modules];
        updatedModules[moduleIndex].videos.push(video);
        setFormData({ ...formData, modules: updatedModules });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVideo = (moduleIndex: number, videoId: string) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos = updatedModules[moduleIndex].videos.filter(v => v.id !== videoId);
    setFormData({ ...formData, modules: updatedModules });
  };

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>, moduleIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const material: MaterialItem = {
          id: `material_${Date.now()}`,
          name: file.name,
          dataUrl: event.target?.result as string,
        };
        const updatedModules = [...formData.modules];
        updatedModules[moduleIndex].materials.push(material);
        setFormData({ ...formData, modules: updatedModules });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMaterial = (moduleIndex: number, materialId: string) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].materials = updatedModules[moduleIndex].materials.filter(m => m.id !== materialId);
    setFormData({ ...formData, modules: updatedModules });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="col-span-3"
            required
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Thumbnail</Label>
          <div className="col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="col-span-3"
              />
              <Upload className="w-4 h-4 text-gray-500" />
            </div>
            {formData.thumbnail && (
              <div className="mt-2">
                <img 
                  src={formData.thumbnail} 
                  alt="Course thumbnail" 
                  className="w-32 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'active' | 'draft' | 'pending') => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (Published)</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Course Modules</h3>
          <Badge variant="secondary">{formData.modules.length} modules</Badge>
        </div>

        {/* Add New Module */}
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="moduleTitle">Module Title</Label>
                <Input
                  id="moduleTitle"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  placeholder="e.g., Introduction to React"
                />
              </div>
              <div>
                <Label htmlFor="moduleDescription">Module Description</Label>
                <Textarea
                  id="moduleDescription"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  placeholder="Brief description of this module..."
                />
              </div>
            </div>
            <Button 
              type="button" 
              onClick={handleAddModule}
              disabled={!newModule.title}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </CardContent>
        </Card>

        {/* Existing Modules */}
        {formData.modules.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Course Modules</h4>
            {formData.modules.map((module, moduleIndex) => (
              <Card key={module.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{moduleIndex + 1}</Badge>
                        <h5 className="font-medium">{module.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {module.description}
                      </p>
                      {/* Videos in Module */}
                      <div className="mb-2">
                        <h6 className="font-semibold">Videos</h6>
                        {module.videos.map((video) => (
                          <div key={video.id} className="flex items-center gap-2 mb-1">
                            <img src={video.thumbnailUrl} alt="thumb" className="w-12 h-8 object-cover rounded" />
                            <span className="font-medium">{video.title}</span>
                            <span className="text-xs text-gray-500">{video.videoUrl}</span>
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemoveVideo(moduleIndex, video.id)}>Remove</Button>
                          </div>
                        ))}
                        {/* Add Video Form */}
                        <div className="flex flex-col gap-2 mt-2">
                          <Input
                            placeholder="Video Title"
                            value={newVideo.title}
                            onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                          />
                          <Input
                            placeholder="Video Description"
                            value={newVideo.description}
                            onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                          />
                          <Input
                            placeholder="Video URL"
                            value={newVideo.videoUrl}
                            onChange={e => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                          />
                          <Input
                            placeholder="Thumbnail URL"
                            value={newVideo.thumbnailUrl}
                            onChange={e => setNewVideo({ ...newVideo, thumbnailUrl: e.target.value })}
                          />
                          <Button type="button" onClick={() => handleAddVideo(moduleIndex)} disabled={!newVideo.title || !newVideo.videoUrl}>
                            <Plus className="w-4 h-4 mr-2" />Add Video
                          </Button>
                        </div>
                      </div>
                      {/* Materials in Module */}
                      <div className="mb-2">
                        <h6 className="font-semibold">Materials</h6>
                        {module.materials.map((material) => (
                          <div key={material.id} className="flex items-center gap-2 mb-1">
                            <a href={material.dataUrl} download={material.name} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{material.name}</a>
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemoveMaterial(moduleIndex, material.id)}>Remove</Button>
                          </div>
                        ))}
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={e => handleMaterialUpload(e, moduleIndex)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModule(module.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Course</Button>
      </DialogFooter>
    </form>
  );
}; 