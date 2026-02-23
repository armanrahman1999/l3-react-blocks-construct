import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui-kit/card';
import { Trophy } from 'lucide-react';

interface Props {
  championName: string;
}

export const ChampionBanner = ({ championName }: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="flex items-center gap-3 p-4">
      <Trophy className="h-5 w-5" />
      <div className="flex flex-col">
        <div className="text-sm text-muted-foreground">{t('CHAMPION')}</div>
        <div className="text-lg font-semibold">{championName}</div>
      </div>
    </Card>
  );
};
