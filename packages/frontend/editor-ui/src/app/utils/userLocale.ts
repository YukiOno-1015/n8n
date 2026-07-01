import { LOCAL_STORAGE_LOCALE } from '@/app/constants/localStorage';

export const getStoredLocaleOverride = (): string | null => {
	if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return null;

	const locale = globalThis.localStorage.getItem(LOCAL_STORAGE_LOCALE)?.trim();
	return locale ?? null;
};

export const saveLocaleOverride = (locale: string, instanceDefaultLocale: string): void => {
	if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return;

	if (locale === instanceDefaultLocale) {
		globalThis.localStorage.removeItem(LOCAL_STORAGE_LOCALE);
		return;
	}

	globalThis.localStorage.setItem(LOCAL_STORAGE_LOCALE, locale);
};
