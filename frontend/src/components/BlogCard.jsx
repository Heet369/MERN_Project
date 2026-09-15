import { Link } from 'react-router-dom';
import { AiOutlineHeart, AiOutlineComment } from 'react-icons/ai';
import { FiShare2, FiArrowRight } from 'react-icons/fi';
import MediaRenderer from './MediaRenderer';

const BlogCard = ({ blog }) => {
  const excerpt =
    blog.description.length > 120
      ? blog.description.substring(0, 120) + '...'
      : blog.description;

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/blog/${blog._id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group"
    >
      <div>
        {blog.mediaType !== 'none' && blog.mediaUrl && (
          <div className="w-full h-48 overflow-hidden bg-gray-100 border-b border-gray-100">
            <MediaRenderer
              type={blog.mediaType}
              url={blog.mediaUrl}
              title={blog.title}
              thumbnail
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>{formattedDate}</span>
            {blog.author && (
              <>
                <span>•</span>
                <span className="font-medium text-gray-700">by {blog.author.username}</span>
              </>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {blog.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mt-2">
            {excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1">
            <AiOutlineHeart className="text-sm" />
            <span>{blog.likesCount || 0}</span>
          </span>
          <span className="flex items-center gap-1">
            <AiOutlineComment className="text-sm" />
            <span>{blog.commentsCount || 0}</span>
          </span>
          <span className="flex items-center gap-1">
            <FiShare2 className="text-xs" />
            <span>{blog.sharesCount || 0}</span>
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
          Read <FiArrowRight className="text-xs" />
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
