import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Fallback-first content hook. Pass a map of { 'section.key': 'fallback text' }.
// Returns the same map, silently swapping in any values found in site_content.
// The site never shows empty text — DB values only override non-empty fallbacks.
export function useContent(fallback) {
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    const keys = Object.keys(fallback);
    if (!keys.length) return;
    supabase.from('site_content').select('key, value').in('key', keys)
      .then(({ data }) => {
        if (!data?.length) return;
        setContent(prev => {
          const next = { ...prev };
          data.forEach(r => { if (r.value != null && r.value !== '') next[r.key] = r.value; });
          return next;
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return content;
}
