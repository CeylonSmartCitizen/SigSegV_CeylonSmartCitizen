import './src/i18n';
import { useTranslation } from 'react-i18next';

// In your component:
const { t } = useTranslation();
<Text>{t('welcome')}</Text>