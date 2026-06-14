import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Shared contact / social links — single source of truth for BOTH the Hebrew
// and English pages. Edit these once in the admin (📞 פרטי קשר tab) and every
// page that uses this hook updates together.
export const DEFAULT_LINKS = {
  whatsapp_url:   'https://wa.me/972534673151',
  whatsapp_group: 'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3',
  phone:          '+972-53-467-3151',
  email:          'shmuelmunic@gmail.com',
  linkedin:       'https://www.linkedin.com/in/shmuel-munitz-marketing',
  facebook:       'https://www.facebook.com/share/1BZ8HrpBeo/',
  instagram:      'https://www.instagram.com/shiftup.il?igsh=MTZod2E3NTk4dXI5Zg==',
};

const KEYS = [
  'contact.whatsapp_url',
  'contact.whatsapp_group',
  'contact.phone',
  'contact.email',
  'contact.linkedin',
  'contact.facebook',
  'contact.instagram',
];

// Fallback-first: returns defaults immediately, silently swaps in DB values.
export function useSiteLinks() {
  const [links, setLinks] = useState(DEFAULT_LINKS);

  useEffect(() => {
    supabase.from('site_content')
      .select('key, value')
      .in('key', KEYS)
      .then(({ data }) => {
        if (!data?.length) return;
        const map = { ...DEFAULT_LINKS };
        data.forEach(row => {
          const short = row.key.replace('contact.', '');
          if (row.value) map[short] = row.value;
        });
        setLinks(map);
      });
  }, []);

  return links;
}
