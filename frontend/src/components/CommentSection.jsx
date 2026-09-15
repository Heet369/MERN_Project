import { useState, useEffect } from 'react';
import { interactionAPI } from '../services/api';
import { AiOutlineSend } from 'react-icons/ai';
import { FiMessageSquare } from 'react-icons/fi';

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    const savedName = localStorage.getItem('commentUsername');
    if (savedName) setUsername(savedName);
    fetchComments();
  }, [blogId]);

  const fetchComments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await interactionAPI.getComments(blogId, pageNum);
      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalComments(data.totalComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) return;

    try {
      setSubmitting(true);
      localStorage.setItem('commentUsername', username);
      const { data } = await interactionAPI.addComment(blogId, {
        username: username.trim(),
        text: text.trim(),
      });
      setComments((prev) => [data.comment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <FiMessageSquare className="text-gray-700 text-lg" />
        <h3 className="text-lg font-bold text-gray-900">Comments ({totalComments})</h3>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 mb-8 shadow-xs">
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Your Name
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            maxLength={50}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Your Comment
          </label>
          <textarea
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[85px]"
            rows={3}
            maxLength={1000}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !username.trim() || !text.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <AiOutlineSend className="text-sm" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3.5">
        {loading && comments.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500">
            No comments yet. Be the first to join the conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 truncate">{comment.username}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}

        {page < totalPages && (
          <div className="text-center pt-2">
            <button
              className="px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => fetchComments(page + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more comments'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
