import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiUploadCloud,
  FiImage,
  FiVideo,
  FiLink,
  FiMessageSquare,
  FiHeart,
  FiShare2,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'none',
    mediaUrl: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAll(page, 10);
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalBlogs(res.data.totalBlogs || 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      description: '',
      mediaType: 'none',
      mediaUrl: '',
    });
    setMediaFile(null);
    setMediaPreview('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      description: blog.description || '',
      mediaType: blog.mediaType || 'none',
      mediaUrl: blog.mediaUrl || '',
    });
    setMediaFile(null);
    setMediaPreview(blog.mediaUrl || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBlog(null);
    setMediaFile(null);
    setMediaPreview('');
    setFormError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('mediaType', formData.mediaType);

      if (mediaFile) {
        submitData.append('media', mediaFile);
      } else if (formData.mediaUrl) {
        submitData.append('mediaUrl', formData.mediaUrl.trim());
      }

      if (editingBlog) {
        await adminAPI.update(editingBlog._id, submitData);
      } else {
        await adminAPI.create(submitData);
      }

      handleCloseModal();
      fetchBlogs();
      fetchStats();
    } catch (error) {
      console.error('Error saving blog:', error);
      setFormError(error.response?.data?.message || 'Failed to save blog post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await adminAPI.delete(id);
      setDeleteId(null);
      fetchBlogs();
      fetchStats();
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMediaBadge = (type) => {
    switch (type) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <FiImage className="text-xs" /> Image
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <FiVideo className="text-xs" /> Video
          </span>
        );
      case 'gif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">
            GIF
          </span>
        );
      case 'url':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <FiLink className="text-xs" /> Link
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            None
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your blog posts, create new articles, and monitor interactions.
          </p>
        </div>

        <button
          id="create-blog-btn"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FiPlus className="text-base" />
          <span>Create Blog</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              <FiFileText />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Blogs</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalBlogs || 0}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
              <FiHeart />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Likes</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalLikes || 0}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <FiMessageSquare />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalComments || 0}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
              <FiShare2 />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Shares</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalShares || 0}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Blog Posts</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {totalBlogs} Total Posts
          </span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <FiFileText />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No blogs found</h3>
            <p className="text-sm text-gray-500 mb-4">You have not created any blog posts yet.</p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiPlus /> Create First Post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Title</th>
                  <th className="py-3.5 px-4">Media</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Likes</th>
                  <th className="py-3.5 px-4 text-center">Comments</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-medium text-gray-900 max-w-xs sm:max-w-md">
                      <div className="line-clamp-1 font-semibold text-gray-900">{blog.title}</div>
                      <div className="line-clamp-1 text-xs text-gray-400 font-normal mt-0.5">
                        {blog.description}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getMediaBadge(blog.mediaType)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-center text-xs font-medium text-gray-600">
                      {blog.likesCount || 0}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-center text-xs font-medium text-gray-600">
                      {blog.commentsCount || 0}
                    </td>
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/blog/${blog._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Blog"
                        >
                          <FiEye className="text-base" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit Blog"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        {deleteId === blog._id ? (
                          <div className="inline-flex items-center gap-1.5 ml-1">
                            <button
                              onClick={() => handleDelete(blog._id)}
                              disabled={deleting}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                            >
                              {deleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(blog._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Blog"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              <FiChevronLeft /> Previous
            </button>
            <span className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <FiAlertCircle className="shrink-0 text-base" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter a compelling title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Media Attachment
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['none', 'image', 'video', 'gif', 'url'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, mediaType: type })}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center capitalize transition-all ${
                        formData.mediaType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.mediaType !== 'none' && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700">
                    Upload Media File or Provide URL
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Upload File (JPG, PNG, GIF, MP4)
                      </label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-3 cursor-pointer bg-white transition-colors">
                        <FiUploadCloud className="text-xl text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 font-medium">
                          {mediaFile ? mediaFile.name : 'Choose file...'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Or External Media / YouTube URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or https://youtube.com/..."
                        value={formData.mediaUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, mediaUrl: e.target.value });
                          setMediaPreview(e.target.value);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {mediaPreview && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-[11px] font-medium text-gray-500 mb-1">Preview:</div>
                      <div className="max-h-36 overflow-hidden rounded-lg bg-gray-900 flex items-center justify-center">
                        {formData.mediaType === 'video' ? (
                          <video src={mediaPreview} controls className="max-h-36 max-w-full" />
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Media Preview"
                            className="max-h-36 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Content / Description *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write your article content here..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all resize-y"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
