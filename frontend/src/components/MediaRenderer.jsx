import { FiExternalLink } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || API_BASE.replace(/\/api\/?$/, '');

const MediaRenderer = ({ type, url, title = '', thumbnail = false }) => {
  if (!url || type === 'none') return null;

  const fullUrl = url.startsWith('http') ? url : `${MEDIA_BASE}${url}`;

  switch (type) {
    case 'image':
    case 'gif':
      return (
        <div className={thumbnail ? 'w-full h-full' : 'w-full my-6 rounded-lg overflow-hidden border border-gray-200'}>
          <img
            src={fullUrl}
            alt={title}
            loading="lazy"
            className={thumbnail ? 'w-full h-full object-cover' : 'w-full max-h-[520px] object-cover'}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );

    case 'video':
      return (
        <div className={thumbnail ? 'w-full h-full' : 'w-full my-6 rounded-lg overflow-hidden border border-gray-200 bg-black'}>
          {thumbnail ? (
            <video src={fullUrl} muted preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <video src={fullUrl} controls preload="metadata" className="w-full max-h-[520px]" />
          )}
        </div>
      );

    case 'url':
      return (
        <div className={thumbnail ? 'w-full h-full' : 'w-full my-6'}>
          {url.match(/youtube\.com|youtu\.be/) ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={url
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Link</span>
                <span className="text-sm text-gray-700 truncate">{url}</span>
              </div>
              <FiExternalLink className="text-gray-400 shrink-0 ml-2" />
            </a>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default MediaRenderer;
