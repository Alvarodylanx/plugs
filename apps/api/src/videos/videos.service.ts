import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
}

@Injectable()
export class VideosService {
  constructor(private config: ConfigService) {}

  async search(q: string, maxResults = 6): Promise<VideoResult[]> {
    const key = this.config.get<string>('YOUTUBE_API_KEY');
    if (!key) return [];

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&q=${encodeURIComponent(q)}&type=video` +
      `&maxResults=${maxResults}&relevanceLanguage=en&key=${key}`;

    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();

    return (data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        '',
      description: item.snippet.description || '',
    }));
  }
}
