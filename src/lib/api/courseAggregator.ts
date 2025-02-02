// lib/api/courseAggregator.ts
import { AdvancedCache } from '../utils/cache';
import { CachedItem } from '../types/gemini';

export interface Course {
  title: string;
  url: string;
  source: 'udemy' | 'edx' | 'youtube';
  rating?: number;
  level?: string; // e.g., beginner, intermediate, advanced
  description?: string;
  duration?: string;
}

/**
 * Helper function: Validates a URL by sending a HEAD request.
 */
async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error validating URL ${url}:`, error);
    return false;
  }
}

/**
 * Fetch free courses from Udemy.
 * (Filters for free courses by using the price filter; adjust the endpoint as needed.)
 */
export async function fetchUdemyFreeCourses(topic: string): Promise<Course[]> {
  const UDEMY_CLIENT_ID = import.meta.env.VITE_UDEMY_CLIENT_ID;
  const UDEMY_CLIENT_SECRET = import.meta.env.VITE_UDEMY_CLIENT_SECRET;
  const endpoint = `https://www.udemy.com/api-2.0/courses/?price=free&search=${encodeURIComponent(topic)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        // Udemy expects basic auth in the header; adjust as per Udemy’s API documentation
        Authorization: 'Basic ' + btoa(`${UDEMY_CLIENT_ID}:${UDEMY_CLIENT_SECRET}`),
      },
    });
    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.statusText}`);
    }
    const data = await response.json();
    // Assume the API returns an array of course objects in data.results.
    const courses: Course[] = data.results.map((course: any) => ({
      title: course.title,
      // Ensure the URL is complete. Some responses may include a relative URL.
      url: course.url.startsWith('http') ? course.url : `https://www.udemy.com${course.url}`,
      source: 'udemy',
      rating: course.rating,
      level: course.level,
      description: course.headline,
      duration: course.estimated_content_length ? `${course.estimated_content_length} hours` : undefined,
    }));
    return courses;
  } catch (error) {
    console.error('Error fetching Udemy free courses:', error);
    return [];
  }
}

/**
 * Fetch free courses from edX.
 * (Filters for free courses using the availability parameter.)
 */
export async function fetchEdxFreeCourses(topic: string): Promise<Course[]> {
  const EDX_API_CLIENT_ID = import.meta.env.VITE_EDX_API_CLIENT_ID;
  const EDX_API_CLIENT_SECRET = import.meta.env.VITE_EDX_API_CLIENT_SECRET;
  const endpoint = `https://api.edx.org/catalog/v1/courses?availability=Free&search=${encodeURIComponent(topic)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        // Again, using basic auth here; adjust according to edX API docs
        Authorization: 'Basic ' + btoa(`${EDX_API_CLIENT_ID}:${EDX_API_CLIENT_SECRET}`),
      },
    });
    if (!response.ok) {
      throw new Error(`edX API error: ${response.statusText}`);
    }
    const data = await response.json();
    const courses: Course[] = data.results.map((course: any) => ({
      title: course.title,
      url: course.url, // Assume edX returns a valid full URL
      source: 'edx',
      rating: course.rating, // if provided
      level: course.level,   // if provided
      description: course.short_description,
      duration: course.duration,
    }));
    return courses;
  } catch (error) {
    console.error('Error fetching edX free courses:', error);
    return [];
  }
}

/**
 * Fetch free course-like videos from YouTube.
 * (Searches YouTube for “<topic> free course” videos.)
 */
export async function fetchYouTubeFreeCourses(topic: string): Promise<Course[]> {
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    topic + ' free course'
  )}&type=video&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    const data = await response.json();
    const courses: Course[] = data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'youtube',
      description: item.snippet.description,
      // YouTube videos typically do not provide “duration” in this search endpoint
    }));
    return courses;
  } catch (error) {
    console.error('Error fetching YouTube courses:', error);
    return [];
  }
}

/**
 * Aggregate free courses from Udemy, edX, and YouTube.
 * Validates each URL and caches the results.
 */
export async function aggregateFreeCourses(topic: string): Promise<Course[]> {
  const cacheKey = `freeCourses-${topic}`;
  const cached = AdvancedCache.get<CachedItem<Course[]>>(cacheKey);
  if (cached) {
    console.log('Retrieved free courses from cache');
    return cached.data;
  }

  console.log('Fetching free courses for topic:', topic);
  // Run the fetches concurrently.
  const [udemyCourses, edxCourses, youtubeCourses] = await Promise.all([
    fetchUdemyFreeCourses(topic),
    fetchEdxFreeCourses(topic),
    fetchYouTubeFreeCourses(topic),
  ]);

  // Combine all fetched courses.
  let allCourses = [...udemyCourses, ...edxCourses, ...youtubeCourses];

  // Validate URLs concurrently.
  const validCourses: Course[] = [];
  await Promise.all(
    allCourses.map(async (course) => {
      const isValid = await validateUrl(course.url);
      if (isValid) {
        validCourses.push(course);
      } else {
        console.warn(`Invalid URL for course: ${course.title}`, course.url);
      }
    })
  );

  // Optionally remove duplicates by URL.
  const uniqueCourses = Array.from(
    new Map(validCourses.map((course) => [course.url, course])).values()
  );

  // Cache the aggregated courses.
  await AdvancedCache.set(
    cacheKey,
    { data: uniqueCourses, metadata: { generatedAt: new Date().toISOString(), goal: topic, skillLevel: 0 } },
    { tags: ['freeCourses', topic], version: '1.0.0' }
  );

  return uniqueCourses;
}
