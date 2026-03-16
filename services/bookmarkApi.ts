import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WelfareAlert } from './welfareAlertApi';

const STORAGE_KEY = '@hamkke_welfare_bookmarks';

export async function getBookmarks(): Promise<WelfareAlert[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getBookmarkIds(): Promise<Set<number>> {
  const bookmarks = await getBookmarks();
  return new Set(bookmarks.map((b) => b.id));
}

export async function toggleBookmark(alert: WelfareAlert): Promise<boolean> {
  const bookmarks = await getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === alert.id);
  if (index >= 0) {
    bookmarks.splice(index, 1);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    return false; // removed
  } else {
    bookmarks.unshift(alert);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    return true; // added
  }
}

export async function removeBookmark(id: number): Promise<void> {
  const bookmarks = await getBookmarks();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookmarks.filter((b) => b.id !== id)),
  );
}
