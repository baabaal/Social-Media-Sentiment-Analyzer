/**
 * ============================================================
 *  SERVICE: YouTube
 * ============================================================
 *  Menggunakan YouTube Data API v3 untuk:
 *  - Ekstrak video ID dari URL
 *  - Ambil metadata video (judul, channel, thumbnail)
 *  - Ambil komentar dengan pagination
 *
 *  Quota cost (per request):
 *   - videos.list:        1 unit
 *   - commentThreads.list: 1 unit per halaman (100 komentar/halaman)
 * ============================================================
 */

const axios = require('axios');

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_COMMENTS = parseInt(process.env.MAX_COMMENTS, 10) || 500;

/**
 * Ekstrak video ID dari berbagai bentuk URL YouTube:
 *  - https://www.youtube.com/watch?v=ID
 *  - https://youtu.be/ID
 *  - https://www.youtube.com/shorts/ID
 *  - https://www.youtube.com/embed/ID
 */
function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  throw new Error('URL YouTube tidak valid');
}

/**
 * Ambil metadata video — judul, channel, thumbnail.
 */
async function getVideoMetadata(videoId) {
  if (!API_KEY) throw new Error('YOUTUBE_API_KEY belum di-set di .env');

  const { data } = await axios.get(`${API_BASE}/videos`, {
    params: {
      part: 'snippet,statistics',
      id: videoId,
      key: API_KEY,
    },
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('Video tidak ditemukan atau private');
  }

  const v = data.items[0];
  return {
    title: v.snippet.title,
    channelName: v.snippet.channelTitle,
    thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
    publishedAt: v.snippet.publishedAt,
    viewCount: v.statistics?.viewCount,
    commentCount: v.statistics?.commentCount,
  };
}

/**
 * Ambil semua komentar (sampai MAX_COMMENTS) dengan pagination.
 */
async function getComments(videoId) {
  if (!API_KEY) throw new Error('YOUTUBE_API_KEY belum di-set di .env');

  const comments = [];
  let pageToken = null;

  do {
    const { data } = await axios.get(`${API_BASE}/commentThreads`, {
      params: {
        part: 'snippet',
        videoId,
        maxResults: 100,
        order: 'relevance',
        pageToken: pageToken || undefined,
        key: API_KEY,
      },
    });

    for (const item of data.items || []) {
      const c = item.snippet.topLevelComment.snippet;
      comments.push({
        text: c.textOriginal || c.textDisplay,
        author: c.authorDisplayName,
        likes: c.likeCount || 0,
        publishedAt: c.publishedAt,
      });

      if (comments.length >= MAX_COMMENTS) break;
    }

    pageToken = data.nextPageToken;
  } while (pageToken && comments.length < MAX_COMMENTS);

  return comments;
}

/**
 * Fungsi utama yang dipanggil controller.
 */
async function fetchYouTubeData(url) {
  const videoId = extractVideoId(url);
  const [metadata, comments] = await Promise.all([
    getVideoMetadata(videoId),
    getComments(videoId),
  ]);

  return {
    videoId,
    ...metadata,
    comments,
  };
}

module.exports = {
  fetchYouTubeData,
  extractVideoId,
};
