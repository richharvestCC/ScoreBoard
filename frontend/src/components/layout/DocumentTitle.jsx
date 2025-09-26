import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DocumentTitle = () => {
  const { t } = useLanguage();

  useEffect(() => {
    const title = t({
      ko: '매치카드 - 공 좀 차니?',
      en: 'MatchCard - What about the score?'
    });

    document.title = title;
  }, [t]);

  return null;
};

export default DocumentTitle;