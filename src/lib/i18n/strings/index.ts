import type { LangCode } from '../languages';
import type { LocaleStrings } from '../buildLocale';
import en from './en';
import so from './so';
import ar from './ar';
import zh from './zh';
import nl from './nl';
import fr from './fr';
import de from './de';
import hi from './hi';
import it from './it';
import pt from './pt';
import ru from './ru';
import es from './es';
import sw from './sw';
import tr from './tr';

export const LOCALE_STRINGS: Record<LangCode, LocaleStrings> = {
  en,
  so,
  ar,
  zh,
  nl,
  fr,
  de,
  hi,
  it,
  pt,
  ru,
  es,
  sw,
  tr,
};
