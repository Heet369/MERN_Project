import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, interactionAPI } from '../services/api';
import MediaRenderer from '../components/MediaRenderer';
import CommentSection from '../components/CommentSection';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FiShare2, FiCopy, FiArrowLeft, FiCheck, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const visitorId = (() => {
    let vid = localStorage.getItem('visitorId');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now();
      localStorage.setItem('visitorId', vid);
    }
    return vid;
  })();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await blogAPI.getOne(id);
      setBlog(data);
      setLikesCount(data.likesCount || 0);
      setLiked(data.likes?.includes(visitorId) || false);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await interactionAPI.toggleLike(id, visitorId);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out this article: ${blog?.title}`;

    try {
      await interactionAPI.trackShare(id);
    } catch (e) {
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-4/5 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          404
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The article you are looking for might have been removed or does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const words = (blog.description || '').trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to all posts</span>
      </Link>

      <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <FiCalendar className="text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <FiClock className="text-gray-400" />
            <span>{readMinutes} min read</span>
          </div>
          {blog.author && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <FiUser className="text-gray-400" />
                <span className="font-medium text-gray-700">{blog.author.username || 'Admin'}</span>
              </div>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-6 mb-6 leading-tight">
          {blog.title}
        </h1>

        {blog.mediaType !== 'none' && blog.mediaUrl && (
          <div className="mb-8 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <MediaRenderer type={blog.mediaType} url={blog.mediaUrl} title={blog.title} />
          </div>
        )}

        <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-5 pt-2 pb-8 border-b border-gray-100">
          {blog.description.split('\n').map((para, i) =>
            para.trim() ? (
              <p key={i} className="text-gray-700 leading-relaxed">
                {para}
              </p>
            ) : (
              <div key={i} className="h-3" />
            )
          )}
        </div>

        <div className="pt-6 flex items-center justify-between flex-wrap gap-4">
          <button
            id="blog-like-btn"
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              liked
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {liked ? (
              <AiFillHeart className="text-lg text-rose-500 animate-bounce" />
            ) : (
              <AiOutlineHeart className="text-lg text-gray-400" />
            )}
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <div className="relative">
            <button
              id="blog-share-btn"
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
            >
              <FiShare2 className="text-base" />
              <span>Share</span>
            </button>

            {showShare && (
              <div className="absolute right-0 bottom-12 w-52 rounded-xl bg-white border border-gray-200 p-2 shadow-lg flex flex-col gap-1 z-30 text-sm">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-left transition-colors"
                >
                  <FaTwitter className="text-[#1DA1F2]" /> Twitter / X
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-left transition-colors"
                >
                  <FaFacebook className="text-[#1877F2]" /> Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-left transition-colors"
                >
                  <FaLinkedin className="text-[#0A66C2]" /> LinkedIn
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-left transition-colors"
                >
                  <FaWhatsapp className="text-[#25D366]" /> WhatsApp
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-900 text-left transition-colors border-t border-gray-100 mt-1 pt-2 font-medium"
                >
                  {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy className="text-gray-500" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <CommentSection blogId={id} />
      </article>
    </div>
  );
};

export default BlogPage;
