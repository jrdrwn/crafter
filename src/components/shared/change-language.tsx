'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import '../../../node_modules/flag-icons/css/flag-icons.min.css';

export default function ChangeLanguage() {
  const [lang, setLang] = useState<string>('en');

  useEffect(() => {
    const langCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='));
    if (langCookie) {
      const langValue = langCookie.split('=')[1];
      setLang(langValue);
    } else {
      setLang('en');
    }
  }, []);

  const onValueChange = (value: string) => {
    document.cookie = `lang=${value}; path=/`;
    window.location.reload();
  };
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        className="!h-auto !w-auto gap-0 rounded-full px-2.5 py-2.5 [&_svg]:hidden"
      >
        {lang === 'en' ? (
          <span className="fi fi-us fis"></span>
        ) : (
          <span className="fi fi-id fis"></span>
        )}
      </SelectTrigger>
      <SelectContent defaultValue={lang} className="w-fit">
        <SelectItem value="en">
          <span className="fi fi-us fis"></span>
        </SelectItem>
        <SelectItem value="id">
          <span className="fi fi-id fis"></span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
